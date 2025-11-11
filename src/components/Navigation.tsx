import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { logout } from '../store/slices/authSlice';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    setMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#001F3F] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3">
            <img 
              src="/mlodge-logo.png" 
              alt="mLodge Hotel Logo" 
              className="h-10 sm:h-12 w-auto"
            />
            <span className="text-white text-lg sm:text-2xl font-bold tracking-wide leading-tight">mLodge Hotel</span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-3 xl:gap-4">
            <Link 
              to="/" 
              className="px-4 xl:px-6 py-2 text-sm xl:text-base text-white bg-[#0056D2] hover:bg-[#0045b0] rounded transition-colors font-medium"
            >
              Home
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to={user?.role === 'admin' ? '/admin/overview' : '/dashboard'}
                  className="px-4 xl:px-6 py-2 text-sm xl:text-base text-white bg-[#0056D2] hover:bg-[#0045b0] rounded transition-colors font-medium"
                >
                  {user?.role === 'admin' ? 'Admin' : 'Dashboard'}
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 xl:px-6 py-2 text-sm xl:text-base text-white bg-red-600 hover:bg-red-700 rounded transition-colors font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="px-4 xl:px-6 py-2 text-sm xl:text-base text-white bg-[#0056D2] hover:bg-[#0045b0] rounded transition-colors font-medium"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 xl:px-6 py-2 text-sm xl:text-base text-white bg-[#0056D2] hover:bg-[#0045b0] rounded transition-colors font-medium"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-white/20 pt-4">
            <div className="flex flex-col gap-3">
              <Link 
                to="/" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 text-white bg-[#0056D2] hover:bg-[#0045b0] rounded transition-colors font-medium text-center"
              >
                Home
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link 
                    to={user?.role === 'admin' ? '/admin/overview' : '/dashboard'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2 text-white bg-[#0056D2] hover:bg-[#0045b0] rounded transition-colors font-medium text-center"
                  >
                    {user?.role === 'admin' ? 'Admin' : 'Dashboard'}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded transition-colors font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2 text-white bg-[#0056D2] hover:bg-[#0045b0] rounded transition-colors font-medium text-center"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2 text-white bg-[#0056D2] hover:bg-[#0045b0] rounded transition-colors font-medium text-center"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
