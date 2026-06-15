import express from 'express';
import pool from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

// Get user cart
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      `SELECT c.*, p.id as product_id, p.slug, p.name, p.shortDescription, p.description, 
              p.category_name as category, p.price, p.originalPrice, p.inStock, 
              p.featured, p.weightOptions, p.images
       FROM cart_items c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?`,
      [userId]
    );

    const cartItems = rows.map(row => {
      let weightOptions = [];
      if (typeof row.weightOptions === 'string') {
        weightOptions = JSON.parse(row.weightOptions);
      } else {
        weightOptions = row.weightOptions;
      }
      
      const selectedWeight = weightOptions.find(w => w.label === row.weight_label && w.grams == row.weight_grams) 
        || weightOptions.find(w => w.label === row.weight_label) 
        || weightOptions[0];

      return {
        productId: String(row.product_id),
        quantity: row.quantity,
        selectedWeight: selectedWeight,
        product: {
          id: String(row.product_id),
          slug: row.slug,
          name: row.name,
          shortDescription: row.shortDescription,
          description: row.description,
          category: row.category,
          price: Number(row.price),
          originalPrice: Number(row.originalPrice),
          inStock: Boolean(row.inStock),
          featured: Boolean(row.featured),
          weightOptions: weightOptions,
          images: row.images ? JSON.parse(row.images) : [],
        }
      };
    });

    res.json(cartItems);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add to cart
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, weightLabel, weightGrams, quantity } = req.body;

    if (!productId || !weightLabel || !quantity) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const safeWeightGrams = weightGrams || 0;

    // Check if item exists
    const [existing] = await pool.query(
      'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ? AND weight_label = ? AND weight_grams = ?',
      [userId, productId, weightLabel, safeWeightGrams]
    );

    if (existing.length > 0) {
      await pool.query(
        'UPDATE cart_items SET quantity = quantity + ? WHERE id = ?',
        [quantity, existing[0].id]
      );
    } else {
      await pool.query(
        'INSERT INTO cart_items (user_id, product_id, weight_label, weight_grams, quantity) VALUES (?, ?, ?, ?, ?)',
        [userId, productId, weightLabel, safeWeightGrams, quantity]
      );
    }

    res.status(200).json({ message: 'Cart updated' });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update cart item quantity
router.put('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, weightLabel, weightGrams, quantity } = req.body;
    
    const safeWeightGrams = weightGrams || 0;

    if (quantity <= 0) {
      await pool.query(
        'DELETE FROM cart_items WHERE user_id = ? AND product_id = ? AND weight_label = ? AND weight_grams = ?',
        [userId, productId, weightLabel, safeWeightGrams]
      );
    } else {
      await pool.query(
        'UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ? AND weight_label = ? AND weight_grams = ?',
        [quantity, userId, productId, weightLabel, safeWeightGrams]
      );
    }

    res.status(200).json({ message: 'Cart updated' });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove item from cart
router.delete('/item', async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, weightLabel, weightGrams } = req.body;
    
    const safeWeightGrams = weightGrams || 0;

    await pool.query(
      'DELETE FROM cart_items WHERE user_id = ? AND product_id = ? AND weight_label = ? AND weight_grams = ?',
      [userId, productId, weightLabel, safeWeightGrams]
    );

    res.status(200).json({ message: 'Item removed' });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear cart
router.delete('/', async (req, res) => {
  try {
    const userId = req.user.id;
    await pool.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);
    res.status(200).json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
