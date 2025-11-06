import express, { Response } from 'express';
import { query, validationResult } from 'express-validator';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';
import db from '../config/database';

const router = express.Router();

// Get all audit logs (admin only)
router.get('/', [
  authenticateToken,
  requireAdmin,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await db.query('SELECT COUNT(*) FROM audit_logs');
    const totalCount = parseInt(countResult.rows[0].count);

    // Get audit logs with user information
    const result = await db.query(
      `SELECT 
        al.*,
        u.email as user_email,
        u.first_name || ' ' || u.last_name as user_name
       FROM audit_logs al
       LEFT JOIN users u ON u.id = al.user_id
       ORDER BY al.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({
      logs: result.rows,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// Get single audit log
router.get('/:id', [
  authenticateToken,
  requireAdmin
], async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT 
        al.*,
        u.email as user_email,
        u.first_name || ' ' || u.last_name as user_name
       FROM audit_logs al
       LEFT JOIN users u ON u.id = al.user_id
       WHERE al.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Audit log not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching audit log:', error);
    res.status(500).json({ error: 'Failed to fetch audit log' });
  }
});

export default router;
