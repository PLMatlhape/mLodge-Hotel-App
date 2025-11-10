import express, { Response } from 'express';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';
import db from '../config/database';

const router = express.Router();

// Get all inquiries
router.get('/', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status as string;
    const priority = req.query.priority as string;

    let query = 'SELECT * FROM inquiries';
    const params: any[] = [limit, offset];
    const conditions: string[] = [];
    let paramIndex = 3;

    if (status) {
      conditions.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (priority) {
      conditions.push(`priority = $${paramIndex}`);
      params.push(priority);
      paramIndex++;
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC LIMIT $1 OFFSET $2';

    const result = await db.query(query, params);

    const countQuery = conditions.length > 0
      ? `SELECT COUNT(*) as total FROM inquiries WHERE ${conditions.join(' AND ')}`
      : 'SELECT COUNT(*) as total FROM inquiries';
    
    const countParams = params.slice(2); // Remove limit and offset
    const countResult = await db.query(countQuery, countParams);

    const total = parseInt(countResult.rows[0].total);

    res.json({
      inquiries: result.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    res.status(500).json({ error: 'Failed to fetch inquiries' });
  }
});

// Get single inquiry
router.get('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'SELECT * FROM inquiries WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Inquiry not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching inquiry:', error);
    res.status(500).json({ error: 'Failed to fetch inquiry' });
  }
});

// Create inquiry (public endpoint)
router.post('/', async (req, res): Promise<void> => {
  try {
    const { guest_name, guest_email, subject, message, priority } = req.body;

    if (!guest_name || !guest_email || !subject || !message) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    const result = await db.query(
      `INSERT INTO inquiries (guest_name, guest_email, subject, message, priority, status)
       VALUES ($1, $2, $3, $4, $5, 'new')
       RETURNING *`,
      [guest_name, guest_email, subject, message, priority || 'medium']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating inquiry:', error);
    res.status(500).json({ error: 'Failed to create inquiry' });
  }
});

// Respond to inquiry
router.put('/:id/respond', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    if (!response) {
      res.status(400).json({ error: 'Response is required' });
      return;
    }

    const result = await db.query(
      `UPDATE inquiries
       SET response = $1,
           responded_by = $2,
           responded_at = CURRENT_TIMESTAMP,
           status = CASE WHEN status = 'new' THEN 'in_progress' ELSE status END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [response, req.user!.id, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Inquiry not found' });
      return;
    }

    // TODO: Send email notification to guest
    // await sendEmail(result.rows[0].guest_email, subject, response);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error responding to inquiry:', error);
    res.status(500).json({ error: 'Failed to respond to inquiry' });
  }
});

// Update inquiry status
router.put('/:id/status', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['new', 'in_progress', 'resolved', 'closed'].includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    const result = await db.query(
      `UPDATE inquiries
       SET status = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Inquiry not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating inquiry status:', error);
    res.status(500).json({ error: 'Failed to update inquiry status' });
  }
});

// Update inquiry priority
router.patch('/:id/priority', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { priority } = req.body;

    if (!['low', 'medium', 'high', 'urgent'].includes(priority)) {
      res.status(400).json({ error: 'Invalid priority' });
      return;
    }

    const result = await db.query(
      `UPDATE inquiries
       SET priority = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [priority, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Inquiry not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating inquiry priority:', error);
    res.status(500).json({ error: 'Failed to update inquiry priority' });
  }
});

// Assign inquiry to staff
router.patch('/:id/assign', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { assigned_to } = req.body;

    const result = await db.query(
      `UPDATE inquiries
       SET assigned_to = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [assigned_to || null, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Inquiry not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error assigning inquiry:', error);
    res.status(500).json({ error: 'Failed to assign inquiry' });
  }
});

export default router;
