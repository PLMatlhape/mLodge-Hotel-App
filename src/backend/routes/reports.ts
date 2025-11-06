import express, { Response } from 'express';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';
import db from '../config/database';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Get all reports
router.get('/', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const result = await db.query(
      `SELECT r.*, u.name as generated_by_name
       FROM reports r
       LEFT JOIN users u ON r.generated_by = u.id
       ORDER BY r.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await db.query('SELECT COUNT(*) as total FROM reports');
    const total = parseInt(countResult.rows[0].total);

    res.json({
      reports: result.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Get single report
router.get('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT r.*, u.name as generated_by_name
       FROM reports r
       LEFT JOIN users u ON r.generated_by = u.id
       WHERE r.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

// Generate report
router.post('/generate', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, period, date_from, date_to, format, filters } = req.body;

    if (!type || !period || !format) {
      res.status(400).json({ error: 'Type, period, and format are required' });
      return;
    }

    // Create report record
    const result = await db.query(
      `INSERT INTO reports (name, type, period, date_from, date_to, format, filters, status, generated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8)
       RETURNING *`,
      [
        `${type.charAt(0).toUpperCase() + type.slice(1)} Report - ${new Date().toLocaleDateString()}`,
        type,
        period,
        date_from || null,
        date_to || null,
        format,
        filters || {},
        req.user!.id
      ]
    );

    const reportId = result.rows[0].id;

    // Start report generation in background
    generateReportAsync(reportId, type, period, date_from, date_to, format, filters).catch(error => {
      console.error('Error generating report:', error);
      db.query(
        `UPDATE reports SET status = 'failed', error_message = $1 WHERE id = $2`,
        [error.message, reportId]
      );
    });

    res.status(202).json({
      message: 'Report generation started',
      report: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ error: 'Failed to create report' });
  }
});

// Download report
router.get('/:id/download', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'SELECT * FROM reports WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }

    const report = result.rows[0];

    if (report.status !== 'completed') {
      res.status(400).json({ error: 'Report is not ready for download' });
      return;
    }

    if (!report.file_path) {
      res.status(404).json({ error: 'Report file not found' });
      return;
    }

    const filePath = path.join(__dirname, '../../', report.file_path);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: 'Report file does not exist' });
      return;
    }

    res.download(filePath, report.file_name);
  } catch (error) {
    console.error('Error downloading report:', error);
    res.status(500).json({ error: 'Failed to download report' });
  }
});

// Check report status
router.get('/:id/status', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'SELECT id, status, error_message, created_at, updated_at FROM reports WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error checking report status:', error);
    res.status(500).json({ error: 'Failed to check report status' });
  }
});

// Delete report
router.delete('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Get report to delete file
    const reportResult = await db.query(
      'SELECT file_path FROM reports WHERE id = $1',
      [id]
    );

    if (reportResult.rows.length > 0 && reportResult.rows[0].file_path) {
      const filePath = path.join(__dirname, '../../', reportResult.rows[0].file_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    const result = await db.query(
      'DELETE FROM reports WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }

    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ error: 'Failed to delete report' });
  }
});

// Background report generation function
async function generateReportAsync(
  reportId: number,
  type: string,
  period: string,
  date_from: string | null,
  date_to: string | null,
  format: string,
  filters: Record<string, unknown>
): Promise<void> {
  try {
    // Update status to processing
    await db.query(
      'UPDATE reports SET status = $1 WHERE id = $2',
      ['processing', reportId]
    );

    // Generate report based on type
    let data: unknown[] = [];
    let fileName = '';

    switch (type) {
      case 'bookings':
        data = await generateBookingsReport(date_from, date_to, filters);
        fileName = `bookings-report-${Date.now()}.${format}`;
        break;
      case 'revenue':
        data = await generateRevenueReport(date_from, date_to, filters);
        fileName = `revenue-report-${Date.now()}.${format}`;
        break;
      case 'occupancy':
        data = await generateOccupancyReport(date_from, date_to, filters);
        fileName = `occupancy-report-${Date.now()}.${format}`;
        break;
      case 'guests':
        data = await generateGuestsReport(date_from, date_to, filters);
        fileName = `guests-report-${Date.now()}.${format}`;
        break;
      default:
        throw new Error('Invalid report type');
    }

    // Create reports directory if it doesn't exist
    const reportsDir = path.join(__dirname, '../../reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const filePath = path.join(reportsDir, fileName);

    // Generate file based on format
    if (format === 'csv') {
      generateCSV(data, filePath);
    } else if (format === 'excel') {
      // TODO: Implement Excel generation
      generateCSV(data, filePath.replace('.excel', '.csv'));
    } else if (format === 'pdf') {
      // TODO: Implement PDF generation
      generateCSV(data, filePath.replace('.pdf', '.csv'));
    }

    // Update report with file info
    await db.query(
      `UPDATE reports
       SET status = 'completed',
           file_path = $1,
           file_name = $2,
           file_size = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [`reports/${fileName}`, fileName, fs.statSync(filePath).size, reportId]
    );
  } catch (error) {
    console.error('Error in generateReportAsync:', error);
    throw error;
  }
}

