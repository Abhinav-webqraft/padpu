import express from 'express';
import pool from '../db.js';

const router = express.Router();

let settingsCache = { data: null, expiresAt: 0 };
const SETTINGS_TTL_MS = 15000;

router.get('/dashboard', async (req, res) => {
  try {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const [
      [[statsRow]],
      [[{ lowStockProducts }]],
      [recentOrders],
      [monthlyRows],
      [dailyRows],
    ] = await Promise.all([
      pool.query(`
        SELECT
          COALESCE(SUM(CASE WHEN paymentStatus = 'paid' THEN total ELSE 0 END), 0) AS totalRevenue,
          COUNT(*) AS totalOrders,
          SUM(CASE WHEN orderStatus NOT IN ('delivered', 'cancelled') THEN 1 ELSE 0 END) AS pendingOrders
        FROM orders
      `),
      pool.query(`SELECT COUNT(*) AS lowStockProducts FROM products WHERE inStock = false`),
      pool.query(`SELECT * FROM orders ORDER BY created_at DESC LIMIT 5`),
      pool.query(
        `SELECT YEAR(created_at) AS yr, MONTH(created_at) AS mo, COALESCE(SUM(total), 0) AS rev
         FROM orders
         WHERE paymentStatus = 'paid' AND created_at >= ?
         GROUP BY YEAR(created_at), MONTH(created_at)`,
        [sixMonthsAgo]
      ),
      pool.query(
        `SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS dt, COUNT(*) AS count
         FROM orders
         WHERE created_at >= ?
         GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')`,
        [sevenDaysAgo]
      ),
    ]);

    const monthlyMap = new Map(monthlyRows.map((r) => [`${r.yr}-${r.mo}`, Number(r.rev)]));
    const revenueChartData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      revenueChartData.push({
        month: monthNames[d.getMonth()],
        revenue: monthlyMap.get(key) || 0,
      });
    }

    const dailyMap = new Map(dailyRows.map((r) => [r.dt, Number(r.count)]));
    const ordersChartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const key = `${yyyy}-${mm}-${dd}`;
      ordersChartData.push({
        day: dayNames[d.getDay()],
        orders: dailyMap.get(key) || 0,
      });
    }

    res.json({
      success: true,
      data: {
        stats: {
          totalRevenue: Number(statsRow.totalRevenue || 0),
          totalOrders: Number(statsRow.totalOrders || 0),
          pendingOrders: Number(statsRow.pendingOrders || 0),
          lowStockProducts: Number(lowStockProducts || 0),
        },
        recentOrders,
        revenueChartData,
        ordersChartData,
      },
    });
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/messages', async (req, res) => {
  try {
    const [messages] = await pool.query('SELECT * FROM messages ORDER BY created_at DESC');
    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('Error fetching admin messages:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/messages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await pool.query('UPDATE messages SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true, message: 'Message status updated' });
  } catch (error) {
    console.error('Error updating message status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/messages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM messages WHERE id = ?', [id]);
    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/settings', async (req, res) => {
  try {
    const now = Date.now();
    if (settingsCache.data && now < settingsCache.expiresAt) {
      return res.json({ success: true, data: settingsCache.data });
    }
    const [rows] = await pool.query('SELECT email, phone, address FROM settings LIMIT 1');
    const settings = rows[0] || { email: '', phone: '', address: '' };
    settingsCache = { data: settings, expiresAt: now + SETTINGS_TTL_MS };
    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/settings', async (req, res) => {
  try {
    const { email, phone, address } = req.body;

    const [result] = await pool.query(
      'UPDATE settings SET email = ?, phone = ?, address = ? WHERE id = 1',
      [email, phone, address]
    );

    if (result.affectedRows === 0) {
      await pool.query(
        'INSERT INTO settings (id, email, phone, address) VALUES (1, ?, ?, ?)',
        [email, phone, address]
      );
    }

    settingsCache = { data: { email, phone, address }, expiresAt: Date.now() + SETTINGS_TTL_MS };
    res.json({ success: true, message: 'Settings updated' });
  } catch (error) {
    console.error('Error updating admin settings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
