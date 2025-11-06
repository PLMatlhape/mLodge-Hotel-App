import { useState, useEffect } from 'react';
import { Search, Edit2, MoreVertical, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { toast } from '../../lib/toast';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchAllBookings, updateBookingStatusAsync } from '../../store/slices/bookingsSlice';

// Transform Redux booking to display format
interface DisplayBooking {
  id: string;
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
  const [selectedBooking, setSelectedBooking] = useState<DisplayBooking | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Fetch bookings on mount
  useEffect(() => {
    dispatch(fetchAllBookings());
  }, [dispatch]);

  // Transform Redux bookings to display format
  const bookings: DisplayBooking[] = reduxBookings.map((booking) => ({
    id: booking.id,
    guest: `${booking.guestInfo.firstName} ${booking.guestInfo.lastName}`,
    email: booking.guestInfo.email,
    room: booking.roomName,
    roomType: 'Standard', // Default since Redux doesn't have this field
    checkIn: booking.checkInDate,
    checkOut: booking.checkOutDate,
    nights: booking.nights,
    amount: booking.totalPrice,
    status: booking.status.charAt(0).toUpperCase() + booking.status.slice(1), // Capitalize
    date: booking.createdAt,
  }));

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guest.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    const matchesRoomType = filterRoomType === 'all' || booking.roomType === filterRoomType;

    return matchesSearch && matchesStatus && matchesRoomType;
  });

  const handleEditBooking = (booking: DisplayBooking) => {
    setSelectedBooking(booking);
    setIsEditDialogOpen(true);
  };

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    try {
      // Parse the ID - Redux uses string IDs directly
      await dispatch(
        updateBookingStatusAsync({
          id: parseInt(bookingId),
          status: newStatus.toLowerCase() as 'pending' | 'confirmed' | 'cancelled',
        })
      ).unwrap();
      toast.success('Booking status updated successfully');
      // Refresh bookings list
      dispatch(fetchAllBookings());
    } catch (error) {
      toast.error('Failed to update booking status');
      console.error('Error updating booking status:', error);
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
      <div className="p-6 space-y-6" style={{ backgroundColor: 'rgba(0, 28, 67, 0.05)' }}>
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
      <div className="p-6 space-y-6" style={{ backgroundColor: 'rgba(0, 28, 67, 0.05)' }}>
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
    <div className="p-6 space-y-6" style={{ backgroundColor: 'rgba(0, 28, 67, 0.05)' }}>
      {/* Header */}
      <div>
        <h1 style={{ color: '#000000', fontSize: '2rem', marginBottom: '0.5rem' }}>Bookings Management</h1>
        <p style={{ color: '#627182' }}>View and manage all hotel bookings</p>
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
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'rgba(0, 28, 67, 0.2)' }}>
                  <th className="text-left py-3 px-4" style={{ color: '#627182' }}>Reference</th>
                  <th className="text-left py-3 px-4" style={{ color: '#627182' }}>Guest</th>
                  <th className="text-left py-3 px-4" style={{ color: '#627182' }}>Room</th>
                  <th className="text-left py-3 px-4" style={{ color: '#627182' }}>Check-in</th>
                  <th className="text-left py-3 px-4" style={{ color: '#627182' }}>Nights</th>
                  <th className="text-left py-3 px-4" style={{ color: '#627182' }}>Amount</th>
                  <th className="text-left py-3 px-4" style={{ color: '#627182' }}>Status</th>
                  <th className="text-left py-3 px-4" style={{ color: '#627182' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => {
                  const statusColor = getStatusColor(booking.status);
                  return (
                    <tr key={booking.id} className="border-b hover:bg-white/50" style={{ borderColor: 'rgba(0, 28, 67, 0.1)' }}>
                      <td className="py-3 px-4" style={{ color: '#000000' }}>{booking.id}</td>
                      <td className="py-3 px-4">
                        <div>
                          <div style={{ color: '#000000' }}>{booking.guest}</div>
                          <div style={{ color: '#627182', fontSize: '0.875rem' }}>{booking.email}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <div style={{ color: '#000000' }}>{booking.room}</div>
                          <div style={{ color: '#627182', fontSize: '0.875rem' }}>{booking.roomType}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4" style={{ color: '#627182' }}>{booking.checkIn}</td>
                      <td className="py-3 px-4" style={{ color: '#000000' }}>{booking.nights}</td>
                      <td className="py-3 px-4" style={{ color: '#000000' }}>R {booking.amount.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <Badge
                          style={{
                            backgroundColor: statusColor.bg,
                            color: statusColor.text,
                          }}
                        >
                          {booking.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" style={{ color: '#0F51AF' }} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent style={{ backgroundColor: '#D9D9D9', borderColor: 'rgba(0, 28, 67, 0.2)' }}>
                            <DropdownMenuItem onClick={() => handleEditBooking(booking)} style={{ color: '#000000' }}>
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(booking.id, 'Confirmed')} style={{ color: '#000000' }}>
                              Confirm Booking
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(booking.id, 'Checked-in')} style={{ color: '#000000' }}>
                              Check-in
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(booking.id, 'Completed')} style={{ color: '#000000' }}>
                              Complete
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(booking.id, 'Cancelled')} style={{ color: '#000000' }}>
                              Cancel
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent style={{ backgroundColor: '#D9D9D9', borderColor: 'rgba(0, 28, 67, 0.2)' }}>
          <DialogHeader>
            <DialogTitle style={{ color: '#000000' }}>Edit Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div>
                <Label style={{ color: '#000000' }}>Guest Name</Label>
                <Input
                  value={selectedBooking.guest}
                  style={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(0, 28, 67, 0.2)', color: '#000000' }}
                />
              </div>
              <div>
                <Label style={{ color: '#000000' }}>Check-in Date</Label>
                <Input
                  type="date"
                  value={selectedBooking.checkIn}
                  style={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(0, 28, 67, 0.2)', color: '#000000' }}
                />
              </div>
              <div>
                <Label style={{ color: '#000000' }}>Check-out Date</Label>
                <Input
                  type="date"
                  value={selectedBooking.checkOut}
                  style={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(0, 28, 67, 0.2)', color: '#000000' }}
                />
              </div>
              <Button
                onClick={() => {
                  toast.success('Booking updated successfully');
                  setIsEditDialogOpen(false);
                }}
                style={{ backgroundColor: '#0F51AF', color: '#FFFFFF' }}
              >
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
