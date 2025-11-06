import { useState, useEffect } from 'react';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { toast } from '../../lib/toast';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchAllBookings, updateBookingStatusAsync } from '../../store/slices/bookingsSlice';
import { refundsAPI } from '../../services/api';
import backgroundImage from '../../assets/image/background/Offers-section.jpeg';

// Transform Redux booking to display format
interface DisplayBooking {
  id: string;
  dbId: number; // Add database ID for updates
  guest: string;
  email: string;
  room: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  amount: number;
  status: string;
  date: string;
}

export function AdminBookings() {
  const dispatch = useAppDispatch();
  const { bookings: reduxBookings, loading, error } = useAppSelector((state) => state.bookings);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRoomType, setFilterRoomType] = useState('all');
  const [cancellingBookingId, setCancellingBookingId] = useState<number | null>(null);

  // Fetch bookings on mount
  useEffect(() => {
    console.log('Fetching all bookings...');
    dispatch(fetchAllBookings());
  }, [dispatch]);

  // Log bookings data when it changes
  useEffect(() => {
    console.log('Redux bookings updated:', reduxBookings);
    console.log('Loading:', loading, 'Error:', error);
  }, [reduxBookings, loading, error]);

  // Transform Redux bookings to display format
  const bookings: DisplayBooking[] = Array.isArray(reduxBookings) 
    ? reduxBookings.map((booking: any) => {
        // Handle both backend format and Redux format
        const bookingRef = booking.booking_reference || booking.id || 'N/A';
        const dbId = booking.id || 0; // Database ID for updates
        const guestName = booking.user_name || 
                         (booking.guestInfo ? `${booking.guestInfo.firstName} ${booking.guestInfo.lastName}` : 'N/A');
        const guestEmail = booking.user_email || booking.guestInfo?.email || 'N/A';
        const roomInfo = booking.rooms?.[0] || {};
        const roomName = booking.accommodation_name || roomInfo.room_name || booking.roomName || 'N/A';
        const roomType = roomInfo.room_type || 'Standard';
        
        return {
          id: bookingRef,
          dbId: dbId,
          guest: guestName,
          email: guestEmail,
          room: roomName,
          roomType: roomType,
          checkIn: booking.check_in_date || booking.checkInDate || 'N/A',
          checkOut: booking.check_out_date || booking.checkOutDate || 'N/A',
          nights: booking.nights || 1,
          amount: booking.total_price || booking.totalPrice || 0,
          status: booking.status ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) : 'Pending',
          date: booking.created_at || booking.createdAt || new Date().toISOString(),
        };
      })
    : [];

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guest.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    const matchesRoomType = filterRoomType === 'all' || booking.roomType === filterRoomType;

    return matchesSearch && matchesStatus && matchesRoomType;
  });

  const handleCancelAndRefund = async (bookingDbId: number, bookingRef: string, amount: number) => {
    if (!confirm(`Are you sure you want to cancel booking ${bookingRef} and process a refund of R ${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}?`)) {
      return;
    }

    setCancellingBookingId(bookingDbId);
    
    try {
      // 1. Update booking status to cancelled
      await dispatch(
        updateBookingStatusAsync({
          id: bookingDbId,
          status: 'cancelled',
        })
      ).unwrap();

      // 2. Create refund record in the database
      await refundsAPI.create({
        booking_id: bookingDbId,
        reason: 'Cancelled by admin',
        refund_amount: amount,
      });
      
      toast.success(`Booking ${bookingRef} cancelled. Refund of R ${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })} has been created and is pending approval.`);
      
      // 3. Refresh bookings list
      dispatch(fetchAllBookings());
    } catch (error) {
      toast.error('Failed to cancel booking and process refund');
      console.error('Error cancelling booking:', error);
    } finally {
      setCancellingBookingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return { bg: '#0F51AF', text: '#FFFFFF' };
      case 'Pending': return { bg: '#ffa500', text: '#FFFFFF' };
      case 'Checked-in': return { bg: '#00bfff', text: '#FFFFFF' };
      case 'Completed': return { bg: '#666', text: '#FFFFFF' };
      case 'Cancelled': return { bg: '#ff4444', text: '#FFFFFF' };
      default: return { bg: '#666', text: '#FFFFFF' };
    }
  };

  // Loading state
  if (loading && bookings.length === 0) {
    return (
      <div className="relative min-h-screen p-6 space-y-6">
        {/* Background Image */}
        <div 
          className="fixed inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${backgroundImage})`,
            zIndex: -2
          }}
        />
        {/* Overlay */}
        <div 
          className="fixed inset-0"
          style={{ 
            backgroundColor: 'rgba(0, 28, 67, 0.5)',
            zIndex: -1
          }}
        />
        <Card style={{ backgroundColor: '#D9D9D9', borderColor: 'rgba(0, 28, 67, 0.2)' }}>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-primary" />
            <span className="ml-3 text-gray-text">Loading bookings...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="relative min-h-screen p-6 space-y-6">
        {/* Background Image */}
        <div 
          className="fixed inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${backgroundImage})`,
            zIndex: -2
          }}
        />
        {/* Overlay */}
        <div 
          className="fixed inset-0"
          style={{ 
            backgroundColor: 'rgba(0, 28, 67, 0.5)',
            zIndex: -1
          }}
        />
        <Card className="bg-red-50 border-red-200">
          <CardContent className="flex items-center py-4">
            <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
            <div>
              <p className="text-red-800 font-medium">Error loading bookings</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Background Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${backgroundImage})`,
          zIndex: -2
        }}
      />
      {/* Overlay */}
      <div 
        className="fixed inset-0"
        style={{ 
          backgroundColor: 'rgba(0, 28, 67, 0.5)',
          zIndex: -1
        }}
      />
      
      {/* Content with padding */}
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 style={{ color: '#FFFFFF', fontSize: '2rem', marginBottom: '0.5rem' }}>Bookings Management</h1>
          <p style={{ color: '#FFFFFF' }}>View and manage all hotel bookings</p>
        </div>

      {/* Filters */}
      <Card style={{ backgroundColor: '#D9D9D9', borderColor: 'rgba(0, 28, 67, 0.2)' }}>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: '#627182' }} />
                <Input
                  placeholder="Search by reference, guest name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  style={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(0, 28, 67, 0.2)', color: '#000000' }}
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger style={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(0, 28, 67, 0.2)', color: '#000000' }}>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: '#D9D9D9', borderColor: 'rgba(0, 28, 67, 0.2)' }}>
                <SelectItem value="all" style={{ color: '#000000' }}>All Statuses</SelectItem>
                <SelectItem value="Confirmed" style={{ color: '#000000' }}>Confirmed</SelectItem>
                <SelectItem value="Pending" style={{ color: '#000000' }}>Pending</SelectItem>
                <SelectItem value="Checked-in" style={{ color: '#000000' }}>Checked-in</SelectItem>
                <SelectItem value="Completed" style={{ color: '#000000' }}>Completed</SelectItem>
                <SelectItem value="Cancelled" style={{ color: '#000000' }}>Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterRoomType} onValueChange={setFilterRoomType}>
              <SelectTrigger style={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(0, 28, 67, 0.2)', color: '#000000' }}>
                <SelectValue placeholder="Room Type" />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: '#D9D9D9', borderColor: 'rgba(0, 28, 67, 0.2)' }}>
                <SelectItem value="all" style={{ color: '#000000' }}>All Types</SelectItem>
                <SelectItem value="Premium" style={{ color: '#000000' }}>Premium</SelectItem>
                <SelectItem value="Deluxe" style={{ color: '#000000' }}>Deluxe</SelectItem>
                <SelectItem value="Standard" style={{ color: '#000000' }}>Standard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card style={{ backgroundColor: '#D9D9D9', borderColor: 'rgba(0, 28, 67, 0.2)' }}>
        <CardHeader>
          <CardTitle style={{ color: '#000000' }}>All Bookings ({filteredBookings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-max table-auto">
              <thead>
                <tr className="border-b" style={{ borderColor: 'rgba(0, 28, 67, 0.2)' }}>
                  <th className="text-left py-3 px-3 whitespace-nowrap" style={{ color: '#627182', minWidth: '180px' }}>Reference</th>
                  <th className="text-left py-3 px-3 whitespace-nowrap" style={{ color: '#627182', minWidth: '200px' }}>Guest</th>
                  <th className="text-left py-3 px-3 whitespace-nowrap" style={{ color: '#627182', minWidth: '220px' }}>Room</th>
                  <th className="text-left py-3 px-3 whitespace-nowrap" style={{ color: '#627182', minWidth: '110px' }}>Check-in</th>
                  <th className="text-left py-3 px-3 whitespace-nowrap" style={{ color: '#627182', minWidth: '110px' }}>Check-out</th>
                  <th className="text-left py-3 px-3 whitespace-nowrap" style={{ color: '#627182', minWidth: '80px' }}>Nights</th>
                  <th className="text-left py-3 px-3 whitespace-nowrap" style={{ color: '#627182', minWidth: '120px' }}>Amount</th>
                  <th className="text-left py-3 px-3 whitespace-nowrap" style={{ color: '#627182', minWidth: '100px' }}>Status</th>
                  <th className="text-left py-3 px-3 whitespace-nowrap" style={{ color: '#627182', minWidth: '120px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => {
                  const statusColor = getStatusColor(booking.status);
                  const isCancelled = booking.status.toLowerCase() === 'cancelled';
                  const isLoading = cancellingBookingId === booking.dbId;
                  
                  return (
                    <tr key={booking.id} className="border-b hover:bg-white/50 transition-colors" style={{ borderColor: 'rgba(0, 28, 67, 0.1)' }}>
                      <td className="py-3 px-3 whitespace-nowrap" style={{ color: '#000000', fontSize: '0.875rem' }}>
                        {booking.id}
                      </td>
                      <td className="py-3 px-3">
                        <div>
                          <div style={{ color: '#000000', fontWeight: '500', fontSize: '0.875rem' }}>{booking.guest}</div>
                          <div style={{ color: '#627182', fontSize: '0.75rem' }}>{booking.email}</div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div>
                          <div style={{ color: '#000000', fontWeight: '500', fontSize: '0.875rem' }}>{booking.room}</div>
                          <div style={{ color: '#627182', fontSize: '0.75rem' }}>{booking.roomType}</div>
                        </div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap" style={{ color: '#627182', fontSize: '0.875rem' }}>
                        {new Date(booking.checkIn).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap" style={{ color: '#627182', fontSize: '0.875rem' }}>
                        {new Date(booking.checkOut).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 text-center" style={{ color: '#000000', fontSize: '0.875rem' }}>
                        {booking.nights}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap" style={{ color: '#000000', fontWeight: '500', fontSize: '0.875rem' }}>
                        R {booking.amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3">
                        <Badge
                          style={{
                            backgroundColor: statusColor.bg,
                            color: statusColor.text,
                            fontSize: '0.75rem',
                            padding: '4px 8px',
                          }}
                        >
                          {booking.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-3">
                        {!isCancelled ? (
                          <Button
                            variant="default"
                            size="sm"
                            disabled={isLoading}
                            onClick={() => handleCancelAndRefund(booking.dbId, booking.id, booking.amount)}
                            className="text-xs"
                            style={{
                              backgroundColor: isLoading ? '#94a3b8' : '#dc2626',
                              color: '#FFFFFF',
                              padding: '6px 12px',
                            }}
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                Cancelling...
                              </>
                            ) : (
                              'Cancel & Refund'
                            )}
                          </Button>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Cancelled</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {/* Empty State */}
            {filteredBookings.length === 0 && (
              <div className="text-center py-12">
                <AlertCircle className="mx-auto h-12 w-12 mb-4" style={{ color: '#627182' }} />
                <h3 style={{ color: '#000000', fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  No bookings found
                </h3>
                <p style={{ color: '#627182', fontSize: '0.875rem' }}>
                  {searchTerm || filterStatus !== 'all' || filterRoomType !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'No bookings have been made yet'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
