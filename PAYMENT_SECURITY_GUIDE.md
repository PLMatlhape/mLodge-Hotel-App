# 🔐 Payment Security Implementation Guide

## Overview
This document outlines the secure payment implementation for mLodge Hotel application, following industry best practices and PCI-DSS compliance guidelines.

## 🎯 Payment Methods Supported

### 1. **Credit/Debit Cards (via Stripe)**
- **PCI-DSS Compliant**: Card data never touches your server
- **3D Secure Authentication**: Extra layer of security
- **Tokenization**: Sensitive data is tokenized
- **Best For**: International payments, instant confirmation

### 2. **PayFast (South African Payment Gateway)**
- **Local Payment Method**: Popular in South Africa
- **Multiple Payment Options**: Cards, EFT, SnapScan, etc.
- **Secure Redirect**: User redirected to PayFast secure page
- **Instant Notification (ITN)**: Real-time payment updates
- **Best For**: South African customers

### 3. **Bank Transfer**
- **Manual Verification**: Admin verifies payments
- **Zero Processing Fees**: No gateway charges
- **Processing Time**: 24-48 hours
- **Best For**: Large bookings, corporate clients

## 🏗️ Architecture

```
Frontend (React)
     ↓
API Layer (/api/payments)
     ↓
Payment Gateway (Stripe/PayFast)
     ↓
Webhook Handler (Verification)
     ↓
Database (Update booking status)
```

## 🔒 Security Features Implemented

### 1. **No Credit Card Storage**
- ❌ Never store full card numbers
- ❌ Never store CVV codes
- ✅ Use payment gateway tokenization
- ✅ Store only last 4 digits for display

### 2. **Webhook Signature Verification**
```typescript
// Every webhook request is verified
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
```

### 3. **Payment Amount Verification**
- Server validates amounts before processing
- Prevent price manipulation attacks
- Cross-check with database records

### 4. **User Authentication**
- All payment endpoints require valid JWT token
- Verify user owns the booking
- Prevent unauthorized access

### 5. **HTTPS Only**
- All payment data transmitted over TLS/SSL
- Minimum TLS 1.2 required
- HTTP Strict Transport Security (HSTS) enabled

### 6. **Rate Limiting**
- Prevent brute force attacks
- Limit payment attempts per IP
- DDoS protection

### 7. **Database Security**
- Prepared statements (SQL injection prevention)
- Encrypted database connections
- Regular backups
- Payment audit trail

## 📋 Setup Instructions

### Step 1: Install Dependencies
```bash
cd src/backend
npm install stripe crypto dotenv
```

### Step 2: Create Database Table
```bash
npx ts-node scripts/createPaymentsTable.ts
```

### Step 3: Configure Environment Variables
```bash
# Copy example file
cp .env.example .env

# Edit .env and add your credentials
```

### Step 4: Get Payment Gateway Credentials

#### **For Stripe:**
1. Sign up at https://dashboard.stripe.com
2. Get your API keys from Dashboard → Developers → API keys
3. For testing, use keys starting with `sk_test_` and `pk_test_`
4. Add to `.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_your_key_here
   STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
   ```

#### **For PayFast (South Africa):**
1. Sign up at https://www.payfast.co.za
2. Get sandbox credentials for testing:
   ```
   PAYFAST_MODE=sandbox
   PAYFAST_MERCHANT_ID=10000100
   PAYFAST_MERCHANT_KEY=46f0cd694581a
   PAYFAST_PASSPHRASE=your_passphrase
   ```
3. For production, get live credentials from your PayFast dashboard

### Step 5: Set Up Webhooks

#### **Stripe Webhooks:**
1. Go to Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.com/api/payments/webhook/stripe`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy webhook secret to `.env`

#### **PayFast ITN (Instant Transaction Notification):**
1. In PayFast dashboard, set ITN URL: `https://your-domain.com/api/payments/webhook/payfast`
2. No additional configuration needed

### Step 6: Test Payments

#### **Test Cards (Stripe):**
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0025 0000 3155

Use any future expiry date and any 3-digit CVV
```

#### **Test PayFast:**
- Use sandbox mode
- Test with sandbox credentials provided

## 🔧 Frontend Integration

### Updated PaymentForm Component
The `PaymentForm.tsx` component now:
- ✅ Uses secure payment tokens (no card data to server)
- ✅ Validates input client-side
- ✅ Handles payment gateway redirects
- ✅ Shows real-time payment status
- ✅ Displays security badges and SSL indicators

### Example Usage:
```tsx
<PaymentForm
  amount={totalPrice * 100} // Amount in cents
  currency="ZAR"
  metadata={{
    bookingId: booking.id,
    userId: user.id,
    accommodationId: accommodation.id,
    roomId: room.id
  }}
  onPaymentSuccess={(transactionId) => {
    console.log('Payment successful:', transactionId);
    navigate('/booking-confirmation');
  }}
  onPaymentError={(error) => {
    console.error('Payment failed:', error);
    toast.error(error);
  }}
  agreeToTerms={agreeToTerms}
