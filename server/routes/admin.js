import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.get('/dashboard', async (req, res) => {
  try {
    // Basic stats
    const [[{ totalRevenue }]] = await pool.query(`SELECT COALESCE(SUM(total), 0) as totalRevenue FROM orders WHERE paymentStatus = 'paid'`);
    const [[{ totalOrders }]] = await pool.query(`SELECT COUNT(*) as totalOrders FROM orders`);
    const [[{ pendingOrders }]] = await pool.query(`SELECT COUNT(*) as pendingOrders FROM orders WHERE orderStatus NOT IN ('delivered', 'cancelled')`);
    const [[{ lowStockProducts }]] = await pool.query(`SELECT COUNT(*) as lowStockProducts FROM products WHERE inStock = false`);

    // Recent orders
    const [recentOrders] = await pool.query(`SELECT * FROM orders ORDER BY created_at DESC LIMIT 5`);

    // Chart Data
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const revenueChartData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.getMonth();
      const y = d.getFullYear();
      const [rows] = await pool.query(`
        SELECT COALESCE(SUM(total), 0) as rev 
        FROM orders 
        WHERE paymentStatus = 'paid' AND MONTH(created_at) = ? AND YEAR(created_at) = ?
      `, [m + 1, y]);
      revenueChartData.push({ month: monthNames[m], revenue: Number(rows[0].rev) });
    }

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const ordersChartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const [rows] = await pool.query(`
        SELECT COUNT(*) as count 
        FROM orders 
        WHERE DATE(created_at) = DATE(?)
      `, [d.toISOString().split('T')[0]]);
      ordersChartData.push({ day: dayNames[d.getDay()], orders: Number(rows[0].count) });
    }

    res.json({
      success: true,
      data: {
        stats: {
          totalRevenue: Number(totalRevenue),
          totalOrders: Number(totalOrders),
          pendingOrders: Number(pendingOrders),
          lowStockProducts: Number(lowStockProducts)
        },
        recentOrders,
        revenueChartData,
        ordersChartData
      }
    });

  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
