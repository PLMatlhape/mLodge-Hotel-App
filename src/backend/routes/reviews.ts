import express, { Response } from 'express';
import { body, validationResult, query } from 'express-validator';
import { authenticateToken, requireAdmin, optionalAuth, AuthRequest } from '../middleware/auth';
import db from '../config/database';

const router = express.Router();

// Get reviews for accommodation
router.get('/accommodation/:accommodationId', [
  optionalAuth,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { accommodationId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const result = await db.query(
      `SELECT r.*,
              u.name as user_name,
              u.email as user_email
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       WHERE r.accommodation_id = $1
       ORDER BY r.created_at DESC
       LIMIT $2 OFFSET $3`,
      [accommodationId, limit, offset]
    );

    // Get total count
    const countResult = await db.query(
      'SELECT COUNT(*) as total FROM reviews WHERE accommodation_id = $1',
      [accommodationId]
    );

    const total = parseInt(countResult.rows[0].total);

    res.json({
      reviews: result.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Get user's reviews
router.get('/my-reviews', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `SELECT r.*,
              a.name as accommodation_name,
              a.city as accommodation_city
       FROM reviews r
       JOIN accommodations a ON a.id = r.accommodation_id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Create review
router.post('/', [
  authenticateToken,
  body('accommodation_id').isInt(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').trim().isLength({ min: 10, max: 1000 })
], async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }

    const { accommodation_id, rating, comment } = req.body;
    const userId = req.user.id;

    // Check if user has completed booking for this accommodation
    const hasBooking = await db.query(
      `SELECT id FROM bookings
       WHERE user_id = $1
         AND accommodation_id = $2
         AND status = 'completed'
       LIMIT 1`,
      [userId, accommodation_id]
    );

    if (hasBooking.rows.length === 0) {
      res.status(400).json({
        error: 'You can only review accommodations you have stayed at'
      });
    }

    // Check if already reviewed
    const existingReview = await db.query(
      'SELECT id FROM reviews WHERE user_id = $1 AND accommodation_id = $2',
      [userId, accommodation_id]
    );

    if (existingReview.rows.length > 0) {
      res.status(400).json({
        error: 'You have already reviewed this accommodation'
      });
    }

    const result = await db.query(
      `INSERT INTO reviews (user_id, accommodation_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, accommodation_id, rating, comment]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// Update review
router.put('/:id', [
  authenticateToken,
  body('rating').optional().isInt({ min: 1, max: 5 }),
  body('comment').optional().trim().isLength({ min: 10, max: 1000 })
], async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    // Check if review exists and belongs to user
    const review = await db.query(
      'SELECT user_id FROM reviews WHERE id = $1',
      [id]
    );

    if (review.rows.length === 0) {
      res.status(404).json({ error: 'Review not found' });
    }

    if (review.rows[0].user_id !== userId) {
      res.status(403).json({ error: 'Unauthorized to update this review' });
    }

    const result = await db.query(
      `UPDATE reviews
       SET rating = COALESCE($1, rating),
           comment = COALESCE($2, comment),
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [rating, comment, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// Delete review (User can delete own, Admin can delete any)
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    // Check if review exists
    const review = await db.query(
      'SELECT user_id FROM reviews WHERE id = $1',
      [id]
    );

    if (review.rows.length === 0) {
      res.status(404).json({ error: 'Review not found' });
    }

    // Check authorization
    if (!isAdmin && review.rows[0].user_id !== userId) {
      res.status(403).json({ error: 'Unauthorized to delete this review' });
    }

    await db.query('DELETE FROM reviews WHERE id = $1', [id]);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

// Get accommodation rating summary
router.get('/accommodation/:accommodationId/summary', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { accommodationId } = req.params;

    const result = await db.query(
      `SELECT 
         COUNT(*) as total_reviews,
         AVG(rating) as avg_rating,
         COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
         COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
         COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
         COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
         COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
       FROM reviews
       WHERE accommodation_id = $1`,
      [accommodationId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching rating summary:', error);
    res.status(500).json({ error: 'Failed to fetch rating summary' });
  }
});

export default router;
