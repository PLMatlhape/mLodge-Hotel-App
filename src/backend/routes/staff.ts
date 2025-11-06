import express, { Response } from 'express';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';
import db from '../config/database';
import bcrypt from 'bcrypt';

const router = express.Router();

// Get all staff members
router.get('/', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const result = await db.query(
      `SELECT id, name, email, role, is_active, created_at, updated_at
       FROM users
       WHERE role IN ('admin', 'staff')
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await db.query(
      `SELECT COUNT(*) as total FROM users WHERE role IN ('admin', 'staff')`
    );

    const total = parseInt(countResult.rows[0].total);

    res.json({
      staff: result.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ error: 'Failed to fetch staff members' });
  }
});

// Get single staff member
router.get('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT id, name, email, role, is_active, created_at, updated_at
       FROM users
       WHERE id = $1 AND role IN ('admin', 'staff')`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Staff member not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching staff member:', error);
    res.status(500).json({ error: 'Failed to fetch staff member' });
  }
});

// Create new staff member
router.post('/', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      res.status(400).json({ error: 'Name, email, password, and role are required' });
      return;
    }

    // Check if email already exists
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      res.status(409).json({ error: 'Email already exists' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO users (name, email, password, role, is_active)
       VALUES ($1, $2, $3, $4, true)
       RETURNING id, name, email, role, is_active, created_at, updated_at`,
      [name, email, hashedPassword, role]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating staff member:', error);
    res.status(500).json({ error: 'Failed to create staff member' });
  }
});

// Update staff member
router.put('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, role, is_active } = req.body;

    const result = await db.query(
      `UPDATE users
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           role = COALESCE($3, role),
           is_active = COALESCE($4, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 AND role IN ('admin', 'staff')
       RETURNING id, name, email, role, is_active, created_at, updated_at`,
      [name, email, role, is_active, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Staff member not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating staff member:', error);
    res.status(500).json({ error: 'Failed to update staff member' });
  }
});

// Delete staff member
router.delete('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (parseInt(id) === req.user!.id) {
      res.status(400).json({ error: 'Cannot delete your own account' });
      return;
    }

    const result = await db.query(
      `DELETE FROM users
       WHERE id = $1 AND role IN ('admin', 'staff')
       RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Staff member not found' });
      return;
    }

    res.json({ message: 'Staff member deleted successfully' });
  } catch (error) {
    console.error('Error deleting staff member:', error);
    res.status(500).json({ error: 'Failed to delete staff member' });
  }
});

// Activate/Deactivate staff member
router.patch('/:id/status', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const result = await db.query(
      `UPDATE users
       SET is_active = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND role IN ('admin', 'staff')
       RETURNING id, name, email, role, is_active, created_at, updated_at`,
      [is_active, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Staff member not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating staff status:', error);
    res.status(500).json({ error: 'Failed to update staff status' });
  }
});

// Change staff password
router.patch('/:id/password', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      `UPDATE users
       SET password = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND role IN ('admin', 'staff')
       RETURNING id`,
      [hashedPassword, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Staff member not found' });
      return;
    }

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

export default router;