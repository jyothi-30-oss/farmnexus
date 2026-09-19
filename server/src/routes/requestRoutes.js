import express from 'express';
import db from '../config/firebase.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// ==========================================
// SEND PURCHASE REQUEST (BUYER ONLY)
// ==========================================
// Buyer enters ONLY: requiredQuantity
router.post('/', authenticate, requireRole('buyer'), async (req, res) => {
  try {
    const { listingId, requiredQuantity } = req.body;

    if (!listingId) {
      return res.status(400).json({ success: false, message: 'Listing ID is required.' });
    }

    const numQuantity = Number(requiredQuantity);
    if (isNaN(numQuantity) || numQuantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Required quantity must be a positive number greater than zero.',
      });
    }

    // Fetch listing
    const listingRef = db.collection('listings').doc(listingId);
    const listingSnap = await listingRef.get();

    if (!listingSnap.exists) {
      return res.status(404).json({ success: false, message: 'Crop listing not found.' });
    }

    const listing = listingSnap.data();

    if (listing.status !== 'ACTIVE' || Number(listing.availableQuantity) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'This crop listing is no longer available.',
      });
    }

    if (numQuantity > Number(listing.availableQuantity)) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity (${numQuantity} ${listing.unit}) exceeds available quantity (${listing.availableQuantity} ${listing.unit}).`,
      });
    }

    // Fetch buyer details
    const buyerSnap = await db.collection('buyers').doc(req.user.id).get();
    if (!buyerSnap.exists) {
      return res.status(404).json({ success: false, message: 'Buyer profile not found.' });
    }
    const buyer = buyerSnap.data();

    // Calculate crop amount: Quantity × Final Price Per Unit
    const finalPricePerUnit = Number(listing.finalPricePerUnit);
    const cropAmount = numQuantity * finalPricePerUnit;

    const requestData = {
      listingId,
      cropName: listing.cropName,
      requestedQuantity: numQuantity,
      unit: listing.unit,
      finalPricePerUnit,
      cropAmount,
      farmerId: listing.farmerId,
      farmerName: listing.farmerName,
      farmerPhone: listing.farmerPhone,
      farmerVillage: listing.village,
      farmerDistrict: listing.district,
      farmerState: listing.state,
      buyerId: req.user.id,
      buyerName: buyer.name,
      buyerPhone: buyer.phone,
      buyerAddress: buyer.address,
      buyerVillageCity: buyer.villageCity,
      buyerDistrict: buyer.district,
      buyerState: buyer.state,
      requestDate: new Date().toISOString(),
      status: 'PENDING',
    };

    const docRef = await db.collection('requests').add(requestData);

    return res.status(201).json({
      success: true,
      message: 'Purchase request sent to farmer successfully.',
      request: { id: docRef.id, ...requestData },
    });
  } catch (err) {
    console.error('Send request error:', err);
    return res.status(500).json({ success: false, message: 'Server error while sending purchase request.' });
  }
});

// ==========================================
// GET FARMER PENDING REQUESTS
// ==========================================
// The Buyer Requests page must show ONLY pending requests.
router.get('/farmer', authenticate, requireRole('farmer'), async (req, res) => {
  try {
    const requestsSnap = await db.collection('requests')
      .where('farmerId', '==', req.user.id)
      .where('status', '==', 'PENDING')
      .get();

    const pendingRequests = [];
    requestsSnap.forEach((doc) => {
      pendingRequests.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Sort newest first
    pendingRequests.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));

    return res.json({ success: true, requests: pendingRequests });
  } catch (err) {
    console.error('Fetch pending requests error:', err);
    return res.status(500).json({ success: false, message: 'Server error while fetching pending requests.' });
  }
});

// ==========================================
// GET BUYER'S SENT REQUESTS (PENDING STATUS)
// ==========================================
router.get('/buyer', authenticate, requireRole('buyer'), async (req, res) => {
  try {
    const requestsSnap = await db.collection('requests')
      .where('buyerId', '==', req.user.id)
      .get();

    const requests = [];
    requestsSnap.forEach((doc) => {
      requests.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    requests.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));

    return res.json({ success: true, requests });
  } catch (err) {
    console.error('Fetch buyer requests error:', err);
    return res.status(500).json({ success: false, message: 'Server error while fetching requests.' });
  }
});

// ==========================================
// ACCEPT PURCHASE REQUEST (FARMER ONLY)
// ==========================================
router.post('/:id/accept', authenticate, requireRole('farmer'), async (req, res) => {
  try {
    const requestId = req.params.id;
    const requestRef = db.collection('requests').doc(requestId);
    const requestSnap = await requestRef.get();

    if (!requestSnap.exists) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    const request = requestSnap.data();

    if (request.farmerId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to accept this request.' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `This request has already been ${request.status.toLowerCase()}.`,
      });
    }

    // Check listing and remaining quantity
    const listingRef = db.collection('listings').doc(request.listingId);
    const listingSnap = await listingRef.get();

    if (!listingSnap.exists) {
      return res.status(404).json({ success: false, message: 'Associated crop listing not found.' });
    }

    const listing = listingSnap.data();
    const currentAvailable = Number(listing.availableQuantity);
    const requestedQuantity = Number(request.requestedQuantity);

    // Business rule: validate available quantity before accepting so quantity never becomes negative
    if (requestedQuantity > currentAvailable) {
      return res.status(400).json({
        success: false,
        message: `Cannot accept: Available quantity is now ${currentAvailable} ${listing.unit}, but requested quantity is ${requestedQuantity} ${listing.unit}.`,
      });
    }

    // 1. Deduct quantity from listing
    const updatedAvailable = currentAvailable - requestedQuantity;
    const listingUpdate = {
      availableQuantity: updatedAvailable,
    };
    if (updatedAvailable === 0) {
      listingUpdate.status = 'SOLD_OUT';
    }
    await listingRef.update(listingUpdate);

    // 2. Mark request as ACCEPTED
    await requestRef.update({
      status: 'ACCEPTED',
      decidedAt: new Date().toISOString(),
    });

    // 3. Automatically create order into My Orders with status ACCEPTED
    const orderData = {
      requestId,
      listingId: request.listingId,
      farmerId: req.user.id,
      farmerName: request.farmerName,
      farmerPhone: request.farmerPhone,
      farmerVillage: request.farmerVillage,
      farmerDistrict: request.farmerDistrict,
      farmerState: request.farmerState,
      buyerId: request.buyerId,
      buyerName: request.buyerName,
      buyerPhone: request.buyerPhone,
      buyerAddress: request.buyerAddress,
      buyerVillageCity: request.buyerVillageCity,
      buyerDistrict: request.buyerDistrict,
      buyerState: request.buyerState,
      cropName: request.cropName,
      quantity: requestedQuantity,
      unit: request.unit,
      finalPricePerUnit: request.finalPricePerUnit,
      cropAmount: request.cropAmount,
      deliveryCharge: 0,
      totalAmount: request.cropAmount, // Total = Crop Amount + Delivery Charge
      status: 'ACCEPTED',
      orderDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const orderRef = await db.collection('orders').add(orderData);

    return res.json({
      success: true,
      message: 'Request accepted successfully. Order created in My Orders.',
      order: { id: orderRef.id, ...orderData },
    });
  } catch (err) {
    console.error('Accept request error:', err);
    return res.status(500).json({ success: false, message: 'Server error while accepting request.' });
  }
});

// ==========================================
// REJECT PURCHASE REQUEST (FARMER ONLY)
// ==========================================
router.post('/:id/reject', authenticate, requireRole('farmer'), async (req, res) => {
  try {
    const requestId = req.params.id;
    const requestRef = db.collection('requests').doc(requestId);
    const requestSnap = await requestRef.get();

    if (!requestSnap.exists) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    const request = requestSnap.data();

    if (request.farmerId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to reject this request.' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `This request has already been ${request.status.toLowerCase()}.`,
      });
    }

    // Mark request as REJECTED
    await requestRef.update({
      status: 'REJECTED',
      decidedAt: new Date().toISOString(),
    });

    // Automatically create/move into My Orders with REJECTED status
    const orderData = {
      requestId,
      listingId: request.listingId,
      farmerId: req.user.id,
      farmerName: request.farmerName,
      farmerPhone: request.farmerPhone,
      farmerVillage: request.farmerVillage,
      farmerDistrict: request.farmerDistrict,
      farmerState: request.farmerState,
      buyerId: request.buyerId,
      buyerName: request.buyerName,
      buyerPhone: request.buyerPhone,
      buyerAddress: request.buyerAddress,
      buyerVillageCity: request.buyerVillageCity,
      buyerDistrict: request.buyerDistrict,
      buyerState: request.buyerState,
      cropName: request.cropName,
      quantity: request.requestedQuantity,
      unit: request.unit,
      finalPricePerUnit: request.finalPricePerUnit,
      cropAmount: request.cropAmount,
      deliveryCharge: 0,
      totalAmount: request.cropAmount,
      status: 'REJECTED',
      orderDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const orderRef = await db.collection('orders').add(orderData);

    return res.json({
      success: true,
      message: 'Request rejected. Recorded in My Orders.',
      order: { id: orderRef.id, ...orderData },
    });
  } catch (err) {
    console.error('Reject request error:', err);
    return res.status(500).json({ success: false, message: 'Server error while rejecting request.' });
  }
});

export default router;
