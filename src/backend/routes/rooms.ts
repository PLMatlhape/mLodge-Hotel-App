import express, { Response } from 'express';
import { body, validationResult, query } from 'express-validator';
import { authenticateToken, requireAdmin, optionalAuth, AuthRequest } from '../middleware/auth';
import db from '../config/database';

const router = express.Router();

// Get all rooms (for admin inventory)
router.get('/', [
  optionalAuth
], async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Check if this is an admin request or client request
    const isAdmin = req.user?.role === 'admin';
    
    const queryText = `
      SELECT r.*,
             a.name as accommodation_name,
             a.city as accommodation_city,
             COALESCE(json_agg(
               DISTINCT jsonb_build_object('url', p.url, 'sort_order', p.sort_order)
             ) FILTER (WHERE p.id IS NOT NULL), '[]') as photos
      FROM rooms r
      LEFT JOIN accommodations a ON a.id = r.accommodation_id
      LEFT JOIN room_photos p ON p.room_id = r.id
      ${!isAdmin ? "WHERE r.status = 'available'" : ''}
      GROUP BY r.id, a.name, a.city
      ORDER BY r.id DESC
    `;

    const result = await db.query(queryText);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching all rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms', details: error instanceof Error ? error.message : 'Unknown error' });
    return;
  }
});

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
               DISTINCT jsonb_build_object('url', p.url, 'sort_order', p.sort_order)
             ) FILTER (WHERE p.id IS NOT NULL), '[]') as photos
      FROM rooms r
      LEFT JOIN room_photos p ON p.room_id = r.id
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
                DISTINCT jsonb_build_object('url', p.url, 'sort_order', p.sort_order)
              ) FILTER (WHERE p.id IS NOT NULL), '[]') as photos,
              a.name as accommodation_name,
              a.city as accommodation_city
       FROM rooms r
       LEFT JOIN room_photos p ON p.room_id = r.id
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
  body('accommodation_id').optional().isInt(),
  body('name').trim().notEmpty(),
  body('location').optional().trim(),
  body('capacity').isInt({ min: 1 }),
  body('beds').isInt({ min: 1 }),
  body('baths').optional().isInt({ min: 1 }),
  body('area').optional().isInt({ min: 1 }),
  body('type').optional().trim(),
  body('price_per_night').isFloat({ min: 0 }),
  body('refundable').optional().isBoolean(),
  body('quantity').optional().isInt({ min: 1 }),
  body('status').optional().isIn(['available', 'unavailable', 'maintenance']),
  body('amenities').optional().isArray(),
  body('roomFeatures').optional().isArray(),
  body('images').optional().isArray()
], async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const {
      accommodation_id = null,
      name,
      location = '',
      description,
      type = 'Standard',
      capacity,
      beds,
      baths = 2,
      area = 120,
      price_per_night,
      refundable = true,
      quantity = 10,
      status = 'available',
      amenities = [],
      roomFeatures = [],
      images = []
    } = req.body;

    const result = await db.query(
      `INSERT INTO rooms (accommodation_id, name, location, description, type, capacity, beds, baths, area, price_per_night, refundable, quantity, status, amenities, room_features)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING *`,
      [accommodation_id, name, location, description, type, capacity, beds, baths, area, price_per_night, refundable, quantity, status, JSON.stringify(amenities), JSON.stringify(roomFeatures)]
    );

    const room = result.rows[0];

    // Insert photos if provided
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        await db.query(
          `INSERT INTO room_photos (room_id, url, sort_order)
           VALUES ($1, $2, $3)`,
          [room.id, images[i], i]
        );
      }
    }

    // Fetch the room with photos
    const roomWithPhotos = await db.query(
      `SELECT r.*,
              COALESCE(json_agg(
                DISTINCT jsonb_build_object('url', p.url, 'sort_order', p.sort_order)
              ) FILTER (WHERE p.id IS NOT NULL), '[]') as photos
       FROM rooms r
       LEFT JOIN room_photos p ON p.room_id = r.id
       WHERE r.id = $1
       GROUP BY r.id`,
      [room.id]
    );

    res.status(201).json(roomWithPhotos.rows[0]);
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Failed to create room', details: error instanceof Error ? error.message : 'Unknown error' });
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
  body('status').optional().isIn(['available', 'unavailable', 'maintenance']),
  body('images').optional().isArray()
], async (req: AuthRequest, res: Response): Promise<void> => {
  const client = await db.getClient();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { id } = req.params;
    const { images, ...updates } = req.body;

    await client.query('BEGIN');

    // Update room details
    const result = await client.query(
      `UPDATE rooms
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           type = COALESCE($3, type),
           location = COALESCE($4, location),
           capacity = COALESCE($5, capacity),
           beds = COALESCE($6, beds),
           baths = COALESCE($7, baths),
           area = COALESCE($8, area),
           price_per_night = COALESCE($9, price_per_night),
           refundable = COALESCE($10, refundable),
           amenities = COALESCE($11, amenities),
           room_features = COALESCE($12, room_features),
           quantity = COALESCE($13, quantity),
           status = COALESCE($14, status),
           updated_at = NOW()
       WHERE id = $15
       RETURNING *`,
      [
        updates.name,
        updates.description,
        updates.type,
        updates.location,
        updates.capacity,
        updates.beds,
        updates.baths,
        updates.area,
        updates.price_per_night,
        updates.refundable,
        updates.amenities ? JSON.stringify(updates.amenities) : null,
        updates.roomFeatures ? JSON.stringify(updates.roomFeatures) : null,
        updates.quantity,
        updates.status,
        id
      ]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    // If images are provided, update photos
    if (images && Array.isArray(images) && images.length > 0) {
      console.log(`Updating photos for room ${id}, count: ${images.length}`);
      
      // Validate image data
      const validImages = images.filter(img => {
        if (typeof img !== 'string' || !img.startsWith('data:image/')) {
          console.warn('Invalid image data detected, skipping');
          return false;
        }
        return true;
      });

      if (validImages.length > 0) {
        // Delete existing photos
        await client.query('DELETE FROM room_photos WHERE room_id = $1', [id]);
        console.log(`Deleted existing photos for room ${id}`);
        
        // Insert new photos
        for (let i = 0; i < validImages.length; i++) {
          await client.query(
            'INSERT INTO room_photos (room_id, url, sort_order) VALUES ($1, $2, $3)',
            [id, validImages[i], i]
          );
        }
        console.log(`Inserted ${validImages.length} new photos for room ${id}`);
      }
    } else {
      console.log(`No images to update for room ${id}`);
    }

    await client.query('COMMIT');

    // Fetch updated room with photos
    const roomWithPhotos = await db.query(
      `SELECT r.*,
              COALESCE(json_agg(
                DISTINCT jsonb_build_object(
                  'url', p.url,
                  'caption', p.caption,
                  'sort_order', p.sort_order
                )
              ) FILTER (WHERE p.id IS NOT NULL), '[]') as photos
       FROM rooms r
       LEFT JOIN room_photos p ON p.room_id = r.id
       WHERE r.id = $1
       GROUP BY r.id`,
      [id]
    );

    res.json(roomWithPhotos.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating room:', error);
    console.error('Request body:', JSON.stringify(req.body, null, 2));
    res.status(500).json({ 
      error: 'Failed to update room', 
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  } finally {
    client.release();
  }
});

// Delete room (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if room exists
    const checkResult = await db.query('SELECT id FROM rooms WHERE id = $1', [id]);
    
    if (checkResult.rows.length === 0) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    // Check for existing bookings
    const bookingCheck = await db.query(
      'SELECT COUNT(*) as count FROM booking_items WHERE room_id = $1',
      [id]
    );

    if (parseInt(bookingCheck.rows[0].count) > 0) {
      res.status(409).json({ 
        error: 'Cannot delete room with existing bookings. Please cancel all bookings first.' 
      });
      return;
    }

    // Delete the room
    await db.query('DELETE FROM rooms WHERE id = $1', [id]);

    res.json({ message: 'Room deleted successfully', id: parseInt(id) });
  } catch (error: unknown) {
    console.error('Error deleting room:', error);
    
    // Handle foreign key constraint errors
    if (error && typeof error === 'object' && 'code' in error && error.code === '23503') {
      res.status(409).json({ 
        error: 'Cannot delete room because it is referenced by other records' 
      });
      return;
    }
    
    res.status(500).json({ error: 'Failed to delete room' });
  }
});

export default router;
