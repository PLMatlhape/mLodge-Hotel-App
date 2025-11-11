import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchMyBookings } from '../../store/slices/bookingsSlice';

interface Booking {
  id: number;
  user_id: number;
  accommodation_id: number;
  check_in_date: string;
  check_out_date: string;
  num_adults: number;
  num_children: number;
  total_price: number;
  total_amount?: number; // For compatibility
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected';
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  special_requests?: string;
  accommodation_name?: string;
  accommodation_city?: string;
  rooms?: { room_id: number; room_name: string; quantity: number; price_per_night: number }[];
  created_at: string;
  payment_status?: string;
  payment_method?: string;
  transaction_id?: string;
}

const Bookings = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { bookings, loading } = useAppSelector((state) => state.bookings);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  useEffect(() => {
    dispatch(fetchMyBookings());
  }, [dispatch]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'paid':
        return 'bg-[#00CD07] text-white';
      case 'pending':
        return 'bg-yellow-500 text-white';
      case 'cancelled':
      case 'refunded':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-[#00CD07] text-white';
      case 'pending':
        return 'bg-yellow-500 text-white';
      case 'failed':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const viewReceipt = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowReceiptModal(true);
  };

  const closeReceiptModal = () => {
    setShowReceiptModal(false);
    setSelectedBooking(null);
  };

  const printReceipt = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#001F3F] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F51AF] mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#001F3F] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button and Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="mb-4 flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">
            My Bookings
          </h1>
          <p className="text-gray-300">
            View and manage your hotel reservations
          </p>
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg shadow-md p-12 text-center border border-white/20">
            <svg
              className="mx-auto h-24 w-24 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="text-lg font-medium text-white mb-2">
              No bookings yet
            </h3>
            <p className="text-gray-300 mb-6">
              Start exploring our accommodations and make your first reservation
            </p>
            <a
              href="/dashboard"
              className="inline-flex items-center px-6 py-3 bg-[#0F51AF] hover:bg-[#0d4291] text-white font-medium rounded-lg transition-colors"
            >
              Browse Accommodations
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking: Booking) => (
              <div
                key={booking.id}
                className="bg-white/10 backdrop-blur-sm rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-white/20"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    {/* Booking Info */}
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 gap-3">
                        <div className="flex-1">
                          <h3 className="text-lg sm:text-xl font-semibold text-white mb-1">
                            {booking.accommodation_name}
                          </h3>
                          {booking.accommodation_city && (
                            <p className="text-xs sm:text-sm text-gray-300">
                              {booking.accommodation_city}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-row sm:flex-col gap-2 items-start sm:items-end">
                          <span
                            className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              booking.status
                            )}`}
                          >
                            {booking.status}
                          </span>
                          {booking.payment_status && (
                            <span
                              className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(
                                booking.payment_status
                              )}`}
                            >
                              {booking.payment_status}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Dates and Rooms */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
                        <div>
                          <p className="text-[10px] sm:text-xs text-gray-400 mb-1">
                            Check-in
                          </p>
                          <p className="text-xs sm:text-sm font-medium text-white">
                            {formatDate(booking.check_in_date)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] sm:text-xs text-gray-400 mb-1">
                            Check-out
                          </p>
                          <p className="text-xs sm:text-sm font-medium text-white">
                            {formatDate(booking.check_out_date)}
                          </p>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <p className="text-[10px] sm:text-xs text-gray-400 mb-1">
                            Duration
                          </p>
                          <p className="text-xs sm:text-sm font-medium text-white">
                            {calculateNights(
                              booking.check_in_date,
                              booking.check_out_date
                            )}{' '}
                            night(s)
                          </p>
                        </div>
                      </div>

                      {/* Rooms */}
                      {booking.rooms && booking.rooms.length > 0 && (
                        <div className="mb-4">
                          <p className="text-[10px] sm:text-xs text-gray-400 mb-2">
                            Room(s)
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {booking.rooms.map((room) => (
                              <span
                                key={room.room_id}
                                className="px-2 sm:px-3 py-1 bg-white/20 text-gray-200 rounded-md text-xs sm:text-sm"
                              >
                                {room.room_name} {room.quantity > 1 && `(x${room.quantity})`}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Price */}
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-xl sm:text-2xl font-bold text-[#0F51AF]">
                          R{(booking.total_price || booking.total_amount || 0).toLocaleString()}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-400">
                          Total
                        </span>
                      </div>

                      {/* Payment Method */}
                      {booking.payment_method && (
                        <p className="text-[10px] sm:text-xs text-gray-400">
                          Payment method:{' '}
                          <span className="capitalize">
                            {booking.payment_method.replace('_', ' ')}
                          </span>
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-row sm:flex-col gap-2 lg:ml-6 lg:min-w-[140px]">
                      <button
                        onClick={() => viewReceipt(booking)}
                        className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-[#0F51AF] hover:bg-[#0d4291] text-white font-medium rounded-lg transition-colors text-center text-xs sm:text-sm whitespace-nowrap"
                      >
                        View Receipt
                      </button>
                      <p className="hidden sm:block text-xs text-gray-400 text-center">
                        Booked on {formatDate(booking.created_at)}
                      </p>
                    </div>
                  </div>
                  {/* Mobile booking date */}
                  <p className="sm:hidden text-[10px] text-gray-400 text-right mt-2">
                    Booked: {formatDate(booking.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      {showReceiptModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between z-10">
              <h2 className="text-lg sm:text-xl font-bold text-[#001F3F]">
                Booking Receipt
              </h2>
              <button
                onClick={closeReceiptModal}
                className="text-gray-400 hover:text-gray-600 p-1"
                aria-label="Close receipt modal"
              >
                <svg
                  className="h-5 w-5 sm:h-6 sm:w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Receipt Content */}
            <div className="p-4 sm:p-6" id="receipt-content">
              {/* Header */}
              <div className="text-center mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-gray-200">
                <h3 className="text-xl sm:text-2xl font-bold text-[#0F51AF] mb-2">
                  mLodge Hotel
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Booking Confirmation Receipt
                </p>
              </div>

              {/* Booking Details */}
              <div className="mb-4 sm:mb-6">
                <h4 className="text-base sm:text-lg font-semibold text-[#001F3F] mb-3 sm:mb-4">
                  Booking Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Booking ID
                    </p>
                    <p className="font-medium text-[#001F3F] text-sm sm:text-base">
                      #{selectedBooking.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Booking Date
                    </p>
                    <p className="font-medium text-[#001F3F] text-sm sm:text-base">
                      {formatDate(selectedBooking.created_at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Status
                    </p>
                    <span
                      className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        selectedBooking.status
                      )}`}
                    >
                      {selectedBooking.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Payment Status
                    </p>
                    {selectedBooking.payment_status && (
                      <span
                        className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(
                          selectedBooking.payment_status
                        )}`}
                      >
                        {selectedBooking.payment_status}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Accommodation Details */}
              <div className="mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-gray-200">
                <h4 className="text-base sm:text-lg font-semibold text-[#001F3F] mb-3 sm:mb-4">
                  Accommodation
                </h4>
                <p className="text-lg sm:text-xl font-medium text-[#001F3F] mb-1">
                  {selectedBooking.accommodation_name}
                </p>
                {selectedBooking.accommodation_city && (
                  <p className="text-xs sm:text-sm text-gray-600">
                    {selectedBooking.accommodation_city}
                  </p>
                )}
                {selectedBooking.rooms && selectedBooking.rooms.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs sm:text-sm text-gray-500 mb-2">
                      Room(s):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedBooking.rooms.map((room) => (
                        <span
                          key={room.room_id}
                          className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-xs sm:text-sm"
                        >
                          {room.room_name} {room.quantity > 1 && `(x${room.quantity})`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Stay Details */}
              <div className="mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-gray-200">
                <h4 className="text-base sm:text-lg font-semibold text-[#001F3F] mb-3 sm:mb-4">
                  Stay Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Check-in
                    </p>
                    <p className="font-medium text-[#001F3F] text-sm sm:text-base">
                      {formatDate(selectedBooking.check_in_date)}
                    </p>
                    <p className="text-xs text-gray-500">
                      From 2:00 PM
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Check-out
                    </p>
                    <p className="font-medium text-[#001F3F] text-sm sm:text-base">
                      {formatDate(selectedBooking.check_out_date)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Until 11:00 AM
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs sm:text-sm text-gray-500">
                      Duration
                    </p>
                    <p className="font-medium text-[#001F3F] text-sm sm:text-base">
                      {calculateNights(
                        selectedBooking.check_in_date,
                        selectedBooking.check_out_date
                      )}{' '}
                      night(s)
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="mb-4 sm:mb-6">
                <h4 className="text-base sm:text-lg font-semibold text-[#001F3F] mb-3 sm:mb-4">
                  Payment Details
                </h4>
                <div className="space-y-2 sm:space-y-3">
                  {selectedBooking.payment_method && (
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-600 text-xs sm:text-sm">
                        Payment Method
                      </span>
                      <span className="font-medium text-[#001F3F] capitalize text-xs sm:text-sm text-right">
                        {selectedBooking.payment_method.replace('_', ' ')}
                      </span>
                    </div>
                  )}
                  {selectedBooking.transaction_id && (
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-600 text-xs sm:text-sm">
                        Transaction ID
                      </span>
                      <span className="font-medium text-[#001F3F] text-xs sm:text-sm break-all">
                        {selectedBooking.transaction_id}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-2 pt-3 border-t border-gray-200">
                    <span className="text-base sm:text-lg font-semibold text-[#001F3F]">
                      Total Amount
                    </span>
                    <span className="text-xl sm:text-2xl font-bold text-[#0F51AF]">
                      R{(selectedBooking.total_price || selectedBooking.total_amount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Important Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <h4 className="text-xs sm:text-sm font-semibold text-blue-900 mb-2">
                  Important Information
                </h4>
                <ul className="text-[10px] sm:text-xs text-blue-800 space-y-1">
                  <li>• Please present this receipt at check-in</li>
                  <li>• Valid photo ID required at check-in</li>
                  <li>• Check-in time: 2:00 PM | Check-out time: 11:00 AM</li>
                  <li>• Cancellation policy applies as per booking terms</li>
                </ul>
              </div>

              {/* Contact */}
              <div className="text-center text-xs sm:text-sm text-gray-600">
                <p className="mb-1">For inquiries, contact us at:</p>
                <p className="font-medium break-all">support@mlodgehotel.com | +27 123 456 789</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={printReceipt}
                className="flex-1 px-4 sm:px-6 py-2 bg-[#0F51AF] hover:bg-[#0d4291] text-white font-medium rounded-lg transition-colors text-sm sm:text-base"
              >
                Print Receipt
              </button>
              <button
                onClick={closeReceiptModal}
                className="px-4 sm:px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors text-sm sm:text-base"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;
