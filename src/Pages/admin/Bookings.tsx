import { useState } from 'react';
import { Search, Edit2, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { toast } from '../../lib/toast';

const mockBookings = [
  { id: 'BK-2025-1234', guest: 'John Doe', email: 'john@example.com', room: 'Luxury Penthouse', roomType: 'Premium', checkIn: '2025-10-25', checkOut: '2025-10-28', nights: 3, amount: 24000, status: 'Confirmed', date: '2025-10-19' },
  { id: 'BK-2025-1233', guest: 'Jane Smith', email: 'jane@example.com', room: 'Deluxe Ocean View', roomType: 'Deluxe', checkIn: '2025-10-24', checkOut: '2025-10-26', nights: 2, amount: 10000, status: 'Confirmed', date: '2025-10-18' },
  { id: 'BK-2025-1232', guest: 'Mike Johnson', email: 'mike@example.com', room: 'Standard Suite', roomType: 'Standard', checkIn: '2025-10-25', checkOut: '2025-10-25', nights: 2, amount: 2400, status: 'Pending', date: '2025-10-19' },
  { id: 'BK-2025-1231', guest: 'Sarah Williams', email: 'sarah@example.com', room: 'Presidential Suite', roomType: 'Premium', checkIn: '2025-10-22', checkOut: '2025-10-24', nights: 2, amount: 15900, status: 'Confirmed', date: '2025-10-17' },
  { id: 'BK-2025-1230', guest: 'David Brown', email: 'david@example.com', room: 'Deluxe City View', roomType: 'Deluxe', checkIn: '2025-10-21', checkOut: '2025-10-23', nights: 2, amount: 8000, status: 'Checked-in', date: '2025-10-16' },
  { id: 'BK-2025-1229', guest: 'Emily Davis', email: 'emily@example.com', room: 'Standard Room', roomType: 'Standard', checkIn: '2025-10-20', checkOut: '2025-10-22', nights: 2, amount: 1600, status: 'Completed', date: '2025-10-15' },
  { id: 'BK-2025-1228', guest: 'Robert Wilson', email: 'robert@example.com', room: 'Family Suite', roomType: 'Deluxe', checkIn: '2025-10-19', checkOut: '2025-10-22', nights: 3, amount: 9600, status: 'Cancelled', date: '2025-10-14' },
  { id: 'BK-2025-1227', guest: 'Lisa Anderson', email: 'lisa@example.com', room: 'Luxury Penthouse', roomType: 'Premium', checkIn: '2025-10-18', checkOut: '2025-10-20', nights: 2, amount: 16000, status: 'Completed', date: '2025-10-13' },
];

export function AdminBookings() {
  const [bookings, setBookings] = useState(mockBookings);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRoomType, setFilterRoomType] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<typeof mockBookings[0] | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guest.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    const matchesRoomType = filterRoomType === 'all' || booking.roomType === filterRoomType;

    return matchesSearch && matchesStatus && matchesRoomType;
  });

  const handleEditBooking = (booking: typeof mockBookings[0]) => {
    setSelectedBooking(booking);
    setIsEditDialogOpen(true);
  };

  const handleUpdateStatus = (bookingId: string, newStatus: string) => {
    setBookings(bookings.map(b => 
      b.id === bookingId ? { ...b, status: newStatus } : b
    ));
    toast.success('Booking status updated');
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
