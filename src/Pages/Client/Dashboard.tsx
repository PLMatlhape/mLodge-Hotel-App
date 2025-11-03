import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { fetchRooms, selectRoom as selectRoomAction } from '../../store/slices/roomsSlice';
import logo from '../../assets/image/Erxtras/Logo-mLodge-hotel.png';
import searchIcon from '../../assets/icons/black/black-search-icon.png';
import filterIcon from '../../assets/icons/black/black-filter-icon.png';
import starIcon from '../../assets/icons/yellow-star-rate-icon.png';
import bathIcon from '../../assets/icons/black/black-bath-icon.png';
import backgroundImage from '../../assets/image/background/Client-Page.jpeg';
import RoomDetails from './RoomDetails';

interface Room {
  id: number;
  name: string;
  location: string;
  beds: number;
  baths: number;
  area: number;
  guests: string;
  price: number;
  rating: number;
  image: string;
  images?: string[];
  badge: string;
  favorite: boolean;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { rooms: reduxRooms, loading, error } = useAppSelector((state) => state.rooms);
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedLocation, setSelectedLocation] = useState('All locations');
  const [selectedTier, setSelectedTier] = useState('All Tiers');
  const [guestCount, setGuestCount] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Fetch accommodations on component mount
  useEffect(() => {
    dispatch(fetchRooms());
  }, [dispatch]);

  // Transform Redux rooms to match display format
  const rooms = reduxRooms.map((room) => {
    const roomData = room as unknown as Record<string, unknown>;
    const photos = (roomData.photos as Array<{ url: string; is_primary: boolean }>) || [];
    const firstPhoto = photos[0]?.url || '/placeholder-room.svg';
    
    return {
      id: roomData.id as number,
      accommodation_id: roomData.accommodation_id as number | undefined,
      name: roomData.name as string,
      location: (roomData.location as string) || 'Unknown',
      beds: (roomData.beds as number) || 1,
      baths: (roomData.baths as number) || 1,
      area: (roomData.area as number) || 0,
      capacity: (roomData.capacity as number) || 2,
      guests: `upto ${(roomData.capacity as number) || 2} guests`,
      price: (roomData.price_per_night as number) || 0,
      price_per_night: (roomData.price_per_night as number) || 0,
      refundable: (roomData.refundable as boolean) || false,
      rating: 5,
      image: firstPhoto,
      images: photos.map(p => p.url),
      photos: photos,
      badge: (roomData.type as string) || 'Standard',
      type: (roomData.type as string) || 'Standard',
      favorite: false
    };
  });

  const toggleFavoriteLocal = (roomId: number) => {
    // Check if user is authenticated before allowing favorite toggle
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // TODO: Call backend API to toggle favorite
    // For now, just dispatch to Redux
    dispatch(selectRoomAction(rooms.find(r => r.id === roomId) || null));
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         room.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = room.price >= priceRange[0] && room.price <= priceRange[1];
    const matchesLocation = selectedLocation === 'All locations' || room.location === selectedLocation;
    const matchesTier = selectedTier === 'All Tiers' || room.badge === selectedTier;
    const matchesGuests = !guestCount || parseInt(room.guests.match(/\d+/)?.[0] || '0') >= parseInt(guestCount);
    const matchesFavorites = !showFavoritesOnly || room.favorite;

    return matchesSearch && matchesPrice && matchesLocation && matchesTier && matchesGuests && matchesFavorites;
  });

  const favoriteRooms = rooms.filter(room => room.favorite);

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
            <h2 className="text-white text-4xl font-bold mb-2">Find Your Perfect Room</h2>
            <p className="text-gray-300 text-lg">Search and filter through our collection of premium rooms</p>
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
                  onClick={() => navigate('/profile')}
                  className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-3"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  Profile
                </button>
                <button
                  onClick={() => {
                    setShowFavoritesOnly(!showFavoritesOnly);
                    setMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100 transition-colors flex items-center justify-between gap-3 border-t"
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    <span>Favorites ({favoriteRooms.length})</span>
                  </div>
                  {showFavoritesOnly && (
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  )}
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

        {/* Search and Filter Bar */}
        <div className="flex gap-4 mb-8">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <img 
              src={searchIcon} 
              alt="Search" 
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5"
            />
            <input
              type="text"
              placeholder="search by location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F51AF]"
            />
          </div>

          {/* Filters Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-6 py-3 bg-white rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 font-medium"
          >
            <img src={filterIcon} alt="Filter" className="w-5 h-5" />
            Filters
          </button>
        </div>

        {/* Content Layout with Sidebar */}
        <div className="flex gap-6">
          {/* Left Sidebar Filter Panel */}
          {showFilters && (
            <div className="w-80 flex-shrink-0">
              <div className="bg-white rounded-lg p-6 sticky top-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-gray-900 text-xl font-bold">Filters</h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="text-[#0F51AF] font-medium hover:underline"
                    aria-label="Close filters"
                  >
                    × Clear
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Price Range */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-3">
                      Price Range (per night)
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>R{priceRange[0]}</span>
                        <span>R{priceRange[1]}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="10000"
                        step="100"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                        className="w-full accent-[#0F51AF]"
                        aria-label="Price range slider"
                      />
                    </div>
                  </div>

                  {/* Location Filter */}
                  <div>
                    <label htmlFor="location-select" className="block text-gray-700 font-medium mb-2">
                      Location
                    </label>
                    <select 
                      id="location-select"
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F51AF]"
                    >
                      <option>All locations</option>
                      <option>Cape Town</option>
                      <option>Durban</option>
                      <option>Johannesburg</option>
                      <option>Pretoria</option>
                    </select>
                  </div>

                  {/* Room Tier */}
                  <div>
                    <label htmlFor="room-tier-select" className="block text-gray-700 font-medium mb-2">
                      Room Tier
                    </label>
                    <select 
                      id="room-tier-select"
                      value={selectedTier}
                      onChange={(e) => setSelectedTier(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F51AF]"
                    >
                      <option>All Tiers</option>
                      <option>Premium</option>
                      <option>Delux</option>
                      <option>Business</option>
                      <option>Standard</option>
                    </select>
                  </div>

                  {/* Number of Guests */}
                  <div>
                    <label htmlFor="guests-input" className="block text-gray-700 font-medium mb-2">
                      Number of Guests
                    </label>
                    <input
                      id="guests-input"
                      type="number"
                      min="1"
                      value={guestCount}
                      onChange={(e) => setGuestCount(e.target.value)}
                      placeholder="Any"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F51AF]"
                    />
                  </div>

                  {/* Amenities */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-3">Amenities</label>
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded w-4 h-4 accent-[#0F51AF]" />
                        <span className="text-gray-700">Free Wi-Fi</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded w-4 h-4 accent-[#0F51AF]" />
                        <span className="text-gray-700">Free Parking</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded w-4 h-4 accent-[#0F51AF]" />
                        <span className="text-gray-700">Breakfast Included</span>
                      </label>
                    </div>
                  </div>

                  {/* Google Location */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Google Location</label>
                    <div className="w-full h-32 bg-gray-200 rounded-lg overflow-hidden">
                      <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Room Cards Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="bg-white rounded-lg p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F51AF] mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading accommodations...</p>
              </div>
            ) : error ? (
              <div className="bg-white rounded-lg p-12 text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <button 
                  onClick={() => dispatch(fetchRooms())}
                  className="px-6 py-2 bg-[#0F51AF] text-white rounded-lg hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            ) : filteredRooms.length === 0 ? (
              <div className="bg-white rounded-lg p-12 text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-gray-900 text-xl font-bold mb-2">No rooms found</h3>
                <p className="text-gray-600">Try adjusting your filters or search criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRooms.map((room) => (
                <div key={room.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                  {/* Room Image */}
                  <div className="relative h-48">
                    <img src={room.image || '/placeholder-room.jpg'} alt={room.name} className="w-full h-full object-cover" />
                    
                    {/* Badge */}
                    <div className={`absolute top-3 left-3 ${getBadgeColor(room.badge)} text-white px-3 py-1 rounded-lg text-xs font-semibold uppercase`}>
                      {room.badge}
                    </div>

                    {/* Rating */}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                      <img src={starIcon} alt="Rating" className="w-4 h-4" />
                      <span className="text-gray-900 font-semibold text-sm">{room.rating}</span>
                    </div>

                    {/* Favorite */}
                    <button 
                      onClick={() => toggleFavoriteLocal(room.id)}
                      className={`absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        room.favorite ? 'bg-red-500' : 'bg-white/90 backdrop-blur-sm hover:bg-white'
                      }`}
                      aria-label="Add to favorites"
                    >
                      <svg 
                        className={`w-5 h-5 ${room.favorite ? 'text-white' : 'text-gray-600'}`}
                        fill={room.favorite ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
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
                      {room.guests}
                    </div>

                    {/* Price and Button */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-gray-900 text-2xl font-bold">R{room.price}</span>
                        <span className="text-gray-500 text-sm ml-1">per night</span>
                      </div>
                      <button 
                        onClick={() => setSelectedRoom(room)}
                        className="bg-[#0F51AF] text-white px-4 py-2 rounded-lg hover:bg-[#0d4291] transition-colors font-medium text-sm"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        </div>
      </div>
      </div>

      {/* Room Details Modal */}
      {selectedRoom && (
        <RoomDetails room={selectedRoom} onClose={() => setSelectedRoom(null)} />
      )}
    </div>
  );
};

export default Dashboard;
