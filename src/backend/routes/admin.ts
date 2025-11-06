import express, { Response } from 'express';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';
import db from '../config/database';

const router = express.Router();

// Dashboard statistics
router.get('/dashboard/stats', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const stats = await db.query(
      `SELECT 
         (SELECT COUNT(*) FROM users WHERE role = 'user') as total_users,
         (SELECT COUNT(*) FROM accommodations WHERE is_active = true) as total_accommodations,
         (SELECT COUNT(*) FROM rooms WHERE is_active = true) as total_rooms,
         (SELECT COUNT(*) FROM bookings) as total_bookings,
         (SELECT COUNT(*) FROM bookings WHERE status = 'pending') as pending_bookings,
         (SELECT COUNT(*) FROM bookings WHERE status = 'confirmed') as confirmed_bookings,
         (SELECT COUNT(*) FROM bookings WHERE status = 'completed') as completed_bookings,
         (SELECT COUNT(*) FROM bookings WHERE status = 'cancelled') as cancelled_bookings,
         (SELECT COALESCE(SUM(total_amount), 0) FROM bookings WHERE status != 'cancelled') as total_revenue,
         (SELECT COALESCE(SUM(total_amount), 0) FROM bookings 
          WHERE status != 'cancelled' 
            AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
            AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)) as monthly_revenue,
         (SELECT COUNT(*) FROM reviews) as total_reviews,
         (SELECT COALESCE(AVG(rating), 0) FROM reviews) as avg_rating`
    );

    res.json(stats.rows[0]);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Recent bookings
router.get('/bookings/recent', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await db.query(
      `SELECT b.*,
              a.name as accommodation_name,
              a.city as accommodation_city,
              u.name as user_name,
              u.email as user_email
       FROM bookings b
       JOIN accommodations a ON a.id = b.accommodation_id
       JOIN users u ON u.id = b.user_id
       ORDER BY b.created_at DESC
       LIMIT $1`,
      [limit]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching recent bookings:', error);
    res.status(500).json({ error: 'Failed to fetch recent bookings' });
  }
});

// Revenue analytics
router.get('/analytics/revenue', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { period = 'month' } = req.query; // day, week, month, year

    let groupBy: string;
    let dateFormat: string;

    switch (period) {
      case 'day':
        groupBy = 'DATE(created_at)';
        dateFormat = 'YYYY-MM-DD';
        break;
      case 'week':
        groupBy = 'DATE_TRUNC(\'week\', created_at)';
        dateFormat = 'YYYY-"W"IW';
        break;
      case 'year':
        groupBy = 'EXTRACT(YEAR FROM created_at)';
        dateFormat = 'YYYY';
        break;
      default: // month
        groupBy = 'DATE_TRUNC(\'month\', created_at)';
        dateFormat = 'YYYY-MM';
    }

    const result = await db.query(
      `SELECT 
         TO_CHAR(${groupBy}, '${dateFormat}') as period,
         COUNT(*) as bookings,
         COALESCE(SUM(total_amount), 0) as revenue
       FROM bookings
       WHERE status != 'cancelled'
         AND created_at >= CURRENT_DATE - INTERVAL '12 months'
       GROUP BY ${groupBy}
       ORDER BY ${groupBy} DESC
       LIMIT 12`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    res.status(500).json({ error: 'Failed to fetch revenue analytics' });
  }
});

// Popular accommodations
router.get('/analytics/popular-accommodations', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await db.query(
      `SELECT 
         a.id,
         a.name,
         a.city,
         a.star_rating,
         COUNT(DISTINCT b.id) as total_bookings,
         COALESCE(SUM(b.total_amount), 0) as total_revenue,
         COALESCE(AVG(r.rating), 0) as avg_rating,
         COUNT(DISTINCT r.id) as review_count
       FROM accommodations a
       LEFT JOIN bookings b ON b.accommodation_id = a.id AND b.status != 'cancelled'
       LEFT JOIN reviews r ON r.accommodation_id = a.id
       WHERE a.is_active = true
       GROUP BY a.id, a.name, a.city, a.star_rating
       ORDER BY total_bookings DESC
       LIMIT $1`,
      [limit]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching popular accommodations:', error);
    res.status(500).json({ error: 'Failed to fetch popular accommodations' });
  }
});

// Audit logs
router.get('/audit-logs', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    const result = await db.query(
      `SELECT al.*,
              u.name as user_name,
              u.email as user_email
       FROM admin_audit_logs al
       LEFT JOIN users u ON u.id = al.user_id
       ORDER BY al.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await db.query(
      'SELECT COUNT(*) as total FROM admin_audit_logs'
    );

    const total = parseInt(countResult.rows[0].total);

    res.json({
      logs: result.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// Log admin action
router.post('/audit-logs', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { action, entity_type, entity_id, changes } = req.body;
    const userId = req.user!.id;

    const result = await db.query(
      `INSERT INTO admin_audit_logs (user_id, action, entity_type, entity_id, changes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, action, entity_type, entity_id, JSON.stringify(changes)]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating audit log:', error);
    res.status(500).json({ error: 'Failed to create audit log' });
  }
});

// Occupancy rate
router.get('/analytics/occupancy', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { start_date, end_date } = req.query;

    const result = await db.query(
      `SELECT 
         a.name as accommodation_name,
         COUNT(DISTINCT b.id) as bookings,
         SUM(EXTRACT(DAY FROM (b.check_out_date - b.check_in_date))) as total_nights
       FROM accommodations a
       LEFT JOIN bookings b ON b.accommodation_id = a.id 
         AND b.status IN ('confirmed', 'completed')
         AND ($1::date IS NULL OR b.check_in_date >= $1)
         AND ($2::date IS NULL OR b.check_out_date <= $2)
       WHERE a.is_active = true
       GROUP BY a.id, a.name
       ORDER BY total_nights DESC`,
      [start_date || null, end_date || null]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching occupancy data:', error);
    res.status(500).json({ error: 'Failed to fetch occupancy data' });
  }
});

// User growth analytics
router.get('/analytics/user-growth', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await db.query(
      `SELECT 
         TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') as month,
         COUNT(*) as new_users
       FROM users
       WHERE role = 'user'
         AND created_at >= CURRENT_DATE - INTERVAL '12 months'
       GROUP BY DATE_TRUNC('month', created_at)
       ORDER BY month DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user growth:', error);
    res.status(500).json({ error: 'Failed to fetch user growth data' });
  }
});

// System health check
router.get('/health', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const dbCheck = await db.query('SELECT NOW()');
    
    const systemInfo = {
      status: 'healthy',
      database: 'connected',
      timestamp: dbCheck.rows[0].now,
      uptime: process.uptime(),
      memory: process.memoryUsage()
    };

    res.json(systemInfo);
  } catch (error: unknown) {
    console.error('Health check error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      status: 'unhealthy',
      error: errorMessage
    });
  }
});

export default router;
