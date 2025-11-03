import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchMyBookings } from '../../store/slices/bookingsSlice';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Calendar, Users, Clock } from 'lucide-react';

const BookingHistory: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { bookings, loading, error } = useAppSelector((state) => state.bookings);

  useEffect(() => {
    dispatch(fetchMyBookings());
  }, [dispatch]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500 text-white';
      case 'pending':
        return 'bg-yellow-500 text-white';
      case 'cancelled':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => dispatch(fetchMyBookings())}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#001F3F] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-white hover:text-blue-300 transition-colors mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back to Dashboard</span>
          </button>
          <h1 className="text-3xl font-bold text-white">My Bookings</h1>
          <p className="text-blue-200 mt-2">View and manage your hotel reservations</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {bookings.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <svg
                  className="w-20 h-20 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No bookings yet
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Start exploring our amazing rooms and make your first booking!
                  </p>
                  <Button
                    onClick={() => navigate('/dashboard')}
                    className="bg-[#0F51AF] hover:bg-[#0045b0] text-white"
                  >
                    Browse Rooms
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gradient-to-r from-[#001F3F] to-[#0F51AF] text-white">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <CardTitle className="text-xl mb-1">{booking.roomName}</CardTitle>
                      <p className="text-blue-200 text-sm">Booking ID: {booking.id}</p>
                    </div>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left: Booking Details */}
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Check-in</p>
                          <p className="font-medium text-gray-900">
                            {formatDate(booking.checkInDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Check-out</p>
                          <p className="font-medium text-gray-900">
                            {formatDate(booking.checkOutDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Duration</p>
                          <p className="font-medium text-gray-900">
                            {booking.nights} {booking.nights === 1 ? 'night' : 'nights'}
                          </p>
                        </div>
                      </div>
                      {booking.guestInfo && (
                        <div className="flex items-start gap-3">
                          <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Guest</p>
                            <p className="font-medium text-gray-900">
                              {booking.guestInfo.firstName} {booking.guestInfo.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{booking.guestInfo.email}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: Room Image and Price */}
                    <div className="space-y-4">
                      {booking.roomImage && (
                        <img
                          src={booking.roomImage}
                          alt={booking.roomName}
                          className="w-full h-40 object-cover rounded-lg"
                        />
                      )}
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Price per night</span>
                          <span className="font-medium text-gray-900">
                            R {booking.pricePerNight.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">
                            {booking.nights} {booking.nights === 1 ? 'night' : 'nights'}
                          </span>
                          <span className="font-medium text-gray-900">
                            R {(booking.pricePerNight * booking.nights).toLocaleString()}
                          </span>
                        </div>
                        <div className="border-t border-blue-200 pt-2 mt-2">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-900">Total</span>
                            <span className="text-xl font-bold text-[#0F51AF]">
                              R {booking.totalPrice.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      onClick={() =>
                        navigate(
                          `/room/${booking.roomId}?checkInDate=${booking.checkInDate}&checkOutDate=${booking.checkOutDate}`
                        )
                      }
                    >
                      View Room Details
                    </Button>
                    {booking.status === 'confirmed' && (
                      <Button
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Request Cancellation
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingHistory;
