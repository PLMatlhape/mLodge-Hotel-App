/**
 * Payment Service
 * Handles payment processing for multiple payment providers
 * Supports: Credit Card (Stripe), PayPal, Bank Transfer
 */

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'paypal' | 'bank_transfer';
  provider: 'stripe' | 'paypal' | 'manual';
  lastFourDigits?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cardholderName?: string;
  isDefault: boolean;
}

export interface CreditCardDetails {
  cardNumber: string;
  cardholderName: string;
  expiryDate: string; // MM/YY format
  cvv: string;
}

export interface BankTransferDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branchCode: string;
  reference: string;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled';
  paymentMethod: PaymentMethod['type'];
  metadata: {
    bookingId?: string;
    userId?: string;
    accommodationId?: number;
    roomId?: number;
  };
  clientSecret?: string;
  createdAt: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  status: PaymentIntent['status'];
  amount: number;
  currency: string;
  receiptUrl?: string;
  errorMessage?: string;
  errorCode?: string;
}

class PaymentService {
  private stripePublicKey: string = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_demo';
  private paypalClientId: string = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'paypal_demo_client';

  /**
   * Validate credit card number using Luhn algorithm
   */
  validateCardNumber(cardNumber: string): boolean {
    const digits = cardNumber.replace(/\s/g, '');
    
    if (!/^\d{13,19}$/.test(digits)) {
      return false;
    }

    let sum = 0;
    let isEven = false;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i], 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  /**
   * Validate CVV code
   */
  validateCVV(cvv: string, cardNumber: string): boolean {
    const cleanCvv = cvv.replace(/\s/g, '');
    
    // American Express uses 4-digit CVV
    const isAmex = /^3[47]/.test(cardNumber.replace(/\s/g, ''));
    const expectedLength = isAmex ? 4 : 3;

    return /^\d+$/.test(cleanCvv) && cleanCvv.length === expectedLength;
  }

  /**
   * Validate expiry date
   */
  validateExpiryDate(expiryDate: string): { valid: boolean; error?: string } {
    const parts = expiryDate.split('/');
    
    if (parts.length !== 2) {
      return { valid: false, error: 'Invalid format. Use MM/YY' };
    }

    const month = parseInt(parts[0], 10);
    const year = parseInt('20' + parts[1], 10);

    if (month < 1 || month > 12) {
      return { valid: false, error: 'Invalid month' };
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return { valid: false, error: 'Card has expired' };
    }

    return { valid: true };
  }

  /**
   * Detect card brand from card number
   */
  detectCardBrand(cardNumber: string): 'visa' | 'mastercard' | 'amex' | 'discover' | 'unknown' {
    const digits = cardNumber.replace(/\s/g, '');

    if (/^4/.test(digits)) return 'visa';
    if (/^5[1-5]/.test(digits)) return 'mastercard';
    if (/^3[47]/.test(digits)) return 'amex';
    if (/^6(?:011|5)/.test(digits)) return 'discover';

    return 'unknown';
  }

  /**
   * Format card number with spaces
   */
  formatCardNumber(value: string): string {
    const cleaned = value.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted.slice(0, 19); // Max 16 digits + 3 spaces
  }

  /**
   * Format expiry date
   */
  formatExpiryDate(value: string): string {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  }

  /**
   * Mask card number for display
   */
  maskCardNumber(cardNumber: string): string {
    const digits = cardNumber.replace(/\s/g, '');
    if (digits.length < 4) return '****';
    return '**** **** **** ' + digits.slice(-4);
  }

  /**
   * Create payment intent (Stripe-style)
   */
  async createPaymentIntent(
    amount: number,
    currency: string = 'ZAR',
    metadata: PaymentIntent['metadata']
  ): Promise<PaymentIntent> {
    // Simulate API call to payment processor
    return new Promise((resolve) => {
      setTimeout(() => {
        const intent: PaymentIntent = {
          id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          amount,
          currency,
          status: 'pending',
          paymentMethod: 'credit_card',
          metadata,
          clientSecret: `secret_${Math.random().toString(36).substr(2, 16)}`,
          createdAt: new Date().toISOString(),
        };
        resolve(intent);
      }, 500);
    });
  }

