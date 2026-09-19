import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../config/firebase.js';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();

// Helper to normalize phone number (strip whitespace, dashes)
const normalizePhone = (phone) => {
  if (!phone) return '';
  return String(phone).trim().replace(/[\s\-\(\)]/g, '');
};

// ==========================================
// FARMER REGISTRATION
// ==========================================
router.post('/farmer/register', async (req, res) => {
  try {
    const { name, phone, password, village, district, state, cropsGrown } = req.body;

    // Strict validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Farmer name is required.' });
    }
    const cleanPhone = normalizePhone(phone);
    if (!cleanPhone || cleanPhone.length < 10) {
      return res.status(400).json({ success: false, message: 'A valid 10-digit phone number is required.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }
    if (!village || !village.trim()) {
      return res.status(400).json({ success: false, message: 'Village name is required.' });
    }
    if (!district || !district.trim()) {
      return res.status(400).json({ success: false, message: 'District is required.' });
    }
    if (!state || !state.trim()) {
      return res.status(400).json({ success: false, message: 'State is required.' });
    }
    if (!Array.isArray(cropsGrown) || cropsGrown.length === 0) {
      return res.status(400).json({ success: false, message: 'Please select at least one crop grown.' });
    }

    // Check if phone number is already registered in farmers or buyers
    const existingFarmerQuery = await db.collection('farmers').where('phone', '==', cleanPhone).get();
    if (!existingFarmerQuery.empty) {
      return res.status(400).json({ success: false, message: 'Phone number is already registered as a Farmer.' });
    }
    const existingBuyerQuery = await db.collection('buyers').where('phone', '==', cleanPhone).get();
    if (!existingBuyerQuery.empty) {
      return res.status(400).json({ success: false, message: 'Phone number is already registered as a Buyer.' });
    }

    // Hash password securely
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const farmerData = {
      name: name.trim(),
      phone: cleanPhone,
      passwordHash,
      village: village.trim(),
      district: district.trim(),
      state: state.trim(),
      cropsGrown,
      role: 'farmer',
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection('farmers').add(farmerData);
    const farmerId = docRef.id;

    const token = generateToken({
      id: farmerId,
      phone: cleanPhone,
      name: farmerData.name,
      role: 'farmer',
    });

    // Strip passwordHash before response
    const { passwordHash: _, ...safeFarmer } = farmerData;

    return res.status(201).json({
      success: true,
      message: 'Farmer registered successfully.',
      token,
      user: { id: farmerId, ...safeFarmer },
    });
  } catch (err) {
    console.error('Farmer registration error:', err);
    return res.status(500).json({ success: false, message: 'Server error during farmer registration.' });
  }
});

// ==========================================
// BUYER REGISTRATION
// ==========================================
router.post('/buyer/register', async (req, res) => {
  try {
    const { name, phone, password, address, villageCity, district, state } = req.body;

    // Strict validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Buyer name is required.' });
    }
    const cleanPhone = normalizePhone(phone);
    if (!cleanPhone || cleanPhone.length < 10) {
      return res.status(400).json({ success: false, message: 'A valid 10-digit phone number is required.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }
    if (!address || !address.trim()) {
      return res.status(400).json({ success: false, message: 'Address is required.' });
    }
    if (!villageCity || !villageCity.trim()) {
      return res.status(400).json({ success: false, message: 'Village/City is required.' });
    }
    if (!district || !district.trim()) {
      return res.status(400).json({ success: false, message: 'District is required.' });
    }
    if (!state || !state.trim()) {
      return res.status(400).json({ success: false, message: 'State is required.' });
    }

    // Check if phone number is already registered in farmers or buyers
    const existingFarmerQuery = await db.collection('farmers').where('phone', '==', cleanPhone).get();
    if (!existingFarmerQuery.empty) {
      return res.status(400).json({ success: false, message: 'Phone number is already registered as a Farmer.' });
    }
    const existingBuyerQuery = await db.collection('buyers').where('phone', '==', cleanPhone).get();
    if (!existingBuyerQuery.empty) {
      return res.status(400).json({ success: false, message: 'Phone number is already registered as a Buyer.' });
    }

    // Hash password securely
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const buyerData = {
      name: name.trim(),
      phone: cleanPhone,
      passwordHash,
      address: address.trim(),
      villageCity: villageCity.trim(),
      district: district.trim(),
      state: state.trim(),
      role: 'buyer',
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection('buyers').add(buyerData);
    const buyerId = docRef.id;

    const token = generateToken({
      id: buyerId,
      phone: cleanPhone,
      name: buyerData.name,
      role: 'buyer',
    });

    const { passwordHash: _, ...safeBuyer } = buyerData;

    return res.status(201).json({
      success: true,
      message: 'Buyer registered successfully.',
      token,
      user: { id: buyerId, ...safeBuyer },
    });
  } catch (err) {
    console.error('Buyer registration error:', err);
    return res.status(500).json({ success: false, message: 'Server error during buyer registration.' });
  }
});

// ==========================================
// LOGIN (PHONE + PASSWORD)
// ==========================================
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    const cleanPhone = normalizePhone(phone);

    if (!cleanPhone) {
      return res.status(400).json({ success: false, message: 'Phone number is required.' });
    }
    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required.' });
    }

    // Check farmer collection first
    const farmerSnap = await db.collection('farmers').where('phone', '==', cleanPhone).get();
    if (!farmerSnap.empty) {
      const doc = farmerSnap.docs[0];
      const farmer = doc.data();
      const isMatch = await bcrypt.compare(password, farmer.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid phone number or password.' });
      }

      const token = generateToken({
        id: doc.id,
        phone: farmer.phone,
        name: farmer.name,
        role: 'farmer',
      });

      const { passwordHash: _, ...safeFarmer } = farmer;
      return res.json({
        success: true,
        message: 'Farmer login successful.',
        token,
        user: { id: doc.id, ...safeFarmer },
      });
    }

    // Check buyer collection
    const buyerSnap = await db.collection('buyers').where('phone', '==', cleanPhone).get();
    if (!buyerSnap.empty) {
      const doc = buyerSnap.docs[0];
      const buyer = doc.data();
      const isMatch = await bcrypt.compare(password, buyer.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid phone number or password.' });
      }

      const token = generateToken({
        id: doc.id,
        phone: buyer.phone,
        name: buyer.name,
        role: 'buyer',
      });

      const { passwordHash: _, ...safeBuyer } = buyer;
      return res.json({
        success: true,
        message: 'Buyer login successful.',
        token,
        user: { id: doc.id, ...safeBuyer },
      });
    }

    return res.status(401).json({ success: false, message: 'Account not found with this phone number.' });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// ==========================================
// GET CURRENT USER PROFILE
// ==========================================
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided.' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'farmnexus_secure_jwt_secret_key_2025_agri');

    const collection = decoded.role === 'farmer' ? 'farmers' : 'buyers';
    const docSnap = await db.collection(collection).doc(decoded.id).get();

    if (!docSnap.exists) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const userData = docSnap.data();
    const { passwordHash: _, ...safeUser } = userData;

    return res.json({
      success: true,
      user: { id: docSnap.id, ...safeUser },
    });
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
});

export default router;
