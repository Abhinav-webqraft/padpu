import express from 'express';
import pool from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/reviews/product/:productId — all reviews + avg rating for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    const [reviews] = await pool.query(
      `SELECT r.id, r.rating, r.review_text, r.created_at,
              u.name as user_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ?
       ORDER BY r.created_at DESC`,
      [productId]
    );

    const [stats] = await pool.query(
      `SELECT ROUND(AVG(rating), 1) as avgRating, COUNT(*) as reviewCount
       FROM reviews WHERE product_id = ?`,
      [productId]
    );

    res.json({
      reviews,
      avgRating: parseFloat(stats[0].avgRating) || 0,
      reviewCount: parseInt(stats[0].reviewCount) || 0,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error.message);
    res.status(500).json({ message: 'Server error fetching reviews' });
  }
});

// POST /api/reviews — submit a review (auth required)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { product_id, rating, review_text } = req.body;
    const user_id = req.user.id;

    if (!product_id || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'product_id and rating (1-5) are required' });
    }

    await pool.query(
      `INSERT INTO reviews (product_id, user_id, rating, review_text)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = VALUES(rating), review_text = VALUES(review_text)`,
      [product_id, user_id, rating, review_text || null]
    );

    // Return updated stats
    const [stats] = await pool.query(
      `SELECT ROUND(AVG(rating), 1) as avgRating, COUNT(*) as reviewCount
       FROM reviews WHERE product_id = ?`,
      [product_id]
    );

    res.status(201).json({
      success: true,
      message: 'Review submitted',
      avgRating: parseFloat(stats[0].avgRating) || 0,
      reviewCount: parseInt(stats[0].reviewCount) || 0,
    });
  } catch (error) {
    console.error('Error submitting review:', error.message);
    res.status(500).json({ message: 'Server error submitting review' });
  }
});

export default router;

