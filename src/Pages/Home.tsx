import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import Offers from './Offers';
import HottestRooms from './HottestRooms';
import Events from './Events';
import RoomDetails from './Client/RoomDetails';
import homeBackground from '../assets/image/background/Home-page-background.jpeg';

interface Room {
  id: number;
  name: string;
  location?: string;
  beds: number;
  baths: number;
  area: number;
  guests?: string;
  price: number;
  rating?: number;
  image: string;
  badge: string;
  favorite?: boolean;
}

const Home: React.FC = () => {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room);
  };

  const handleCloseModal = () => {
    setSelectedRoom(null);
  };
  return (
    <div className="min-h-screen bg-[#001F3F]">
      <Navigation />
      
      {/* Hero Section */}
      <div className="relative h-screen">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img 
            src={homeBackground} 
            alt="Hotel Room" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#001F3F]/40"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-start justify-center h-full max-w-7xl mx-auto px-12 pb-32">
          <h1 className="text-white text-7xl font-bold mb-6 leading-tight">
            Welcome to mLodge Hotel
          </h1>
          <p className="text-white text-xl mb-10 max-w-4xl leading-relaxed">
            Experience unparalleled luxury and comfort in the heart of the city. Your<br />
            perfect escape awaits.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex gap-6">
            <Link 
              to="/dashboard" 
              className="px-7 py-3 bg-[#0056D2] text-white rounded hover:bg-[#0045b0] transition-colors font-medium"
            >
              Book Your Stay
            </Link>
            <Link 
              to="/dashboard" 
              className="px-7 py-3 bg-transparent text-white border-2 border-white rounded hover:bg-white/10 transition-colors font-medium"
            >
              Explore rooms
            </Link>
          </div>
        </div>

        {/* Stats Section Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-[#00153D]/70 backdrop-blur-sm z-10 border-t border-white/10">
          <div className="max-w-6xl mx-auto px-8 py-6">
            <div className="grid grid-cols-4 gap-8">
              {/* Rating */}
              <div className="flex flex-col items-center text-center">
                <div className="text-white mb-2">
                  <svg className="w-10 h-10 mx-auto" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="0.5">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <div className="text-white text-3xl font-bold mb-1">4.5</div>
                <div className="text-white text-xs font-normal tracking-wide">Guest Rating</div>
              </div>

              {/* Happy Guests */}
              <div className="flex flex-col items-center text-center">
                <div className="text-white mb-2">
                  <svg className="w-10 h-10 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                  </svg>
                </div>
                <div className="text-white text-3xl font-bold mb-1">10K+</div>
                <div className="text-white text-xs font-normal tracking-wide">Happy Guest</div>
              </div>

              {/* Restaurants */}
              <div className="flex flex-col items-center text-center">
                <div className="text-white mb-2">
                  <svg className="w-10 h-10 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z" />
                  </svg>
                </div>
                <div className="text-white text-3xl font-bold mb-1">3</div>
                <div className="text-white text-xs font-normal tracking-wide">Restaurants</div>
              </div>

              {/* Pools */}
              <div className="flex flex-col items-center text-center">
                <div className="text-white mb-2">
                  <svg className="w-10 h-10 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 21c-1.11 0-1.73-.37-2.18-.64-.37-.22-.6-.36-1.15-.36-.56 0-.78.13-1.15.36-.46.27-1.07.64-2.18.64s-1.73-.37-2.18-.64c-.37-.22-.6-.36-1.15-.36-.56 0-.78.13-1.15.36-.46.27-1.08.64-2.19.64-1.11 0-1.73-.37-2.18-.64-.37-.23-.6-.36-1.15-.36s-.78.13-1.15.36c-.46.27-1.08.64-2.19.64v-2c.56 0 .78-.13 1.15-.36.46-.27 1.08-.64 2.19-.64s1.73.37 2.18.64c.37.23.59.36 1.15.36.56 0 .78-.13 1.15-.36.46-.27 1.08-.64 2.19-.64 1.11 0 1.73.37 2.18.64.37.22.6.36 1.15.36s.78-.13 1.15-.36c.45-.27 1.07-.64 2.18-.64s1.73.37 2.18.64c.37.23.59.36 1.15.36v2zm0-4.5c-1.11 0-1.73-.37-2.18-.64-.37-.22-.6-.36-1.15-.36-.56 0-.78.13-1.15.36-.45.27-1.07.64-2.18.64s-1.73-.37-2.18-.64c-.37-.22-.6-.36-1.15-.36-.56 0-.78.13-1.15.36-.45.27-1.07.64-2.18.64s-1.73-.37-2.18-.64c-.37-.22-.6-.36-1.15-.36s-.78.13-1.15.36c-.47.27-1.09.64-2.2.64v-2c.56 0 .78-.13 1.15-.36.45-.27 1.07-.64 2.18-.64s1.73.37 2.18.64c.37.22.6.36 1.15.36.56 0 .78-.13 1.15-.36.45-.27 1.07-.64 2.18-.64s1.73.37 2.18.64c.37.22.6.36 1.15.36s.78-.13 1.15-.36c.45-.27 1.07-.64 2.18-.64s1.73.37 2.18.64c.37.22.6.36 1.15.36v2zM8.67 12c.56 0 .78-.13 1.15-.36.46-.27 1.08-.64 2.19-.64 1.11 0 1.73.37 2.18.64.37.22.6.36 1.15.36s.78-.13 1.15-.36c.12-.07.26-.15.41-.23L10.48 5C8.93 3.45 7.5 2.99 5 3v2.5c1.82-.01 2.89.39 4 1.5l1 1-3.25 3.25c.31.12.56.27.77.39.37.23.59.36 1.15.36z" />
                  </svg>
                </div>
                <div className="text-white text-3xl font-bold mb-1">2</div>
                <div className="text-white text-xs font-normal tracking-wide">Pools</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Offers Section */}
      <Offers />

      {/* Hottest Rooms & Amenities Section */}
      <HottestRooms onRoomClick={handleRoomClick} />

      {/* Events Section */}
      <Events />

      {/* Footer */}
      <Footer />

      {/* Room Details Modal */}
      {selectedRoom && (
        <RoomDetails
          room={selectedRoom}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Home;
