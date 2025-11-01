import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { logout } from '../store/slices/authSlice';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#001F3F] shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-3">
            <div className="flex flex-col items-center">
              <span className="text-white text-xs font-semibold">THE</span>
              <span className="text-white text-2xl font-bold tracking-wide">mLODGE</span>
              <span className="text-white text-xs font-semibold">HOTEL</span>
            </div>
            <span className="text-white text-2xl font-light ml-4">mLodge Hotel</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              className="px-6 py-2 text-white bg-[#0056D2] hover:bg-[#0045b0] rounded transition-colors font-medium"
            >
              Home
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to={user?.role === 'admin' ? '/admin/overview' : '/dashboard'}
                  className="px-6 py-2 text-white bg-[#0056D2] hover:bg-[#0045b0] rounded transition-colors font-medium"
                >
                  {user?.role === 'admin' ? 'Admin' : 'Dashboard'}
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-6 py-2 text-white bg-red-600 hover:bg-red-700 rounded transition-colors font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="px-6 py-2 text-white bg-[#0056D2] hover:bg-[#0045b0] rounded transition-colors font-medium"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="px-6 py-2 text-white bg-[#0056D2] hover:bg-[#0045b0] rounded transition-colors font-medium"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
