import express, { type Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, requireAdmin, type AuthRequest } from '../middleware/auth';
import db from '../config/database';

const router = express.Router();

// Get all amenities
router.get('/', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await db.query(
      'SELECT * FROM amenities ORDER BY name ASC'
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching amenities:', error);
    res.status(500).json({ error: 'Failed to fetch amenities' });
  }
});

// Get amenities for accommodation
router.get('/accommodation/:accommodationId', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { accommodationId } = req.params;

    const result = await db.query(
      `SELECT a.*
       FROM amenities a
       JOIN accommodation_amenities aa ON aa.amenity_id = a.id
       WHERE aa.accommodation_id = $1
       ORDER BY a.name ASC`,
      [accommodationId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching accommodation amenities:', error);
    res.status(500).json({ error: 'Failed to fetch amenities' });
  }
});

// Create amenity (Admin only)
router.post('/', [
  authenticateToken,
  requireAdmin,
  body('name').trim().notEmpty().isLength({ max: 100 }),
  body('icon').optional().trim().isLength({ max: 50 })
], async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { name, icon } = req.body;

    // Check if amenity already exists
    const existing = await db.query(
      'SELECT id FROM amenities WHERE LOWER(name) = LOWER($1)',
      [name]
    );

    if (existing.rows.length > 0) {
      res.status(400).json({ error: 'Amenity already exists' });
      return;
    }

    const result = await db.query(
      'INSERT INTO amenities (name, icon) VALUES ($1, $2) RETURNING *',
      [name, icon]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating amenity:', error);
    res.status(500).json({ error: 'Failed to create amenity' });
  }
});

// Update amenity (Admin only)
router.put('/:id', [
  authenticateToken,
  requireAdmin,
  body('name').optional().trim().notEmpty().isLength({ max: 100 }),
  body('icon').optional().trim().isLength({ max: 50 })
], async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { id } = req.params;
    const { name, icon } = req.body;

    const result = await db.query(
      `UPDATE amenities
       SET name = COALESCE($1, name),
           icon = COALESCE($2, icon)
       WHERE id = $3
       RETURNING *`,
      [name, icon, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Amenity not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating amenity:', error);
    res.status(500).json({ error: 'Failed to update amenity' });
  }
});

// Delete amenity (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM amenities WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Amenity not found' });
      return;
    }

    res.json({ message: 'Amenity deleted successfully' });
  } catch (error) {
    console.error('Error deleting amenity:', error);
    res.status(500).json({ error: 'Failed to delete amenity' });
  }
});

// Assign amenities to accommodation (Admin only)
router.post('/accommodation/:accommodationId', [
  authenticateToken,
  requireAdmin,
  body('amenity_ids').isArray()
], async (req: AuthRequest, res: Response): Promise<void> => {
  const client = await db.getClient();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { accommodationId } = req.params;
    const { amenity_ids } = req.body;

    await client.query('BEGIN');

    // Remove existing amenities
    await client.query(
      'DELETE FROM accommodation_amenities WHERE accommodation_id = $1',
      [accommodationId]
    );

    // Add new amenities
    for (const amenityId of amenity_ids) {
      await client.query(
        'INSERT INTO accommodation_amenities (accommodation_id, amenity_id) VALUES ($1, $2)',
        [accommodationId, amenityId]
      );
    }

    await client.query('COMMIT');

    res.json({ message: 'Amenities updated successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error assigning amenities:', error);
    res.status(500).json({ error: 'Failed to assign amenities' });
  } finally {
    client.release();
  }
});

export default router;
