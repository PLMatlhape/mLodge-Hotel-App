/**
 * Payment Routes
 * Handles secure payment processing with multiple providers
 * Supports: Stripe, PayFast (South African), Bank Transfer
 */

import { Router, type Response } from 'express';
import crypto from 'crypto';
import { authenticateToken, type AuthRequest } from '../middleware/auth';
import db from '../config/database';
import { sendBookingReceipt } from '../services/emailService';

const router = Router();

// Payment configuration from environment variables
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const PAYFAST_MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID || '';
const PAYFAST_MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY || '';
const PAYFAST_PASSPHRASE = process.env.PAYFAST_PASSPHRASE || '';
const PAYFAST_MODE = process.env.PAYFAST_MODE || 'sandbox'; // 'sandbox' or 'live'
const PAYMENT_WEBHOOK_SECRET = process.env.PAYMENT_WEBHOOK_SECRET || crypto.randomBytes(32).toString('hex');

// Payment status constants
const PaymentStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
} as const;

// Payment method constants
const PaymentMethod = {
  CREDIT_CARD: 'credit_card',
  PAYFAST: 'payfast',
  BANK_TRANSFER: 'bank_transfer'
} as const;

/**
 * Helper function to send receipt email after successful payment
 */
async function sendReceiptEmail(bookingId: number, transactionId: string, paymentMethod: string) {
  try {
    // Fetch booking details with accommodation and user info
    const bookingResult = await db.query(
      `SELECT b.*, 
              a.name as accommodation_name,
              u.name as user_name,
              u.email as user_email,
              COALESCE(json_agg(
                DISTINCT jsonb_build_object('name', r.name)
              ) FILTER (WHERE r.id IS NOT NULL), '[]') as rooms
       FROM bookings b
       JOIN accommodations a ON a.id = b.accommodation_id
       JOIN users u ON u.id = b.user_id
       LEFT JOIN booking_items bi ON bi.booking_id = b.id
       LEFT JOIN rooms r ON r.id = bi.room_id
       WHERE b.id = $1
       GROUP BY b.id, a.name, u.name, u.email`,
      [bookingId]
    );

    if (bookingResult.rows.length === 0) {
      console.log('⚠️ Booking not found for email:', bookingId);
      return;
    }

    const booking = bookingResult.rows[0];
    const rooms = booking.rooms as Array<{ name: string }>;
    const roomNames = rooms.map(r => r.name).filter(Boolean).join(', ');

    // Calculate number of nights
    const checkIn = new Date(booking.check_in_date);
    const checkOut = new Date(booking.check_out_date);
    const numNights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    // Send receipt email
    await sendBookingReceipt({
      bookingId: booking.id,
      bookingReference: booking.booking_reference || `BK${booking.id}`,
      guestName: booking.user_name,
      guestEmail: booking.user_email,
      accommodationName: booking.accommodation_name,
      roomName: roomNames || undefined,
      checkInDate: booking.check_in_date,
      checkOutDate: booking.check_out_date,
      numAdults: booking.num_adults || 1,
      numChildren: booking.num_children || 0,
      numNights,
      totalPrice: parseFloat(booking.total_price || 0),
      paymentMethod: paymentMethod.replace('_', ' ').toUpperCase(),
      transactionId,
      paymentDate: new Date().toISOString(),
    });

    console.log(`✅ Receipt email sent for booking #${bookingId}`);
  } catch (error) {
    console.error('❌ Error sending receipt email:', error);
    // Don't throw - email failure shouldn't break payment flow
  }
}

/**
 * Generate secure payment signature for PayFast
 */
function generatePayFastSignature(data: Record<string, string | number>, passphrase: string = ''): string {
  // Create parameter string
  const pfOutput = Object.keys(data)
    .filter(key => key !== 'signature')
    .sort()
    .map(key => `${key}=${encodeURIComponent(String(data[key])).replace(/%20/g, '+')}`)
    .join('&');

  // Add passphrase if provided
  const signatureString = passphrase ? `${pfOutput}&passphrase=${encodeURIComponent(passphrase)}` : pfOutput;
  
  // Generate MD5 hash
  return crypto.createHash('md5').update(signatureString).digest('hex');
}

/**
 * Verify payment webhook signature
 */
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Create payment intent
 * POST /api/payments/intent
 */
