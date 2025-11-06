import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import routes
import * as authRoutesModule from './routes/auth';
import * as accommodationsRoutesModule from './routes/accommodations';
import * as roomsRoutesModule from './routes/rooms';
import * as bookingsRoutesModule from './routes/bookings';
import * as reviewsRoutesModule from './routes/reviews';
import * as amenitiesRoutesModule from './routes/amenities';
import * as favouritesRoutesModule from './routes/favourites';
import * as usersRoutesModule from './routes/users';
import * as adminRoutesModule from './routes/admin';

const authRoutes = (authRoutesModule as any).default || authRoutesModule;
const accommodationsRoutes = (accommodationsRoutesModule as any).default || accommodationsRoutesModule;
const roomsRoutes = (roomsRoutesModule as any).default || roomsRoutesModule;
const bookingsRoutes = (bookingsRoutesModule as any).default || bookingsRoutesModule;
const reviewsRoutes = (reviewsRoutesModule as any).default || reviewsRoutesModule;
const amenitiesRoutes = (amenitiesRoutesModule as any).default || amenitiesRoutesModule;
const favouritesRoutes = (favouritesRoutesModule as any).default || favouritesRoutesModule;
const usersRoutes = (usersRoutesModule as any).default || usersRoutesModule;
const adminRoutes = (adminRoutesModule as any).default || adminRoutesModule;

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

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
});

export default app;