/>
```

## 🚀 API Endpoints

### 1. Create Payment Intent
```http
POST /api/payments/intent
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "amount": 10000, // Amount in cents (R100.00)
  "currency": "ZAR",
  "bookingId": 123,
  "paymentMethod": "credit_card" | "payfast" | "bank_transfer"
}
```

**Response:**
```json
{
  "paymentId": 1,
  "referenceNumber": "PAY-1234567890-ABC123",
  "status": "pending",
  "amount": 10000,
  "currency": "ZAR",
  "clientSecret": "pi_xxx_secret_xxx", // For Stripe
  "paymentUrl": "https://sandbox.payfast.co.za/...", // For PayFast
  "bankDetails": { ... } // For Bank Transfer
}
```

### 2. Process Payment
```http
POST /api/payments/:paymentId/process
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "token": "tok_visa" // Payment token from Stripe
}
```

### 3. Check Payment Status
```http
GET /api/payments/:paymentId/status
Authorization: Bearer <JWT_TOKEN>
```

### 4. Verify Bank Transfer (Admin Only)
```http
POST /api/payments/:paymentId/verify-bank-transfer
Authorization: Bearer <ADMIN_JWT_TOKEN>
Content-Type: application/json

{
  "verified": true,
  "transactionId": "FNB-TXN-123456",
  "notes": "Payment confirmed via bank statement"
}
```

## 📊 Database Schema

```sql
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER NOT NULL REFERENCES bookings(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  amount INTEGER NOT NULL, -- Amount in cents
  currency VARCHAR(3) NOT NULL DEFAULT 'ZAR',
  payment_method VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  reference_number VARCHAR(100) UNIQUE NOT NULL,
  transaction_id VARCHAR(255), -- Gateway transaction ID
  error_message TEXT,
  admin_notes TEXT, -- For bank transfer verification
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);
```

## ✅ PCI-DSS Compliance Checklist

- [x] **No card data storage**: Using payment gateway tokenization
- [x] **HTTPS only**: All communication encrypted
- [x] **Strong authentication**: JWT tokens required
- [x] **Input validation**: Server-side validation on all inputs
- [x] **Audit logging**: All payment attempts logged
- [x] **Secure webhooks**: Signature verification
- [x] **Environment variables**: Sensitive data not in code
- [x] **Rate limiting**: Prevent brute force attacks
- [x] **Error handling**: No sensitive data in error messages
- [x] **Regular updates**: Dependencies kept up to date

## 🧪 Testing Checklist

- [ ] Test successful payment (credit card)
- [ ] Test declined payment
- [ ] Test PayFast redirect flow
- [ ] Test bank transfer workflow
- [ ] Test webhook signature verification
- [ ] Test amount manipulation prevention
- [ ] Test unauthorized access prevention
- [ ] Test rate limiting
- [ ] Test payment status updates
- [ ] Test booking confirmation after payment

## 🚨 Production Deployment

### Before Going Live:

1. **Switch to Production Keys**
   - Stripe: Use `sk_live_` keys
   - PayFast: Switch `PAYFAST_MODE=live` and use live credentials

2. **Enable HTTPS**
   - Get SSL certificate (Let's Encrypt is free)
   - Force HTTPS redirect
   - Enable HSTS header

3. **Configure Webhooks**
   - Update webhook URLs to production domain
   - Verify webhook signatures are working

4. **Security Audit**
   - Run security scan (npm audit)
   - Test all payment flows
   - Verify no sensitive data in logs

5. **Monitoring**
   - Set up error tracking (Sentry)
   - Monitor payment success/failure rates
   - Alert on unusual activity

6. **Backup Strategy**
   - Regular database backups
   - Test restore procedures
   - Keep payment records for 7 years (compliance)

## 📞 Support & Resources

### Stripe
- Documentation: https://stripe.com/docs
- Support: https://support.stripe.com

### PayFast
- Documentation: https://www.payfast.co.za/documentation
- Support: support@payfast.co.za

### PCI-DSS
- Standards: https://www.pcisecuritystandards.org

## 🔐 Security Best Practices

1. **Never log sensitive data**: Card numbers, CVVs, passwords
2. **Use prepared statements**: Prevent SQL injection
3. **Validate on server**: Never trust client input
4. **Keep secrets secret**: Use environment variables
5. **Update regularly**: Keep dependencies current
6. **Monitor logs**: Watch for suspicious activity
7. **Test thoroughly**: Before deploying to production
8. **Have a backup**: Regular backups and disaster recovery plan

## 📝 Compliance Notes

This implementation follows:
- **PCI-DSS**: Payment Card Industry Data Security Standard
- **GDPR**: General Data Protection Regulation (EU)
- **POPIA**: Protection of Personal Information Act (South Africa)
- **OWASP**: Top 10 security best practices

---

**Last Updated**: November 2025
**Version**: 1.0.0