router.post('/intent', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { amount, currency, bookingId, paymentMethod } = req.body;

    // Validate required fields
    if (!amount || !currency || !bookingId || !paymentMethod) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Validate amount is positive
    if (amount <= 0) {
      res.status(400).json({ error: 'Amount must be greater than zero' });
      return;
    }

    // Verify booking exists and belongs to user
    const bookingCheck = await db.query(
      'SELECT id, user_id, total_price, status FROM bookings WHERE id = $1',
      [bookingId]
    );

    if (bookingCheck.rows.length === 0) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    const booking = bookingCheck.rows[0];
    if (booking.user_id !== userId) {
      res.status(403).json({ error: 'Unauthorized access to booking' });
      return;
    }

    // Check if booking is already paid
    if (booking.status === 'confirmed' || booking.status === 'completed') {
      res.status(400).json({ error: 'Booking is already paid' });
      return;
    }

    // Generate unique payment reference
    const paymentReference = `PAY-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    // Create payment record
    const paymentResult = await db.query(
      `INSERT INTO payments (
        booking_id, user_id, amount, currency, payment_method, status, reference_number, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING id, reference_number, status`,
      [bookingId, userId, amount, currency, paymentMethod, PaymentStatus.PENDING, paymentReference]
    );

    const payment = paymentResult.rows[0];

    // Generate response based on payment method
    let responseData: Record<string, unknown> = {
      paymentId: payment.id,
      referenceNumber: payment.reference_number,
      status: payment.status,
      amount,
      currency
    };

    // For PayFast, generate payment URL
    if (paymentMethod === PaymentMethod.PAYFAST) {
      const payFastUrl = PAYFAST_MODE === 'live' 
        ? 'https://www.payfast.co.za/eng/process'
        : 'https://sandbox.payfast.co.za/eng/process';

      const payFastData = {
        merchant_id: PAYFAST_MERCHANT_ID,
        merchant_key: PAYFAST_MERCHANT_KEY,
        return_url: `${process.env.APP_URL}/payment/success?ref=${paymentReference}`,
        cancel_url: `${process.env.APP_URL}/payment/cancel?ref=${paymentReference}`,
        notify_url: `${process.env.API_URL}/api/payments/webhook/payfast`,
        name_first: req.user?.name?.split(' ')[0] || 'Guest',
        email_address: req.user?.email || '',
        m_payment_id: payment.id,
        amount: (amount / 100).toFixed(2), // Convert cents to rands
        item_name: `Booking #${bookingId}`,
        item_description: `Hotel Booking Payment - ${paymentReference}`,
        custom_str1: bookingId.toString(),
        custom_str2: userId?.toString() || '',
      };

      // Generate signature
      const signature = generatePayFastSignature(payFastData, PAYFAST_PASSPHRASE);
      
      responseData = {
        ...responseData,
        paymentUrl: payFastUrl,
        paymentData: { ...payFastData, signature }
      };
    }

    // For Stripe (requires Stripe SDK on frontend)
    if (paymentMethod === PaymentMethod.CREDIT_CARD && STRIPE_SECRET_KEY) {
      // Note: In production, use Stripe SDK server-side
      responseData = {
        ...responseData,
        clientSecret: `pi_${payment.reference_number}_secret_${crypto.randomBytes(16).toString('hex')}`,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
      };
    }

    // For bank transfer
    if (paymentMethod === PaymentMethod.BANK_TRANSFER) {
      responseData = {
        ...responseData,
        bankDetails: {
          bankName: 'First National Bank (FNB)',
          accountName: 'mLodge Hotel PTY LTD',
          accountNumber: '62 7891 2345 6',
          branchCode: '250 655',
          reference: paymentReference,
          swiftCode: 'FIRNZAJJ'
        }
      };
    }

    res.json(responseData);
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

/**
 * Verify payment status
 * GET /api/payments/:paymentId/status
 */
router.get('/:paymentId/status', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { paymentId } = req.params;
    const userId = req.user?.id;

    const paymentResult = await db.query(
      `SELECT p.*, b.booking_reference, b.user_id as booking_user_id
       FROM payments p
       JOIN bookings b ON b.id = p.booking_id
       WHERE p.id = $1`,
      [paymentId]
    );

    if (paymentResult.rows.length === 0) {
      res.status(404).json({ error: 'Payment not found' });
      return;
    }

    const payment = paymentResult.rows[0];

    // Verify user has access to this payment
    if (payment.booking_user_id !== userId) {
      res.status(403).json({ error: 'Unauthorized access to payment' });
      return;
    }

    res.json({
      id: payment.id,
      referenceNumber: payment.reference_number,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      paymentMethod: payment.payment_method,
      bookingReference: payment.booking_reference,
      createdAt: payment.created_at,
      completedAt: payment.completed_at
    });
  } catch (error) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({ error: 'Failed to fetch payment status' });
  }
});

/**
 * Process payment (for credit card - simulated)
 * POST /api/payments/:paymentId/process
 */
