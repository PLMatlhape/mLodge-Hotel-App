/**
 * Email Service
 * Handles sending emails for bookings, receipts, and notifications
 */

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Email configuration
const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
};

const FROM_EMAIL = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'noreply@mlodgehotel.com';
const FROM_NAME = process.env.SMTP_FROM_NAME || 'mLodge Hotel';

// Create reusable transporter
const transporter = nodemailer.createTransport(SMTP_CONFIG);

// Verify connection configuration
transporter.verify((error) => {
  if (error) {
    console.error('❌ Email service configuration error:', error.message);
    console.log('📧 Email notifications will be disabled. Please configure SMTP settings in .env');
  } else {
    console.log('✅ Email service ready');
  }
});

interface BookingDetails {
  bookingId: number;
  bookingReference: string;
  guestName: string;
  guestEmail: string;
  accommodationName: string;
  roomName?: string;
  checkInDate: string;
  checkOutDate: string;
  numAdults: number;
  numChildren: number;
  numNights: number;
  totalPrice: number;
  paymentMethod: string;
  transactionId: string;
  paymentDate: string;
}

/**
 * Generate booking receipt HTML
 */
function generateReceiptHTML(booking: BookingDetails): string {
  const checkIn = new Date(booking.checkInDate).toLocaleDateString('en-ZA', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });
  const checkOut = new Date(booking.checkOutDate).toLocaleDateString('en-ZA', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });
  const paymentDate = new Date(booking.paymentDate).toLocaleDateString('en-ZA', { 
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .email-container {
          background-color: #ffffff;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #001F3F 0%, #0056D2 100%);
          color: #ffffff;
          padding: 40px 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 32px;
          font-weight: 700;
          letter-spacing: 2px;
        }
        .header p {
          margin: 10px 0 0 0;
          font-size: 14px;
          opacity: 0.9;
        }
        .content {
          padding: 40px 30px;
        }
        .success-badge {
          background-color: #10B981;
          color: white;
          padding: 12px 24px;
          border-radius: 25px;
          display: inline-block;
          font-weight: 600;
          margin-bottom: 20px;
        }
        .booking-details {
          background-color: #f8f9fa;
          border-radius: 8px;
          padding: 25px;
          margin: 25px 0;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #e0e0e0;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          font-weight: 600;
          color: #555;
        }
        .detail-value {
          color: #333;
          text-align: right;
        }
        .total-row {
          background-color: #001F3F;
          color: white;
          padding: 15px 20px;
          border-radius: 8px;
          margin-top: 20px;
          display: flex;
          justify-content: space-between;
          font-size: 18px;
          font-weight: 700;
        }
        .info-box {
          background-color: #E3F2FD;
          border-left: 4px solid #0056D2;
          padding: 20px;
          margin: 25px 0;
          border-radius: 4px;
        }
        .info-box h3 {
          margin: 0 0 10px 0;
          color: #0056D2;
          font-size: 16px;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 30px;
          text-align: center;
          font-size: 13px;
          color: #666;
        }
        .btn {
          display: inline-block;
          padding: 14px 30px;
          background-color: #0056D2;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin: 20px 0;
        }
        @media only screen and (max-width: 600px) {
          .content {
            padding: 20px 15px;
          }
          .detail-row {
            flex-direction: column;
          }
          .detail-value {
            text-align: left;
            margin-top: 5px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <!-- Header -->
        <div class="header">
          <h1>mLODGE HOTEL</h1>
          <p>Luxury Accommodation</p>
        </div>

        <!-- Content -->
        <div class="content">
          <div class="success-badge">
            ✓ Payment Successful
          </div>

          <h2 style="color: #001F3F; margin-top: 0;">Booking Confirmation</h2>
          <p style="font-size: 16px; color: #555;">
            Dear ${booking.guestName},
          </p>
          <p style="font-size: 16px; color: #555;">
            Thank you for choosing mLodge Hotel! Your payment has been successfully processed and your booking is confirmed.
          </p>

          <!-- Booking Details -->
          <div class="booking-details">
            <h3 style="margin-top: 0; color: #001F3F;">Booking Details</h3>
            
            <div class="detail-row">
              <span class="detail-label">Booking Reference:</span>
              <span class="detail-value"><strong>${booking.bookingReference}</strong></span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Accommodation:</span>
              <span class="detail-value">${booking.accommodationName}</span>
            </div>
            
            ${booking.roomName ? `
            <div class="detail-row">
              <span class="detail-label">Room:</span>
              <span class="detail-value">${booking.roomName}</span>
            </div>
            ` : ''}
            
            <div class="detail-row">
              <span class="detail-label">Check-in:</span>
              <span class="detail-value">${checkIn}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Check-out:</span>
              <span class="detail-value">${checkOut}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Number of Nights:</span>
              <span class="detail-value">${booking.numNights}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Guests:</span>
              <span class="detail-value">
                ${booking.numAdults} Adult${booking.numAdults > 1 ? 's' : ''}${booking.numChildren > 0 ? `, ${booking.numChildren} Child${booking.numChildren > 1 ? 'ren' : ''}` : ''}
              </span>
            </div>
          </div>

          <!-- Payment Details -->
          <div class="booking-details">
            <h3 style="margin-top: 0; color: #001F3F;">Payment Details</h3>
            
            <div class="detail-row">
              <span class="detail-label">Payment Method:</span>
              <span class="detail-value">${booking.paymentMethod}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Transaction ID:</span>
              <span class="detail-value">${booking.transactionId}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Payment Date:</span>
              <span class="detail-value">${paymentDate}</span>
            </div>
            
            <div class="total-row">
              <span>Total Amount Paid:</span>
              <span>R ${booking.totalPrice.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          <!-- Important Information -->
          <div class="info-box">
            <h3>📋 Important Information</h3>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Check-in time: 2:00 PM</li>
              <li>Check-out time: 11:00 AM</li>
              <li>Please bring a valid ID for check-in</li>
              <li>Your booking reference: <strong>${booking.bookingReference}</strong></li>
            </ul>
          </div>

          <center>
            <a href="${process.env.APP_URL}/bookings" class="btn" style="color: white;">View My Bookings</a>
          </center>

          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            If you have any questions or need to make changes to your booking, please contact us at:
          </p>
          <p style="color: #0056D2; font-weight: 600; font-size: 14px;">
            📧 reservations@mlodgehotel.com<br>
            📞 +27 11 123 4567
          </p>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p><strong>mLodge Hotel</strong></p>
          <p>123 Luxury Avenue, Sandton, Johannesburg, 2196</p>
          <p style="margin-top: 15px; font-size: 12px; color: #999;">
            This is an automated email. Please do not reply to this message.<br>
            © ${new Date().getFullYear()} mLodge Hotel. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Send booking receipt email
 */
export async function sendBookingReceipt(booking: BookingDetails): Promise<boolean> {
  try {
    // Check if email service is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.log('⚠️ Email service not configured. Skipping email send.');
      return false;
    }

    const mailOptions = {
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: booking.guestEmail,
      subject: `Booking Confirmation - ${booking.bookingReference} | mLodge Hotel`,
      html: generateReceiptHTML(booking),
      text: `
Booking Confirmation - mLodge Hotel

Dear ${booking.guestName},

Your payment has been successfully processed and your booking is confirmed!

Booking Reference: ${booking.bookingReference}
Accommodation: ${booking.accommodationName}
${booking.roomName ? `Room: ${booking.roomName}\n` : ''}
Check-in: ${new Date(booking.checkInDate).toLocaleDateString('en-ZA')}
Check-out: ${new Date(booking.checkOutDate).toLocaleDateString('en-ZA')}
Guests: ${booking.numAdults} Adult(s)${booking.numChildren > 0 ? `, ${booking.numChildren} Child(ren)` : ''}
Total Amount: R ${booking.totalPrice.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}

Payment Method: ${booking.paymentMethod}
Transaction ID: ${booking.transactionId}

Important Information:
- Check-in time: 2:00 PM
- Check-out time: 11:00 AM
- Please bring a valid ID for check-in

For any questions, contact us at reservations@mlodgehotel.com or call +27 11 123 4567.

Thank you for choosing mLodge Hotel!

Best regards,
mLodge Hotel Team
      `.trim(),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    console.log(`📧 Receipt sent to: ${booking.guestEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return false;
  }
}

/**
 * Send booking cancellation email
 */
export async function sendCancellationEmail(
  guestName: string,
  guestEmail: string,
  bookingReference: string,
  accommodationName: string
): Promise<boolean> {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.log('⚠️ Email service not configured. Skipping email send.');
      return false;
    }

    const mailOptions = {
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: guestEmail,
      subject: `Booking Cancelled - ${bookingReference} | mLodge Hotel`,
      html: `
        <h2>Booking Cancellation Confirmation</h2>
        <p>Dear ${guestName},</p>
        <p>Your booking <strong>${bookingReference}</strong> for ${accommodationName} has been cancelled.</p>
        <p>If this was a mistake, please contact us immediately.</p>
        <p>Best regards,<br>mLodge Hotel Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Cancellation email sent to: ${guestEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending cancellation email:', error);
    return false;
  }
}

export default {
  sendBookingReceipt,
  sendCancellationEmail,
};
