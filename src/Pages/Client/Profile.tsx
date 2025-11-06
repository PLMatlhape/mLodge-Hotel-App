
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { updateUser } from '../../store/slices/authSlice';
import { fetchMyBookings } from '../../store/slices/bookingsSlice';
import { usersAPI } from '../../services/api';
import { Badge } from '../../components/ui/badge';
import logo from '../../assets/image/Erxtras/Logo-mLodge-hotel.png';
import backgroundImage from '../../assets/image/background/Client-Page.jpeg';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { bookings, loading: bookingsLoading } = useAppSelector((state) => state.bookings);
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    nationality: ''
  });

  const [formData, setFormData] = useState({ ...profileData });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch user profile and bookings on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await usersAPI.getProfile();
        const userData = response.data;

        setProfileData({
          fullName: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          address: '', // Not stored in database yet
          dateOfBirth: '', // Not stored in database yet
          nationality: '' // Not stored in database yet
        });
        setFormData({
          fullName: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          address: '',
          dateOfBirth: '',
          nationality: ''
        });
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchProfile();
      dispatch(fetchMyBookings());
    }
  }, [isAuthenticated, dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Only update name and phone since backend only supports these fields
      const response = await usersAPI.updateProfile({
        name: formData.fullName,
        phone: formData.phone
      });
      
      // Update local state with saved data
      setProfileData({ ...formData });
      
      // Update Redux store
      dispatch(updateUser({
        name: response.data.name,
        phone: response.data.phone
      }));
      
      setIsEditing(false);
      
      // Show success message (you can add a toast notification here)
      console.log('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ ...profileData });
    setIsEditing(false);
    setError(null);
  };

  // Show loading state
  if (loading && !profileData.email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#0F51AF] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <img 
          src={backgroundImage} 
          alt="Background" 
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#1E3A5F]/30"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="bg-[#001F3F] px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-[#001C43] flex items-center justify-center">
              <img src={logo} alt="mLodge Hotel Logo" className="w-12 h-12 object-contain" />
            </div>
            <h1 className="text-white text-2xl font-bold">mLodge Hotel</h1>
          </div>

          {/* Back to Dashboard */}
          <Link 
            to="/dashboard" 
            className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-lg font-medium">Back to Dashboard</span>
          </Link>
        </header>

        {/* Error Message */}
        {error && (
          <div className="max-w-4xl mx-auto px-6 pt-6">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
              <button
                onClick={() => setError(null)}
                className="absolute top-0 right-0 px-4 py-3"
                aria-label="Close error message"
              >
                <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <title>Close</title>
                  <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-[#001F3F] to-[#0056D2] px-8 py-12">
              <div className="flex items-center gap-6">
                {/* Avatar */}
                <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center text-[#001F3F] text-5xl font-bold">
                  {profileData.fullName ? profileData.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : '?'}
                </div>
                
                {/* User Info */}
                <div className="flex-1">
                  <h2 className="text-white text-4xl font-bold mb-2">{profileData.fullName || 'User'}</h2>
                  <p className="text-gray-200 text-lg">{profileData.email}</p>
                  <div className="mt-4">
                    <span className="inline-block bg-[#00CD07] text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Active Member
                    </span>
                  </div>
                </div>

                {/* Edit Button */}
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-white text-[#0F51AF] px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            {/* Profile Details */}
            <div className="p-8">
              <h3 className="text-gray-900 text-2xl font-bold mb-6">Personal Information</h3>

              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="fullName" className="block text-gray-700 font-medium mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F51AF]"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                      disabled
                      readOnly
                    />
                    <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F51AF]"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label htmlFor="address" className="block text-gray-700 font-medium mb-2">
                      Address <span className="text-sm text-gray-500">(Coming soon)</span>
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F51AF] bg-gray-50"
                      disabled
                    />
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label htmlFor="dateOfBirth" className="block text-gray-700 font-medium mb-2">
                      Date of Birth <span className="text-sm text-gray-500">(Coming soon)</span>
                    </label>
                    <input
                      type="date"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F51AF] bg-gray-50"
                      disabled
                    />
                  </div>

                  {/* Nationality */}
                  <div>
                    <label htmlFor="nationality" className="block text-gray-700 font-medium mb-2">
                      Nationality <span className="text-sm text-gray-500">(Coming soon)</span>
                    </label>
                    <input
                      type="text"
                      id="nationality"
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F51AF] bg-gray-50"
                      disabled
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-[#0F51AF] text-white py-3 rounded-lg hover:bg-[#0d4291] transition-colors font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={loading}
                      className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  {/* Display Mode */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-gray-600 text-sm font-medium mb-1">Full Name</p>
                      <p className="text-gray-900 text-lg">{profileData.fullName || 'Not set'}</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-600 text-sm font-medium mb-1">Email Address</p>
                      <p className="text-gray-900 text-lg">{profileData.email}</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-600 text-sm font-medium mb-1">Phone Number</p>
                      <p className="text-gray-900 text-lg">{profileData.phone || 'Not set'}</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-600 text-sm font-medium mb-1">Date of Birth</p>
                      <p className="text-gray-500 text-lg italic">
                        {profileData.dateOfBirth 
                          ? new Date(profileData.dateOfBirth).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : 'Coming soon'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-gray-600 text-sm font-medium mb-1">Nationality</p>
                      <p className="text-gray-500 text-lg italic">{profileData.nationality || 'Coming soon'}</p>
                    </div>
                    
                    <div className="md:col-span-2">
                      <p className="text-gray-600 text-sm font-medium mb-1">Address</p>
                      <p className="text-gray-500 text-lg italic">{profileData.address || 'Coming soon'}</p>
                    </div>
                  </div>

                  {/* Recent Bookings Section */}
                  <div className="mt-12">
                    <h3 className="text-gray-900 text-2xl font-bold mb-6">Recent Bookings</h3>
                    {bookingsLoading ? (
                      <div className="bg-gray-50 rounded-lg p-6 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0F51AF] mx-auto"></div>
                        <p className="text-gray-600 mt-2">Loading bookings...</p>
                      </div>
                    ) : bookings.length === 0 ? (
                      <div className="bg-gray-50 rounded-lg p-6 text-center">
                        <p className="text-gray-600">No recent bookings</p>
                        <Link
                          to="/dashboard"
                          className="inline-block mt-4 bg-[#0F51AF] text-white px-6 py-2 rounded-lg hover:bg-[#0d4291] transition-colors font-medium"
                        >
                          Browse Rooms
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {bookings.slice(0, 3).map((booking) => (
                          <div key={booking.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-semibold text-gray-900">{booking.accommodation_name || 'Accommodation'}</h4>
                                <p className="text-sm text-gray-600">Booking ID: {booking.id}</p>
                              </div>
                              <Badge className={`${
                                booking.status === 'confirmed' ? 'bg-green-500' :
                                booking.status === 'pending' ? 'bg-yellow-500' :
                                booking.status === 'cancelled' ? 'bg-red-500' : 'bg-gray-500'
                              } text-white`}>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500">Check-in</p>
                                <p className="font-medium">{new Date(booking.check_in_date).toLocaleDateString('en-ZA')}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Check-out</p>
                                <p className="font-medium">{new Date(booking.check_out_date).toLocaleDateString('en-ZA')}</p>
                              </div>
                            </div>
                            <div className="mt-3 flex justify-between items-center">
                              <p className="text-sm text-gray-600">
                                {booking.num_adults} adults{booking.num_children > 0 ? `, ${booking.num_children} children` : ''}
                              </p>
                              <p className="font-bold text-[#0F51AF]">R {(booking.total_price || 0).toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                        {bookings.length > 3 && (
                          <div className="text-center pt-4">
                            <Link
                              to="/booking-history"
                              className="text-[#0F51AF] hover:text-[#0045b0] font-medium"
                            >
                              View all bookings →
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
