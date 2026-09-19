import express from 'express';
import db from '../config/firebase.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// ==========================================
// GET FARMER'S ORDERS (ACCEPTED & REJECTED)
// ==========================================
router.get('/farmer', authenticate, requireRole('farmer'), async (req, res) => {
  try {
    const ordersSnap = await db.collection('orders')
      .where('farmerId', '==', req.user.id)
      .get();

    const orders = [];
    ordersSnap.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Sort newest first
    orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

    return res.json({ success: true, orders });
  } catch (err) {
    console.error('Fetch farmer orders error:', err);
    return res.status(500).json({ success: false, message: 'Server error while fetching orders.' });
  }
});

// ==========================================
// GET BUYER'S ORDERS (ACCEPTED & REJECTED)
// ==========================================
router.get('/buyer', authenticate, requireRole('buyer'), async (req, res) => {
  try {
    const ordersSnap = await db.collection('orders')
      .where('buyerId', '==', req.user.id)
      .get();

    const orders = [];
    ordersSnap.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

    return res.json({ success: true, orders });
  } catch (err) {
    console.error('Fetch buyer orders error:', err);
    return res.status(500).json({ success: false, message: 'Server error while fetching your orders.' });
  }
});

// ==========================================
// ADD/UPDATE DELIVERY CHARGE (FARMER ONLY)
// ==========================================
router.patch('/:id/delivery-charge', authenticate, requireRole('farmer'), async (req, res) => {
  try {
    const orderId = req.params.id;
    const { deliveryCharge } = req.body;

    const numDeliveryCharge = Number(deliveryCharge);
    if (isNaN(numDeliveryCharge) || numDeliveryCharge < 0) {
      return res.status(400).json({
        success: false,
        message: 'Delivery charge must be a valid number greater than or equal to zero.',
      });
    }

    const orderRef = db.collection('orders').doc(orderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = orderSnap.data();

    if (order.farmerId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this order.' });
    }

    if (order.status === 'REJECTED') {
      return res.status(400).json({ success: false, message: 'Cannot set delivery charge for a rejected order.' });
    }

    const cropAmount = Number(order.cropAmount);
    const totalAmount = cropAmount + numDeliveryCharge;

    const updateData = {
      deliveryCharge: numDeliveryCharge,
      totalAmount,
      updatedAt: new Date().toISOString(),
    };

    await orderRef.update(updateData);

    return res.json({
      success: true,
      message: 'Delivery charge updated successfully.',
      order: { id: orderId, ...order, ...updateData },
    });
  } catch (err) {
    console.error('Update delivery charge error:', err);
    return res.status(500).json({ success: false, message: 'Server error while updating delivery charge.' });
  }
});

// ==========================================
// UPDATE ORDER STATUS (FARMER ONLY)
// ==========================================
// Flow: Accepted -> Ready -> Shipped -> Delivered
// A rejected order cannot move to Ready, Shipped, or Delivered.
router.patch('/:id/status', authenticate, requireRole('farmer'), async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    const validStatuses = ['READY', 'SHIPPED', 'DELIVERED'];
    const uppercaseStatus = (status || '').toUpperCase();

    if (!validStatuses.includes(uppercaseStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const orderRef = db.collection('orders').doc(orderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = orderSnap.data();

    if (order.farmerId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this order.' });
    }

    if (order.status === 'REJECTED') {
      return res.status(400).json({
        success: false,
        message: 'A rejected order cannot move to Ready, Shipped, or Delivered.',
      });
    }

    // Enforce sequential transition:
    // ACCEPTED -> READY -> SHIPPED -> DELIVERED
    const transitions = {
      'ACCEPTED': ['READY'],
      'READY': ['SHIPPED'],
      'SHIPPED': ['DELIVERED'],
      'DELIVERED': [],
    };

    const allowedNext = transitions[order.status] || [];
    if (!allowedNext.includes(uppercaseStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${order.status} to ${uppercaseStatus}. Allowed next status: ${allowedNext.join(', ') || 'None (order completed)'}.`,
      });
    }

    const updateData = {
      status: uppercaseStatus,
      updatedAt: new Date().toISOString(),
    };

    await orderRef.update(updateData);

    return res.json({
      success: true,
      message: `Order status updated to ${uppercaseStatus}.`,
      order: { id: orderId, ...order, ...updateData },
    });
  } catch (err) {
    console.error('Update status error:', err);
    return res.status(500).json({ success: false, message: 'Server error while updating order status.' });
  }
});

export default router;
