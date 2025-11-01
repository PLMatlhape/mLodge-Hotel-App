import express, { Response } from 'express';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';
import db from '../config/database';

const router = express.Router();

// Get all refunds
router.get('/', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status as string;

    let query = `
      SELECT r.*, b.booking_reference, b.total_price as booking_amount,
             u.name as guest_name, u.email as guest_email,
             acc.name as accommodation_name
      FROM refunds r
      JOIN bookings b ON r.booking_id = b.id
      JOIN users u ON b.user_id = u.id
      JOIN accommodations acc ON b.accommodation_id = acc.id
    `;

    const params: any[] = [limit, offset];
    
    if (status) {
      query += ' WHERE r.status = $3';
      params.push(status);
    }

    query += ' ORDER BY r.requested_date DESC LIMIT $1 OFFSET $2';

    const result = await db.query(query, params);

    const countQuery = status
      ? 'SELECT COUNT(*) as total FROM refunds WHERE status = $1'
      : 'SELECT COUNT(*) as total FROM refunds';
    
    const countResult = await db.query(
      countQuery,
      status ? [status] : []
    );

    const total = parseInt(countResult.rows[0].total);

    res.json({
      refunds: result.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching refunds:', error);
    res.status(500).json({ error: 'Failed to fetch refunds' });
  }
});

// Get single refund
router.get('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT r.*, b.booking_reference, b.total_price as booking_amount,
              u.name as guest_name, u.email as guest_email,
              acc.name as accommodation_name
       FROM refunds r
       JOIN bookings b ON r.booking_id = b.id
       JOIN users u ON b.user_id = u.id
       JOIN accommodations acc ON b.accommodation_id = acc.id
       WHERE r.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Refund not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching refund:', error);
    res.status(500).json({ error: 'Failed to fetch refund' });
  }
});

// Create refund request
router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { booking_id, reason, refund_amount } = req.body;

    if (!booking_id || !reason) {
      res.status(400).json({ error: 'Booking ID and reason are required' });
      return;
    }

    // Check if booking exists
    const bookingResult = await db.query(
      'SELECT id, total_price, user_id FROM bookings WHERE id = $1',
      [booking_id]
    );

    if (bookingResult.rows.length === 0) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    const booking = bookingResult.rows[0];
    const amount = refund_amount || booking.total_price;

    const result = await db.query(
      `INSERT INTO refunds (booking_id, reason, refund_amount, status, requested_date)
       VALUES ($1, $2, $3, 'pending', CURRENT_TIMESTAMP)
       RETURNING *`,
      [booking_id, reason, amount]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating refund:', error);
    res.status(500).json({ error: 'Failed to create refund' });
  }
});

// Approve refund
router.patch('/:id/approve', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { admin_notes } = req.body;

    const result = await db.query(
      `UPDATE refunds
       SET status = 'approved',
           admin_notes = $1,
           processed_date = CURRENT_TIMESTAMP,
           processed_by = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND status = 'pending'
       RETURNING *`,
      [admin_notes || null, req.user!.id, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Refund not found or already processed' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error approving refund:', error);
    res.status(500).json({ error: 'Failed to approve refund' });
  }
});

// Reject refund
router.patch('/:id/reject', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { admin_notes } = req.body;

    if (!admin_notes) {
      res.status(400).json({ error: 'Rejection reason is required' });
      return;
    }

    const result = await db.query(
      `UPDATE refunds
       SET status = 'rejected',
           admin_notes = $1,
           processed_date = CURRENT_TIMESTAMP,
           processed_by = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND status = 'pending'
       RETURNING *`,
      [admin_notes, req.user!.id, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Refund not found or already processed' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error rejecting refund:', error);
    res.status(500).json({ error: 'Failed to reject refund' });
  }
});

// Process refund (mark as completed after payment)
router.patch('/:id/process', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { transaction_id } = req.body;

    const result = await db.query(
      `UPDATE refunds
       SET status = 'completed',
           transaction_id = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND status = 'approved'
       RETURNING *`,
      [transaction_id || null, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Refund not found or not approved' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ error: 'Failed to process refund' });
  }
});

export default router;
