import express from 'express';
import pool from '../db.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const router = express.Router();

// Calculate total on the backend (for MVP we will use a basic calculation based on items sent)
// In a real app, we should fetch prices from the DB
const calculateOrderTotal = async (items) => {
  let subtotal = 0;
  
  for (const item of items) {
    // Ideally fetch product price from DB using item.product_id
    // But since the frontend sends selectedWeight price, we will use it for MVP.
    // To be perfectly secure, we'd query: SELECT weightOptions FROM products WHERE id = item.productId
    // For now, trusting frontend price but calculating totals here.
    const price = item.selectedWeight.price;
    subtotal += price * item.quantity;
  }

  const TAX_RATE = 0.06;
  const shippingCharge = subtotal >= 500 || subtotal === 0 ? 0 : 60;
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax + shippingCharge;
  
  return { subtotal, tax, shippingCharge, total };
};

router.post('/create', async (req, res) => {
  try {
    const { items, form } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const { subtotal, tax, shippingCharge, total } = await calculateOrderTotal(items);
    
    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'test_key',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'test_secret',
    });

    const rzpOrder = await razorpay.orders.create({
      amount: total * 100, // amount in paise
      currency: "INR",
      receipt: `temp-${Date.now()}`, // Temporary receipt ID
    });

    res.json({
      success: true,
      order: {
        amount: total,
        currency: "INR",
        razorpay_order_id: rzpOrder.id
      }
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Server error while creating order' });
  }
});

router.post('/verify', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, items, form, userId } = req.body;
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing parameters' });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || 'test_secret';

    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');

    if (digest !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Transaction not legit!' });
    }

    const { subtotal, tax, shippingCharge, total } = await calculateOrderTotal(items);
    const orderNumber = `PF-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`;

    const shippingAddress = {
      fullName: form.fullName,
      phone: form.phone,
      line1: form.line1,
      city: form.city,
      state: form.state,
      pincode: form.pincode
    };

    await connection.beginTransaction();

    const [orderResult] = await connection.query(
      `INSERT INTO orders 
      (orderNumber, customerName, customerEmail, customerPhone, shippingAddress, subtotal, tax, shippingCharge, total, paymentMethod, paymentStatus, razorpay_order_id, razorpay_payment_id, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderNumber, 
        form.fullName, 
        form.email, 
        form.phone, 
        JSON.stringify(shippingAddress), 
        subtotal, 
        tax, 
        shippingCharge, 
        total, 
        form.payment, 
        'paid', 
        razorpay_order_id,
        razorpay_payment_id,
        userId || null
      ]
    );

    const orderId = orderResult.insertId;

    for (const item of items) {
      let pid = parseInt(item.productId.toString().replace('prod-', ''));
      if (isNaN(pid)) pid = 1;

      await connection.query(
        `INSERT INTO order_items (order_id, product_id, weight_label, quantity, price)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, pid, item.selectedWeight.label, item.quantity, item.selectedWeight.price]
      );
    }

    await connection.commit();

    res.json({ success: true, message: 'Payment verified successfully', orderId });
  } catch (error) {
    await connection.rollback();
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Server error during verification' });
  } finally {
    connection.release();
  }
});

