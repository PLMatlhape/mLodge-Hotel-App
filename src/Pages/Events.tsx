import React from 'react';
import { Link } from 'react-router-dom';
// Event Images
import jazzNight from '../assets/image/events/jazz-night.jpeg';
import wineTasting from '../assets/image/events/wine-tasting.jpg';
import wellness from '../assets/image/events/wellness and spar3.jpeg';

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  image: string;
  badge: string;
}

const Events: React.FC = () => {
  const events: Event[] = [
    {
      id: 1,
      title: "Summer Jazz Night",
      date: "October 25, 2025",
      time: "7:00 PM - 11:00 PM",
      location: "Rooftop Terrace",
      description: "Enjoy live jazz music under the stars with signature cocktails and gourmet appetizers",
      image: jazzNight,
      badge: "This Week"
    },
    {
      id: 2,
      title: "Wine Tasting Experience",
      date: "October 28, 2025",
      time: "6:00 PM - 9:00 PM",
      location: "Grand Ballroom",
      description: "Sample premium wines from local vineyards paired with artisanal cheeses",
      image: wineTasting,
      badge: "Limited Seats"
    },
    {
      id: 3,
      title: "Wellness & Spa Weekend",
      date: "October 25 2025",
      time: "7:00 PM - 11:00 PM",
      location: "Spa & Wellness Center",
      description: "Rejuvenate with yoga sessions, spa treatments, and healthy gourmet meals",
      image: wellness,
      badge: "Early Bird"
    }
  ];

  return (
    <div className="bg-[#66778E] py-20">
      <div className="max-w-7xl mx-auto px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-white text-5xl font-bold mb-4">
            Upcoming Hotel Events
          </h2>
          <p className="text-white text-xl font-light">
            Join us for exclusive events and unforgettable experiences throughout the year
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {events.map((event) => (
            <div 
              key={event.id}
              className="bg-white rounded-3xl overflow-hidden shadow-xl transform transition-transform hover:scale-105"
            >
              {/* Event Image */}
              <div className="relative h-56 overflow-hidden">
                <img 
                  src={event.image} 
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                {/* Badge */}
                <div className="absolute top-4 left-4 bg-[#00CD07] text-white px-4 py-2 rounded-lg font-semibold text-sm">
                  {event.badge}
                </div>
              </div>

              {/* Event Details */}
              <div className="p-6">
                <h3 className="text-gray-900 text-xl font-bold mb-4">
                  {event.title}
                </h3>

                {/* Date */}
                <div className="flex items-start gap-3 mb-3">
                  <svg className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/>
                  </svg>
                  <span className="text-gray-700 text-sm">{event.date}</span>
                </div>

                {/* Time */}
                <div className="flex items-start gap-3 mb-3">
                  <svg className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                  </svg>
                  <span className="text-gray-700 text-sm">{event.time}</span>
                </div>

                {/* Location */}
                <div className="flex items-start gap-3 mb-4">
                  <svg className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  <span className="text-gray-700 text-sm">{event.location}</span>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                  {event.description}
                </p>

                {/* Reserve Button */}
                <Link 
                  to="/dashboard" 
                  className="w-full bg-[#0F51AF] text-white py-3 rounded-lg hover:bg-[#0d4291] transition-colors font-medium text-center block"
                >
                  Reserve Your Spot
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action Section */}
        <div className="bg-[#E5E5E5] rounded-3xl p-12 shadow-xl">
          <div className="text-center max-w-4xl mx-auto">
            <h3 className="text-gray-900 text-3xl font-bold mb-4">
              Ready to Experience Luxury?
            </h3>
            <p className="text-gray-700 text-lg mb-8 leading-relaxed">
              Join thousands of satisfied guests who have made mLodge Hotel their home away from home. 
              Register today and unlock exclusive benefits and special offers.
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-6">
              <Link 
                to="/register" 
                className="bg-[#0F51AF] text-white px-10 py-3.5 rounded-lg hover:bg-[#0d4291] transition-colors font-medium text-lg"
              >
                Create account
              </Link>
              <Link 
                to="/login" 
                className="bg-transparent text-gray-900 border-2 border-gray-900 px-10 py-3.5 rounded-lg hover:bg-gray-900 hover:text-white transition-colors font-medium text-lg"
              >
                Already a member?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Events;
