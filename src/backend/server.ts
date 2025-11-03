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
import auditLogsRoutes from './routes/auditLogs';

dotenv.config();

// Initialize Express app
const app = express();
const PORT = parseInt(process.env.PORT || '5001', 10);

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
app.use('/api/promo-codes', promoCodesRoutes); // Public promo codes endpoint
app.use('/api/refunds', refundsRoutes); // Public refunds endpoint
app.use('/api/inquiries', inquiriesRoutes); // Public inquiries endpoint
app.use('/api/reports', reportsRoutes); // Public reports endpoint
app.use('/api/staff', staffRoutes); // Public staff endpoint
app.use('/api/audit-logs', auditLogsRoutes); // Audit logs endpoint
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: ErrorWithStatus, _req: Request, res: Response, _next: NextFunction) => {
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

// Start server - Force localhost IPv4
console.log('🔄 Attempting to start server...');
const server = app.listen(PORT, 'localhost', () => {
  const addr = server.address();
  console.log(`✅ Server successfully bound to port ${PORT}`);
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 API available at http://localhost:${PORT}/api`);
  console.log(`⏰ Server started at: ${new Date().toISOString()}`);
  console.log(`📍 Listening on:`, addr);
});

server.on('error', (err: Error) => {
  console.error('❌ Server error:', err);
  process.exit(1);
});

server.on('listening', () => {
  const addr = server.address();
  console.log('🎧 Server is now listening:', addr);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('❌ Uncaught Exception:', err);
  console.error('Stack:', err.stack);
  console.error('Process will NOT exit - investigating issue');
  // Don't exit immediately, wait a bit to see what happens
  setTimeout(() => {
    console.error('⚠️ Still alive after exception');
  }, 1000);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown) => {
  console.error('❌ Unhandled Rejection:');
  console.error('Reason:', reason);
  if (reason instanceof Error) {
    console.error('Stack:', reason.stack);
  }
  console.error('Process will NOT exit - investigating issue');
});

export default app;
