import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import db from '../config/database';

const router = express.Router();

// Get user's favourites
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `SELECT f.id as favourite_id,
              f.created_at as favourited_at,
              a.*,
              COALESCE(json_agg(
                DISTINCT jsonb_build_object('url', p.photo_url, 'is_primary', p.is_primary)
              ) FILTER (WHERE p.id IS NOT NULL), '[]') as photos,
              COALESCE(AVG(r.rating), 0) as avg_rating,
              COUNT(DISTINCT r.id) as review_count
       FROM favourites f
       JOIN accommodations a ON a.id = f.accommodation_id
       LEFT JOIN photos p ON p.accommodation_id = a.id
       LEFT JOIN reviews r ON r.accommodation_id = a.id
       WHERE f.user_id = $1
       GROUP BY f.id, f.created_at, a.id
       ORDER BY f.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching favourites:', error);
    res.status(500).json({ error: 'Failed to fetch favourites' });
  }
});

// Add to favourites
router.post('/', [
  authenticateToken,
  body('accommodation_id').isInt()
], async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }

    const { accommodation_id } = req.body;
    const userId = req.user.id;

    // Check if already favourited
    const existing = await db.query(
      'SELECT id FROM favourites WHERE user_id = $1 AND accommodation_id = $2',
      [userId, accommodation_id]
    );

    if (existing.rows.length > 0) {
      res.status(400).json({ error: 'Already in favourites' });
    }

    // Check if accommodation exists
    const accommodation = await db.query(
      'SELECT id FROM accommodations WHERE id = $1',
      [accommodation_id]
    );

    if (accommodation.rows.length === 0) {
      res.status(404).json({ error: 'Accommodation not found' });
    }

    const result = await db.query(
      'INSERT INTO favourites (user_id, accommodation_id) VALUES ($1, $2) RETURNING *',
      [userId, accommodation_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding favourite:', error);
    res.status(500).json({ error: 'Failed to add favourite' });
  }
});

// Remove from favourites
router.delete('/:accommodationId', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { accommodationId } = req.params;
    const userId = req.user.id;

    const result = await db.query(
      'DELETE FROM favourites WHERE user_id = $1 AND accommodation_id = $2 RETURNING *',
      [userId, accommodationId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Favourite not found' });
    }

    res.json({ message: 'Removed from favourites' });
  } catch (error) {
    console.error('Error removing favourite:', error);
    res.status(500).json({ error: 'Failed to remove favourite' });
  }
});

// Toggle favourite (add if not exists, remove if exists)
router.post('/toggle', [
  authenticateToken,
  body('accommodation_id').isInt()
], async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }

    const { accommodation_id } = req.body;
    const userId = req.user.id;

    // Check if exists
    const existing = await db.query(
      'SELECT id FROM favourites WHERE user_id = $1 AND accommodation_id = $2',
      [userId, accommodation_id]
    );

    if (existing.rows.length > 0) {
      // Remove
      await db.query(
        'DELETE FROM favourites WHERE user_id = $1 AND accommodation_id = $2',
        [userId, accommodation_id]
      );
      return res.json({ action: 'removed', is_favourite: false });
    } else {
      // Add
      await db.query(
        'INSERT INTO favourites (user_id, accommodation_id) VALUES ($1, $2)',
        [userId, accommodation_id]
      );
      return res.json({ action: 'added', is_favourite: true });
    }
  } catch (error) {
    console.error('Error toggling favourite:', error);
    res.status(500).json({ error: 'Failed to toggle favourite' });
  }
});

// Check if accommodation is favourited
router.get('/check/:accommodationId', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { accommodationId } = req.params;
    const userId = req.user.id;

    const result = await db.query(
      'SELECT id FROM favourites WHERE user_id = $1 AND accommodation_id = $2',
      [userId, accommodationId]
    );

    res.json({ is_favourite: result.rows.length > 0 });
  } catch (error) {
    console.error('Error checking favourite:', error);
    res.status(500).json({ error: 'Failed to check favourite status' });
  }
});

export default router;
