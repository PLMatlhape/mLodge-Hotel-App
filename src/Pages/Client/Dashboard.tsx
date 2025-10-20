import React, { useState } from 'react';
import logo from '../../assets/image/Erxtras/Logo-mLodge-hotel.png';
import searchIcon from '../../assets/icons/black/black-search-icon.png';
import filterIcon from '../../assets/icons/black/black-filter-icon.png';
import heartIcon from '../../assets/icons/yellow-heart-icon.png';
import starIcon from '../../assets/icons/yellow-star-rate-icon.png';
import bathIcon from '../../assets/icons/black/black-bath-icon.png';
import backgroundImage from '../../assets/image/background/Client-Page.jpeg';
import RoomDetails from './RoomDetails';
// Room Images
import luxuryPenthouse from '../../assets/image/dashboard/penthouse-room.jpeg';
import deluxeOcean from '../../assets/image/dashboard/Deluxe Ocean View.jpeg';
import executiveBusiness from '../../assets/image/dashboard/Executive-business-room.jpeg';
import familySuite from '../../assets/image/dashboard/Family Suite.jpeg';
import presidentialSuite from '../../assets/image/dashboard/Presidential Suite.jpeg';
import standardComfort from '../../assets/image/dashboard/Standard Comfort Room.jpeg';
import romanticHoneymoon from '../../assets/image/dashboard/Romantic Honeymoon Suite.jpeg';

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
  badge: string;
  favorite: boolean;
}

const Dashboard: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const rooms: Room[] = [
    {
      id: 1,
      name: "Luxury Penthouse",
      location: "Cape Town",
      beds: 3,
      baths: 2,
      area: 95,
      guests: "upto 4 guests",
      price: 8800,
      rating: 5,
      image: luxuryPenthouse,
      badge: "Premium",
      favorite: false
    },
    {
      id: 2,
      name: "Deluxe Ocean View",
      location: "Durban",
      beds: 2,
      baths: 1,
      area: 67,
      guests: "upto 2 guests",
      price: 5000,
      rating: 4.6,
      image: deluxeOcean,
      badge: "Delux",
      favorite: false
    },
    {
      id: 3,
      name: "Executive Business Suite",
      location: "Johannesburg",
      beds: 1,
      baths: 1,
      area: 45,
      guests: "upto 2 guests",
      price: 6800,
      rating: 4.9,
      image: executiveBusiness,
      badge: "Business",
      favorite: false
    },
    {
      id: 4,
      name: "Family Suite",
      location: "Pretoria",
      beds: 3,
      baths: 2,
      area: 85,
      guests: "upto 6 guests",
      price: 4450,
      rating: 4.5,
      image: familySuite,
      badge: "Premium",
      favorite: false
    },
    {
      id: 5,
      name: "Presidential Suite",
      location: "Cape Town",
      beds: 2,
      baths: 2,
      area: 120,
      guests: "upto 4 guests",
      price: 7350,
      rating: 4.7,
      image: presidentialSuite,
      badge: "Delux",
      favorite: false
    },
    {
      id: 6,
      name: "Standard Comfort Room",
      location: "Pretoria",
      beds: 1,
      baths: 1,
      area: 35,
      guests: "upto 2 guests",
      price: 2500,
      rating: 4.2,
      image: standardComfort,
      badge: "Standard",
      favorite: false
    },
    {
      id: 7,
      name: "Romantic Honeymoon Suite",
      location: "Durban",
      beds: 1,
      baths: 1,
      area: 55,
      guests: "upto 2 guests",
      price: 3800,
      rating: 5,
      image: romanticHoneymoon,
      badge: "Premium",
      favorite: false
    }
  ];

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
    // Handle logout logic
    window.location.href = '/';
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
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl overflow-hidden z-50">
                <button
                  onClick={() => window.location.href = '/profile'}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => (
                <div key={room.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                  {/* Room Image */}
                  <div className="relative h-48">
                    <img src={room.image} alt={room.name} className="w-full h-full object-cover" />
                    
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
                      className="absolute bottom-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                      aria-label="Add to favorites"
                    >
                      <img src={heartIcon} alt="Favorite" className="w-5 h-5" />
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
