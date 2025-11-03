import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { loginSuccess } from '../store/slices/authSlice';
import api from '../services/api';
import background from '../assets/image/background/login-background.jpeg';
import centerImage from '../assets/image/background/Offers-section.jpeg';
import backIcon from '../assets/icons/white/white-back-button-icon.png';
import logo from '../assets/image/Erxtras/Logo-mLodge-hotel.png';
 
const Register: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('returnUrl');
  
  const [firstname, setFirstname] = useState('')
  const [lastname, setLastname] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (!firstname || !lastname || !email || !phone || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
 
    setError(null);
    setIsLoading(true);

    try {
      // Call backend API for registration
      const response = await api.post('/auth/register', {
        email: email,
        name: `${firstname} ${lastname}`,
        phone: phone,
        password: password,
      });

      const data = response.data;
      
      // Store token in localStorage
      localStorage.setItem('token', data.token);
      
      // Create user object and dispatch to Redux
      const newUser = {
        id: data.user.id.toString(),
        email: data.user.email,
        firstName: firstname,
        lastName: lastname,
        phone: phone,
        role: 'client' as const,
      };

      dispatch(loginSuccess(newUser));
      
      // Redirect to returnUrl if it exists, otherwise to dashboard
      if (returnUrl) {
        navigate(returnUrl);
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      // Extract error message from Axios error response
      const errorMessage = error?.response?.data?.error || 
                          error?.response?.data?.message || 
                          error?.message || 
                          'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }
 
  return (
    <div className="min-h-screen relative flex items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img src={background} alt="Register Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[#001F4D]/80"></div>
      </div>
 
      {/* Back to Home Button */}
      <Link to="/" className="absolute top-8 right-8 z-20 flex items-center gap-2 text-white hover:opacity-80 transition-opacity">
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
 
      {/* Register Container */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 bg-white rounded-3xl overflow-hidden shadow-2xl">
          {/* Left Side - Image */}
          <div className="hidden lg:block relative h-[500px]">
            <img src={centerImage} alt="Hotel Interior" className="w-full h-full object-cover" />
          </div>
 
          {/* Right Side - Register Form */}
          <div className="bg-[#001F4D] p-4 lg:p-6 flex flex-col justify-center lg:h-[500px]">
            <h2 className="text-white text-2xl font-bold mb-3 text-center">Register</h2>
 
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="firstname" className="block text-white text-sm font-medium mb-2">Firstname</label>
                  <input
                    type="text"
                    id="firstname"
                    value={firstname}
                    onChange={(e) => { setFirstname(e.target.value); setError(null); }}
                    placeholder="Enter Your firstname"
                    className="w-full px-3 py-2 rounded bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F51AF]"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lastname" className="block text-white text-sm font-medium mb-2">Lastname</label>
                  <input
                    type="text"
                    id="lastname"
                    value={lastname}
                    onChange={(e) => { setLastname(e.target.value); setError(null); }}
                    placeholder="Enter Your lastname"
                    className="w-full px-3 py-2 rounded bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F51AF]"
                    required
                  />
                </div>
              </div>
 
              <div>
                <label htmlFor="email" className="block text-white text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null); }}
                  placeholder="Enter Email"
                  className="w-full px-3 py-2 rounded bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F51AF]"
                  required
                />
              </div>
 
              <div>
                <label htmlFor="phone" className="block text-white text-sm font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setError(null); }}
                  placeholder="Enter Phone Number"
                  className="w-full px-3 py-2 rounded bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F51AF]"
                  required
                />
              </div>
 
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-white text-sm font-medium mb-2">Password</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(null); }}
                    placeholder="Enter New Password"
                    className="w-full px-3 py-2 rounded bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F51AF]"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-white text-sm font-medium mb-2">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
                    placeholder="Confirm Password"
                    className="w-full px-3 py-2 rounded bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F51AF]"
                    required
                  />
                </div>
              </div>
 
              {error && <p className="text-red-300 text-sm">{error}</p>}
 
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-[#0F51AF] text-white py-2 rounded font-semibold text-base hover:bg-[#0d4291] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating Account...' : 'Register'}
              </button>

              {/* Login Link */}
              <div className="text-center space-y-1 pt-2">
                <p className="text-white text-sm">Already have an account?</p>
                <Link 
                  to="/login" 
                  className="text-white text-sm font-semibold hover:underline block"
                >
                  Login now
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
 
export default Register
 
 