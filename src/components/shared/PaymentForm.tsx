import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  setSelectedPaymentMethod,
  processCreditCardPayment,
  initializePayPalPayment,
  verifyBankTransfer,
  clearPaymentResult,
} from '../../store/slices/paymentSlice';
import paymentService from '../../services/paymentService';
import type { PaymentMethod, CreditCardDetails } from '../../services/paymentService';
import { toast } from '../../lib/toast';

interface PaymentFormProps {
  amount: number;
  currency?: string;
  agreeToTerms?: boolean;
  metadata: {
    bookingId?: string;
    userId?: string;
    accommodationId?: number;
    roomId?: number;
  };
  onPaymentSuccess: (transactionId: string) => void;
  onPaymentError: (error: string) => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  currency = 'ZAR',
  agreeToTerms = true,
  metadata,
  onPaymentSuccess,
  onPaymentError,
}) => {
  const dispatch = useAppDispatch();
  const { selectedPaymentMethod, processing, paymentResult, error } = useAppSelector(
    (state) => state.payment
  );

  // Card details state
  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  // Validation state
  const [cardErrors, setCardErrors] = useState<{
    cardNumber?: string;
    cardholderName?: string;
    expiryDate?: string;
    cvv?: string;
  }>({});

  // Bank transfer state
  const [bankReference, setBankReference] = useState('');

  // Get supported payment methods
  const supportedMethods = paymentService.getSupportedPaymentMethods();

  useEffect(() => {
    // Set default payment method
    if (!selectedPaymentMethod && supportedMethods.length > 0) {
      dispatch(setSelectedPaymentMethod(supportedMethods[0].id));
    }
  }, [dispatch, selectedPaymentMethod, supportedMethods]);

  useEffect(() => {
    // Handle payment result
    if (paymentResult) {
      if (paymentResult.success) {
        onPaymentSuccess(paymentResult.transactionId);
        toast.success('Payment processed successfully!');
      } else {
        onPaymentError(paymentResult.errorMessage || 'Payment failed');
        toast.error(paymentResult.errorMessage || 'Payment failed');
      }
      dispatch(clearPaymentResult());
    }
  }, [paymentResult, dispatch, onPaymentSuccess, onPaymentError]);

  useEffect(() => {
    // Handle errors
    if (error) {
      onPaymentError(error);
      toast.error(error);
    }
  }, [error, onPaymentError]);

  // Generate bank reference when bank transfer is selected
  useEffect(() => {
    if (selectedPaymentMethod === 'bank_transfer' && !bankReference) {
      const ref = paymentService.generateBankTransferReference(metadata.bookingId);
      setBankReference(ref);
    }
  }, [selectedPaymentMethod, metadata.bookingId, bankReference]);

  const validateCardForm = (): boolean => {
    const errors: typeof cardErrors = {};

    if (!paymentService.validateCardNumber(cardNumber)) {
      errors.cardNumber = 'Invalid card number';
    }

    if (!cardholderName.trim()) {
      errors.cardholderName = 'Cardholder name is required';
    }

    const expiryValidation = paymentService.validateExpiryDate(expiryDate);
    if (!expiryValidation.valid) {
      errors.expiryDate = expiryValidation.error;
    }

    if (!paymentService.validateCVV(cvv, cardNumber)) {
      errors.cvv = 'Invalid CVV';
    }

    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreditCardPayment = async () => {
    if (!validateCardForm()) {
      toast.error('Please correct the form errors');
      return;
    }

    const cardDetails: CreditCardDetails = {
      cardNumber,
      cardholderName,
      expiryDate,
      cvv,
    };

    await dispatch(
      processCreditCardPayment({
        cardDetails,
        amount,
        currency,
        metadata,
      })
    );
  };

  const handlePayPalPayment = async () => {
    const result = await dispatch(
      initializePayPalPayment({
        amount,
        currency,
        metadata,
      })
    ).unwrap();

    // Redirect to PayPal approval URL
    window.location.href = result.approvalUrl;
  };

  const handleBankTransferPayment = async () => {
    if (!bankReference) {
      toast.error('Bank reference not generated');
      return;
    }

    await dispatch(
      verifyBankTransfer({
        reference: bankReference,
        amount,
        currency,
      })
    );
  };

  const handlePayment = async () => {
    // Check if terms are agreed to
    if (!agreeToTerms) {
      toast.error('Please agree to the terms and conditions to proceed.');
      return;
    }

    // Validate payment method is selected
    if (!selectedPaymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    try {
      switch (selectedPaymentMethod) {
        case 'credit_card':
          await handleCreditCardPayment();
          break;
        case 'paypal':
          await handlePayPalPayment();
          break;
        case 'bank_transfer':
          await handleBankTransferPayment();
          break;
        default:
          toast.error('Invalid payment method selected');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment processing failed. Please try again.');
    }
  };

  const cardBrand = cardNumber ? paymentService.detectCardBrand(cardNumber) : 'unknown';
  const processingFee = selectedPaymentMethod
    ? paymentService.calculateProcessingFee(amount, selectedPaymentMethod)
    : 0;
  const totalAmount = amount + processingFee;

  return (
    <div className="space-y-6">
      {/* Security Warning Banner */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-amber-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-amber-800">
              <strong>Development Mode:</strong> This is a demo payment form. For production, integrate with a PCI-DSS compliant payment gateway like Stripe, PayPal, or PayFast.
            </p>
          </div>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Payment Method</h3>
        <div className="space-y-3">
          {supportedMethods.map((method) => (
            <button
              key={method.id}
              type="button"
              disabled={!method.available || processing}
              onClick={() => dispatch(setSelectedPaymentMethod(method.id))}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                selectedPaymentMethod === method.id
                  ? 'border-[#0F51AF] bg-[#0056D2]/10'
                  : 'border-gray-200 hover:border-[#0F51AF]'
              } ${!method.available ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {paymentService.getPaymentMethodIcon(method.id)}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">{method.name}</p>
                    <p className="text-sm text-gray-500">{method.description}</p>
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedPaymentMethod === method.id ? 'border-blue-500' : 'border-gray-300'
                  }`}
                >
                  {selectedPaymentMethod === method.id && (
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Credit Card Form */}
      {selectedPaymentMethod === 'credit_card' && (
        <form onSubmit={(e) => { e.preventDefault(); handleCreditCardPayment(); }} className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Card Details</h3>

          <div>
            <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Card Number {cardBrand !== 'unknown' && `(${cardBrand.toUpperCase()})`}
            </label>
            <input
              type="text"
              id="cardNumber"
              name="cardNumber"
              autoComplete="cc-number"
              inputMode="numeric"
              value={cardNumber}
              onChange={(e) => {
                setCardNumber(paymentService.formatCardNumber(e.target.value));
                setCardErrors((prev) => ({ ...prev, cardNumber: undefined }));
              }}
              placeholder="1234 5678 9012 3456"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                cardErrors.cardNumber ? 'border-red-500' : 'border-gray-300'
              }`}
              maxLength={19}
              disabled={processing}
            />
            {cardErrors.cardNumber && (
              <p className="text-red-500 text-sm mt-1">{cardErrors.cardNumber}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="cardholderName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Cardholder Name
            </label>
            <input
              type="text"
              id="cardholderName"
              name="cardholderName"
              autoComplete="cc-name"
              value={cardholderName}
              onChange={(e) => {
                setCardholderName(e.target.value);
                setCardErrors((prev) => ({ ...prev, cardholderName: undefined }));
              }}
              placeholder="John Doe"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                cardErrors.cardholderName ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={processing}
            />
            {cardErrors.cardholderName && (
              <p className="text-red-500 text-sm mt-1">{cardErrors.cardholderName}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date
              </label>
              <input
                type="text"
                id="expiryDate"
                name="expiryDate"
                autoComplete="cc-exp"
                inputMode="numeric"
                value={expiryDate}
                onChange={(e) => {
                  setExpiryDate(paymentService.formatExpiryDate(e.target.value));
                  setCardErrors((prev) => ({ ...prev, expiryDate: undefined }));
                }}
                placeholder="MM/YY"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                  cardErrors.expiryDate ? 'border-red-500' : 'border-gray-300'
                }`}
                maxLength={5}
                disabled={processing}
              />
              {cardErrors.expiryDate && (
                <p className="text-red-500 text-sm mt-1">{cardErrors.expiryDate}</p>
              )}
            </div>
            <div>
              <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-2">
                CVV
              </label>
              <input
                type="password"
                id="cvv"
                name="cvv"
                autoComplete="cc-csc"
                inputMode="numeric"
                value={cvv}
                onChange={(e) => {
                  setCvv(e.target.value.replace(/\D/g, ''));
                  setCardErrors((prev) => ({ ...prev, cvv: undefined }));
                }}
                placeholder="123"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                  cardErrors.cvv ? 'border-red-500' : 'border-gray-300'
                }`}
                maxLength={4}
                disabled={processing}
              />
              {cardErrors.cvv && <p className="text-red-500 text-sm mt-1">{cardErrors.cvv}</p>}
            </div>
          </div>
        </form>
      )}

      {/* Bank Transfer Details */}
      {selectedPaymentMethod === 'bank_transfer' && bankReference && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Bank Transfer Details</h3>
          <div className="bg-blue-50 rounded-lg p-6 space-y-4">
            {Object.entries(paymentService.getBankTransferDetails(bankReference)).map(
              ([key, value]) => (
                <div key={key}>
                  <p className="text-sm text-gray-600 mb-1 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p className="text-base font-semibold text-gray-900">{value}</p>
                </div>
              )
            )}
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex gap-3">
              <svg
                className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-amber-900">Important</p>
                <p className="text-sm text-amber-700 mt-1">
                  Please use the reference number when making the transfer. Your booking will be
                  confirmed once payment is received (usually within 24-48 hours).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PayPal Info */}
      {selectedPaymentMethod === 'paypal' && (
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-8 text-center">
          <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8.32 21.97a.546.546 0 01-.26-.32c-.03-.15-.01-.3.03-.44l2.36-9.6c.04-.18.13-.34.26-.47s.3-.21.48-.24h5.85c1.58 0 2.87-.53 3.74-1.53.85-.98 1.25-2.28 1.13-3.67-.11-1.32-.67-2.43-1.61-3.21-.93-.77-2.23-1.16-3.75-1.16H7.53c-.42 0-.78.29-.87.69L3.82 15.42c-.05.19-.03.38.05.56.08.17.22.31.39.39.17.08.36.09.54.02.18-.06.33-.18.43-.34l2.47-10.06c.03-.12.09-.22.18-.29.09-.07.2-.11.32-.11h9.02c1.19 0 2.15.31 2.78.89.63.59.98 1.42 1.05 2.47.08 1.11-.22 2.05-.87 2.72-.66.68-1.62 1.02-2.78 1.02h-5.42c-.42 0-.78.29-.87.69l-2.36 9.6c-.05.19-.03.38.05.56.08.17.22.31.39.39.17.08.36.09.54.02.18-.06.33-.18.43-.34z" />
            </svg>
          </div>
          <h3 className="text-white text-xl font-semibold mb-2">Pay with PayPal</h3>
          <p className="text-blue-100 text-sm mb-6">Safe and secure payment processing</p>
        </div>
      )}

      {/* Price Summary */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-gray-900 font-medium">
            {currency} {amount.toLocaleString()}
          </span>
        </div>
        {processingFee > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Processing Fee</span>
            <span className="text-gray-900 font-medium">
              {currency} {processingFee.toLocaleString()}
            </span>
          </div>
        )}
        <div className="border-t border-gray-200 pt-2 flex justify-between">
          <span className="font-semibold text-gray-900">Total</span>
          <span className="text-xl font-bold text-[#0F51AF]">
            {currency} {totalAmount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Payment Button */}
      <button
        type="button"
        onClick={handlePayment}
        disabled={processing || !selectedPaymentMethod || !agreeToTerms}
        className="w-full bg-[#0F51AF] text-white py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-[#0045b0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {processing ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Processing...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            {selectedPaymentMethod === 'paypal'
              ? 'Continue to PayPal'
              : `Pay ${currency} ${totalAmount.toLocaleString()}`}
          </>
        )}
      </button>

      <p className="text-center text-xs text-gray-500 flex items-center justify-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
        Your payment is secured with 256-bit SSL encryption
      </p>
    </div>
  );
};

export default PaymentForm;
