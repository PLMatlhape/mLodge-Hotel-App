import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { createBooking } from '../store/slices/bookingsSlice';
import { toast } from '../lib/toast';
import PaymentForm from '../components/shared/PaymentForm';
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
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { loading: bookingLoading } = useAppSelector((state) => state.bookings);
  
  const [firstName] = useState(user?.firstName || '');
  const [lastName] = useState(user?.lastName || '');
  const [email] = useState(user?.email || '');
  const [phone] = useState(user?.phone || '');
  const [specialRequests, setSpecialRequests] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
 
  // Get booking details from URL parameters
  const roomId = parseInt(searchParams.get('roomId') || '0');
  const accommodationId = parseInt(searchParams.get('accommodationId') || '0');
  const roomName = searchParams.get('roomName') || 'Luxury Penthouse';
  const roomImage = searchParams.get('roomImage') || luxuryPenthouse || '/placeholder-room.svg';
  const roomBadge = searchParams.get('roomBadge') || 'Premium';
  const roomLocation = searchParams.get('location') || 'Cape Town';
  const beds = parseInt(searchParams.get('beds') || '3');
  const baths = parseInt(searchParams.get('baths') || '2');
  const area = parseInt(searchParams.get('area') || '95');
  const rating = parseFloat(searchParams.get('rating') || '5.0');
  const guests = searchParams.get('guests') || 'upto 4 guests';
  const numGuests = parseInt(searchParams.get('numGuests') || '1');
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
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreeToTerms) {
      toast.error('Please agree to the terms and conditions to proceed.');
      return;
    }

    // Validate required fields
    if (!roomId || !accommodationId) {
      toast.error('Missing booking information. Please select a room again.');
      return;
    }

    setIsProcessing(true);
  };

  const handlePaymentSuccess = async (transactionId: string) => {
    try {
      // Convert dates to YYYY-MM-DD format for backend
      const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toISOString().split('T')[0];
      };

      const bookingData = {
        accommodation_id: accommodationId,
        check_in_date: formatDate(checkInDate),
        check_out_date: formatDate(checkOutDate),
        rooms: [{ room_id: roomId, quantity: 1 }],
        guest_name: `${firstName} ${lastName}`,
        guest_email: email,
        guest_phone: phone,
        num_adults: numGuests,
        num_children: 0,
        special_requests: specialRequests || undefined,
      };

      await dispatch(createBooking(bookingData)).unwrap();
      
      toast.success(`Booking confirmed! Transaction ID: ${transactionId}`);
      
      // Navigate to bookings page or dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to create booking. Please contact support with your transaction ID: ' + transactionId);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    setIsProcessing(false);
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
                      {firstName || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Name</p>
                    <p className="text-base text-gray-900">
                      {lastName || 'N/A'}
                    </p>
                  </div>
                </div>
 
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-base text-gray-900">
                    {email || 'N/A'}
                  </p>
                </div>
 
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-base text-gray-900">
                    {phone || 'N/A'}
                  </p>
                </div>
 
                <div>
                  <label htmlFor="specialRequests" className="block text-sm text-gray-500 mb-2">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    id="specialRequests"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Any special requirements for your stay..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 resize-none"
                    rows={3}
                  />
                </div>
              </div>
            </div>
 
            {/* Payment Form Component */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border-2 border-[#001C43] p-4 sm:p-6">
              <PaymentForm
                amount={totalPrice}
                currency="R"
                metadata={{
                  bookingId: undefined,
                  userId: user?.id?.toString(),
                  accommodationId,
                  roomId,
                }}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
              />
            </div>
 
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
              disabled={!agreeToTerms || isProcessing || bookingLoading}
              className="w-full bg-[#0F51AF] text-white py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-[#0045b0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing || bookingLoading ? (
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
 