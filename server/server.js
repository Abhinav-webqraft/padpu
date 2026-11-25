import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import pool from './db.js';
import { verifyToken } from './middleware/auth.js';

// Always load .env from the server directory, regardless of CWD
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

import productsRoutes from './routes/products.js';
import cartRoutes from './routes/cart.js';
import ordersRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js';
import reviewsRoutes from './routes/reviews.js';

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewsRoutes);

// Categories Routes
app.get('/api/categories', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT name FROM categories ORDER BY created_at ASC');
    res.json(rows.map(row => row.name));
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    await pool.query('INSERT INTO categories (name) VALUES (?)', [name]);
    res.status(201).json({ message: 'Category added' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Category already exists' });
    }
    console.error('Error adding category:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/categories/:name', async (req, res) => {
  try {
    const { name } = req.params;
    await pool.query('DELETE FROM categories WHERE name = ?', [name]);
    res.json({ message: 'Category deleted' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Weights Routes
const formatWeightRow = (row) => ({
  id: row.id,
  label: row.label,
  grams: Number(row.grams || 0),
  defaultPrice: Number(row.default_price || 0),
  created_at: row.created_at,
});

app.get('/api/weights', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, label, grams, default_price, created_at FROM weights ORDER BY grams ASC, created_at ASC'
    );
    res.json(rows.map(formatWeightRow));
  } catch (error) {
    console.error('Error fetching weights:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/weights', async (req, res) => {
  try {
    const label = typeof req.body.label === 'string' ? req.body.label.trim() : '';
    const grams = Number(req.body.grams) || 0;
    const defaultPrice = req.body.defaultPrice !== undefined && req.body.defaultPrice !== ''
      ? Number(req.body.defaultPrice)
      : 0;
    if (!label) return res.status(400).json({ message: 'Weight label is required' });
    if (grams < 0 || !Number.isFinite(grams)) {
      return res.status(400).json({ message: 'Grams must be a valid positive number' });
    }
    if (defaultPrice < 0 || !Number.isFinite(defaultPrice)) {
      return res.status(400).json({ message: 'Default price must be a valid non-negative number' });
    }

    const [result] = await pool.query(
      'INSERT INTO weights (label, grams, default_price) VALUES (?, ?, ?)',
      [label, Math.round(grams), Number(defaultPrice.toFixed(2))]
    );
    const [rows] = await pool.query(
      'SELECT id, label, grams, default_price, created_at FROM weights WHERE id = ?',
      [result.insertId]
    );
    res.status(201).json(formatWeightRow(rows[0]));
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'This weight option already exists' });
    }
    console.error('Error adding weight:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/weights/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const label = typeof req.body.label === 'string' ? req.body.label.trim() : '';
    const grams = Number(req.body.grams) || 0;
    const defaultPrice = req.body.defaultPrice !== undefined && req.body.defaultPrice !== ''
      ? Number(req.body.defaultPrice)
      : 0;
    if (!label) return res.status(400).json({ message: 'Weight label is required' });
    if (grams < 0 || !Number.isFinite(grams)) {
      return res.status(400).json({ message: 'Grams must be a valid positive number' });
    }
    if (defaultPrice < 0 || !Number.isFinite(defaultPrice)) {
      return res.status(400).json({ message: 'Default price must be a valid non-negative number' });
    }

    const [result] = await pool.query(
      'UPDATE weights SET label = ?, grams = ?, default_price = ? WHERE id = ?',
      [label, Math.round(grams), Number(defaultPrice.toFixed(2)), id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Weight option not found' });
    }
    const [rows] = await pool.query(
      'SELECT id, label, grams, default_price, created_at FROM weights WHERE id = ?',
      [id]
    );
    res.json(formatWeightRow(rows[0]));
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'This weight option already exists' });
    }
    console.error('Error updating weight:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/weights/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM weights WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Weight option not found' });
    }
    res.json({ message: 'Weight deleted' });
  } catch (error) {
    console.error('Error deleting weight:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Gallery Routes
app.get('/api/gallery', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM gallery ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/gallery', async (req, res) => {
  try {
    const { title, description, category, image } = req.body;
    if (!title || !category || !image) {
      return res.status(400).json({ message: 'Title, category, and image are required' });
    }
    const [result] = await pool.query(
      'INSERT INTO gallery (title, description, category, image) VALUES (?, ?, ?, ?)',
      [title, description, category, image]
    );
    
    // Fetch and return the created image
    const [rows] = await pool.query('SELECT * FROM gallery WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error adding gallery image:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/gallery/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM gallery WHERE id = ?', [id]);
    res.json({ message: 'Gallery image deleted' });
  } catch (error) {
    console.error('Error deleting gallery image:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Contact Route
app.post('/api/contact', verifyToken, async (req, res) => {
  try {
    const { name, emailOrPhone, subject, message } = req.body;
    const userId = req.user.id;
    
    if (!name || !emailOrPhone || !message) {
      return res.status(400).json({ message: 'Name, Email/Phone, and Message are required' });
    }

    await pool.query(
      'INSERT INTO messages (user_id, name, email_or_phone, subject, message) VALUES (?, ?, ?, ?, ?)',
      [userId, name, emailOrPhone, subject, message]
    );
    
    res.status(201).json({ message: 'Message saved successfully' });
  } catch (error) {
    console.error('Error saving contact message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
