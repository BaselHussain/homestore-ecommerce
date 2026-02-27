import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import prisma from './lib/prisma';
import productRoutes from './routes/products';
import cartRoutes from './routes/cart';
import wishlistRoutes from './routes/wishlist';
import orderRoutes from './routes/orders';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter((v) => !process.env[v]);
if (missingVars.length > 0) {
  console.error(`[FATAL] Missing required environment variables: ${missingVars.join(', ')}`);
  console.error('Copy .env.example to .env and fill in your values.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow Next.js to fetch assets
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging in development
if (process.env.NODE_ENV === 'development') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);

// 404 handler (must come after all routes)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Validate database connection
    await prisma.$connect();
    console.log('[DB] Connected to Neon PostgreSQL');

    app.listen(PORT, () => {
      console.log(`[SERVER] Running on http://localhost:${PORT}`);
      console.log(`[SERVER] Environment: ${process.env.NODE_ENV ?? 'development'}`);
    });
  } catch (error) {
    console.error('[FATAL] Failed to connect to database:', error);
    process.exit(1);
  }
};

startServer();