router.post('/:paymentId/process', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { paymentId } = req.params;
    const userId = req.user?.id;
    const { token } = req.body; // Payment token from Stripe/payment processor

    // Verify payment belongs to user
    const paymentResult = await db.query(
      `SELECT p.*, b.user_id as booking_user_id, b.id as booking_id
       FROM payments p
       JOIN bookings b ON b.id = p.booking_id
       WHERE p.id = $1`,
      [paymentId]
    );

    if (paymentResult.rows.length === 0) {
      res.status(404).json({ error: 'Payment not found' });
      return;
    }

    const payment = paymentResult.rows[0];

    if (payment.booking_user_id !== userId) {
      res.status(403).json({ error: 'Unauthorized access to payment' });
      return;
    }

    if (payment.status !== PaymentStatus.PENDING) {
      res.status(400).json({ error: 'Payment has already been processed' });
      return;
    }

    // Update payment status to processing
    await db.query(
      'UPDATE payments SET status = $1, updated_at = NOW() WHERE id = $2',
      [PaymentStatus.PROCESSING, paymentId]
    );

    // Simulate payment processing (in production, call Stripe API)
    // For demo: 95% success rate
    const success = Math.random() > 0.05;

    if (success && token) {
      const transactionId = `txn_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      
      // Update payment to succeeded
      await db.query(
        `UPDATE payments 
         SET status = $1, completed_at = NOW(), transaction_id = $2, updated_at = NOW()
         WHERE id = $3`,
        [PaymentStatus.SUCCEEDED, transactionId, paymentId]
      );

      // Update booking status to confirmed
      await db.query(
        'UPDATE bookings SET status = $1, payment_status = $2, updated_at = NOW() WHERE id = $3',
        ['confirmed', 'paid', payment.booking_id]
      );

      // Send receipt email
      await sendReceiptEmail(payment.booking_id, transactionId, payment.payment_method);

      res.json({
        success: true,
        status: PaymentStatus.SUCCEEDED,
        message: 'Payment processed successfully'
      });
    } else {
      // Update payment to failed
      await db.query(
        'UPDATE payments SET status = $1, error_message = $2, updated_at = NOW() WHERE id = $3',
        [PaymentStatus.FAILED, 'Payment declined by processor', paymentId]
      );

      res.status(402).json({
        success: false,
        status: PaymentStatus.FAILED,
        error: 'Payment was declined'
      });
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

/**
 * PayFast webhook handler (ITN - Instant Transaction Notification)
 * POST /api/payments/webhook/payfast
 */
router.post('/webhook/payfast', async (req, res): Promise<void> => {
  try {
    const pfData = req.body;
    
    console.log('📥 PayFast ITN received:', pfData);

    // Verify signature
    const signature = pfData.signature;
    delete pfData.signature;
    
    const generatedSignature = generatePayFastSignature(pfData, PAYFAST_PASSPHRASE);
    
    if (signature !== generatedSignature) {
      console.error('❌ Invalid PayFast signature');
      res.status(400).send('Invalid signature');
      return;
    }

    // Extract payment info
    const paymentId = pfData.m_payment_id;
    const paymentStatus = pfData.payment_status;
    const amountGross = parseFloat(pfData.amount_gross);

    // Get payment from database
    const paymentResult = await db.query(
      'SELECT p.*, b.id as booking_id FROM payments p JOIN bookings b ON b.id = p.booking_id WHERE p.id = $1',
      [paymentId]
    );

    if (paymentResult.rows.length === 0) {
      console.error('❌ Payment not found:', paymentId);
      res.status(404).send('Payment not found');
      return;
    }

    const payment = paymentResult.rows[0];

    // Verify amount matches
    const expectedAmount = payment.amount / 100; // Convert cents to rands
    if (Math.abs(amountGross - expectedAmount) > 0.01) {
      console.error('❌ Amount mismatch:', { received: amountGross, expected: expectedAmount });
      res.status(400).send('Amount mismatch');
      return;
    }

    // Update payment based on status
    if (paymentStatus === 'COMPLETE') {
      await db.query(
        `UPDATE payments 
         SET status = $1, completed_at = NOW(), transaction_id = $2, updated_at = NOW()
         WHERE id = $3`,
        [PaymentStatus.SUCCEEDED, pfData.pf_payment_id, paymentId]
      );

      // Update booking
      await db.query(
        'UPDATE bookings SET status = $1, payment_status = $2, updated_at = NOW() WHERE id = $3',
        ['confirmed', 'paid', payment.booking_id]
      );

      // Send receipt email
      await sendReceiptEmail(payment.booking_id, pfData.pf_payment_id, payment.payment_method);

      console.log('✅ Payment successful:', paymentId);
    } else if (paymentStatus === 'FAILED') {
      await db.query(
        'UPDATE payments SET status = $1, error_message = $2, updated_at = NOW() WHERE id = $3',
        [PaymentStatus.FAILED, 'Payment failed at gateway', paymentId]
      );

      console.log('❌ Payment failed:', paymentId);
    } else if (paymentStatus === 'CANCELLED') {
      await db.query(
        'UPDATE payments SET status = $1, updated_at = NOW() WHERE id = $2',
        [PaymentStatus.CANCELLED, paymentId]
      );

      console.log('⚠️ Payment cancelled:', paymentId);
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Error processing PayFast webhook:', error);
    res.status(500).send('Webhook processing error');
  }
});

/**
 * Stripe webhook handler
 * POST /api/payments/webhook/stripe
 */
router.post('/webhook/stripe', async (req, res): Promise<void> => {
  try {
    const sig = req.headers['stripe-signature'] as string;
    const payload = JSON.stringify(req.body);

    // Verify webhook signature
    if (!verifyWebhookSignature(payload, sig, PAYMENT_WEBHOOK_SECRET)) {
      console.error('❌ Invalid Stripe webhook signature');
      res.status(400).send('Invalid signature');
      return;
    }

    const event = req.body;

    console.log('📥 Stripe webhook received:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const paymentId = paymentIntent.metadata.paymentId;

        if (paymentId) {
          await db.query(
            `UPDATE payments 
             SET status = $1, completed_at = NOW(), transaction_id = $2, updated_at = NOW()
             WHERE id = $3`,
            [PaymentStatus.SUCCEEDED, paymentIntent.id, paymentId]
          );

          // Update booking
          const payment = await db.query('SELECT booking_id FROM payments WHERE id = $1', [paymentId]);
          if (payment.rows.length > 0) {
            await db.query(
              'UPDATE bookings SET status = $1, payment_status = $2, updated_at = NOW() WHERE id = $3',
              ['confirmed', 'paid', payment.rows[0].booking_id]
            );
            
            // Send receipt email
            await sendReceiptEmail(payment.rows[0].booking_id, paymentIntent.id, PaymentMethod.CREDIT_CARD);
          }

          console.log('✅ Stripe payment successful:', paymentId);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const paymentId = paymentIntent.metadata.paymentId;

        if (paymentId) {
          await db.query(
            'UPDATE payments SET status = $1, error_message = $2, updated_at = NOW() WHERE id = $3',
            [PaymentStatus.FAILED, paymentIntent.last_payment_error?.message || 'Payment failed', paymentId]
          );

          console.log('❌ Stripe payment failed:', paymentId);
        }
        break;
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing Stripe webhook:', error);
    res.status(500).send('Webhook processing error');
  }
});

/**
 * Verify bank transfer manually (admin only)
 * POST /api/payments/:paymentId/verify-bank-transfer
 */
router.post(
  '/:paymentId/verify-bank-transfer',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { paymentId } = req.params;
      const { verified, transactionId, notes } = req.body;

      // Check if user is admin
      if (req.user?.role !== 'admin') {
        res.status(403).json({ error: 'Unauthorized. Admin access required.' });
        return;
      }

      const paymentResult = await db.query(
        'SELECT p.*, b.id as booking_id FROM payments p JOIN bookings b ON b.id = p.booking_id WHERE p.id = $1',
        [paymentId]
      );

      if (paymentResult.rows.length === 0) {
        res.status(404).json({ error: 'Payment not found' });
        return;
      }

      const payment = paymentResult.rows[0];

      if (payment.payment_method !== PaymentMethod.BANK_TRANSFER) {
        res.status(400).json({ error: 'Payment is not a bank transfer' });
        return;
      }

      const newStatus = verified ? PaymentStatus.SUCCEEDED : PaymentStatus.FAILED;

      await db.query(
        `UPDATE payments 
         SET status = $1, completed_at = NOW(), transaction_id = $2, admin_notes = $3, updated_at = NOW()
         WHERE id = $4`,
        [newStatus, transactionId, notes, paymentId]
      );

      if (verified) {
        await db.query(
          'UPDATE bookings SET status = $1, payment_status = $2, updated_at = NOW() WHERE id = $3',
          ['confirmed', 'paid', payment.booking_id]
        );
        
        // Send receipt email
        await sendReceiptEmail(payment.booking_id, transactionId || paymentId, PaymentMethod.BANK_TRANSFER);
      }

      res.json({
        success: true,
        status: newStatus,
        message: `Bank transfer ${verified ? 'verified' : 'rejected'} successfully`
      });
    } catch (error) {
      console.error('Error verifying bank transfer:', error);
      res.status(500).json({ error: 'Failed to verify bank transfer' });
    }
  }
);

export default router;
