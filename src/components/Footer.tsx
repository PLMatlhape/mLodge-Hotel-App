import React from 'react';
import logo from '../assets/image/Erxtras/Logo-mLodge-hotel.png';
import contactIcon from '../assets/icons/black/black-contact-icon.png';
import emailIcon from '../assets/icons/black/black-email-icon.png';
import locationIcon from '../assets/icons/black/black-location-icon.png';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#D9D9D9] py-12">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-8">
          {/* Logo & Description */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-full bg-[#001C43] flex items-center justify-center flex-shrink-0">
                <img 
                  src={logo} 
                  alt="mLodge Hotel Logo" 
                  className="w-12 h-12 object-contain"
                />
              </div>
              <h3 className="text-gray-900 text-2xl font-bold">mLodge Hotel</h3>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">
              Experience luxury and comfort at its finest. Your perfect getaway awaits.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-gray-900 text-lg font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="/home" className="text-gray-700 text-sm hover:text-[#0F51AF] transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/register" className="text-gray-700 text-sm hover:text-[#0F51AF] transition-colors">
                  Register
                </a>
              </li>
              <li>
                <a href="/login" className="text-gray-700 text-sm hover:text-[#0F51AF] transition-colors">
                  Login
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-gray-900 text-lg font-bold mb-4">Services</h4>
            <ul className="space-y-2">
              <li>
                <a href="#rooms" className="text-gray-700 text-sm hover:text-[#0F51AF] transition-colors">
                  Luxury Rooms
                </a>
              </li>
              <li>
                <a href="#dining" className="text-gray-700 text-sm hover:text-[#0F51AF] transition-colors">
                  Fine Dining
                </a>
              </li>
              <li>
                <a href="#spa" className="text-gray-700 text-sm hover:text-[#0F51AF] transition-colors">
                  Spa & Wellness
                </a>
              </li>
              <li>
                <a href="#conference" className="text-gray-700 text-sm hover:text-[#0F51AF] transition-colors">
                  Conference Halls
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-gray-900 text-lg font-bold mb-4">Contact</h4>
            <div className="space-y-3">
              {/* Phone */}
              <div className="flex items-start gap-3">
                <img 
                  src={contactIcon} 
                  alt="Phone" 
                  className="w-5 h-5 mt-0.5 flex-shrink-0"
                />
                <span className="text-gray-700 text-sm">+27 79 946 7887</span>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3">
                <img 
                  src={emailIcon} 
                  alt="Email" 
                  className="w-5 h-5 mt-0.5 flex-shrink-0"
                />
                <span className="text-gray-700 text-sm">info@codetribehotel.com</span>
              </div>

              {/* Address */}
              <div className="flex items-start gap-3">
                <img 
                  src={locationIcon} 
                  alt="Location" 
                  className="w-5 h-5 mt-0.5 flex-shrink-0"
                />
                <span className="text-gray-700 text-sm">123 Pretorious St, Pretoria</span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-400 pt-6">
          <p className="text-center text-gray-700 text-sm">
            © 2025 mLodge Hotel. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
