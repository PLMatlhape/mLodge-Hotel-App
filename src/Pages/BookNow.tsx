import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
// Icons
import starIcon from '../assets/icons/yellow-star-rate-icon.png';
import bathIcon from '../assets/icons/black/black-bath-icon.png';
import heartIcon from '../assets/icons/yellow-heart-icon.png';
// Room Images
import luxuryPenthouse from '../assets/image/dashboard/penthouse-room.jpeg';
// Backgrounds
import offersBg from '../assets/image/background/Offers-section.jpeg';
 
 
const Booking: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('credit');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [firstName] = useState('John');
  const [lastName] = useState('Doe');
  const [email] = useState('john.doe@example.com');
  const [phone] = useState('+27 123 456 789');
  const [specialRequests] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
 
  // Get booking details from URL parameters
  const roomName = searchParams.get('roomName') || 'Luxury Penthouse';
  const roomImage = searchParams.get('roomImage') || luxuryPenthouse;
  const roomBadge = searchParams.get('roomBadge') || 'Premium';
  const roomLocation = searchParams.get('location') || 'Cape Town';
  const beds = parseInt(searchParams.get('beds') || '3');
  const baths = parseInt(searchParams.get('baths') || '2');
  const area = parseInt(searchParams.get('area') || '95');
  const rating = parseFloat(searchParams.get('rating') || '5.0');
  const guests = searchParams.get('guests') || 'upto 4 guests';
  const checkInDate = searchParams.get('checkInDate') || 'Nov 15, 2025';
  const checkOutDate = searchParams.get('checkOutDate') || 'Nov 19, 2025';
  const nights = parseInt(searchParams.get('nights') || '4');
  const pricePerNight = parseFloat(searchParams.get('pricePerNight') || '8800');
  const serviceFee = pricePerNight * nights * 0.04; // 4% service fee
  const taxes = pricePerNight * nights * 0.06; // 6% tax
  const subtotal = pricePerNight * nights;
  const totalPrice = subtotal + serviceFee + taxes;

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated) {
      // Store the current URL to return after login
      const returnUrl = `${location.pathname}${location.search}`;
      navigate(`/register?returnUrl=${encodeURIComponent(returnUrl)}`);
    }
  }, [isAuthenticated, navigate, location]);

  // If not authenticated, don't render the booking page
  if (!isAuthenticated) {
    return null;
  }
 
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted.slice(0, 19);
  };
 
  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreeToTerms) {
      alert('Please agree to the terms and conditions to proceed.');
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      console.log({
        firstName,
        lastName,
        email,
        phone,
        specialRequests,
        paymentMethod: selectedPaymentMethod,
        cardNumber: cardNumber ? '****' + cardNumber.slice(-4) : '',
        cardholderName,
        roomName,
        checkInDate,
        checkOutDate,
        totalPrice
      });

      setIsProcessing(false);
      
      // Show success message and redirect
      alert('Booking confirmed! You will receive a confirmation email shortly.');
      navigate('/dashboard');
    }, 2000);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };
 
  return (
  <div
    className="min-h-screen bg-[#001F3F] bg-cover bg-center bg-no-repeat"
    style={{
      backgroundImage: `linear-gradient(rgba(0,31,63,0.85), rgba(0,31,63,0.85)), url(${offersBg})`,
      backgroundBlendMode: 'overlay'
    }}
  >
      {/* Header */}
      <div className="bg-[#001F3F] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-white hover:text-blue-300 transition-colors"
            aria-label="Back to dashboard"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back to Dashboard</span>
          </button>
        </div>
      </div>
 
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">Complete Your Booking</h1>
 
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 order-2 lg:order-1">
            {/* Guest Information Card */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border-2 border-[#001C43] p-4 sm:p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-1">Guest Information</h2>
              <p className="text-sm text-gray-500 mb-6">Your booking details</p>
 
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">First Name</p>
                    <p className="text-base text-gray-900">
                      {firstName || 'Demo'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Name</p>
                    <p className="text-base text-gray-900">
                      {lastName || 'User'}
                    </p>
                  </div>
                </div>
 
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-base text-gray-900">
                    {email || 'demo@example.com'}
                  </p>
                </div>
 
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-base text-gray-900">
                    {phone || '+27987654321'}
                  </p>
                </div>
 
                <div>
                  <p className="text-sm text-gray-500">Special Requests</p>
                  <p className="text-base text-gray-900">
                    {specialRequests || 'No special requests'}
                  </p>
                </div>
              </div>
            </div>
 
            {/* Payment Method Selection */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border-2 border-[#001C43] p-4 sm:p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-1">Select Payment Method</h2>
              <p className="text-sm text-gray-500 mb-6">Choose how you'd like to pay</p>
 
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod('credit')}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    selectedPaymentMethod === 'credit'
                      ? 'border-[#0F51AF] bg-[#0056D2]/10'
                      : 'border-gray-200 hover:border-[#0F51AF]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <div>
                        <p className="font-semibold text-gray-900">Credit/Debit Card</p>
                        <p className="text-sm text-gray-500">Pay securely with your card</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedPaymentMethod === 'credit'
                        ? 'border-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedPaymentMethod === 'credit' && (
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                      )}
                    </div>
                  </div>
                </button>
 
                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod('bank')}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    selectedPaymentMethod === 'bank'
                      ? 'border-[#0F51AF] bg-[#0056D2]/10'
                      : 'border-gray-200 hover:border-[#0F51AF]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                      </svg>
                      <div>
                        <p className="font-semibold text-gray-900">Bank Transfer</p>
                        <p className="text-sm text-gray-500">Direct bank transfer</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedPaymentMethod === 'bank'
                        ? 'border-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedPaymentMethod === 'bank' && (
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                      )}
                    </div>
                  </div>
                </button>
 
                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod('paypal')}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    selectedPaymentMethod === 'paypal'
                      ? 'border-[#0F51AF] bg-[#0056D2]/10'
                      : 'border-gray-200 hover:border-[#0F51AF]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <div>
                        <p className="font-semibold text-gray-900">PayPal</p>
                        <p className="text-sm text-gray-500">Pay with PayPal</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedPaymentMethod === 'paypal'
                        ? 'border-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedPaymentMethod === 'paypal' && (
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                      )}
                    </div>
                  </div>
                </button>
              </div>
            </div>
 
            {/* Card Details - Only show if credit card selected */}
            {selectedPaymentMethod === 'credit' && (
              <div className="bg-white rounded-2xl sm:rounded-3xl border-2 border-[#001C43] p-4 sm:p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Card Details</h2>
                <p className="text-sm text-gray-500 mb-6">Enter your payment information</p>
 
                <div className="space-y-4">
                <div>
                  <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    id="cardNumber"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    maxLength={19}
                    required
                  />
                </div>
 
                <div>
                  <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700 mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    id="cardholderName"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  />
                </div>                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        id="expiryDate"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                        placeholder="MM/YY"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        maxLength={5}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-2">
                        CVV
                      </label>
                      <input
                        type="password"
                        id="cvv"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                        placeholder="123"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        maxLength={3}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
 
            {/* Bank Transfer Details */}
            {selectedPaymentMethod === 'bank' && (
              <div className="bg-white rounded-2xl sm:rounded-3xl border-2 border-[#001C43] p-4 sm:p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Bank Transfer Details</h2>
                <p className="text-sm text-gray-500 mb-6">Transfer payment to the following account</p>
 
                <div className="bg-blue-50 rounded-lg p-6 space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Bank Name</p>
                    <p className="text-base font-semibold text-gray-900">First National Bank (FNB)</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Account Name</p>
                    <p className="text-base font-semibold text-gray-900">mLodge Hotel PTY LTD</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Account Number</p>
                    <p className="text-base font-semibold text-gray-900">62 7891 2345 6</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Branch Code</p>
                    <p className="text-base font-semibold text-gray-900">250 655</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Reference</p>
                    <p className="text-base font-semibold text-gray-900">BOOKING-{Date.now().toString().slice(-8)}</p>
                  </div>
                </div>
 
                <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-amber-900">Important</p>
                      <p className="text-sm text-amber-700 mt-1">Please use the reference number when making the transfer. Your booking will be confirmed once payment is received (usually within 24 hours).</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
 
            {/* PayPal Payment */}
            {selectedPaymentMethod === 'paypal' && (
              <div className="bg-white rounded-2xl sm:rounded-3xl border-2 border-[#001C43] p-4 sm:p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-1">PayPal Payment</h2>
                <p className="text-sm text-gray-500 mb-6">You'll be redirected to PayPal to complete your payment</p>
 
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-8 text-center">
                  <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-12 h-12 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.32 21.97a.546.546 0 01-.26-.32c-.03-.15-.01-.3.03-.44l2.36-9.6c.04-.18.13-.34.26-.47s.3-.21.48-.24h5.85c1.58 0 2.87-.53 3.74-1.53.85-.98 1.25-2.28 1.13-3.67-.11-1.32-.67-2.43-1.61-3.21-.93-.77-2.23-1.16-3.75-1.16H7.53c-.42 0-.78.29-.87.69L3.82 15.42c-.05.19-.03.38.05.56.08.17.22.31.39.39.17.08.36.09.54.02.18-.06.33-.18.43-.34l2.47-10.06c.03-.12.09-.22.18-.29.09-.07.2-.11.32-.11h9.02c1.19 0 2.15.31 2.78.89.63.59.98 1.42 1.05 2.47.08 1.11-.22 2.05-.87 2.72-.66.68-1.62 1.02-2.78 1.02h-5.42c-.42 0-.78.29-.87.69l-2.36 9.6c-.05.19-.03.38.05.56.08.17.22.31.39.39.17.08.36.09.54.02.18-.06.33-.18.43-.34z"/>
                    </svg>
                  </div>
                  <h3 className="text-white text-xl font-semibold mb-2">Pay with PayPal</h3>
                  <p className="text-blue-100 text-sm mb-6">Safe and secure payment processing</p>
                  <button
                    type="button"
                    onClick={() => {
                      alert('You will be redirected to PayPal to complete your payment.');
                      // In production, this would redirect to actual PayPal
                    }}
                    className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                  >
                    Continue to PayPal
                  </button>
                </div>
 
                <div className="mt-6 flex items-start gap-3 bg-gray-50 rounded-lg p-4">
                  <svg className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-gray-600">
                    You'll be securely redirected to PayPal to log in and authorize the payment. Once completed, you'll return to our site.
                  </p>
                </div>
              </div>
            )}
 
            {/* Terms and Conditions */}
            <div className="flex items-start gap-3 px-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="terms" className="text-sm text-white cursor-pointer">
                I agree to the{' '}
                <button 
                  type="button"
                  onClick={() => navigate('/terms')}
                  className="text-blue-300 underline hover:text-blue-200"
                >
                  terms and conditions
                </button>
                {' '}and cancellation policy
              </label>
            </div>
 
            {/* Pay Button */}
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={!agreeToTerms || isProcessing}
              className="w-full bg-[#0F51AF] text-white py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-[#0045b0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Pay R {totalPrice.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </>
              )}
            </button>
 
            <p className="text-center text-xs text-gray-300 flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Your payment is secured with 256-bit SSL encryption
            </p>
          </div>
 
          {/* Right Column - Booking Summary */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="bg-white rounded-2xl sm:rounded-3xl border-2 border-[#001C43] p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Booking Summary</h2>
 
              {/* Room Image with Rating and Badge */}
              <div className="relative mb-4 rounded-lg overflow-hidden">
                <img
                  src={roomImage}
                  alt={roomName}
                  className="w-full h-40 sm:h-48 object-cover"
                />
                {/* Rating */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                  <img src={starIcon} alt="Rating" className="w-4 h-4" />
                  <span className="text-gray-900 font-semibold text-sm">{rating}</span>
                </div>
                {/* Badge */}
                <span className="absolute top-3 left-3 bg-[#00CD07] text-white text-xs font-semibold px-3 py-1 rounded-lg">
                  {roomBadge}
                </span>
                {/* Favorite */}
                <button
                  onClick={toggleFavorite}
                  className="absolute bottom-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                  aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  {isFavorite ? (
                    <img src={heartIcon} alt="Favorited" className="w-5 h-5" />
                  ) : (
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  )}
                </button>
              </div>
 
              {/* Room Name and Location */}
              <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-1">{roomName}</h3>
              <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500 mb-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {roomLocation}
              </div>
 
              {/* Room Features */}
              <div className="flex items-center gap-3 sm:gap-4 mb-3 text-gray-600 text-xs sm:text-sm flex-wrap">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/>
                  </svg>
                  {beds} Beds
                </div>
                <div className="flex items-center gap-1">
                  <img src={bathIcon} alt="Bathrooms" className="w-4 h-4" />
                  {baths} Baths
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 14H9v-2h2v2z"/>
                  </svg>
                  {area}m²
                </div>
              </div>
 
              {/* Guests */}
              <div className="flex items-center gap-1 text-gray-600 text-xs sm:text-sm mb-4 sm:mb-6">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                </svg>
                {guests}
              </div>
 
              {/* Booking Details */}
              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Check-in</p>
                    <p className="text-sm font-medium text-gray-900">{checkInDate}</p>
                  </div>
                </div>
 
                <div className="flex items-center gap-2 sm:gap-3">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Check-out</p>
                    <p className="text-sm font-medium text-gray-900">{checkOutDate}</p>
                  </div>
                </div>
 
                <div className="flex items-center gap-2 sm:gap-3">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Guests</p>
                    <p className="text-sm font-medium text-gray-900">1</p>
                  </div>
                </div>
              </div>
 
              <hr className="my-4 sm:my-6 border-gray-200" />
 
              {/* Price Breakdown */}
              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">R {pricePerNight.toLocaleString()} × {nights} {nights === 1 ? 'night' : 'nights'}</span>
                  <span className="text-gray-900 font-medium">R {subtotal.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service fee (4%)</span>
                  <span className="text-gray-900 font-medium">R {serviceFee.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Taxes (6%)</span>
                  <span className="text-gray-900 font-medium">R {taxes.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
 
              <hr className="my-4 sm:my-6 border-gray-200" />
 
              {/* Total */}
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <span className="font-semibold text-gray-900 text-base sm:text-lg">Total (ZAR)</span>
                <span className="text-xl sm:text-2xl font-bold text-[#0F51AF]">R {totalPrice.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
 
              {/* Cancellation Policy */}
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 font-medium mb-1">Free cancellation before 48 hours</p>
                <p className="text-xs text-gray-500">You won't be charged yet</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default Booking;
 