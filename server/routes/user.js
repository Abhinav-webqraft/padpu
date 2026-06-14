import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/profile', verifyToken, async (req, res) => {
  try {
    const [users] = await db.execute('SELECT id, name, email, phonenumber, location, role, created_at FROM users WHERE id = ?', [req.user.id]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/profile', verifyToken, async (req, res) => {
  const { name, email, location, password } = req.body;

  try {
    // Check if email is already taken by another user
    const [existingEmail] = await db.execute('SELECT * FROM users WHERE email = ? AND id != ?', [email, req.user.id]);
    if (existingEmail.length > 0) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      await db.execute(
        'UPDATE users SET name = ?, email = ?, location = ?, password = ? WHERE id = ?',
        [name, email, location || null, hashedPassword, req.user.id]
      );
    } else {
      await db.execute(
        'UPDATE users SET name = ?, email = ?, location = ? WHERE id = ?',
        [name, email, location || null, req.user.id]
      );
    }

    const [updatedUsers] = await db.execute('SELECT id, name, email, phonenumber, location, role, created_at FROM users WHERE id = ?', [req.user.id]);
    res.json(updatedUsers[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
