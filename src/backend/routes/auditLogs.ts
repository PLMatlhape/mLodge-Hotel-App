import express, { type Response } from 'express';
import { query, validationResult } from 'express-validator';
import { authenticateToken, requireAdmin, type AuthRequest } from '../middleware/auth';
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
    const countResult = await db.query('SELECT COUNT(*) FROM admin_audit_logs');
    const totalCount = parseInt(countResult.rows[0].count);

    // Get audit logs with user information
    const result = await db.query(
      `SELECT
        al.*,
        u.email as user_email,
        u.name as user_name
       FROM admin_audit_logs al
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
        u.name as user_name
       FROM admin_audit_logs al
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

// Export audit logs
router.get('/export', [
  authenticateToken,
  requireAdmin,
  query('module').optional().isString(),
  query('action').optional().isString(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('format').optional().isIn(['csv', 'json'])
], async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { module, action, startDate, endDate, format = 'csv' } = req.query;

    // Build query with filters
    let query = `
      SELECT
        al.*,
        u.email as user_email,
        u.name as user_name
       FROM admin_audit_logs al
       LEFT JOIN users u ON u.id = al.user_id
       WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (module) {
      query += ` AND al.module = $${paramIndex}`;
      params.push(module);
      paramIndex++;
    }

    if (action) {
      query += ` AND al.action = $${paramIndex}`;
      params.push(action);
      paramIndex++;
    }

    if (startDate) {
      query += ` AND al.created_at >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND al.created_at <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    query += ' ORDER BY al.created_at DESC';

    const result = await db.query(query, params);

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.json"`);
      res.json(result.rows);
    } else {
      // CSV format
      const csvHeaders = [
        'ID',
        'User ID',
        'User Email',
        'User Name',
        'Action',
        'Module',
        'Entity Type',
        'Entity ID',
        'Details',
        'IP Address',
        'User Agent',
        'Created At'
      ];

      const csvRows = result.rows.map(row => [
        row.id,
        row.user_id,
        `"${row.user_email || ''}"`,
        `"${row.user_name || ''}"`,
        row.action,
        row.module,
        row.entity_type || '',
        row.entity_id || '',
        `"${typeof row.details === 'object' ? JSON.stringify(row.details) : row.details || ''}"`,
        `"${row.ip_address || ''}"`,
        `"${row.user_agent || ''}"`,
        row.created_at
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.join(','))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvContent);
    }
  } catch (error) {
    console.error('Error exporting audit logs:', error);
    res.status(500).json({ error: 'Failed to export audit logs' });
  }
});

export default router;