router.post('/cod', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { items, form, userId } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const { subtotal, tax, shippingCharge, total } = await calculateOrderTotal(items);
    const orderNumber = `PF-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`;

    const shippingAddress = {
      fullName: form.fullName,
      phone: form.phone,
      line1: form.line1,
      city: form.city,
      state: form.state,
      pincode: form.pincode
    };

    await connection.beginTransaction();

    const [orderResult] = await connection.query(
      `INSERT INTO orders 
      (orderNumber, customerName, customerEmail, customerPhone, shippingAddress, subtotal, tax, shippingCharge, total, paymentMethod, paymentStatus, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderNumber, 
        form.fullName, 
        form.email, 
        form.phone, 
        JSON.stringify(shippingAddress), 
        subtotal, 
        tax, 
        shippingCharge, 
        total, 
        'cod', 
        'pending',
        userId || null
      ]
    );

    const orderId = orderResult.insertId;

    for (const item of items) {
      let pid = parseInt(item.productId.toString().replace('prod-', ''));
      if (isNaN(pid)) pid = 1;

      await connection.query(
        `INSERT INTO order_items (order_id, product_id, weight_label, quantity, price)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, pid, item.selectedWeight.label, item.quantity, item.selectedWeight.price]
      );
    }

    await connection.commit();

    res.json({ success: true, message: 'COD order placed successfully', orderId });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating COD order:', error);
    res.status(500).json({ message: 'Server error while creating COD order' });
  } finally {
    connection.release();
  }
});
router.get('/', async (req, res) => {
  try {
    const [orders] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    
    // Fetch items for each order
    for (const order of orders) {
      // Parse shipping address if it's a string
      if (typeof order.shippingAddress === 'string') {
        try {
          order.shippingAddress = JSON.parse(order.shippingAddress);
        } catch (e) {
          order.shippingAddress = {};
        }
      }

      // Rename created_at to createdAt, etc. for frontend
      order.id = order.id.toString();
      order.createdAt = order.created_at;
      order.updatedAt = order.updated_at;
      order.total = parseFloat(order.total) || 0;
      order.subtotal = parseFloat(order.subtotal) || 0;
      order.tax = parseFloat(order.tax) || 0;
      order.shippingCharge = parseFloat(order.shippingCharge) || 0;
      order.discount = parseFloat(order.discount) || 0;

      // Fetch items for this order
      const [items] = await pool.query(
        `SELECT oi.*, p.name as product_name, p.images as product_images 
         FROM order_items oi 
         JOIN products p ON oi.product_id = p.id 
         WHERE oi.order_id = ?`,
        [order.id]
      );
      
      order.items = items.map(item => ({
        product: {
          id: item.product_id.toString(),
          name: item.product_name,
          images: item.product_images ? JSON.parse(item.product_images) : []
        },
        selectedWeight: {
          label: item.weight_label,
          price: parseFloat(item.price) || 0
        },
        quantity: item.quantity
      }));
    }
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error while fetching orders' });
  }
});

router.get('/my-orders', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: 'UserId is required' });
    }
    
    const [orders] = await pool.query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    
    for (const order of orders) {
      if (typeof order.shippingAddress === 'string') {
        try { order.shippingAddress = JSON.parse(order.shippingAddress); } catch (e) { order.shippingAddress = {}; }
      }
      order.id = order.id.toString();
      order.createdAt = order.created_at;
      order.updatedAt = order.updated_at;
      order.total = parseFloat(order.total) || 0;
      order.subtotal = parseFloat(order.subtotal) || 0;
      order.tax = parseFloat(order.tax) || 0;
      order.shippingCharge = parseFloat(order.shippingCharge) || 0;
      order.discount = parseFloat(order.discount) || 0;

      const [items] = await pool.query(
        `SELECT oi.*, p.name as product_name, p.images as product_images 
         FROM order_items oi 
         JOIN products p ON oi.product_id = p.id 
         WHERE oi.order_id = ?`,
        [order.id]
      );
      
      order.items = items.map(item => ({
        product: {
          id: item.product_id.toString(),
          name: item.product_name,
          images: item.product_images ? JSON.parse(item.product_images) : []
        },
        selectedWeight: {
          label: item.weight_label,
          price: parseFloat(item.price) || 0
        },
        quantity: item.quantity
      }));
    }
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Server error while fetching user orders' });
  }
});

router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    await pool.query(`
      UPDATE orders 
      SET orderStatus = ?, 
          paymentStatus = CASE 
            WHEN ? = 'delivered' AND paymentMethod = 'cod' THEN 'paid' 
            WHEN ? != 'delivered' AND paymentMethod = 'cod' THEN 'pending'
            ELSE paymentStatus 
          END
      WHERE id = ?
    `, [status, status, status, id]);
    res.json({ success: true, message: 'Order status updated' });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error while updating order status' });
  }
});

export default router;
