import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchHottestRooms } from '../store/slices/roomsSlice';
// Amenities Icons
import wifiIcon from '../assets/icons/white/white-wifi-icon.png';
import carIcon from '../assets/icons/white/white-car-icon.png';
import diningIcon from '../assets/icons/white/white-dining-room-icon.png';
import poolIcon from '../assets/icons/white/white-pool-icon.png';
import gymIcon from '../assets/icons/white/white-gym-icon.png';
import securityIcon from '../assets/icons/white/white-security-shield-icon.png';

interface Room {
  id: number;
  name: string;
  description: string;
  beds: number;
  baths: number;
  area: number;
  price: number;
  image: string;
  images?: string[];
  badge: string;
  location?: string;
  rating?: number;
  guests?: string;
  favorite?: boolean;
}

interface Amenity {
  id: number;
  title: string;
  description: string;
  icon: string;
}

interface HottestRoomsProps {
  onRoomClick?: (room: Room) => void;
}

const HottestRooms: React.FC<HottestRoomsProps> = ({ onRoomClick }) => {
  const dispatch = useAppDispatch();
  const { rooms: reduxRooms } = useAppSelector((state) => state.rooms);

  // Fetch hottest rooms (top 3 most booked) from database on component mount
  useEffect(() => {
    dispatch(fetchHottestRooms());
  }, [dispatch]);

  // Transform Redux rooms to match the Room interface
  // Backend already returns only the top 3 most booked available rooms
  const rooms: Room[] = reduxRooms.map((room) => {
    const roomData = room as unknown as Record<string, unknown>;
    const photos = (roomData.photos as Array<{ url: string; is_primary: boolean }>) || [];
    const firstPhoto = photos[0]?.url || '';
    
    return {
      id: roomData.id as number,
      name: roomData.name as string,
      description: (roomData.description as string) || 'Luxurious suite with panoramic views',
      beds: (roomData.beds as number) || 2,
      baths: (roomData.baths as number) || 1,
      area: (roomData.area as number) || 85,
      price: (roomData.price_per_night as number) || 0,
      image: firstPhoto,
      images: photos.map(p => p.url),
      badge: (roomData.type as string) || 'Premium',
      location: (roomData.location as string) || 'Cape Town',
      rating: 5,
      guests: `upto ${(roomData.capacity as number) || 2} guests`,
      favorite: false
    };
  });

  const amenities: Amenity[] = [
    {
      id: 1,
      title: "Free Wi-Fi",
      description: "High-speed internet throughout the hotel",
      icon: wifiIcon
    },
    {
      id: 2,
      title: "Free Parking",
      description: "Complimentary parking for all guests",
      icon: carIcon
    },
    {
      id: 3,
      title: "Fine Dining",
      description: "World-class restaurants and room service",
      icon: diningIcon
    },
    {
      id: 4,
      title: "Swimming Pool",
      description: "Olympic-sized pool with stunning views",
      icon: poolIcon
    },
    {
      id: 5,
      title: "Fitness Center",
      description: "24/7 state-of-the-art gym facilities",
      icon: gymIcon
    },
    {
      id: 6,
      title: "Security",
      description: "Round-the-clock security and safety",
      icon: securityIcon
    }
  ];

  return (
    <div>
      {/* Hottest Rooms Section */}
      <div className="bg-[#66778E] py-20">
        <div className="max-w-7xl mx-auto px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-white text-5xl font-bold mb-4">
              Hottest Rooms to Book
            </h2>
            <p className="text-white text-xl font-light">
              Featuring our most booked rooms and best available accommodations
            </p>
          </div>

          {/* Rooms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {rooms.map((room) => (
              <div 
                key={room.id}
                className="bg-white rounded-3xl overflow-hidden shadow-xl transform transition-transform hover:scale-105"
              >
                {/* Room Image */}
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={room.image || '/placeholder-room.jpg'} 
                    alt={room.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Badge */}
                  <div className="absolute top-4 left-4 bg-[#00CD07] text-white px-4 py-2 rounded-lg font-semibold text-sm">
                    {room.badge}
                  </div>
                </div>

                {/* Room Details */}
                <div className="p-6">
                  <h3 className="text-gray-900 text-2xl font-bold mb-3">
                    {room.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                    {room.description}
                  </p>

                  {/* Room Features */}
                  <div className="flex items-center gap-6 mb-6 text-gray-700">
                    {/* Beds */}
                    <div className="flex items-center gap-1">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/>
                      </svg>
                      <span className="text-sm font-medium">{room.beds} Beds</span>
                    </div>

                    {/* Baths */}
                    <div className="flex items-center gap-1">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM7 3c1.11 0 2 .89 2 2 0 1.11-.89 2-2 2-1.11 0-2-.89-2-2 0-1.11.89-2 2-2zm13 15H4v-2h16v2z"/>
                      </svg>
                      <span className="text-sm font-medium">{room.baths} Baths</span>
                    </div>

                    {/* Area */}
                    <div className="flex items-center gap-1">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 14H9v-2h2v2zm0-4H9v-2h2v2zm0-4H9V7h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/>
                      </svg>
                      <span className="text-sm font-medium">{room.area} m²</span>
                    </div>
                  </div>

                  {/* Price and Book Button */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-gray-900 text-3xl font-bold">R{room.price}</span>
                      <span className="text-gray-500 text-sm">/night</span>
                    </div>
                    {onRoomClick ? (
                      <button
                        onClick={() => onRoomClick(room)}
                        className="bg-[#0F51AF] text-white px-6 py-2.5 rounded-lg hover:bg-[#0d4291] transition-colors font-medium"
                      >
                        Book Now
                      </button>
                    ) : (
                      <Link 
                        to="/dashboard" 
                        className="bg-[#0F51AF] text-white px-6 py-2.5 rounded-lg hover:bg-[#0d4291] transition-colors font-medium"
                      >
                        Book Now
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hotel Amenities Section */}
      <div className="bg-[#D9D9D9] py-20">
        <div className="max-w-7xl mx-auto px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-gray-900 text-5xl font-bold mb-4">
              Hotel Amenities
            </h2>
            <p className="text-gray-700 text-xl font-light">
              Enjoy a wide range of premium facilities and services designed to make your stay exceptional
            </p>
          </div>

          {/* Amenities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {amenities.map((amenity) => (
              <div 
                key={amenity.id}
                className="bg-[#001C43] rounded-2xl p-8 text-white transform transition-transform hover:scale-105"
              >
                {/* Icon */}
                <div className="mb-6">
                  <img 
                    src={amenity.icon || '/placeholder-icon.png'} 
                    alt={amenity.title}
                    className="w-16 h-16 object-contain"
                  />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold mb-3">
                  {amenity.title}
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {amenity.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HottestRooms;
