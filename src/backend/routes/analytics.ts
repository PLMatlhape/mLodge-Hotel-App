import express, { Response } from 'express';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';
import db from '../config/database';

const router = express.Router();

// Get dashboard overview statistics
router.get('/dashboard', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Default values in case of empty database
    let totalBookings = 0;
    let totalRevenue = 0;
    let totalAccommodations = 0;
    let totalUsers = 0;
    let pendingBookings = 0;
    let todayCheckIns = 0;
    let activeReviews = 0;
    let averageRating = 0;

    try {
      // Total bookings
      const bookingsResult = await db.query('SELECT COUNT(*) as total FROM bookings');
      totalBookings = parseInt(bookingsResult.rows[0]?.total || '0');
    } catch (err) {
      console.log('Bookings table might not exist yet:', err);
    }

    try {
      // Total revenue
      const revenueResult = await db.query(
        `SELECT COALESCE(SUM(total_price), 0) as total 
         FROM bookings 
         WHERE status IN ('confirmed', 'completed')`
      );
      totalRevenue = parseFloat(revenueResult.rows[0]?.total || '0');
    } catch (err) {
      console.log('Revenue query failed:', err);
    }

    try {
      // Total accommodations
      const accommodationsResult = await db.query('SELECT COUNT(*) as total FROM accommodations WHERE is_active = true');
      totalAccommodations = parseInt(accommodationsResult.rows[0]?.total || '0');
    } catch (err) {
      console.log('Accommodations table might not exist yet:', err);
    }

    try {
      // Total users
      const usersResult = await db.query('SELECT COUNT(*) as total FROM users WHERE is_active = true');
      totalUsers = parseInt(usersResult.rows[0]?.total || '0');
    } catch (err) {
      console.log('Users table might not exist yet:', err);
    }

    try {
      // Pending bookings
      const pendingResult = await db.query(`SELECT COUNT(*) as total FROM bookings WHERE status = 'pending'`);
      pendingBookings = parseInt(pendingResult.rows[0]?.total || '0');
    } catch (err) {
      console.log('Pending bookings query failed:', err);
    }

    try {
      // Today's check-ins
      const todayCheckInsResult = await db.query(
        `SELECT COUNT(*) as total FROM bookings 
         WHERE check_in_date = CURRENT_DATE 
         AND status IN ('confirmed', 'completed')`
      );
      todayCheckIns = parseInt(todayCheckInsResult.rows[0]?.total || '0');
    } catch (err) {
      console.log('Today check-ins query failed:', err);
    }

    try {
      // Active reviews
      const reviewsResult = await db.query(`SELECT COUNT(*) as total FROM reviews WHERE status = 'approved'`);
      activeReviews = parseInt(reviewsResult.rows[0]?.total || '0');
    } catch (err) {
      console.log('Reviews table might not exist yet:', err);
    }

    try {
      // Average rating
      const avgRatingResult = await db.query(`SELECT COALESCE(AVG(rating), 0) as avg FROM reviews WHERE status = 'approved'`);
      averageRating = parseFloat(avgRatingResult.rows[0]?.avg || '0');
    } catch (err) {
      console.log('Average rating query failed:', err);
    }

    res.json({
      totalBookings,
      totalRevenue,
      totalAccommodations,
      totalUsers,
      pendingBookings,
      todayCheckIns,
      activeReviews,
      averageRating
    });
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    // Return zeros instead of error for empty database
    res.json({
      totalBookings: 0,
      totalRevenue: 0,
      totalAccommodations: 0,
      totalUsers: 0,
      pendingBookings: 0,
      todayCheckIns: 0,
      activeReviews: 0,
      averageRating: 0
    });
  }
});

// Get booking trends
router.get('/booking-trends', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { period = 'month' } = req.query;
    let dateFormat = 'YYYY-MM-DD';
    let dateInterval = '1 month';

    if (period === 'week') {
      dateInterval = '1 week';
    } else if (period === 'year') {
      dateFormat = 'YYYY-MM';
      dateInterval = '1 year';
    }

    const result = await db.query(
      `SELECT 
        TO_CHAR(created_at, $1) as date,
        COUNT(*) as count,
        COALESCE(SUM(total_price), 0) as revenue
       FROM bookings
       WHERE created_at >= NOW() - INTERVAL $2
       GROUP BY TO_CHAR(created_at, $1)
       ORDER BY date`,
      [dateFormat, dateInterval]
    );

    res.json(result.rows || []);
  } catch (error) {
    console.error('Error fetching booking trends:', error);
    // Return empty array for empty database
    res.json([]);
  }
});

// Get revenue trends
router.get('/revenue-trends', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { period = 'month' } = req.query;
    let dateFormat = 'YYYY-MM-DD';
    let dateInterval = '1 month';

    if (period === 'week') {
      dateInterval = '1 week';
    } else if (period === 'year') {
      dateFormat = 'YYYY-MM';
      dateInterval = '1 year';
    }

    const result = await db.query(
      `SELECT 
        TO_CHAR(created_at, $1) as date,
        COALESCE(SUM(total_price), 0) as revenue
       FROM bookings
       WHERE status IN ('confirmed', 'completed')
         AND created_at >= NOW() - INTERVAL $2
       GROUP BY TO_CHAR(created_at, $1)
       ORDER BY date`,
      [dateFormat, dateInterval]
    );

    res.json(result.rows || []);
  } catch (error) {
    console.error('Error fetching revenue trends:', error);
    // Return empty array for empty database
    res.json([]);
  }
});

// Get recent bookings
router.get('/recent-bookings', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { limit = 5 } = req.query;

    const result = await db.query(
      `SELECT 
        b.id,
        b.booking_reference,
        b.status,
        b.total_price,
        b.check_in_date,
        b.check_out_date,
        b.created_at,
        u.name as guest_name,
        u.email as guest_email,
        a.name as accommodation_name
       FROM bookings b
       JOIN users u ON u.id = b.user_id
       JOIN accommodations a ON a.id = b.accommodation_id
       ORDER BY b.created_at DESC
       LIMIT $1`,
      [limit]
    );

    res.json(result.rows || []);
  } catch (error) {
    console.error('Error fetching recent bookings:', error);
    // Return empty array for empty database
    res.json([]);
  }
});

// Get top accommodations by bookings
router.get('/top-accommodations', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { limit = 5 } = req.query;

    const result = await db.query(
      `SELECT 
        a.id,
        a.name,
        a.city,
        COUNT(b.id) as booking_count,
        COALESCE(SUM(b.total_price), 0) as total_revenue,
        COALESCE(AVG(r.rating), 0) as average_rating
       FROM accommodations a
       LEFT JOIN bookings b ON b.accommodation_id = a.id
       LEFT JOIN reviews r ON r.accommodation_id = a.id AND r.status = 'approved'
       WHERE a.is_active = true
       GROUP BY a.id, a.name, a.city
       ORDER BY booking_count DESC
       LIMIT $1`,
      [limit]
    );

    res.json(result.rows || []);
  } catch (error) {
    console.error('Error fetching top accommodations:', error);
    // Return empty array for empty database
    res.json([]);
  }
});

// Get booking status distribution
router.get('/booking-status', authenticateToken, requireAdmin, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await db.query(
      `SELECT 
        status,
        COUNT(*) as count
       FROM bookings
       GROUP BY status
       ORDER BY count DESC`
    );

    res.json(result.rows || []);
  } catch (error) {
    console.error('Error fetching booking status:', error);
    // Return empty array for empty database
    res.json([]);
  }
});

export default router;