  /**
   * Process credit card payment
   */
  async processCreditCardPayment(
    cardDetails: CreditCardDetails,
    amount: number,
    currency: string = 'ZAR',
    _metadata: PaymentIntent['metadata']
  ): Promise<PaymentResult> {
    // Validate card details
    if (!this.validateCardNumber(cardDetails.cardNumber)) {
      return {
        success: false,
        transactionId: '',
        status: 'failed',
        amount,
        currency,
        errorMessage: 'Invalid card number',
        errorCode: 'INVALID_CARD_NUMBER',
      };
    }

    const expiryValidation = this.validateExpiryDate(cardDetails.expiryDate);
    if (!expiryValidation.valid) {
      return {
        success: false,
        transactionId: '',
        status: 'failed',
        amount,
        currency,
        errorMessage: expiryValidation.error,
        errorCode: 'INVALID_EXPIRY_DATE',
      };
    }

    if (!this.validateCVV(cardDetails.cvv, cardDetails.cardNumber)) {
      return {
        success: false,
        transactionId: '',
        status: 'failed',
        amount,
        currency,
        errorMessage: 'Invalid CVV',
        errorCode: 'INVALID_CVV',
      };
    }

    // Simulate payment processing
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate 90% success rate
        const success = Math.random() > 0.1;

        if (success) {
          resolve({
            success: true,
            transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            status: 'succeeded',
            amount,
            currency,
            receiptUrl: `/receipts/txn_${Date.now()}`,
          });
        } else {
          resolve({
            success: false,
            transactionId: '',
            status: 'failed',
            amount,
            currency,
            errorMessage: 'Payment declined by issuer',
            errorCode: 'CARD_DECLINED',
          });
        }
      }, 2000); // Simulate network delay
    });
  }

  /**
   * Initialize PayPal payment
   */
  async initializePayPalPayment(
    _amount: number,
    _currency: string = 'ZAR',
    _metadata: PaymentIntent['metadata']
  ): Promise<{ orderId: string; approvalUrl: string }> {
    // In production, this would call PayPal API
    return new Promise((resolve) => {
      setTimeout(() => {
        const orderId = `PAYPAL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        resolve({
          orderId,
          approvalUrl: `https://www.sandbox.paypal.com/checkoutnow?token=${orderId}`,
        });
      }, 1000);
    });
  }

  /**
   * Capture PayPal payment after user approval
   */
  async capturePayPalPayment(orderId: string): Promise<PaymentResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          transactionId: orderId,
          status: 'succeeded',
          amount: 0, // Would be retrieved from PayPal
          currency: 'ZAR',
          receiptUrl: `/receipts/${orderId}`,
        });
      }, 1500);
    });
  }

  /**
   * Generate bank transfer reference
   */
  generateBankTransferReference(bookingId?: string): string {
    const prefix = 'MLODGE';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    const booking = bookingId ? bookingId.slice(-4).toUpperCase() : '0000';
    return `${prefix}-${booking}-${timestamp}-${random}`;
  }

  /**
   * Get bank transfer details
   */
  getBankTransferDetails(reference: string): BankTransferDetails {
    return {
      bankName: 'First National Bank (FNB)',
      accountName: 'mLodge Hotel PTY LTD',
      accountNumber: '62 7891 2345 6',
      branchCode: '250 655',
      reference,
    };
  }

  /**
   * Verify bank transfer payment
   * In production, this would integrate with banking API or manual verification
   */
  async verifyBankTransfer(
    reference: string,
    amount: number,
    currency: string = 'ZAR'
  ): Promise<PaymentResult> {
    // This would typically check with your bank's API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          transactionId: reference,
          status: 'pending', // Bank transfers require manual verification
          amount,
          currency,
          errorMessage: 'Payment pending verification. Please allow 24-48 hours for processing.',
        });
      }, 1000);
    });
  }

  /**
   * Calculate processing fee
   */
  calculateProcessingFee(
    amount: number,
    paymentMethod: PaymentMethod['type']
  ): number {
    switch (paymentMethod) {
      case 'credit_card':
        return Math.round(amount * 0.029 + 30); // Stripe-like: 2.9% + R0.30
      case 'paypal':
        return Math.round(amount * 0.034 + 35); // PayPal: 3.4% + R0.35
      case 'bank_transfer':
        return 0; // Free for bank transfers
      default:
        return 0;
    }
  }

  /**
   * Get payment method icon
   */
  getPaymentMethodIcon(brand: string): string {
    const icons: Record<string, string> = {
      visa: '💳',
      mastercard: '💳',
      amex: '💳',
      discover: '💳',
      paypal: '🅿️',
      bank_transfer: '🏦',
    };
    return icons[brand] || '💳';
  }

  /**
   * Check if Stripe is available
   */
  isStripeAvailable(): boolean {
    return !!this.stripePublicKey && this.stripePublicKey !== 'pk_test_demo';
  }

  /**
   * Check if PayPal is available
   */
  isPayPalAvailable(): boolean {
    // Enable PayPal in demo mode for testing
    return true;
  }

  /**
   * Get supported payment methods
   */
  getSupportedPaymentMethods(): Array<{
    id: PaymentMethod['type'];
    name: string;
    description: string;
    available: boolean;
  }> {
    return [
      {
        id: 'credit_card',
        name: 'Credit/Debit Card',
        description: 'Pay securely with your card',
        available: true, // Always available in demo mode
      },
      {
        id: 'paypal',
        name: 'PayPal',
        description: 'Pay with your PayPal account',
        available: this.isPayPalAvailable(),
      },
      {
        id: 'bank_transfer',
        name: 'Bank Transfer',
        description: 'Direct bank transfer (24-48h processing)',
        available: true,
      },
    ];
  }
}

export const paymentService = new PaymentService();
export default paymentService;
