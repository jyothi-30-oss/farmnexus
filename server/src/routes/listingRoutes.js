import express from 'express';
import db from '../config/firebase.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { MARKET_PRICES, VALID_UNITS, CROPS_LIST } from '../constants/marketPrices.js';

const router = express.Router();

// ==========================================
// CREATE LISTING (FARMER ONLY)
// ==========================================
router.post('/', authenticate, requireRole('farmer'), async (req, res) => {
  try {
    const { cropName, quantity, unit, expectedPricePerUnit } = req.body;

    // Validate crop
    if (!cropName || !CROPS_LIST.includes(cropName)) {
      return res.status(400).json({
        success: false,
        message: `Please select a valid crop from the supported list (${CROPS_LIST.join(', ')}).`,
      });
    }

    // Validate quantity
    const numQuantity = Number(quantity);
    if (isNaN(numQuantity) || numQuantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive number greater than zero.',
      });
    }

    // Validate unit
    if (!unit || !VALID_UNITS.includes(unit.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Please select a valid unit (${VALID_UNITS.join(', ')}).`,
      });
    }

    // Validate expected price per unit
    const numPrice = Number(expectedPricePerUnit);
    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Expected Price Per Unit must be a positive number greater than zero.',
      });
    }

    // Reference market price (always fixed reference)
    const referenceMarketPrice = MARKET_PRICES[cropName] || null;

    // Get farmer details from database to ensure fresh location/contact info
    const farmerSnap = await db.collection('farmers').doc(req.user.id).get();
    if (!farmerSnap.exists) {
      return res.status(404).json({ success: false, message: 'Farmer profile not found.' });
    }
    const farmerData = farmerSnap.data();

    // Verify that the crop being listed is among the farmer's registered crops
    const registeredCrops = Array.isArray(farmerData.cropsGrown) ? farmerData.cropsGrown : [];
    if (!registeredCrops.includes(cropName)) {
      return res.status(400).json({
        success: false,
        message: `You can only list crops that you selected during registration (${registeredCrops.join(', ') || 'none'}).`,
      });
    }

    const listingData = {
      farmerId: req.user.id,
      cropName,
      availableQuantity: numQuantity,
      initialQuantity: numQuantity,
      unit: unit.toLowerCase(),
      marketPrice: referenceMarketPrice, // Reference only
      finalPricePerUnit: numPrice,       // Farmer's expected price per unit is final price
      farmerName: farmerData.name,
      farmerPhone: farmerData.phone,
      village: farmerData.village,
      district: farmerData.district,
      state: farmerData.state,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection('listings').add(listingData);

    return res.status(201).json({
      success: true,
      message: 'Crop listing created successfully.',
      listing: { id: docRef.id, ...listingData },
    });
  } catch (err) {
    console.error('Create listing error:', err);
    return res.status(500).json({ success: false, message: 'Server error while creating listing.' });
  }
});

// ==========================================
// GET ACTIVE LISTINGS (FOR BUYERS TO BROWSE)
// ==========================================
router.get('/', authenticate, async (req, res) => {
  try {
    const listingsSnap = await db.collection('listings')
      .where('status', '==', 'ACTIVE')
      .get();

    const listings = [];
    listingsSnap.forEach((doc) => {
      const data = doc.data();
      // Only include active listings with available quantity > 0
      if (Number(data.availableQuantity) > 0) {
        listings.push({
          id: doc.id,
          ...data,
        });
      }
    });

    // Sort newest first
    listings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({ success: true, listings });
  } catch (err) {
    console.error('Fetch listings error:', err);
    return res.status(500).json({ success: false, message: 'Server error while fetching listings.' });
  }
});

// ==========================================
// GET FARMER'S ACTIVE LISTINGS
// ==========================================
router.get('/farmer', authenticate, requireRole('farmer'), async (req, res) => {
  try {
    const listingsSnap = await db.collection('listings')
      .where('farmerId', '==', req.user.id)
      .where('status', '==', 'ACTIVE')
      .get();

    const listings = [];
    listingsSnap.forEach((doc) => {
      const data = doc.data();
      // Auto-remove / hide when available quantity is 0
      if (Number(data.availableQuantity) > 0) {
        listings.push({
          id: doc.id,
          ...data,
        });
      }
    });

    listings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({ success: true, listings });
  } catch (err) {
    console.error('Fetch farmer listings error:', err);
    return res.status(500).json({ success: false, message: 'Server error while fetching your listings.' });
  }
});

// ==========================================
// UPDATE LISTING EXPECTED PRICE (FARMER ONLY)
// ==========================================
const handleUpdatePrice = async (req, res) => {
  try {
    const listingId = req.params.id;
    const { expectedPricePerUnit, newPrice, price } = req.body;

    const rawPrice = expectedPricePerUnit !== undefined ? expectedPricePerUnit : (newPrice !== undefined ? newPrice : price);
    const numPrice = Number(rawPrice);

    if (rawPrice === undefined || rawPrice === null || isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Expected price must be a valid positive number.',
      });
    }

    const listingRef = db.collection('listings').doc(listingId);
    const listingSnap = await listingRef.get();

    if (!listingSnap.exists) {
      return res.status(404).json({
        success: false,
        message: 'Crop listing not found.',
      });
    }

    const listing = listingSnap.data();

    // Verify that only the farmer who owns the listing can update it
    if (listing.farmerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You can only update your own listings.',
      });
    }

    // Verify listing is active
    if (listing.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: 'Only active listings can be updated.',
      });
    }

    const updatedData = {
      finalPricePerUnit: numPrice,
      updatedAt: new Date().toISOString(),
    };

    await listingRef.update(updatedData);

    return res.json({
      success: true,
      message: 'Expected price updated successfully.',
      listing: {
        id: listingId,
        ...listing,
        ...updatedData,
      },
    });
  } catch (err) {
    console.error('Update listing price error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating expected price.',
    });
  }
};

router.patch('/:id/price', authenticate, requireRole('farmer'), handleUpdatePrice);
router.put('/:id/price', authenticate, requireRole('farmer'), handleUpdatePrice);
router.patch('/:id', authenticate, requireRole('farmer'), handleUpdatePrice);

// ==========================================
// GET REFERENCE MARKET PRICES
// ==========================================
router.get('/market-prices', authenticate, (req, res) => {
  return res.json({
    success: true,
    marketPrices: MARKET_PRICES,
    crops: CROPS_LIST,
    units: VALID_UNITS,
  });
});

export default router;
