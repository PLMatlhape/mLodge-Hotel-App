import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { fetchFavourites, removeFavourite } from '../../store/slices/favouritesSlice';
import logo from '../../assets/image/Erxtras/Logo-mLodge-hotel.png';
import starIcon from '../../assets/icons/yellow-star-rate-icon.png';

import bathIcon from '../../assets/icons/black/black-bath-icon.png';
import backgroundImage from '../../assets/image/background/Client-Page.jpeg';
import RoomDetails from './RoomDetails';

interface Favourite {
  favourite_id: number;
  favourited_at: string;
  id: number;
  name: string;
  description?: string;
  location: string;
  price_per_night: number;
  type: string;
  capacity: number;
  beds: number;
  baths: number;
  area: number;
  photos: Array<{ url: string; is_primary: boolean }>;
  avg_rating: number;
  review_count: number;
  price: number;
  image: string;
  badge: string;
  rating?: number;
  guests?: string;
  amenities?: string[];
  roomFeatures?: string[];
}

const Favourites: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { favourites, loading, error } = useAppSelector((state) => state.favourites);

  const [selectedRoom, setSelectedRoom] = React.useState<Favourite | null>(null);
  const [menuOpen, setMenuOpen] = React.useState(false);

  // Fetch favourites on component mount
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchFavourites());
    } else {
      navigate('/login');
    }
  }, [dispatch, isAuthenticated, navigate]);



  const handleRemoveFavourite = async (accommodationId: number) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await dispatch(removeFavourite(accommodationId)).unwrap();
    } catch (error) {
      console.error('Failed to remove favourite:', error);
    }
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'Premium':
        return 'bg-[#00CD07]';
      case 'Delux':
        return 'bg-[#00CD07]';
      case 'Business':
        return 'bg-[#00CD07]';
      case 'Standard':
        return 'bg-[#00CD07]';
      default:
        return 'bg-[#00CD07]';
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <img
          src={backgroundImage}
          alt="Background"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#1E3A5F]/30"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="bg-[#001F3F] px-6 py-4 flex items-center justify-center">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-[#001C43] flex items-center justify-center">
              <img src={logo} alt="mLodge Hotel Logo" className="w-12 h-12 object-contain" />
            </div>
            <h1 className="text-white text-2xl font-bold">mLodge Hotel</h1>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Title Section with Hamburger Menu */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h2 className="text-white text-4xl font-bold mb-2">Your Favourites</h2>
              <p className="text-gray-300 text-lg">Your saved accommodations</p>
            </div>

            {/* Hamburger Menu */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex flex-col gap-1.5 p-2 bg-[#0F51AF] rounded-lg hover:bg-[#0d4291] transition-colors"
              >
                <span className="w-6 h-0.5 bg-white rounded"></span>
                <span className="w-6 h-0.5 bg-white rounded"></span>
                <span className="w-6 h-0.5 bg-white rounded"></span>
              </button>

              {/* Dropdown Menu */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl overflow-hidden z-50">
                  <button
                    onClick={() => {
                      navigate('/dashboard');
                      setMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                    </svg>
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                    Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-3 border-t"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Favourites Content */}
          {loading ? (
            <div className="bg-white rounded-lg p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F51AF] mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading your favourites...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-lg p-12 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => dispatch(fetchFavourites())}
                className="px-6 py-2 bg-[#0F51AF] text-white rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : favourites.length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <h3 className="text-gray-900 text-xl font-bold mb-2">No favourites yet</h3>
              <p className="text-gray-600 mb-4">Start exploring and save your favorite accommodations</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2 bg-[#0F51AF] text-white rounded-lg hover:bg-blue-700"
              >
                Browse Accommodations
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favourites.map((room) => {
                const primaryPhoto = room.photos.find(p => p.is_primary) || room.photos[0];
                const imageUrl = primaryPhoto?.url || '/placeholder-room.jpg';

                return (
                  <div key={room.favourite_id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                    {/* Room Image */}
                    <div className="relative h-48">
                      <img src={imageUrl} alt={room.name} className="w-full h-full object-cover" />

                      {/* Badge */}
                      <div className={`absolute top-3 left-3 ${getBadgeColor(room.type)} text-white px-3 py-1 rounded-lg text-xs font-semibold uppercase`}>
                        {room.type}
                      </div>

                      {/* Rating */}
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                        <img src={starIcon} alt="Rating" className="w-4 h-4" />
                        <span className="text-gray-900 font-semibold text-sm">{room.avg_rating.toFixed(1)}</span>
                      </div>

                      {/* Remove from favourites */}
                      <button
                        onClick={() => handleRemoveFavourite(room.id)}
                        className="absolute bottom-3 right-3 w-12 h-12 rounded-full bg-red-500 flex items-center justify-center transition-all hover:bg-red-600"
                        aria-label="Remove from favourites"
                      >
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                      </button>
                    </div>

                    {/* Room Details */}
                    <div className="p-4">
                      <h3 className="text-gray-900 text-lg font-bold mb-1">{room.name}</h3>
                      <div className="flex items-center gap-1 text-gray-600 text-sm mb-3">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                        {room.location}
                      </div>

                      {/* Room Features */}
                      <div className="flex items-center gap-4 mb-3 text-gray-600 text-sm">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/>
                          </svg>
                          {room.beds}
                        </div>
                        <div className="flex items-center gap-1">
                          <img src={bathIcon} alt="Bathrooms" className="w-4 h-4" />
                          {room.baths}
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 14H9v-2h2v2zm0-4H9v-2h2v2zm0-4H9V7h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/>
                          </svg>
                          {room.area}m²
                        </div>
                      </div>

                      {/* Guests */}
                      <div className="flex items-center gap-1 text-gray-600 text-sm mb-4">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                        </svg>
                        upto {room.capacity} guests
                      </div>

                      {/* Price and Button */}
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-gray-900 text-2xl font-bold">R{room.price_per_night}</span>
                          <span className="text-gray-500 text-sm ml-1">per night</span>
                        </div>
                        <button
                          onClick={() => {
                            const primaryPhoto = room.photos.find(p => p.is_primary) || room.photos[0];
                            const mappedRoom = {
                              ...room,
                              price: room.price_per_night,
                              image: primaryPhoto?.url || '/placeholder-room.jpg',
                              badge: room.type,
                              rating: room.avg_rating,
                              guests: `upto ${room.capacity} guests`,
                              amenities: [],
                              roomFeatures: []
                            };
                            setSelectedRoom(mappedRoom);
                          }}
                          className="bg-[#0F51AF] text-white px-4 py-2 rounded-lg hover:bg-[#0d4291] transition-colors font-medium text-sm"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Room Details Modal */}
      {selectedRoom && (
        <RoomDetails room={selectedRoom} onClose={() => setSelectedRoom(null)} />
      )}
    </div>
  );
};

export default Favourites;
