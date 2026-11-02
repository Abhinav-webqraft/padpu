import express from 'express';
import pool from '../db.js';

const router = express.Router();

const formatProduct = (row) => ({
  ...row,
  id: String(row.id),
  category: row.category_name,
  inStock: Boolean(row.inStock),
  featured: Boolean(row.featured),
  price: Number(row.price),
  originalPrice: row.originalPrice != null ? Number(row.originalPrice) : undefined,
  weightOptions: typeof row.weightOptions === 'string' ? JSON.parse(row.weightOptions) : (row.weightOptions || []),
  images: row.images ? (typeof row.images === 'string' ? JSON.parse(row.images) : row.images) : [],
  avgRating: parseFloat(row.avgRating) || 0,
  rating: parseFloat(row.avgRating) || 0,
  reviewCount: parseInt(row.reviewCount) || 0,
});

const PRODUCT_SELECT = `
  SELECT p.*,
    ROUND(AVG(r.rating), 1) as avgRating,
    COUNT(r.id) as reviewCount
  FROM products p
  LEFT JOIN reviews r ON r.product_id = p.id
`;

// Get random products
router.get('/random', async (req, res) => {
  try {
    const [rows] = await pool.query(`${PRODUCT_SELECT} GROUP BY p.id ORDER BY RAND() LIMIT 4`);
    res.json(rows.map(formatProduct));
  } catch (error) {
    console.error('Error fetching random products:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all products
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`${PRODUCT_SELECT} GROUP BY p.id ORDER BY p.created_at DESC`);
    res.json(rows.map(formatProduct));
  } catch (error) {
    console.error('Error fetching products:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new product
router.post('/', async (req, res) => {
  try {
    const {
      slug, name, shortDescription, description, category,
      price, originalPrice, inStock, featured, weightOptions, images
    } = req.body;

    const [cats] = await pool.query('SELECT name FROM categories WHERE name = ?', [category]);
    if (cats.length === 0) {
      return res.status(400).json({ message: `Category "${category}" does not exist. Please create it first.` });
    }

    await pool.query(
      `INSERT INTO products 
      (slug, name, shortDescription, description, category_name, price, originalPrice, inStock, featured, weightOptions, images) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        slug, name, shortDescription || '', description || '', category,
        price, originalPrice || null, inStock ?? true, featured ?? false,
        JSON.stringify(weightOptions || []),
        JSON.stringify(images || [])
      ]
    );

    res.status(201).json({ message: 'Product added' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Product with this slug already exists' });
    }
    console.error('Error adding product:', error.code, error.message);
    res.status(500).json({ message: error.message || 'Server error adding product' });
  }
});

// Update a product
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      slug, name, shortDescription, description, category,
      price, originalPrice, inStock, featured, weightOptions, images
    } = req.body;

    const [cats] = await pool.query('SELECT name FROM categories WHERE name = ?', [category]);
    if (cats.length === 0) {
      return res.status(400).json({ message: `Category "${category}" does not exist. Please create it first.` });
    }

    await pool.query(
      `UPDATE products 
       SET slug = ?, name = ?, shortDescription = ?, description = ?, category_name = ?, 
           price = ?, originalPrice = ?, inStock = ?, featured = ?, weightOptions = ?, images = ?
       WHERE id = ?`,
      [
        slug, name, shortDescription || '', description || '', category,
        price, originalPrice || null, inStock ?? true, featured ?? false,
        JSON.stringify(weightOptions || []),
        JSON.stringify(images || []),
        id
      ]
    );

    res.json({ message: 'Product updated' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Product with this slug already exists' });
    }
    console.error('Error updating product:', error.code, error.message);
    res.status(500).json({ message: error.message || 'Server error updating product' });
  }
});

// Delete a product
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM products WHERE id = ?', [id]);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Error deleting product:', error.code, error.message);
    res.status(500).json({ message: error.message || 'Server error deleting product' });
  }
});

export default router;
