import express, { type Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, type AuthRequest } from '../middleware/auth';
import db from '../config/database';

const router = express.Router();

// Get user's favourites
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const result = await db.query(
      `SELECT DISTINCT ON (f.accommodation_id)
              f.user_id,
              f.accommodation_id as favourite_id,
              f.created_at as favourited_at,
              rm.id,
              rm.name,
              rm.description,
              rm.location,
              rm.price_per_night,
              rm.type,
              rm.capacity,
              rm.beds,
              rm.baths,
              rm.area,
              a.name as accommodation_name,
              a.city,
              COALESCE(
                (SELECT json_agg(json_build_object('url', p.url, 'sort_order', p.sort_order, 'is_primary', false) ORDER BY p.sort_order ASC)
                 FROM room_photos p
                 WHERE p.room_id = rm.id),
                '[]'::json
              ) as photos,
              COALESCE(AVG(rev.rating), 0) as avg_rating,
              COUNT(DISTINCT rev.id) as review_count
       FROM favourites f
       JOIN accommodations a ON a.id = f.accommodation_id
       LEFT JOIN rooms rm ON rm.accommodation_id = a.id AND rm.status = 'available' AND rm.deleted_at IS NULL
       LEFT JOIN reviews rev ON rev.accommodation_id = a.id
       WHERE f.user_id = $1 AND rm.id IS NOT NULL
       GROUP BY f.user_id, f.accommodation_id, f.created_at, rm.id, rm.name, rm.description, 
                rm.location, rm.price_per_night, rm.type, rm.capacity, rm.beds, rm.baths, 
                rm.area, a.name, a.city
       ORDER BY f.accommodation_id, f.created_at DESC, rm.price_per_night DESC`,
      [userId]
    );

    console.log(`📋 Fetched ${result.rows.length} favourites for user ${userId}`);
    result.rows.forEach(row => {
      console.log(`   - Room ${row.id} (Accommodation ${row.favourite_id})`);
    });

    res.json(result.rows);
    return;
  } catch (error) {
    console.error('Error fetching favourites:', error);
    res.status(500).json({ error: 'Failed to fetch favourites' });
    return;
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
      return;
    }

    const { accommodation_id } = req.body;
    const userId = req.user!.id;

    console.log(`➕ Attempting to add favourite: userId=${userId}, accommodationId=${accommodation_id}`);

    // Check if already favourited
    const existing = await db.query(
      'SELECT user_id FROM favourites WHERE user_id = $1 AND accommodation_id = $2',
      [userId, accommodation_id]
    );

    if (existing.rows.length > 0) {
      console.log(`⚠️  Already in favourites`);
      res.status(400).json({ error: 'Already in favourites' });
      return;
    }

    // Check if accommodation exists
    const accommodation = await db.query(
      'SELECT id FROM accommodations WHERE id = $1',
      [accommodation_id]
    );

    if (accommodation.rows.length === 0) {
      console.log(`❌ Accommodation ${accommodation_id} not found`);
      res.status(404).json({ error: 'Accommodation not found' });
      return;
    }

    const result = await db.query(
      'INSERT INTO favourites (user_id, accommodation_id) VALUES ($1, $2) RETURNING *',
      [userId, accommodation_id]
    );

    console.log(`✅ Successfully added favourite:`, result.rows[0]);
    res.status(201).json(result.rows[0]);
    return;
  } catch (error) {
    console.error('Error adding favourite:', error);
    res.status(500).json({ error: 'Failed to add favourite' });
    return;
  }
});

// Remove from favourites
router.delete('/:accommodationId', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { accommodationId } = req.params;
    const userId = req.user!.id;

    console.log(`🗑️  Attempting to remove favourite: userId=${userId}, accommodationId=${accommodationId}`);

    // First check if it exists
    const check = await db.query(
      'SELECT * FROM favourites WHERE user_id = $1 AND accommodation_id = $2',
      [userId, accommodationId]
    );

    console.log(`📋 Favourite exists check: ${check.rows.length > 0 ? 'FOUND' : 'NOT FOUND'}`);
    if (check.rows.length > 0) {
      console.log('   Found favourite:', check.rows[0]);
    }

    const result = await db.query(
      'DELETE FROM favourites WHERE user_id = $1 AND accommodation_id = $2 RETURNING *',
      [userId, accommodationId]
    );

    if (result.rows.length === 0) {
      console.log(`❌ Favourite not found for deletion`);
      res.status(404).json({ error: 'Favourite not found' });
      return;
    }

    console.log(`✅ Successfully removed favourite`);
    res.json({ message: 'Removed from favourites' });
    return;
  } catch (error) {
    console.error('Error removing favourite:', error);
    res.status(500).json({ error: 'Failed to remove favourite' });
    return;
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
      return;
    }

    const { accommodation_id } = req.body;
    const userId = req.user!.id;

    // Check if exists
    const existing = await db.query(
      'SELECT user_id FROM favourites WHERE user_id = $1 AND accommodation_id = $2',
      [userId, accommodation_id]
    );

    if (existing.rows.length > 0) {
      // Remove
      await db.query(
        'DELETE FROM favourites WHERE user_id = $1 AND accommodation_id = $2',
        [userId, accommodation_id]
      );
      res.json({ action: 'removed', is_favourite: false });
      return;
    } else {
      // Add
      await db.query(
        'INSERT INTO favourites (user_id, accommodation_id) VALUES ($1, $2)',
        [userId, accommodation_id]
      );
      res.json({ action: 'added', is_favourite: true });
      return;
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
    const userId = req.user!.id;

    const result = await db.query(
      'SELECT user_id FROM favourites WHERE user_id = $1 AND accommodation_id = $2',
      [userId, accommodationId]
    );

    res.json({ is_favourite: result.rows.length > 0 });
    return;
  } catch (error) {
    console.error('Error checking favourite:', error);
    res.status(500).json({ error: 'Failed to check favourite status' });
    return;
  }
});

export default router;
