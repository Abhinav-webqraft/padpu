import express from 'express';
import pool from '../db.js';

const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    // Parse JSON strings back to objects
    const products = rows.map(row => ({
      ...row,
      category: row.category_name,
      inStock: Boolean(row.inStock),
      featured: Boolean(row.featured),
      price: Number(row.price),
      originalPrice: Number(row.originalPrice),
      weightOptions: typeof row.weightOptions === 'string' ? JSON.parse(row.weightOptions) : row.weightOptions,
      images: row.images ? JSON.parse(row.images) : [],
    }));
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
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

    await pool.query(
      `INSERT INTO products 
      (slug, name, shortDescription, description, category_name, price, originalPrice, inStock, featured, weightOptions, images) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        slug, name, shortDescription, description, category,
        price, originalPrice, inStock, featured, 
        JSON.stringify(weightOptions || []), 
        JSON.stringify(images || [])
      ]
    );

    res.status(201).json({ message: 'Product added' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Product with this slug already exists' });
    }
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Server error' });
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

    await pool.query(
      `UPDATE products 
       SET slug = ?, name = ?, shortDescription = ?, description = ?, category_name = ?, 
           price = ?, originalPrice = ?, inStock = ?, featured = ?, weightOptions = ?, images = ?
       WHERE id = ?`,
      [
        slug, name, shortDescription, description, category,
        price, originalPrice, inStock, featured, 
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
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a product
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM products WHERE id = ?', [id]);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
