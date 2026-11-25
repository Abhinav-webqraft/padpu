import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import { verifyGoogleToken } from '../utils/googleAuth.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const router = express.Router();

// Apply auth rate limiter (supports 50-100 concurrent users including shared NAT IPs)
router.use(authRateLimiter(150, 15 * 60 * 1000));

/**
 * Generate standard application JWT
 */
function generateToken(user) {
  const payload = {
    user: {
      id: user.id,
      role: user.role
    }
  };

  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'fallback_secret_key',
    { expiresIn: '7d' }
  );
}

// -------------------------------------------------------------
// POST /signup — Standard Email/Password Registration
// -------------------------------------------------------------
router.post('/signup', async (req, res) => {
  const { name, phonenumber, email, password } = req.body;

  if (!name || !phonenumber || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanPhone = phonenumber.trim().replace(/\D/g, '');

  if (cleanPhone.length !== 10) {
    return res.status(400).json({ message: 'Phone number must be 10 digits' });
  }

  try {
    const [existingUsers] = await db.execute('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const [existingPhone] = await db.execute('SELECT id FROM users WHERE phonenumber = ?', [cleanPhone]);
    if (existingPhone.length > 0) {
      return res.status(400).json({ message: 'Phone number already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const role = cleanEmail === 'admin@padpu.com' ? 'admin' : 'user';
    await db.execute(
      'INSERT INTO users (name, phonenumber, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), cleanPhone, cleanEmail, hashedPassword, role]
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// -------------------------------------------------------------
// POST /signin — Standard Email/Phone + Password Login
// -------------------------------------------------------------
router.post('/signin', async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ message: 'Email/Phone and password are required' });
  }

  const cleanIdentifier = identifier.trim();

  try {
    const [users] = await db.execute(
      'SELECT * FROM users WHERE email = ? OR phonenumber = ?',
      [cleanIdentifier.toLowerCase(), cleanIdentifier]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // If account was created via OAuth without a password
    if (!user.password) {
      return res.status(400).json({
        message: 'This account was created with Google. Please use Continue with Google to sign in.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const role = (user.email === 'admin@padpu.com' ? 'admin' : (user.role || 'user')).toLowerCase();
    const token = generateToken({ id: user.id, role });

    res.json({
      token,
      role,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phonenumber: user.phonenumber,
        role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// -------------------------------------------------------------
// POST /google — Google Authentication (Sign In & Sign Up)
// -------------------------------------------------------------
router.post('/google', async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ message: 'Google credential ID token is required' });
  }

  let googleUser;
  try {
    googleUser = await verifyGoogleToken(credential);
  } catch (err) {
    return res.status(401).json({
      message: 'Invalid or expired Google authentication token. Please sign in again.'
    });
  }

  const { sub, email, emailVerified, name, picture } = googleUser;

  // Reject unverified emails
  if (!emailVerified) {
    return res.status(400).json({
      message: 'Google email is not verified. Please verify your Google email first.'
    });
  }

  const cleanEmail = email.trim().toLowerCase();

  const connection = await db.getConnection();
  try {
    // 1. Check if this Google sub is already linked in user_auth_providers
    const [providers] = await connection.query(
      `SELECT p.user_id, u.* 
       FROM user_auth_providers p 
       JOIN users u ON p.user_id = u.id 
       WHERE p.provider = 'google' AND p.provider_user_id = ?`,
      [sub]
    );

    if (providers.length > 0) {
      // SCENARIO B: Existing Google user logging in again
      const user = providers[0];
      const role = (user.email === 'admin@padpu.com' ? 'admin' : (user.role || 'user')).toLowerCase();

      // Update avatar if not set
      if (!user.avatar && picture) {
        await connection.query('UPDATE users SET avatar = ? WHERE id = ?', [picture, user.id]);
      }

      const token = generateToken({ id: user.id, role });
      return res.json({
        token,
        role,
        requiresPhone: !user.phonenumber,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phonenumber: user.phonenumber,
          role,
          avatar: user.avatar || picture
        }
      });
    }

    // 2. Check if a user exists with the same email
    const [existingUsers] = await connection.query(
      'SELECT * FROM users WHERE email = ?',
      [cleanEmail]
    );

    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];

      // If existing user has a password, we must NOT link silently!
      // SCENARIO C: Ask user to authenticate with existing password to link accounts
      if (existingUser.password) {
        return res.status(200).json({
          requiresLink: true,
          email: existingUser.email,
          name: existingUser.name,
          message: 'An account with this email already exists. Please verify your password to link your Google account.'
        });
      }

      // If user has no password (e.g. from prior OAuth), link directly
      await connection.query(
        'INSERT INTO user_auth_providers (user_id, provider, provider_user_id) VALUES (?, ?, ?)',
        [existingUser.id, 'google', sub]
      );

      const role = existingUser.email === 'admin@padpu.com' ? 'admin' : existingUser.role;
      const token = generateToken({ id: existingUser.id, role });

      return res.json({
        token,
        role,
        requiresPhone: !existingUser.phonenumber,
        user: {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
          phonenumber: existingUser.phonenumber,
          role,
          avatar: existingUser.avatar || picture
        }
      });
    }

    // 3. SCENARIO A: Brand-new Google user
    await connection.beginTransaction();

    const role = cleanEmail === 'admin@padpu.com' ? 'admin' : 'user';
    const [userResult] = await connection.query(
      'INSERT INTO users (name, email, password, phonenumber, avatar, role) VALUES (?, ?, NULL, NULL, ?, ?)',
      [name || 'Google User', cleanEmail, picture || null, role]
    );

    const newUserId = userResult.insertId;

    await connection.query(
      'INSERT INTO user_auth_providers (user_id, provider, provider_user_id) VALUES (?, ?, ?)',
      [newUserId, 'google', sub]
    );

    await connection.commit();

    const token = generateToken({ id: newUserId, role });

    return res.status(201).json({
      token,
      role,
      requiresPhone: true,
      user: {
        id: newUserId,
        name: name || 'Google User',
        email: cleanEmail,
        phonenumber: null,
        role,
        avatar: picture || null
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Google auth processing error:', error);
    res.status(500).json({ message: 'Internal server error during Google authentication' });
  } finally {
    connection.release();
  }
});

// -------------------------------------------------------------
// POST /google/link — Securely Link Google to Existing Account
// -------------------------------------------------------------
router.post('/google/link', async (req, res) => {
  const { credential, password } = req.body;

  if (!credential || !password) {
    return res.status(400).json({ message: 'Google credential and existing password are required' });
  }

  let googleUser;
  try {
    googleUser = await verifyGoogleToken(credential);
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired Google authentication token' });
  }

  const { sub, email, emailVerified, picture } = googleUser;
  if (!emailVerified) {
    return res.status(400).json({ message: 'Google email is not verified' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const connection = await db.getConnection();

  try {
    // 1. Verify existing account exists
    const [users] = await connection.query('SELECT * FROM users WHERE email = ?', [cleanEmail]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    const user = users[0];

    // 2. Prevent account takeover: verify existing account password
    if (user.password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Incorrect password for account verification' });
      }
    }

    // 3. SCENARIO H: Check if this Google sub is already linked to another user
    const [existingProviders] = await connection.query(
      "SELECT user_id FROM user_auth_providers WHERE provider = 'google' AND provider_user_id = ?",
      [sub]
    );

    if (existingProviders.length > 0 && existingProviders[0].user_id !== user.id) {
      return res.status(409).json({
        message: 'This Google account is already linked to another Padpu Farms account.'
      });
    }

    // 4. Link Google account
    await connection.query(
      `INSERT INTO user_auth_providers (user_id, provider, provider_user_id) 
       VALUES (?, 'google', ?) 
       ON DUPLICATE KEY UPDATE updated_at = NOW()`,
      [user.id, sub]
    );

    if (!user.avatar && picture) {
      await connection.query('UPDATE users SET avatar = ? WHERE id = ?', [picture, user.id]);
    }

    const role = (user.email === 'admin@padpu.com' ? 'admin' : (user.role || 'user')).toLowerCase();
    const token = generateToken({ id: user.id, role });

    return res.json({
      success: true,
      message: 'Google account linked successfully',
      token,
      role,
      requiresPhone: !user.phonenumber,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phonenumber: user.phonenumber,
        role,
        avatar: user.avatar || picture
      }
    });
  } catch (error) {
    console.error('Account linking error:', error);
    res.status(500).json({ message: 'Server error during account linking' });
  } finally {
    connection.release();
  }
});

export default router;
