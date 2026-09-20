import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import listingRoutes from './routes/listingRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5055;

// Middlewares & CORS configuration
const corsOrigin = process.env.CORS_ORIGIN;
let corsOptions = {
  credentials: true,
};

if (corsOrigin && corsOrigin !== '*') {
  const allowedOrigins = corsOrigin.split(',').map((o) => o.trim());
  corsOptions.origin = (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  };
} else {
  corsOptions.origin = true;
}

app.use(cors(corsOptions));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/orders', orderRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'FarmNexus API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
  });
});

// Resolve frontend build directory: '../client/dist' relative to server directory
const candidatePaths = [
  path.resolve(process.cwd(), '../client/dist'),
  path.resolve(__dirname, '../../client/dist'),
  path.resolve(process.cwd(), 'client/dist'),
];

const clientDistPath = candidatePaths.find((p) => fs.existsSync(path.join(p, 'index.html'))) || path.resolve(process.cwd(), '../client/dist');
const indexPath = path.join(clientDistPath, 'index.html');
const hasFrontendBuild = fs.existsSync(indexPath);

console.log(`📦 Frontend build path: ${clientDistPath} (index.html found: ${hasFrontendBuild})`);

// Serve static frontend assets if built
if (hasFrontendBuild) {
  app.use(express.static(clientDistPath));
}

// 404 handler for unmatched API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found.' });
});

// SPA fallback: serve index.html for all non-API GET requests
app.get('*', (req, res) => {
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('FarmNexus App: Frontend build not found or route not handled.');
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`🌾 FarmNexus Server running on http://localhost:${PORT}`);
});

export default app;
