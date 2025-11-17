import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { toggleFavourite, fetchFavourites } from '../../store/slices/favouritesSlice';
import { toast } from '../../lib/toast';
import starIcon from '../../assets/icons/yellow-star-rate-icon.png';
import heartIcon from '../../assets/icons/yellow-heart-icon.png';
import bathIcon from '../../assets/icons/black/black-bath-icon.png';
import bedIcon from '../../assets/icons/black/black-bed-icon.png';
import locationIcon from '../../assets/icons/black/black-location-icon.png';
import squareIcon from '../../assets/icons/black/black-square-border-icon.png';
import groupIcon from '../../assets/icons/black/black-group-icon.png';
import calendarIcon from '../../assets/icons/black/black-calendar-icon.png';
import wifiIcon from '../../assets/icons/black/black-wifi-icon.png';
import carIcon from '../../assets/icons/black/black-car-icon.png';
import breakfastIcon from '../../assets/icons/black/black-breakfast-icon.png';
import tvIcon from '../../assets/icons/black/black-smart-tv-icon.png';
import airIcon from '../../assets/icons/black/black-air-icon.png';
import securityIcon from '../../assets/icons/black/black-card-security-icon.png';
import teaIcon from '../../assets/icons/black/black-tea-icon.png';
import doneIcon from '../../assets/icons/black/black-doneTick-icon.png';

interface RoomDetailsProps {
  room: {
    id: number;
    accommodation_id?: number;
    name: string;
    description?: string;
    location?: string;
    beds: number;
    baths?: number;
    area?: number;
    guests?: string;
    capacity?: number;
    price: number;
    price_per_night?: number;
    rating?: number;
    image: string;
    images?: string[];
    photos?: Array<{ url: string; sort_order?: number }>;
    badge: string;
    type?: string;
    favorite?: boolean;
    amenities?: string[];
    roomFeatures?: string[];
    room_features?: string[];
  };
  onClose: () => void;
}

