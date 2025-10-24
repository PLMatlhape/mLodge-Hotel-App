import React from 'react';

const Navigation: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#001F3F] shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center">
              <span className="text-white text-xs font-semibold">THE</span>
              <span className="text-white text-2xl font-bold tracking-wide">mLODGE</span>
              <span className="text-white text-xs font-semibold">HOTEL</span>
            </div>
            <span className="text-white text-2xl font-light ml-4">mLodge Hotel</span>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-4">
            <a href="/" className="px-6 py-2 text-white bg-[#0056D2] hover:bg-[#0045b0] rounded transition-colors font-medium">
              Home
            </a>
            <a href="/login" className="px-6 py-2 text-white bg-[#0056D2] hover:bg-[#0045b0] rounded transition-colors font-medium">
              Login
            </a>
            <a href="/register" className="px-6 py-2 text-white bg-[#0056D2] hover:bg-[#0045b0] rounded transition-colors font-medium">
              Register
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
