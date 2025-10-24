import React, { useState } from 'react';
import starIcon from '../../assets/icons/yellow-star-rate-icon.png';
import heartIcon from '../../assets/icons/yellow-heart-icon.png';
import bathIcon from '../../assets/icons/black/black-bath-icon.png';
import RoomDetails from './RoomDetails';

// Room images (paths match imports used in Dashboard.tsx)
import deluxeOcean from '../../assets/image/dashboard/Deluxe Ocean View.jpeg';
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

const Favorites: React.FC = () => {
  // Using a small subset of the Dashboard room data and marking favorites
  const rooms: Room[] = [
    {
      id: 6,
      name: 'Standard Comfort Room',
      location: 'Pretoria',
      beds: 1,
      baths: 1,
      area: 35,
      guests: 'upto 2 guests',
      price: 2500,
      rating: 4.2,
      image: standardComfort,
      badge: 'Standard',
      favorite: true,
    },
    {
      id: 2,
      name: 'Deluxe Ocean View',
      location: 'Durban',
      beds: 2,
      baths: 1,
      area: 67,
      guests: 'upto 2 guests',
      price: 5000,
      rating: 4.6,
      image: deluxeOcean,
      badge: 'Delux',
      favorite: true,
    },
    {
      id: 7,
      name: 'Romantic Honeymoon Suite',
      location: 'Durban',
      beds: 1,
      baths: 1,
      area: 55,
      guests: 'upto 2 guests',
      price: 3800,
      rating: 5,
      image: romanticHoneymoon,
      badge: 'Premium',
      favorite: true,
    },
  ];

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const favoriteRooms = rooms.filter((r) => r.favorite);

  return (
    <div className="min-h-screen bg-[#062245] text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-semibold mb-2">My Favorites</h2>
        <p className="text-gray-200 mb-8">{favoriteRooms.length} rooms saved</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {favoriteRooms.map((room) => (
            <div key={room.id} className="bg-white rounded-2xl overflow-hidden shadow-lg">
              {/* Room Image */}
              <div className="relative h-44">
                <img src={room.image} alt={room.name} className="w-full h-full object-cover" />

                {/* Badge */}
                <div
                  className={`absolute top-3 left-3 ${getBadgeColor(room.badge)} text-white px-3 py-1 rounded-lg text-xs font-semibold uppercase`}
                >
                  {room.badge}
                </div>

                {/* Rating */}
                <div className="absolute top-3 right-3 bg-white/90 px-2 py-1 rounded-lg flex items-center gap-1">
                  <img src={starIcon} alt="Rating" className="w-4 h-4" />
                  <span className="text-gray-900 font-semibold text-sm">{room.rating}</span>
                </div>

                {/* Favorite */}
                <button
                  className="absolute bottom-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                  aria-label="Favorite"
                >
                  <img src={heartIcon} alt="Favorite" className="w-5 h-5" />
                </button>
              </div>

              {/* Room Details */}
              <div className="p-4 text-gray-900">
                <h3 className="text-lg font-bold mb-1">{room.name}</h3>
                <div className="flex items-center gap-1 text-gray-600 text-sm mb-3">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  {room.location}
                </div>

                <div className="flex items-center gap-4 mb-3 text-gray-600 text-sm">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z" />
                    </svg>
                    {room.beds}
                  </div>
                  <div className="flex items-center gap-1">
                    <img src={bathIcon} alt="Bathrooms" className="w-4 h-4" />
                    {room.baths}
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 14H9v-2h2v2zm0-4H9v-2h2v2zm0-4H9V7h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z" />
                    </svg>
                    {room.area}m²
                  </div>
                </div>

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
      {selectedRoom && (
        <RoomDetails room={selectedRoom} onClose={() => setSelectedRoom(null)} />
      )}
    </div>
  );
};

export default Favorites;
