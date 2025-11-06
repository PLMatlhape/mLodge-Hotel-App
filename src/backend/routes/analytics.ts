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

    if (period === 'year') {
      dateFormat = 'YYYY-MM';
    }

    const result = await db.query(
      `SELECT 
        TO_CHAR(created_at, $1) as date,
        COUNT(*) as count,
        COALESCE(SUM(total_price), 0) as revenue
       FROM bookings
       WHERE created_at >= NOW() - INTERVAL '1 ${period}'
       GROUP BY TO_CHAR(created_at, $1)
       ORDER BY date`,
      [dateFormat]
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

    if (period === 'year') {
      dateFormat = 'YYYY-MM';
    }

    const result = await db.query(
      `SELECT 
        TO_CHAR(created_at, $1) as date,
        COALESCE(SUM(total_price), 0) as revenue
       FROM bookings
       WHERE status IN ('confirmed', 'completed')
         AND created_at >= NOW() - INTERVAL '1 ${period}'
       GROUP BY TO_CHAR(created_at, $1)
       ORDER BY date`,
      [dateFormat]
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

// Get performance statistics with period comparison
router.get('/performance-stats', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { period = 'year' } = req.query; // 'week', 'month', 'quarter', 'year'
    
    // Calculate date ranges
    let currentPeriodStart: Date;
    let previousPeriodStart: Date;
    let previousPeriodEnd: Date;
    const now = new Date();

    switch (period) {
      case 'week':
        currentPeriodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousPeriodStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        previousPeriodEnd = currentPeriodStart;
        break;
      case 'month':
        currentPeriodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        previousPeriodStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        previousPeriodEnd = currentPeriodStart;
        break;
      case 'quarter':
        currentPeriodStart = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        previousPeriodStart = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        previousPeriodEnd = currentPeriodStart;
        break;
      case 'year':
      default:
        currentPeriodStart = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        previousPeriodStart = new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000);
        previousPeriodEnd = currentPeriodStart;
    }

    // Get current period statistics
    const currentStats = await db.query(
      `SELECT 
        COUNT(*) as total_bookings,
        COALESCE(SUM(total_price), 0) as total_revenue,
        COALESCE(AVG(EXTRACT(DAY FROM (check_out_date - check_in_date))), 0) as avg_stay_duration
       FROM bookings
       WHERE created_at >= $1 AND created_at <= $2
         AND status IN ('confirmed', 'completed')`,
      [currentPeriodStart, now]
    );

    // Get previous period statistics
    const previousStats = await db.query(
      `SELECT 
        COUNT(*) as total_bookings,
        COALESCE(SUM(total_price), 0) as total_revenue,
        COALESCE(AVG(EXTRACT(DAY FROM (check_out_date - check_in_date))), 0) as avg_stay_duration
       FROM bookings
       WHERE created_at >= $1 AND created_at < $2
         AND status IN ('confirmed', 'completed')`,
      [previousPeriodStart, previousPeriodEnd]
    );

    // Calculate occupancy for current period
    const occupancyResult = await db.query(
      `SELECT 
        COUNT(DISTINCT DATE(d.date)) as booked_days,
        (SELECT SUM(quantity) FROM rooms WHERE is_active = true) as total_rooms
       FROM bookings b
       CROSS JOIN LATERAL generate_series(
         GREATEST(b.check_in_date, $1::date),
         LEAST(b.check_out_date - INTERVAL '1 day', $2::date),
         '1 day'::interval
       ) AS d(date)
       WHERE b.status IN ('confirmed', 'completed')
         AND b.check_in_date <= $2
         AND b.check_out_date >= $1`,
      [currentPeriodStart, now]
    );

    // Calculate occupancy for previous period
    const previousOccupancyResult = await db.query(
      `SELECT 
        COUNT(DISTINCT DATE(d.date)) as booked_days,
        (SELECT SUM(quantity) FROM rooms WHERE is_active = true) as total_rooms
       FROM bookings b
       CROSS JOIN LATERAL generate_series(
         GREATEST(b.check_in_date, $1::date),
         LEAST(b.check_out_date - INTERVAL '1 day', $2::date),
         '1 day'::interval
       ) AS d(date)
       WHERE b.status IN ('confirmed', 'completed')
         AND b.check_in_date <= $2
         AND b.check_out_date >= $1`,
      [previousPeriodStart, previousPeriodEnd]
    );

    const current = currentStats.rows[0] || { total_bookings: 0, total_revenue: 0, avg_stay_duration: 0 };
    const previous = previousStats.rows[0] || { total_bookings: 0, total_revenue: 0, avg_stay_duration: 0 };
    
    const currentOccupancy = occupancyResult.rows[0] || { booked_days: 0, total_rooms: 1 };
    const previousOccupancy = previousOccupancyResult.rows[0] || { booked_days: 0, total_rooms: 1 };
    
    // Calculate period length in days
    const periodDays = Math.ceil((now.getTime() - currentPeriodStart.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate occupancy percentages
    const totalRooms = parseInt(currentOccupancy.total_rooms) || 1;
    const totalPossibleRoomDays = totalRooms * periodDays;
    const currentOccupancyRate = totalPossibleRoomDays > 0 
      ? (parseInt(currentOccupancy.booked_days) / totalPossibleRoomDays) * 100 
      : 0;
    
    const previousOccupancyRate = totalPossibleRoomDays > 0 
      ? (parseInt(previousOccupancy.booked_days) / totalPossibleRoomDays) * 100 
      : 0;

    // Calculate percentage changes
    const bookingsChange = previous.total_bookings > 0
      ? ((parseInt(current.total_bookings) - parseInt(previous.total_bookings)) / parseInt(previous.total_bookings)) * 100
      : parseInt(current.total_bookings) > 0 ? 100 : 0;

    const revenueChange = parseFloat(previous.total_revenue) > 0
      ? ((parseFloat(current.total_revenue) - parseFloat(previous.total_revenue)) / parseFloat(previous.total_revenue)) * 100
      : parseFloat(current.total_revenue) > 0 ? 100 : 0;

    const occupancyChange = previousOccupancyRate > 0
      ? currentOccupancyRate - previousOccupancyRate
      : currentOccupancyRate;

    const stayDurationChange = parseFloat(previous.avg_stay_duration) > 0
      ? parseFloat(current.avg_stay_duration) - parseFloat(previous.avg_stay_duration)
      : parseFloat(current.avg_stay_duration);

    res.json({
      totalBookings: {
        value: parseInt(current.total_bookings),
        change: parseFloat(bookingsChange.toFixed(1)),
        changeType: bookingsChange >= 0 ? 'increase' : 'decrease'
      },
      revenue: {
        value: parseFloat(current.total_revenue),
        change: parseFloat(revenueChange.toFixed(1)),
        changeType: revenueChange >= 0 ? 'increase' : 'decrease'
      },
      avgOccupancy: {
        value: parseFloat(currentOccupancyRate.toFixed(1)),
        change: parseFloat(occupancyChange.toFixed(1)),
        changeType: occupancyChange >= 0 ? 'increase' : 'decrease'
      },
      avgStayDuration: {
        value: parseFloat(parseFloat(current.avg_stay_duration).toFixed(1)),
        change: parseFloat(stayDurationChange.toFixed(1)),
        changeType: stayDurationChange >= 0 ? 'increase' : 'decrease'
      }
    });
  } catch (error) {
    console.error('Error fetching performance stats:', error);
    res.json({
      totalBookings: { value: 0, change: 0, changeType: 'increase' },
      revenue: { value: 0, change: 0, changeType: 'increase' },
      avgOccupancy: { value: 0, change: 0, changeType: 'increase' },
      avgStayDuration: { value: 0, change: 0, changeType: 'increase' }
    });
  }
});

// Get room type distribution (for pie chart)
router.get('/room-type-distribution', authenticateToken, requireAdmin, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await db.query(
      `SELECT 
        r.room_type as name,
        COUNT(b.id) as value,
        '#0F51AF' as color
       FROM rooms r
       LEFT JOIN booking_items bi ON bi.room_id = r.id
       LEFT JOIN bookings b ON b.id = bi.booking_id AND b.status IN ('confirmed', 'completed')
       WHERE r.is_active = true
       GROUP BY r.room_type
       ORDER BY value DESC`
    );

    // Assign different colors to each room type
    const colors = ['#0F51AF', '#627182', '#001C43', '#D9D9D9', '#4A90E2'];
    const data = result.rows.map((row, index) => ({
      ...row,
      value: parseInt(row.value),
      color: colors[index % colors.length]
    }));

    res.json(data);
  } catch (error) {
    console.error('Error fetching room type distribution:', error);
    res.json([]);
  }
});

// Get booking sources (for bar chart)
router.get('/booking-sources', authenticateToken, requireAdmin, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await db.query(
      `SELECT 
        COALESCE(source, 'Website') as source,
        COUNT(*) as bookings
       FROM bookings
       WHERE status IN ('confirmed', 'completed')
       GROUP BY source
       ORDER BY bookings DESC`
    );

    res.json(result.rows.map(row => ({
      source: row.source,
      bookings: parseInt(row.bookings)
    })));
  } catch (error) {
    console.error('Error fetching booking sources:', error);
    res.json([
      { source: 'Website', bookings: 0 },
      { source: 'Mobile App', bookings: 0 },
      { source: 'Phone', bookings: 0 },
      { source: 'Walk-in', bookings: 0 }
    ]);
  }
});

export default router;
