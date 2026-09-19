import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { createLocalFirestore } from './localFirestore.js';

dotenv.config();

let db;
let isRealFirestore = false;

try {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || process.env.GOOGLE_APPLICATION_CREDENTIALS;
  
  if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    db = admin.firestore();
    isRealFirestore = true;
    console.log('✅ Connected to Google Firebase Cloud Firestore successfully.');
  } else if (process.env.FIREBASE_CONFIG_JSON) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG_JSON);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    db = admin.firestore();
    isRealFirestore = true;
    console.log('✅ Connected to Google Firebase Cloud Firestore via FIREBASE_CONFIG_JSON.');
  } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
    db = admin.firestore();
    isRealFirestore = true;
    console.log('✅ Connected to Google Firebase Cloud Firestore via discrete environment variables.');
  } else {
    console.log('ℹ️ No Firebase Service Account key detected in .env. Initializing local persistent Firestore store.');
    console.log('ℹ️ (All operations use standard Firestore collection/doc API; data stored at server/data/firestore_db.json).');
    db = createLocalFirestore();
  }
} catch (err) {
  console.warn('⚠️ Error initializing Firebase Admin, falling back to local Firestore store:', err.message);
  db = createLocalFirestore();
}

export { db, isRealFirestore };
export default db;
