import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { loginSuccess } from '../store/slices/authSlice';
import loginBg from '../assets/image/background/login-background.jpeg';
import centerImage from '../assets/image/background/Offers-section.jpeg';
import backIcon from '../assets/icons/white/white-back-button-icon.png';
import logo from '../assets/image/Erxtras/Logo-mLodge-hotel.png';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      // Check if admin credentials
      if (username === 'Admin@mlodgehotel.co.za' && password === 'Admin@mlodgehotel') {
        const adminUser = {
          id: 'admin-1',
          email: username,
          firstName: 'Admin',
          lastName: 'User',
          phone: '0000000000',
          role: 'admin' as const,
        };
        dispatch(loginSuccess(adminUser));
        navigate('/admin/overview');
      } else {
        // Regular user login
        const clientUser = {
          id: Math.random().toString(36).substr(2, 9),
          email: username,
          firstName: 'Client',
          lastName: 'User',
          phone: '0123456789',
          role: 'client' as const,
        };
        dispatch(loginSuccess(clientUser));
        navigate('/dashboard');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={loginBg} 
          alt="Login Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#001F4D]/80"></div>
      </div>

      {/* Back to Home Button */}
      <Link 
        to="/" 
        className="absolute top-8 right-8 z-20 flex items-center gap-2 text-white hover:opacity-80 transition-opacity"
      >
        <img src={backIcon} alt="Back" className="w-6 h-6" />
        <span className="text-lg font-medium">Home</span>
      </Link>

      {/* Logo */}
      <div className="absolute top-8 left-8 z-20 flex items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-[#001C43] flex items-center justify-center">
          <img src={logo} alt="mLodge Hotel Logo" className="w-10 h-10 object-contain" />
        </div>
        <h1 className="text-white text-2xl font-bold">mLodge Hotel</h1>
      </div>

      {/* Login Container */}
      <div className="relative z-10 w-full max-w-4xl mx-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 bg-white rounded-3xl overflow-hidden shadow-2xl max-h-[550px]">
          {/* Left Side - Image */}
          <div className="hidden lg:block relative h-[500px]">
            <img 
              src={centerImage} 
              alt="Hotel Interior" 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right Side - Login Form */}
          <div className="bg-[#001F4D] p-8 flex flex-col justify-center h-[500px]">
            <h2 className="text-white text-3xl font-bold mb-6 text-center">Login</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-white text-sm font-medium mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter Your username"
                  className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F51AF]"
                  required
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-white text-sm font-medium mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter New Password"
                  className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F51AF]"
                  required
                />
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <Link to="/forgot-password" className="text-white text-sm hover:underline">
                  forgot password
                </Link>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#0F51AF] text-white py-3 rounded-lg font-semibold text-lg hover:bg-[#0d4291] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>

              {/* Register Link */}
              <div className="text-center space-y-2">
                <p className="text-white text-sm">Don't have an account</p>
                <Link 
                  to="/register" 
                  className="text-white text-sm font-semibold hover:underline block"
                >
                  Register now
                </Link>
              </div>

              {/* Terms and Services */}
              <div className="text-center pt-6">
                <Link to="/terms" className="text-white text-sm hover:underline">
                  Terms and Services
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
