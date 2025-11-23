import express, { type Response } from 'express';
import { authenticateToken, requireAdmin, type AuthRequest } from '../middleware/auth';
import db from '../config/database';

const router = express.Router();

// Get all email templates
router.get('/', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const type = req.query.type as string;

    let query = 'SELECT * FROM email_templates';
    const params: (string | number)[] = [];

    if (type) {
      query += ' WHERE type = $1';
      params.push(type);
    }

    query += ' ORDER BY created_at DESC';

    const result = await db.query(query, params);

    res.json({ templates: result.rows });
  } catch (error) {
    console.error('Error fetching email templates:', error);
    res.status(500).json({ error: 'Failed to fetch email templates' });
  }
});

// Get single email template
router.get('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'SELECT * FROM email_templates WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Email template not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching email template:', error);
    res.status(500).json({ error: 'Failed to fetch email template' });
  }
});

// Create email template
router.post('/', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, type, subject, body, variables } = req.body;

    if (!name || !type || !subject || !body) {
      res.status(400).json({ error: 'Name, type, subject, and body are required' });
      return;
    }

    const result = await db.query(
      `INSERT INTO email_templates (name, type, subject, body, variables)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, type, subject, body, variables || []]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating email template:', error);
    res.status(500).json({ error: 'Failed to create email template' });
  }
});

// Update email template
router.put('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, type, subject, body, variables, is_active } = req.body;

    const result = await db.query(
      `UPDATE email_templates
       SET name = COALESCE($1, name),
           type = COALESCE($2, type),
           subject = COALESCE($3, subject),
           body = COALESCE($4, body),
           variables = COALESCE($5, variables),
           is_active = COALESCE($6, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [name, type, subject, body, variables, is_active, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Email template not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating email template:', error);
    res.status(500).json({ error: 'Failed to update email template' });
  }
});

// Delete email template
router.delete('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM email_templates WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Email template not found' });
      return;
    }

    res.json({ message: 'Email template deleted successfully' });
  } catch (error) {
    console.error('Error deleting email template:', error);
    res.status(500).json({ error: 'Failed to delete email template' });
  }
});

// Send test email
router.post('/:id/test', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { test_email, test_data } = req.body;

    if (!test_email) {
      res.status(400).json({ error: 'Test email address is required' });
      return;
    }

    const result = await db.query(
      'SELECT * FROM email_templates WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Email template not found' });
      return;
    }

    const template = result.rows[0];
    
    // Replace variables with test data
    let subject = template.subject;
    let body = template.body;

    if (test_data) {
      Object.keys(test_data).forEach((key) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        subject = subject.replace(regex, test_data[key]);
        body = body.replace(regex, test_data[key]);
      });
    }

    // TODO: Send actual email using email service
    // await sendEmail(test_email, subject, body);

    res.json({
      message: 'Test email sent successfully',
      preview: { subject, body }
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ error: 'Failed to send test email' });
  }
});

export default router;
