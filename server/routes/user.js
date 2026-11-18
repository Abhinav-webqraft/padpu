import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/profile', verifyToken, async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT id, name, email, phonenumber, location, avatar, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/profile', verifyToken, async (req, res) => {
  const { name, email, phonenumber, location, password } = req.body;

  try {
    // If email is being changed, check if taken by another user
    if (email) {
      const [existingEmail] = await db.execute('SELECT id FROM users WHERE email = ? AND id != ?', [email, req.user.id]);
      if (existingEmail.length > 0) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // If phonenumber is being provided or changed, validate & check uniqueness
    let cleanPhone = null;
    if (phonenumber && phonenumber.trim()) {
      cleanPhone = phonenumber.trim().replace(/\D/g, '');
      if (cleanPhone.length !== 10) {
        return res.status(400).json({ message: 'Phone number must be 10 digits' });
      }
      const [existingPhone] = await db.execute('SELECT id FROM users WHERE phonenumber = ? AND id != ?', [cleanPhone, req.user.id]);
      if (existingPhone.length > 0) {
        return res.status(400).json({ message: 'Phone number already registered with another account' });
      }
    }

    // Fetch existing user to keep existing fields if not supplied
    const [currentUsers] = await db.execute('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (currentUsers.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    const current = currentUsers[0];

    const updatedName = name !== undefined ? name.trim() : current.name;
    const updatedEmail = email !== undefined ? email.trim() : current.email;
    const updatedPhone = cleanPhone !== null ? cleanPhone : (phonenumber === '' ? null : current.phonenumber);
    const updatedLocation = location !== undefined ? location.trim() || null : current.location;

    if (password && password.trim()) {
      if (password.trim().length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password.trim(), salt);

      await db.execute(
        'UPDATE users SET name = ?, email = ?, phonenumber = ?, location = ?, password = ? WHERE id = ?',
        [updatedName, updatedEmail, updatedPhone, updatedLocation, hashedPassword, req.user.id]
      );
    } else {
      await db.execute(
        'UPDATE users SET name = ?, email = ?, phonenumber = ?, location = ? WHERE id = ?',
        [updatedName, updatedEmail, updatedPhone, updatedLocation, req.user.id]
      );
    }

    const [updatedUsers] = await db.execute(
      'SELECT id, name, email, phonenumber, location, avatar, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    res.json(updatedUsers[0]);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
