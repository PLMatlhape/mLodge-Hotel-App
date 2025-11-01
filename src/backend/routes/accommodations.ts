import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import db from '../config/database';
import { authenticateToken, requireAdmin, optionalAuth, AuthRequest } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/accommodations
// @desc    Get all accommodations (with filters and pagination)
// @access  Public
router.get('/', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { 
      city, 
      minPrice, 
      maxPrice, 
      guests, 
      checkIn, 
      checkOut,
      search,
      page,
      limit 
    } = req.query;

    // Pagination parameters
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;
    const offset = (pageNum - 1) * limitNum;

    let queryText = `
      SELECT 
        a.id, 
        a.name, 
        a.description, 
        a.address, 
        a.city, 
        a.country,
        a.star_rating,
        a.base_currency,
        a.created_at,
        (SELECT json_agg(p.url) FROM photos p WHERE p.accommodation_id = a.id) as photos,
        (SELECT COALESCE(AVG(r.rating), 0) FROM reviews r WHERE r.accommodation_id = a.id) as avg_rating,
        (SELECT COUNT(*) FROM reviews r WHERE r.accommodation_id = a.id) as review_count
      FROM accommodations a
      WHERE a.is_active = true
    `;

    const params: (string | number)[] = [];
    let paramIndex = 1;

    if (city) {
      queryText += ` AND LOWER(a.city) = LOWER($${paramIndex})`;
      params.push(city as string);
      paramIndex++;
    }

    if (search) {
      queryText += ` AND (LOWER(a.name) LIKE LOWER($${paramIndex}) OR LOWER(a.description) LIKE LOWER($${paramIndex}))`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    queryText += ` ORDER BY a.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limitNum, offset);

    const result = await db.query(queryText, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM accommodations a WHERE a.is_active = true';
    const countParams: (string | number)[] = [];
    let countParamIndex = 1;

    if (city) {
      countQuery += ` AND LOWER(a.city) = LOWER($${countParamIndex})`;
      countParams.push(city as string);
      countParamIndex++;
    }

    if (search) {
      countQuery += ` AND (LOWER(a.name) LIKE LOWER($${countParamIndex}) OR LOWER(a.description) LIKE LOWER($${countParamIndex}))`;
      countParams.push(`%${search}%`);
    }

    const countResult = await db.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    // If user is authenticated, check favorites
    let accommodations = result.rows;
    if (req.user) {
      const favResult = await db.query(
        'SELECT accommodation_id FROM favourites WHERE user_id = $1',
        [req.user.id]
      );
      const favoriteIds = favResult.rows.map((row) => row.accommodation_id);
      
      accommodations = accommodations.map((acc) => ({
        ...acc,
        is_favorite: favoriteIds.includes(acc.id)
      }));
    }

    res.json({
      success: true,
      count: accommodations.length,
      data: accommodations,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get accommodations error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch accommodations' 
    });
  }
});

// @route   GET /api/accommodations/:id
// @desc    Get single accommodation with rooms
// @access  Public
router.get('/:id', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Get accommodation details
    const accResult = await db.query(
      `SELECT 
        a.*,
        (SELECT json_agg(p.url) FROM photos p WHERE p.accommodation_id = a.id) as photos,
        (SELECT COALESCE(AVG(r.rating), 0) FROM reviews r WHERE r.accommodation_id = a.id) as avg_rating,
        (SELECT COUNT(*) FROM reviews r WHERE r.accommodation_id = a.id) as review_count,
        (SELECT json_agg(json_build_object('id', am.id, 'name', am.name, 'icon', am.icon)) 
         FROM accommodation_amenities aa 
         JOIN amenities am ON aa.amenity_id = am.id 
         WHERE aa.accommodation_id = a.id) as amenities
       FROM accommodations a
       WHERE a.id = $1 AND a.is_active = true`,
      [id]
    );

    if (accResult.rows.length === 0) {
      res.status(404).json({ 
        success: false, 
        message: 'Accommodation not found' 
      });
      return;
    }

    const accommodation = accResult.rows[0];

    // Get rooms for this accommodation
    const roomsResult = await db.query(
      `SELECT id, name, description, capacity, beds, price_per_night, refundable 
       FROM rooms 
       WHERE accommodation_id = $1 
       ORDER BY price_per_night ASC`,
      [id]
    );

    accommodation.rooms = roomsResult.rows;

    // Check if favorite (if authenticated)
    if (req.user) {
      const favResult = await db.query(
        'SELECT 1 FROM favourites WHERE user_id = $1 AND accommodation_id = $2',
        [req.user.id, id]
      );
      accommodation.is_favorite = favResult.rows.length > 0;
    }

    res.json({
      success: true,
      data: accommodation
    });
  } catch (error) {
    console.error('Get accommodation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch accommodation' 
    });
  }
});

// @route   POST /api/accommodations
// @desc    Create new accommodation (Admin only)
// @access  Private/Admin
router.post('/', 
  authenticateToken, 
  requireAdmin,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('description').optional().trim(),
    body('address').notEmpty().withMessage('Address is required'),
    body('city').notEmpty().withMessage('City is required'),
    body('country').notEmpty().withMessage('Country is required'),
    body('star_rating').optional().isInt({ min: 1, max: 5 }),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
        return;
      }

      const {
        name,
        description,
        address,
        city,
        country,
        postal_code,
        latitude,
        longitude,
        star_rating,
        base_currency
      } = req.body;

      const result = await db.query(
        `INSERT INTO accommodations 
         (owner_id, name, description, address, city, country, postal_code, latitude, longitude, star_rating, base_currency) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
         RETURNING *`,
        [req.user!.id, name, description || null, address, city, country, postal_code || null, 
         latitude || null, longitude || null, star_rating || 3, base_currency || 'ZAR']
      );

      res.status(201).json({
        success: true,
        message: 'Accommodation created successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Create accommodation error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to create accommodation' 
      });
    }
  }
);

// @route   PUT /api/accommodations/:id
// @desc    Update accommodation (Admin only)
// @access  Private/Admin
router.put('/:id', 
  authenticateToken, 
  requireAdmin,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const {
        name,
        description,
        address,
        city,
        country,
        postal_code,
        latitude,
        longitude,
        star_rating,
        is_active
      } = req.body;

      const result = await db.query(
        `UPDATE accommodations 
         SET name = COALESCE($1, name),
             description = COALESCE($2, description),
             address = COALESCE($3, address),
             city = COALESCE($4, city),
             country = COALESCE($5, country),
             postal_code = COALESCE($6, postal_code),
             latitude = COALESCE($7, latitude),
             longitude = COALESCE($8, longitude),
             star_rating = COALESCE($9, star_rating),
             is_active = COALESCE($10, is_active),
             updated_at = NOW()
         WHERE id = $11
         RETURNING *`,
        [name, description, address, city, country, postal_code, latitude, longitude, star_rating, is_active, id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ 
          success: false, 
          message: 'Accommodation not found' 
        });
        return;
      }

      res.json({
        success: true,
        message: 'Accommodation updated successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Update accommodation error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to update accommodation' 
      });
    }
  }
);

// @route   DELETE /api/accommodations/:id
// @desc    Delete accommodation (Admin only)
// @access  Private/Admin
router.delete('/:id', 
  authenticateToken, 
  requireAdmin,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const result = await db.query(
        'DELETE FROM accommodations WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ 
          success: false, 
          message: 'Accommodation not found' 
        });
        return;
      }

      res.json({
        success: true,
        message: 'Accommodation deleted successfully'
      });
    } catch (error) {
      console.error('Delete accommodation error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to delete accommodation' 
      });
    }
  }
);

export default router;