const RoomDetails: React.FC<RoomDetailsProps> = ({ room, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { favourites } = useAppSelector((state) => state.favourites);
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Check if this specific room is favorited (match by room id returned from favourites API)
  const isFavorite = room.id ? favourites.some(fav => fav.id === room.id) : false;
  
  // Get room images from photos array or fallback
  const roomImages = room.photos && room.photos.length > 0 
    ? room.photos.map(p => p.url) 
    : (room.images && room.images.length > 0 ? room.images : [room.image]);
  
  const firstImage = roomImages[0] || room.image || '/placeholder-room.svg';
  
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [mainImage, setMainImage] = useState(firstImage);
  const [thumbnails, setThumbnails] = useState<string[]>(
    roomImages.length >= 3 
      ? roomImages.slice(0, 3) 
      : [...roomImages, ...Array(3 - roomImages.length).fill(firstImage)]
  );
  
  // Get price - use price_per_night if available, otherwise price
  // Ensure it's always a number
  const roomPrice = Number(room.price_per_night || room.price || 0);

  // Handle image swap
  const handleImageSwap = (clickedIndex: number) => {
    const clickedImage = thumbnails[clickedIndex];
    const newThumbnails = [...thumbnails];
    newThumbnails[clickedIndex] = mainImage;
    
    setMainImage(clickedImage);
    setThumbnails(newThumbnails);
  };

  // Handle favorite toggle
  const handleFavoriteClick = async () => {
    if (!isAuthenticated) {
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
      toast.error('Please login to add to favorites');
      onClose();
      navigate('/login');
      return;
    }
    if (!room.id) {
      toast.error('Unable to add to favorites');
      return;
    }
    try {
      // Toggle favorite in backend using room id
      const result = await dispatch(toggleFavourite(room.id)).unwrap();
      await dispatch(fetchFavourites()).unwrap();
      if (result.action === 'added') {
        toast.success('Added to favorites');
      } else {
        toast.success('Removed from favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  };

  // Calculate nights based on check-in and check-out dates
  const calculateNights = () => {
    if (checkInDate && checkOutDate) {
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      const diffTime = checkOut.getTime() - checkIn.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 1;
    }
    return 1;
  };

  const nights = calculateNights();
  const serviceFee = 350;
  const totalPrice = roomPrice * nights + serviceFee;

  // Use room amenities if available, otherwise use defaults
  const defaultAmenities = [
    { icon: wifiIcon, name: 'Free High-Speed Wi-Fi' },
    { icon: carIcon, name: 'Complimentary Parking' },
    { icon: breakfastIcon, name: 'Breakfast Included' },
    { icon: tvIcon, name: '65" Smart TV' },
    { icon: airIcon, name: 'Climate Control' },
    { icon: securityIcon, name: '24/7 Security' },
    { icon: teaIcon, name: 'Room Service' }
  ];

  // Map amenity names to icons
  const amenityIconMap: { [key: string]: string } = {
    'Free High-Speed Wi-Fi': wifiIcon,
    'Wi-Fi': wifiIcon,
    'WiFi': wifiIcon,
    'Complimentary Parking': carIcon,
    'Parking': carIcon,
    'Breakfast Included': breakfastIcon,
    'Breakfast': breakfastIcon,
    '65" Smart TV': tvIcon,
    'Smart TV': tvIcon,
    'TV': tvIcon,
    'Climate Control': airIcon,
    'Air Conditioning': airIcon,
    'AC': airIcon,
    '24/7 Security': securityIcon,
    'Security': securityIcon,
    'Room Service': teaIcon,
    'Minibar': teaIcon
  };

  const amenities = room.amenities && room.amenities.length > 0
    ? room.amenities.map(name => ({
        icon: amenityIconMap[name] || wifiIcon, // Use matching icon or default to wifi
        name
      }))
    : defaultAmenities;

  // Use room features if available, otherwise use defaults
  const defaultRoomFeatures = [
    'King-size beds with premium linens',
    'Marble bathroom with jacuzzi',
    'Minibar and Nespresso machine',
    'Blackout curtains',
    'Separate living and dining areas',
    'Private balcony with city views',
    'Work desk with ergonomic chair',
    'In-room safe'
  ];

  const roomFeatures = (room.roomFeatures || room.room_features || []).length > 0
    ? (room.roomFeatures || room.room_features || [])
    : defaultRoomFeatures;

  const handleBookNow = () => {
    console.log('Book Now clicked', { checkInDate, checkOutDate, isAuthenticated });
    
    // Check authentication first
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
      
      // Store the booking intent with all parameters
      const bookingIntent = {
        roomId: room.id,
        accommodationId: room.accommodation_id || 0,
        checkInDate,
        checkOutDate,
        returnToBooking: true
      };
      sessionStorage.setItem('bookingIntent', JSON.stringify(bookingIntent));
      sessionStorage.setItem('redirectAfterLogin', `/dashboard`); // Return to dashboard so they can view the room again
      
      toast.error('Please login to book a room');
      onClose(); // Close modal before redirecting
      navigate('/login');
      return;
    }

    // Validate dates before booking
    if (!checkInDate || !checkOutDate) {
      console.log('Dates not selected');
      toast.error('Please select check-in and check-out dates');
      return;
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    console.log('Dates:', { checkIn, checkOut });

    if (checkOut <= checkIn) {
      console.log('Invalid date range');
      toast.error('Check-out date must be after check-in date');
      return;
    }

    // Calculate nights
    const nights = calculateNights();
    
    // Ensure roomPrice is a valid number
    const validRoomPrice = Number(roomPrice);
    if (isNaN(validRoomPrice) || validRoomPrice <= 0) {
      console.error('Invalid room price:', roomPrice);
      toast.error('Unable to process booking. Invalid room price.');
      return;
    }

    console.log('Room price:', validRoomPrice, 'Type:', typeof validRoomPrice);

    // Format dates for display
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    };

    // Store image data in sessionStorage to avoid URL length limit
    sessionStorage.setItem('bookingRoomImage', firstImage);
    
    // Navigate to booking page with all parameters (excluding large image data)
    const params = new URLSearchParams({
      roomId: room.id.toString(),
      accommodationId: (room.accommodation_id || 0).toString(),
      roomName: room.name,
      roomBadge: room.badge,
      location: room.location || 'Location Not Specified',
      beds: room.beds.toString(),
      baths: (room.baths || 1).toString(),
      area: (room.area || 0).toString(),
      rating: (room.rating || 4.5).toString(),
      guests: room.guests || `upto ${room.capacity || 4} guests`,
      numGuests: (room.capacity || 4).toString(),
      checkInDate: formatDate(checkIn),
      checkOutDate: formatDate(checkOut),
      nights: nights.toString(),
      pricePerNight: validRoomPrice.toFixed(2)
    });

    const bookingUrl = `/book?${params.toString()}`;
    console.log('Navigating to:', bookingUrl);
    console.log('Booking data:', {
      roomId: room.id,
      accommodationId: room.accommodation_id,
      checkIn: formatDate(checkIn),
      checkOut: formatDate(checkOut),
      nights,
      price: validRoomPrice
    });
    
    navigate(bookingUrl);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header with Back Button */}
          <div className="bg-gradient-to-r from-[#001F3F] to-[#0056D2] p-4">
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Search
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            {/* Left Column - Room Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Main Image and Gallery */}
              <div className="space-y-4">
                <div className="relative h-64 lg:h-96 rounded-xl overflow-hidden">
                  <img src={mainImage} alt={room.name} className="w-full h-full object-cover" />
                  
                  {/* Badge */}
                  <div className="absolute top-4 left-4 bg-[#00CD07] text-white px-4 py-2 rounded-lg text-sm font-semibold uppercase">
                    {room.badge}
                  </div>

                  {/* Favorite */}
                  <button 
                    onClick={handleFavoriteClick}
                    className="absolute bottom-4 right-4 p-1 transition-all hover:scale-110"
                    aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    <img 
                      src={heartIcon} 
                      alt="Favorite" 
                      className={`w-8 h-8 transition-all ${
                        isFavorite 
                          ? 'brightness-100 saturate-150 drop-shadow-md' 
                          : 'brightness-[10] saturate-0 opacity-90 hover:scale-105'
                      }`}
                    />
                  </button>
                </div>

                {/* Thumbnail Images with Swap Functionality */}
                <div className="grid grid-cols-3 gap-4">
                  {thumbnails.map((img, index) => (
                    <div 
                      key={index} 
                      className="relative h-20 sm:h-32 rounded-lg overflow-hidden cursor-pointer group thumbnail-h"
                      onClick={() => handleImageSwap(index)}
                    >
                      <img 
                        src={img} 
                        alt={`View ${index + 1}`} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <svg 
                          className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Room Title and Info */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <h1 className="text-4xl font-bold text-gray-900">{room.name}</h1>
                  <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
                    <img src={starIcon} alt="Rating" className="w-5 h-5" />
                    <span className="font-semibold text-gray-900">{room.rating || 4.5}</span>
                    <span className="text-gray-600 text-sm">(128 Reviews)</span>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-gray-600 mb-6">
                  <img src={locationIcon} alt="Location" className="w-5 h-5" />
                  <span>{room.location || '45 Loop Street Cape Town City Centre Cape Town, 8001 South Africa'}</span>
                </div>

                {/* Room Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-100 rounded-lg p-4 text-center">
                    <img src={bedIcon} alt="Beds" className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-semibold text-gray-900">{room.beds} beds</p>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-4 text-center">
                    <img src={bathIcon} alt="Baths" className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-semibold text-gray-900">{room.baths || 1} baths</p>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-4 text-center">
                    <img src={squareIcon} alt="Area" className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-semibold text-gray-900">{room.area || 120} m²</p>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-4 text-center">
                    <img src={groupIcon} alt="Guests" className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-semibold text-gray-900">{room.capacity || 4} Guests</p>
                  </div>
                </div>
              </div>

              <hr />

              {/* Description */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
                <p className="text-gray-700 leading-relaxed">
                  {room.description || 'Experience the ultimate in luxury with our Presidential Suite. This expansive accommodation features stunning panoramic city views, a private terrace, and a sophisticated design that combines modern elegance with timeless comfort. Perfect for those seeking the finest hospitality experience.'}
                </p>
              </div>

              <hr />

              {/* Amenities */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Amenities</h2>
                <div className="grid grid-cols-2 gap-4">
                  {amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <img src={amenity.icon} alt={amenity.name} className="w-6 h-6" />
                      <span className="text-gray-700">{amenity.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <hr />

              {/* Room Features */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Room Features</h2>
                <div className="grid grid-cols-2 gap-4">
                  {roomFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <img src={doneIcon} alt="Check" className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Booking Card */}
            <div className="lg:col-span-1">
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6 sticky top-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Book Your Stay</h3>
                <p className="text-gray-600 text-sm mb-6">Select your date and process to payment</p>

                {/* Price Display */}
                <div className="bg-gray-100 rounded-lg p-4 mb-6">
                  <p className="text-4xl font-bold text-gray-900">R {roomPrice.toLocaleString()}</p>
                  <p className="text-gray-600">per night</p>
                </div>

                <hr className="mb-6" />

                {/* Date Inputs */}
                <div className="space-y-4 mb-6">
                  <div>
                    <label htmlFor="checkInDate" className="block text-gray-900 font-semibold mb-2">Check in date</label>
                    <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-3">
                      <img src={calendarIcon} alt="Calendar" className="w-5 h-5" />
                      <input
                        type="date"
                        id="checkInDate"
                        value={checkInDate}
                        onChange={(e) => {
                          setCheckInDate(e.target.value);
                          // Reset check-out date if it's before the new check-in date
                          if (checkOutDate && e.target.value >= checkOutDate) {
                            setCheckOutDate('');
                          }
                        }}
                        min={today}
                        className="flex-1 outline-none text-gray-700"
                        placeholder="yyyy/mm/dd"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="checkOutDate" className="block text-gray-900 font-semibold mb-2">Check out date</label>
                    <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-3">
                      <img src={calendarIcon} alt="Calendar" className="w-5 h-5" />
                      <input
                        type="date"
                        id="checkOutDate"
                        value={checkOutDate}
                        onChange={(e) => setCheckOutDate(e.target.value)}
                        min={checkInDate || today}
                        disabled={!checkInDate}
                        className="flex-1 outline-none text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="yyyy/mm/dd"
                        required
                      />
                    </div>
                    {!checkInDate && (
                      <p className="text-xs text-gray-500 mt-1">Please select check-in date first</p>
                    )}
                  </div>
                </div>

                <hr className="mb-6" />

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span>R{roomPrice.toLocaleString()} × {nights} {nights === 1 ? 'night' : 'nights'}</span>
                    <span className="font-semibold">R{(roomPrice * nights).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Service fee</span>
                    <span className="font-semibold">R{serviceFee}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between text-gray-900 text-lg font-bold">
                    <span>Total</span>
                    <span>R{totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                {/* Book Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleBookNow();
                  }}
                  disabled={!checkInDate || !checkOutDate}
                  className="w-full bg-[#0F51AF] text-white py-4 rounded-lg font-bold text-lg hover:bg-[#0d4291] active:bg-[#0a3678] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Book Now
                </button>
                {(!checkInDate || !checkOutDate) && (
                  <p className="text-xs text-gray-500 text-center mt-2">Select dates to continue</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;
