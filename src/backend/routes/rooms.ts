import express, { Response } from 'express';
import { body, validationResult, query } from 'express-validator';
import { authenticateToken, requireAdmin, optionalAuth, AuthRequest } from '../middleware/auth';
import db from '../config/database';

const router = express.Router();

// Get rooms by accommodation (with availability check)
router.get('/accommodation/:accommodationId', [
  optionalAuth,
  query('checkIn').optional().isISO8601(),
  query('checkOut').optional().isISO8601(),
  query('guests').optional().isInt({ min: 1 })
], async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { accommodationId } = req.params;
    const { checkIn, checkOut, guests } = req.query;

    let queryText = `
      SELECT r.*,
             COALESCE(json_agg(
               DISTINCT jsonb_build_object('url', p.photo_url, 'is_primary', p.is_primary)
             ) FILTER (WHERE p.id IS NOT NULL), '[]') as photos
      FROM rooms r
      LEFT JOIN photos p ON p.room_id = r.id
      WHERE r.accommodation_id = $1
        AND r.is_active = true
    `;

    const params: (string | number)[] = [accommodationId];

    // Filter by capacity if guests specified
    if (guests) {
      queryText += ` AND r.capacity >= $${params.length + 1}`;
      params.push(Number(guests));
    }

    queryText += ` GROUP BY r.id ORDER BY r.price_per_night ASC`;

    const rooms = await db.query(queryText, params);

    // Check availability if dates provided
    if (checkIn && checkOut && rooms.rows.length > 0) {
      const roomIds = rooms.rows.map((r: { id: number }) => r.id);
      
      const availabilityQuery = `
        SELECT room_id, COUNT(*) as bookings
        FROM booking_items bi
        JOIN bookings b ON b.id = bi.booking_id
        WHERE bi.room_id = ANY($1)
          AND b.status NOT IN ('cancelled', 'rejected')
          AND (
            (b.check_in_date <= $2 AND b.check_out_date >= $2) OR
            (b.check_in_date <= $3 AND b.check_out_date >= $3) OR
            (b.check_in_date >= $2 AND b.check_out_date <= $3)
          )
        GROUP BY room_id
      `;

      const bookedRooms = await db.query(availabilityQuery, [roomIds, checkIn, checkOut]);
      const bookedMap = new Map(
        bookedRooms.rows.map((r: { room_id: number; bookings: string }) => 
          [r.room_id, parseInt(r.bookings)]
        )
      );

      rooms.rows = rooms.rows.map((room: { id: number; quantity?: number }) => ({
        ...room,
        available_quantity: Math.max(0, (room.quantity || 1) - (bookedMap.get(room.id) || 0))
      }));
    }

    res.json(rooms.rows);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// Get single room details
router.get('/:id', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT r.*,
              COALESCE(json_agg(
                DISTINCT jsonb_build_object('url', p.photo_url, 'is_primary', p.is_primary)
              ) FILTER (WHERE p.id IS NOT NULL), '[]') as photos,
              a.name as accommodation_name,
              a.city as accommodation_city
       FROM rooms r
       LEFT JOIN photos p ON p.room_id = r.id
       LEFT JOIN accommodations a ON a.id = r.accommodation_id
       WHERE r.id = $1
       GROUP BY r.id, a.name, a.city`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ error: 'Failed to fetch room' });
  }
});

// Create new room (Admin only)
router.post('/', [
  authenticateToken,
  requireAdmin,
  body('accommodation_id').isInt(),
  body('name').trim().notEmpty(),
  body('capacity').isInt({ min: 1 }),
  body('beds').isInt({ min: 1 }),
  body('price_per_night').isFloat({ min: 0 }),
  body('refundable').optional().isBoolean(),
  body('quantity').optional().isInt({ min: 1 })
], async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const {
      accommodation_id,
      name,
      description,
      capacity,
      beds,
      price_per_night,
      refundable = true,
      quantity = 1
    } = req.body;

    const result = await db.query(
      `INSERT INTO rooms (accommodation_id, name, description, capacity, beds, price_per_night, refundable, quantity, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
       RETURNING *`,
      [accommodation_id, name, description, capacity, beds, price_per_night, refundable, quantity]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// Update room (Admin only)
router.put('/:id', [
  authenticateToken,
  requireAdmin,
  body('name').optional().trim().notEmpty(),
  body('capacity').optional().isInt({ min: 1 }),
  body('beds').optional().isInt({ min: 1 }),
  body('price_per_night').optional().isFloat({ min: 0 }),
  body('refundable').optional().isBoolean(),
  body('quantity').optional().isInt({ min: 1 }),
  body('is_active').optional().isBoolean()
], async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { id } = req.params;
    const updates = req.body;

    const result = await db.query(
      `UPDATE rooms
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           capacity = COALESCE($3, capacity),
           beds = COALESCE($4, beds),
           price_per_night = COALESCE($5, price_per_night),
           refundable = COALESCE($6, refundable),
           quantity = COALESCE($7, quantity),
           is_active = COALESCE($8, is_active),
           updated_at = NOW()
       WHERE id = $9
       RETURNING *`,
      [
        updates.name,
        updates.description,
        updates.capacity,
        updates.beds,
        updates.price_per_night,
        updates.refundable,
        updates.quantity,
        updates.is_active,
        id
      ]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({ error: 'Failed to update room' });
  }
});

// Delete room (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await db.query('DELETE FROM rooms WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ error: 'Failed to delete room' });
  }
});

export default router;
