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
  accommodation_name?: string;
  city?: string;
  photos: Array<{ url: string; sort_order?: number; is_primary?: boolean }>;
  avg_rating: number;
  review_count: number;
  price?: number;
  image?: string;
  badge?: string;
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

  const handleRemoveFavourite = async (roomId: number) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await dispatch(removeFavourite(roomId)).unwrap();
    } catch (error) {
      console.error('Failed to remove favourite:', error);
    }
  };

  const getBadgeColor = (badge: string) => {
    return 'bg-[#00CD07]';
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  if (!isAuthenticated) return null;

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
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-[#001C43] flex items-center justify-center">
              <img src={logo} alt="mLodge Hotel Logo" className="w-12 h-12 object-contain" />
            </div>
            <h1 className="text-white text-2xl font-bold">mLodge Hotel</h1>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h2 className="text-white text-2xl sm:text-4xl font-bold mb-2">Your Favourites</h2>
              <p className="text-gray-300 text-lg">Your saved accommodations</p>
            </div>

            {/* Menu */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex flex-col gap-1.5 p-2 bg-[#0F51AF] rounded-lg hover:bg-[#0d4291] transition-colors"
              >
                <span className="w-6 h-0.5 bg-white rounded"></span>
                <span className="w-6 h-0.5 bg-white rounded"></span>
                <span className="w-6 h-0.5 bg-white rounded"></span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl overflow-hidden z-50">
                  <button
                    onClick={() => {
                      navigate('/dashboard');
                      setMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                  >
                    Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100 border-t flex items-center gap-3"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Favourites Header */}
          {!loading && !error && favourites.length > 0 && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">
                My Favourites ({favourites.length})
              </h2>
            </div>
          )}

          {/* Loading */}
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
              <h3 className="text-gray-900 text-xl font-bold mb-2">No favourites yet</h3>
              <p className="text-gray-600 mb-4">Start exploring and save your favorite rooms</p>
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
                  <div
                    key={`fav-${room.id}-${room.favourite_id}`}
                    className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="relative h-40 sm:h-48">
                      <img src={imageUrl} alt={room.name} className="w-full h-full object-cover" />

                      <div
                        className={`absolute top-3 left-3 ${getBadgeColor(
                          room.type
                        )} text-white px-3 py-1 rounded-lg text-xs font-semibold uppercase`}
                      >
                        {room.type}
                      </div>

                      <div className="absolute top-3 right-3 bg-white/90 px-2 py-1 rounded-lg flex items-center gap-1">
                        <img src={starIcon} alt="Rating" className="w-4 h-4" />
                        <span className="text-gray-900 font-semibold text-sm">
                          {room.avg_rating ? Number(room.avg_rating).toFixed(1) : '5.0'}
                        </span>
                      </div>

                      <button
                        onClick={() => handleRemoveFavourite(room.id)}
                        className="absolute bottom-3 right-3 w-12 h-12 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600"
                        aria-label="Remove from favourites"
                      >
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                        </svg>
                      </button>
                    </div>

                    <div className="p-4">
                      <h3 className="text-gray-900 text-lg font-bold mb-1">{room.name}</h3>

                      <div className="flex items-center gap-1 text-gray-600 text-sm mb-3">
                        {room.location}
                      </div>

                      <div className="flex items-center gap-4 mb-3 text-gray-600 text-sm">
                        <div className="flex items-center gap-1">{room.beds} beds</div>
                        <div className="flex items-center gap-1">
                          <img src={bathIcon} alt="Bathrooms" className="w-4 h-4" />
                          {room.baths}
                        </div>
                        <div className="flex items-center gap-1">{room.area}m²</div>
                      </div>

                      <div className="flex items-center gap-1 text-gray-600 text-sm mb-4">
                        upto {room.capacity} guests
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-gray-900 text-2xl font-bold">
                            R{room.price_per_night}
                          </span>
                          <span className="text-gray-500 text-sm ml-1">per night</span>
                        </div>

                        {/* FIXED MAPPED ROOM */}
                        <button
                          onClick={() => {
                            const mappedRoom: Favourite = {
                              ...room,
                              price: room.price_per_night ?? 0,
                              image: primaryPhoto?.url || '/placeholder-room.jpg',
                              badge: room.type,
                              rating: room.avg_rating ?? 0,
                              guests: `upto ${room.capacity} guests`,
                              amenities: room.amenities ?? [],
                              roomFeatures: room.roomFeatures ?? []
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

      {selectedRoom && <RoomDetails room={selectedRoom} onClose={() => setSelectedRoom(null)} />}
    </div>
  );
};

export default Favourites;
