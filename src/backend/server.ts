import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth';
import accommodationsRoutes from './routes/accommodations';
import roomsRoutes from './routes/rooms';
import bookingsRoutes from './routes/bookings';
import reviewsRoutes from './routes/reviews';
import amenitiesRoutes from './routes/amenities';
import favouritesRoutes from './routes/favourites';
import usersRoutes from './routes/users';
import adminRoutes from './routes/admin';
import staffRoutes from './routes/staff';
import promoCodesRoutes from './routes/promoCodes';
import refundsRoutes from './routes/refunds';
import inquiriesRoutes from './routes/inquiries';
import emailTemplatesRoutes from './routes/emailTemplates';
import reportsRoutes from './routes/reports';
import analyticsRoutes from './routes/analytics';

dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Body parsing middleware with increased limit for image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/accommodations', accommodationsRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/amenities', amenitiesRoutes);
app.use('/api/favourites', favouritesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/staff', staffRoutes);
app.use('/api/admin/promo-codes', promoCodesRoutes);
app.use('/api/admin/refunds', refundsRoutes);
app.use('/api/admin/inquiries', inquiriesRoutes);
app.use('/api/admin/email-templates', emailTemplatesRoutes);
app.use('/api/admin/reports', reportsRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error handling middleware
interface ErrorWithStatus extends Error {
  status?: number;
}

app.use((err: ErrorWithStatus, req: Request, res: Response, _next: NextFunction) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 API available at http://localhost:${PORT}/api`);
}).on('error', (err: Error) => {
  console.error('❌ Server error:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app;
