import express, { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import db from '../config/database';

const router = express.Router();

// Register new user
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('name').trim().isLength({ min: 2, max: 100 }),
    body('phone').optional().trim().isMobilePhone('any'),
    body('password').isLength({ min: 6 }),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { email, name, phone, password } = req.body;

      // Check if user already exists
      const existingUser = await db.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        res.status(400).json({ error: 'Email already registered' });
        return;
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const result = await db.query(
        `INSERT INTO users (email, name, phone, password, role, is_active)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, email, name, phone, role, created_at`,
        [email, name, phone || null, passwordHash, 'user', true]
      );

      const user = result.rows[0];

      // Generate JWT token
      const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
      const signOptions: SignOptions = { expiresIn: '7d' };
      const token = jwt.sign(
        { userId: user.id },
        jwtSecret,
        signOptions
      );

      res.status(201).json({ token, user });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
);

// Login user
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { email, password } = req.body;

      // Find user
      const result = await db.query(
        'SELECT id, email, name, phone, role, password, is_active FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      const user = result.rows[0];

      // Check if user is active
      if (!user.is_active) {
        res.status(401).json({ error: 'Account is deactivated' });
        return;
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      // Update last login
      await db.query('UPDATE users SET updated_at = NOW() WHERE id = $1', [user.id]);

      // Generate JWT token
      const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
      const signOptions: SignOptions = { expiresIn: '7d' };
      const token = jwt.sign(
        { userId: user.id },
        jwtSecret,
        signOptions
      );

      // Remove password from response
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userWithoutPassword } = user;

      res.json({ token, user: userWithoutPassword });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

// Get current user
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    res.json(req.user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

export default router;
