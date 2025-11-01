import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { Menu, X } from 'lucide-react';
import logo from '../assets/image/Erxtras/Logo-mLodge-hotel.png';
import backgroundImage from '../assets/image/background/Offers-section.jpeg';
import overviewIcon from '../assets/Admin icon/overview-icon.png';
import calendarIcon from '../assets/Admin icon/calendar-icon.png';
import refundIcon from '../assets/Admin icon/refund-icon.png';
import reviewIcon from '../assets/Admin icon/review-star-icon.png';
import analyticsIcon from '../assets/Admin icon/analytics-icon.png';
import reportIcon from '../assets/Admin icon/report-icon.png';
import inquiriesIcon from '../assets/Admin icon/inquiries-icons.png';
import roomInventoryIcon from '../assets/Admin icon/room-inventory-icons.png';
import promoIcon from '../assets/Admin icon/Promo-codes-icon.png';
import staffIcon from '../assets/Admin icon/staff-icon.png';
import auditIcon from '../assets/Admin icon/audit-icons.png';
import emailIcon from '../assets/Admin icon/email-icons.png';
import logoutIcon from '../assets/Admin icon/logout-icon.png';

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, currentPage, onNavigate }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: overviewIcon },
    { id: 'bookings', label: 'Bookings', icon: calendarIcon },
    { id: 'refunds', label: 'Refunds', icon: refundIcon },
    { id: 'reviews', label: 'Reviews', icon: reviewIcon },
    { id: 'analytics', label: 'Analytics', icon: analyticsIcon },
    { id: 'reports', label: 'Reports', icon: reportIcon },
    { id: 'inquiries', label: 'Inquiries', icon: inquiriesIcon },
    { id: 'inventory', label: 'Room Inventory', icon: roomInventoryIcon },
    { id: 'promo', label: 'Promo Codes', icon: promoIcon },
    { id: 'staff', label: 'Staff & Roles', icon: staffIcon },
    { id: 'audit', label: 'Audit Logs', icon: auditIcon },
    { id: 'templates', label: 'Email Templates', icon: emailIcon },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-bg-light">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-navy-dark text-white"
      >
        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          ${sidebarOpen ? 'w-64' : 'w-20'} 
          text-white transition-all duration-300 flex flex-col
          fixed lg:relative inset-y-0 left-0 z-40
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          relative overflow-hidden
        `}
      >
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${backgroundImage})`,
            zIndex: -2
          }}
        />
        {/* Overlay */}
        <div 
          className="absolute inset-0"
          style={{ 
            backgroundColor: 'rgba(0, 28, 67, 0.5)',
            zIndex: -1
          }}
        />
        
        {/* Logo */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-navy-darker flex items-center justify-center flex-shrink-0">
              <img src={logo} alt="mLodge" className="w-6 h-6 lg:w-8 lg:h-8 object-contain" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-base lg:text-lg">mLodge Hotel</h1>
                <p className="text-xs text-gray-300">Admin Panel</p>
              </div>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-3 lg:p-4 space-y-1 lg:space-y-2 overflow-y-auto admin-scrollbar-hide">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg transition-colors ${
                currentPage === item.id
                  ? 'bg-blue-primary text-white'
                  : 'hover:bg-white/10 text-gray-300 hover:text-white'
              }`}
            >
              <img 
                src={item.icon} 
                alt={item.label} 
                className="w-5 h-5 lg:w-6 lg:h-6 flex-shrink-0 object-contain"
              />
              {sidebarOpen && <span className="font-medium text-sm lg:text-base truncate">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 lg:p-4 border-t border-white/10">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex w-full items-center justify-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors mb-2 text-sm"
          >
            <span>{sidebarOpen ? '◀' : '▶'}</span>
            {sidebarOpen && <span>Collapse</span>}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center lg:justify-start gap-3 px-3 lg:px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-gray-300 hover:text-white text-sm lg:text-base"
          >
            <img 
              src={logoutIcon} 
              alt="Logout" 
              className="w-5 h-5 lg:w-6 lg:h-6 flex-shrink-0 object-contain"
            />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full lg:w-auto admin-scrollbar-hide">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