// Report generation helpers
async function generateBookingsReport(date_from: string | null, date_to: string | null, filters: Record<string, unknown>) {
  let query = `
    SELECT b.*, u.name as guest_name, u.email as guest_email,
           acc.name as accommodation_name
    FROM bookings b
    JOIN users u ON b.user_id = u.id
    JOIN accommodations acc ON b.accommodation_id = acc.id
    WHERE 1=1
  `;
  const params: (string | number)[] = [];
  let paramIndex = 1;

  if (date_from) {
    query += ` AND b.check_in_date >= $${paramIndex}`;
    params.push(date_from);
    paramIndex++;
  }

  if (date_to) {
    query += ` AND b.check_out_date <= $${paramIndex}`;
    params.push(date_to);
    paramIndex++;
  }

  query += ' ORDER BY b.created_at DESC';

  const result = await db.query(query, params);
  return result.rows;
}

async function generateRevenueReport(date_from: string | null, date_to: string | null, filters: Record<string, unknown>) {
  let query = `
    SELECT DATE(created_at) as date,
           COUNT(*) as bookings_count,
           SUM(total_price) as total_revenue
    FROM bookings
    WHERE status = 'confirmed'
  `;
  const params: string[] = [];
  let paramIndex = 1;

  if (date_from) {
    query += ` AND created_at >= $${paramIndex}`;
    params.push(date_from);
    paramIndex++;
  }

  if (date_to) {
    query += ` AND created_at <= $${paramIndex}`;
    params.push(date_to);
    paramIndex++;
  }

  query += ' GROUP BY DATE(created_at) ORDER BY date DESC';

  const result = await db.query(query, params);
  return result.rows;
}

async function generateOccupancyReport(date_from: string | null, date_to: string | null, filters: Record<string, unknown>) {
  const query = `
    SELECT acc.name as accommodation_name,
           COUNT(b.id) as total_bookings,
           SUM(EXTRACT(DAY FROM (b.check_out_date - b.check_in_date))) as total_nights
    FROM accommodations acc
    LEFT JOIN bookings b ON acc.id = b.accommodation_id
    GROUP BY acc.id, acc.name
    ORDER BY total_bookings DESC
  `;

  const result = await db.query(query);
  return result.rows;
}

async function generateGuestsReport(date_from: string | null, date_to: string | null, filters: Record<string, unknown>) {
  let query = `
    SELECT u.id, u.name, u.email,
           COUNT(b.id) as total_bookings,
           SUM(b.total_price) as total_spent
    FROM users u
    LEFT JOIN bookings b ON u.id = b.user_id
    WHERE u.role = 'user'
  `;
  const params: string[] = [];
  let paramIndex = 1;

  if (date_from) {
    query += ` AND b.created_at >= $${paramIndex}`;
    params.push(date_from);
    paramIndex++;
  }

  if (date_to) {
    query += ` AND b.created_at <= $${paramIndex}`;
    params.push(date_to);
    paramIndex++;
  }

  query += ' GROUP BY u.id, u.name, u.email ORDER BY total_spent DESC';

  const result = await db.query(query, params);
  return result.rows;
}

function generateCSV(data: unknown[], filePath: string) {
  if (data.length === 0) {
    fs.writeFileSync(filePath, 'No data available');
    return;
  }

  const headers = Object.keys(data[0] as Record<string, unknown>).join(',');
  const rows = data.map(row => 
    Object.values(row as Record<string, unknown>)
      .map(val => `"${val}"`)
      .join(',')
  );

  const csv = [headers, ...rows].join('\n');
  fs.writeFileSync(filePath, csv);
}

export default router;
