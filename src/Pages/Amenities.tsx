import React from 'react';

const Amenities: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-navy-dark mb-4">Hotel Amenities</h1>
        <p className="text-gray-text mb-8">
          Discover the exceptional facilities and services we offer to make your stay memorable.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 bg-gray-light rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
            <p className="text-gray-text">Amenities page is under construction.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Amenities;
