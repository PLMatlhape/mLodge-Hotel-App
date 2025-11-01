import express, { Response } from 'express';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';
import db from '../config/database';

const router = express.Router();

// Get all promo codes
router.get('/', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const result = await db.query(
      `SELECT *
       FROM promo_codes
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await db.query('SELECT COUNT(*) as total FROM promo_codes');
    const total = parseInt(countResult.rows[0].total);

    res.json({
      promoCodes: result.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching promo codes:', error);
    res.status(500).json({ error: 'Failed to fetch promo codes' });
  }
});

// Get single promo code
router.get('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'SELECT * FROM promo_codes WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Promo code not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching promo code:', error);
    res.status(500).json({ error: 'Failed to fetch promo code' });
  }
});

// Validate promo code
router.post('/validate', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { code } = req.body;

    if (!code) {
      res.status(400).json({ error: 'Promo code is required' });
      return;
    }

    const result = await db.query(
      `SELECT *
       FROM promo_codes
       WHERE code = $1
         AND is_active = true
         AND (valid_from IS NULL OR valid_from <= CURRENT_DATE)
         AND (valid_until IS NULL OR valid_until >= CURRENT_DATE)
         AND (usage_limit IS NULL OR usage_count < usage_limit)`,
      [code.toUpperCase()]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Invalid or expired promo code' });
      return;
    }

    res.json({
      valid: true,
      promoCode: result.rows[0]
    });
  } catch (error) {
    console.error('Error validating promo code:', error);
    res.status(500).json({ error: 'Failed to validate promo code' });
  }
});

// Create promo code
router.post('/', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      code,
      description,
      discount_type,
      discount_value,
      min_purchase_amount,
      usage_limit,
      valid_from,
      valid_until,
      is_active
    } = req.body;

    // Validate required fields
    if (!code || !discount_type || !discount_value) {
      res.status(400).json({ error: 'Code, discount type, and discount value are required' });
      return;
    }

    // Check if code already exists
    const existing = await db.query(
      'SELECT id FROM promo_codes WHERE code = $1',
      [code.toUpperCase()]
    );

    if (existing.rows.length > 0) {
      res.status(409).json({ error: 'Promo code already exists' });
      return;
    }

    const result = await db.query(
      `INSERT INTO promo_codes (
        code, description, discount_type, discount_value,
        min_purchase_amount, usage_limit, valid_from, valid_until, is_active
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        code.toUpperCase(),
        description,
        discount_type,
        discount_value,
        min_purchase_amount || null,
        usage_limit || null,
        valid_from || null,
        valid_until || null,
        is_active !== false
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating promo code:', error);
    res.status(500).json({ error: 'Failed to create promo code' });
  }
});

// Update promo code
router.put('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      code,
      description,
      discount_type,
      discount_value,
      min_purchase_amount,
      usage_limit,
      valid_from,
      valid_until,
      is_active
    } = req.body;

    const result = await db.query(
      `UPDATE promo_codes
       SET code = COALESCE($1, code),
           description = COALESCE($2, description),
           discount_type = COALESCE($3, discount_type),
           discount_value = COALESCE($4, discount_value),
           min_purchase_amount = COALESCE($5, min_purchase_amount),
           usage_limit = COALESCE($6, usage_limit),
           valid_from = COALESCE($7, valid_from),
           valid_until = COALESCE($8, valid_until),
           is_active = COALESCE($9, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING *`,
      [
        code ? code.toUpperCase() : null,
        description,
        discount_type,
        discount_value,
        min_purchase_amount,
        usage_limit,
        valid_from,
        valid_until,
        is_active,
        id
      ]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Promo code not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating promo code:', error);
    res.status(500).json({ error: 'Failed to update promo code' });
  }
});

// Delete promo code
router.delete('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM promo_codes WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Promo code not found' });
      return;
    }

    res.json({ message: 'Promo code deleted successfully' });
  } catch (error) {
    console.error('Error deleting promo code:', error);
    res.status(500).json({ error: 'Failed to delete promo code' });
  }
});

// Activate/Deactivate promo code
router.patch('/:id/status', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const result = await db.query(
      `UPDATE promo_codes
       SET is_active = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [is_active, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Promo code not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating promo code status:', error);
    res.status(500).json({ error: 'Failed to update promo code status' });
  }
});

export default router;
