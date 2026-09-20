import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createLocalFirestore } from './localFirestore.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db;
let isRealFirestore = false;

const isProduction = process.env.NODE_ENV === 'production';

try {
  // Resolve candidate service account paths
  const envPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || process.env.GOOGLE_APPLICATION_CREDENTIALS;
  let serviceAccountPath = null;

  if (envPath) {
    const candidates = [
      envPath,
      path.resolve(process.cwd(), envPath),
      path.resolve(__dirname, '../../', envPath),
    ];
    serviceAccountPath = candidates.find((p) => fs.existsSync(p)) || null;
  }

  // Check default local serviceAccountKey.json location only if envPath is not explicitly set
  if (!serviceAccountPath && !envPath) {
    const defaultLocalKeyPath = path.resolve(__dirname, '../../serviceAccountKey.json');
    if (fs.existsSync(defaultLocalKeyPath)) {
      serviceAccountPath = defaultLocalKeyPath;
    }
  }

  if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    db = admin.firestore();
    isRealFirestore = true;
    console.log('✅ Connected to Google Firebase Cloud Firestore successfully from service account file.');
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
    if (isProduction) {
      const errorMsg = 'FATAL: Firebase credentials are required in production (NODE_ENV=production). ' +
        'Please configure FIREBASE_CONFIG_JSON or discrete variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY). ' +
        'Fallback to temporary local storage is strictly disabled in production.';
      console.error(`❌ ${errorMsg}`);
      throw new Error(errorMsg);
    }

    console.log('ℹ️ No Firebase Service Account key detected in .env. Initializing local persistent Firestore store.');
    console.log('ℹ️ (All operations use standard Firestore collection/doc API; data stored at server/data/firestore_db.json).');
    db = createLocalFirestore();
    isRealFirestore = false;
  }
} catch (err) {
  console.error('❌ Error initializing Firebase Admin:', err.message);
  if (isProduction) {
    throw err;
  }
  console.warn('⚠️ Falling back to local Firestore store for non-production environment.');
  db = createLocalFirestore();
  isRealFirestore = false;
}

export { db, isRealFirestore };
export default db;
