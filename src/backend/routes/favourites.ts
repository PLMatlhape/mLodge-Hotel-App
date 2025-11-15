import express, { type Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, type AuthRequest } from '../middleware/auth';
import db from '../config/database';

const router = express.Router();

// Get user's favourites (per room)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const result = await db.query(
      `SELECT f.user_id,
              f.room_id,
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
       JOIN rooms rm ON rm.id = f.room_id AND rm.status = 'available' AND rm.deleted_at IS NULL
       JOIN accommodations a ON a.id = rm.accommodation_id
       LEFT JOIN reviews rev ON rev.accommodation_id = a.id
       WHERE f.user_id = $1
       GROUP BY f.user_id, f.room_id, f.created_at, rm.id, rm.name, rm.description, 
                rm.location, rm.price_per_night, rm.type, rm.capacity, rm.beds, rm.baths, 
                rm.area, a.name, a.city
       ORDER BY f.room_id, f.created_at DESC, rm.price_per_night DESC`,
      [userId]
    );
    res.json(result.rows);
    return;
  } catch (error) {
    console.error('Error fetching favourites:', error);
    res.status(500).json({ error: 'Failed to fetch favourites' });
    return;
  }
});

// Add to favourites (per room)
router.post('/', [
  authenticateToken,
  body('room_id').isInt()
], async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    const { room_id } = req.body;
    const userId = req.user!.id;
    // Check if already favourited
    const existing = await db.query(
      'SELECT user_id FROM favourites WHERE user_id = $1 AND room_id = $2',
      [userId, room_id]
    );
    if (existing.rows.length > 0) {
      res.status(400).json({ error: 'Already in favourites' });
      return;
    }
    // Check if room exists
    const room = await db.query(
      'SELECT id FROM rooms WHERE id = $1',
      [room_id]
    );
    if (room.rows.length === 0) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }
    const result = await db.query(
      'INSERT INTO favourites (user_id, room_id) VALUES ($1, $2) RETURNING *',
      [userId, room_id]
    );
    res.status(201).json(result.rows[0]);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to add favourite' });
    return;
  }
});

// Remove from favourites (per room)
router.delete('/:roomId', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { roomId } = req.params;
    const userId = req.user!.id;
    // First check if it exists
    const check = await db.query(
      'SELECT * FROM favourites WHERE user_id = $1 AND room_id = $2',
      [userId, roomId]
    );
    if (check.rows.length === 0) {
      res.status(404).json({ error: 'Favourite not found' });
      return;
    }
    const result = await db.query(
      'DELETE FROM favourites WHERE user_id = $1 AND room_id = $2 RETURNING *',
      [userId, roomId]
    );
    res.json({ message: 'Removed from favourites' });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove favourite' });
    return;
  }
});

// Toggle favourite (per room)
router.post('/toggle', [
  authenticateToken,
  body('room_id').isInt()
], async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    const { room_id } = req.body;
    const userId = req.user!.id;
    // Check if exists
    const existing = await db.query(
      'SELECT user_id FROM favourites WHERE user_id = $1 AND room_id = $2',
      [userId, room_id]
    );
    if (existing.rows.length > 0) {
      // Remove
      await db.query(
        'DELETE FROM favourites WHERE user_id = $1 AND room_id = $2',
        [userId, room_id]
      );
      res.json({ action: 'removed', is_favourite: false });
      return;
    } else {
      // Add
      await db.query(
        'INSERT INTO favourites (user_id, room_id) VALUES ($1, $2)',
        [userId, room_id]
      );
      res.json({ action: 'added', is_favourite: true });
      return;
    }
  } catch (error) {
    console.error('❌ Error toggling favourite:', error);
    const err = error as { message?: string };
    res.status(500).json({ error: err.message || 'Failed to toggle favourite' });
  }
});

// Check if room is favourited
router.get('/check/:roomId', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { roomId } = req.params;
    const userId = req.user!.id;
    const result = await db.query(
      'SELECT user_id FROM favourites WHERE user_id = $1 AND room_id = $2',
      [userId, roomId]
    );
    res.json({ is_favourite: result.rows.length > 0 });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to check favourite status' });
    return;
  }
});

export default router;
