import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';
import db from '../config/database';

const router = express.Router();

// Get user's bookings
router.get('/my-bookings', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `SELECT b.*,
              a.name as accommodation_name,
              a.city as accommodation_city,
              a.address as accommodation_address,
              COALESCE(json_agg(
                DISTINCT jsonb_build_object(
                  'room_id', r.id,
                  'room_name', r.name,
                  'quantity', bi.quantity,
                  'price_per_night', bi.price_per_night
                )
              ) FILTER (WHERE r.id IS NOT NULL), '[]') as rooms
       FROM bookings b
       JOIN accommodations a ON a.id = b.accommodation_id
       LEFT JOIN booking_items bi ON bi.booking_id = b.id
       LEFT JOIN rooms r ON r.id = bi.room_id
       WHERE b.user_id = $1
       GROUP BY b.id, a.name, a.city, a.address
       ORDER BY b.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get single booking
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const result = await db.query(
      `SELECT b.*,
              a.name as accommodation_name,
              a.city as accommodation_city,
              a.address as accommodation_address,
              a.phone as accommodation_phone,
              u.name as user_name,
              u.email as user_email,
              u.phone as user_phone,
              COALESCE(json_agg(
                DISTINCT jsonb_build_object(
                  'room_id', r.id,
                  'room_name', r.name,
                  'quantity', bi.quantity,
                  'price_per_night', bi.price_per_night
                )
              ) FILTER (WHERE r.id IS NOT NULL), '[]') as rooms,
              (SELECT json_agg(json_build_object('status', p.status, 'amount', p.amount, 'method', p.payment_method))
               FROM payments p WHERE p.booking_id = b.id) as payments
       FROM bookings b
       JOIN accommodations a ON a.id = b.accommodation_id
       JOIN users u ON u.id = b.user_id
       LEFT JOIN booking_items bi ON bi.booking_id = b.id
       LEFT JOIN rooms r ON r.id = bi.room_id
       WHERE b.id = $1 AND (b.user_id = $2 OR $3 = true)
       GROUP BY b.id, a.name, a.city, a.address, a.phone, u.name, u.email, u.phone`,
      [id, userId, isAdmin]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Booking not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// Create booking
router.post('/', [
  authenticateToken,
  body('accommodation_id').isInt(),
  body('check_in_date').isISO8601(),
  body('check_out_date').isISO8601(),
  body('rooms').isArray({ min: 1 }),
  body('rooms.*.room_id').isInt(),
  body('rooms.*.quantity').isInt({ min: 1 }),
  body('guest_name').trim().notEmpty(),
  body('guest_email').isEmail(),
  body('guest_phone').trim().notEmpty(),
  body('num_adults').isInt({ min: 1 }),
  body('num_children').optional().isInt({ min: 0 })
], async (req: AuthRequest, res: Response): Promise<void> => {
  const client = await db.getClient();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }

    const {
      accommodation_id,
      check_in_date,
      check_out_date,
      rooms,
      guest_name,
      guest_email,
      guest_phone,
      num_adults,
      num_children = 0,
      special_requests
    } = req.body;

    const userId = req.user.id;

    // Validate dates
    const checkIn = new Date(check_in_date);
    const checkOut = new Date(check_out_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      res.status(400).json({ error: 'Check-in date cannot be in the past' });
    }

    if (checkOut <= checkIn) {
      res.status(400).json({ error: 'Check-out date must be after check-in date' });
    }

    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    await client.query('BEGIN');

    // Check room availability
    for (const room of rooms) {
      const availabilityCheck = await client.query(
        `SELECT r.quantity,
                COALESCE(SUM(bi.quantity), 0) as booked
         FROM rooms r
         LEFT JOIN booking_items bi ON bi.room_id = r.id
         LEFT JOIN bookings b ON b.id = bi.booking_id
         WHERE r.id = $1
           AND b.status NOT IN ('cancelled', 'rejected')
           AND (
             (b.check_in_date <= $2 AND b.check_out_date >= $2) OR
             (b.check_in_date <= $3 AND b.check_out_date >= $3) OR
             (b.check_in_date >= $2 AND b.check_out_date <= $3)
           )
         GROUP BY r.quantity`,
        [room.room_id, check_in_date, check_out_date]
      );

      if (availabilityCheck.rows.length > 0) {
        const { quantity, booked } = availabilityCheck.rows[0];
        const available = quantity - parseInt(booked);

        if (available < room.quantity) {
          await client.query('ROLLBACK');
          res.status(400).json({
            error: `Insufficient rooms available for room ID ${room.room_id}. Available: ${available}, Requested: ${room.quantity}`
          });
        }
      }
    }

    // Calculate total amount
    let totalAmount = 0;
    const roomDetails = [];

    for (const room of rooms) {
      const roomPrice = await client.query(
        'SELECT price_per_night FROM rooms WHERE id = $1',
        [room.room_id]
      );

      if (roomPrice.rows.length === 0) {
        await client.query('ROLLBACK');
        res.status(404).json({ error: `Room ${room.room_id} not found` });
      }

      const pricePerNight = parseFloat(roomPrice.rows[0].price_per_night);
      const roomTotal = pricePerNight * nights * room.quantity;
      totalAmount += roomTotal;

      roomDetails.push({
        room_id: room.room_id,
        quantity: room.quantity,
        price_per_night: pricePerNight
      });
    }

    // Create booking
    const bookingResult = await client.query(
      `INSERT INTO bookings (
        user_id, accommodation_id, check_in_date, check_out_date,
        num_adults, num_children, total_amount,
        guest_name, guest_email, guest_phone, special_requests,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        userId,
        accommodation_id,
        check_in_date,
        check_out_date,
        num_adults,
        num_children,
        totalAmount,
        guest_name,
        guest_email,
        guest_phone,
        special_requests,
        'pending'
      ]
    );

    const booking = bookingResult.rows[0];

    // Create booking items
    for (const room of roomDetails) {
      await client.query(
        `INSERT INTO booking_items (booking_id, room_id, quantity, price_per_night)
         VALUES ($1, $2, $3, $4)`,
        [booking.id, room.room_id, room.quantity, room.price_per_night]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      ...booking,
      rooms: roomDetails,
      nights
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  } finally {
    client.release();
  }
});

// Update booking status (Admin or user for cancellation)
router.patch('/:id/status', [
  authenticateToken,
  body('status').isIn(['confirmed', 'cancelled', 'completed', 'rejected'])
], async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    // Check if user owns booking or is admin
    const booking = await db.query(
      'SELECT user_id, status as current_status FROM bookings WHERE id = $1',
      [id]
    );

    if (booking.rows.length === 0) {
      res.status(404).json({ error: 'Booking not found' });
    }

    const ownBooking = booking.rows[0].user_id === userId;

    // Users can only cancel their own bookings
    if (!isAdmin && (!ownBooking || status !== 'cancelled')) {
      res.status(403).json({ error: 'Unauthorized to update booking status' });
    }

    const result = await db.query(
      `UPDATE bookings
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

// Get all bookings (Admin only)
router.get('/', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await db.query(
      `SELECT b.*,
              a.name as accommodation_name,
              a.city as accommodation_city,
              u.name as user_name,
              u.email as user_email
       FROM bookings b
       JOIN accommodations a ON a.id = b.accommodation_id
       JOIN users u ON u.id = b.user_id
       ORDER BY b.created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

export default router;
