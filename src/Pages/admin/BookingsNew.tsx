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
import backgroundImage from '../../assets/image/background/Offers-section.jpeg';

const mockBookings = [
  { id: 'BK-2025-1234', guest: 'John Doe', email: 'john@example.com', room: 'Luxury Penthouse', roomType: 'Premium', checkIn: '2025-10-25', checkOut: '2025-10-28', nights: 3, amount: 24000, status: 'Confirmed', date: '2025-10-19' },
  { id: 'BK-2025-1233', guest: 'Jane Smith', email: 'jane@example.com', room: 'Deluxe Ocean View', roomType: 'Deluxe', checkIn: '2025-10-24', checkOut: '2025-10-26', nights: 2, amount: 10000, status: 'Confirmed', date: '2025-10-18' },
  { id: 'BK-2025-1232', guest: 'Mike Johnson', email: 'mike@example.com', room: 'Standard Suite', roomType: 'Standard', checkIn: '2025-10-23', checkOut: '2025-10-25', nights: 2, amount: 2400, status: 'Pending', date: '2025-10-19' },
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
    <div className="relative p-4 sm:p-6 space-y-4 sm:space-y-6 min-h-screen">
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
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-white">Bookings Management</h1>
        <p className="text-sm sm:text-base text-white">View and manage all hotel bookings</p>
      </div>

      {/* Filters */}
      <Card className="bg-gray-light border-gray-text/20">
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="sm:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-text" />
                <Input
                  placeholder="Search by reference, guest name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-gray-text/20 text-black text-sm"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="bg-white border-gray-text/20 text-black text-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-light border-gray-text/20">
                <SelectItem value="all" className="text-black">All Statuses</SelectItem>
                <SelectItem value="Confirmed" className="text-black">Confirmed</SelectItem>
                <SelectItem value="Pending" className="text-black">Pending</SelectItem>
                <SelectItem value="Checked-in" className="text-black">Checked-in</SelectItem>
                <SelectItem value="Completed" className="text-black">Completed</SelectItem>
                <SelectItem value="Cancelled" className="text-black">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterRoomType} onValueChange={setFilterRoomType}>
              <SelectTrigger className="bg-white border-gray-text/20 text-black text-sm">
                <SelectValue placeholder="Room Type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-light border-gray-text/20">
                <SelectItem value="all" className="text-black">All Types</SelectItem>
                <SelectItem value="Premium" className="text-black">Premium</SelectItem>
                <SelectItem value="Deluxe" className="text-black">Deluxe</SelectItem>
                <SelectItem value="Standard" className="text-black">Standard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card className="bg-gray-light border-gray-text/20">
        <CardHeader>
          <CardTitle className="text-black text-lg sm:text-xl">All Bookings ({filteredBookings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-text/20">
                  <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-gray-text text-xs sm:text-sm font-medium">Reference</th>
                  <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-gray-text text-xs sm:text-sm font-medium">Guest</th>
                  <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-gray-text text-xs sm:text-sm font-medium">Room</th>
                  <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-gray-text text-xs sm:text-sm font-medium">Check-in</th>
                  <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-gray-text text-xs sm:text-sm font-medium">Nights</th>
                  <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-gray-text text-xs sm:text-sm font-medium">Amount</th>
                  <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-gray-text text-xs sm:text-sm font-medium">Status</th>
                  <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-gray-text text-xs sm:text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => {
                  const statusColor = getStatusColor(booking.status);
                  return (
                    <tr key={booking.id} className="border-b border-gray-text/10 hover:bg-white/50 transition-colors">
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-black text-xs sm:text-sm font-medium">{booking.id}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4">
                        <div>
                          <div className="text-black text-xs sm:text-sm font-medium">{booking.guest}</div>
                          <div className="text-gray-text text-xs">{booking.email}</div>
                        </div>
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4">
                        <div>
                          <div className="text-black text-xs sm:text-sm">{booking.room}</div>
                          <div className="text-gray-text text-xs">{booking.roomType}</div>
                        </div>
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-gray-text text-xs sm:text-sm">{booking.checkIn}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-black text-xs sm:text-sm font-medium">{booking.nights}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-black text-xs sm:text-sm font-medium">R {booking.amount.toLocaleString()}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4">
                        <Badge
                          className="text-xs"
                          style={{
                            backgroundColor: statusColor.bg,
                            color: statusColor.text,
                          }}
                        >
                          {booking.status}
                        </Badge>
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4 text-blue-primary" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-gray-light border-gray-text/20">
                            <DropdownMenuItem onClick={() => handleEditBooking(booking)} className="text-black text-xs sm:text-sm cursor-pointer">
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(booking.id, 'Confirmed')} className="text-black text-xs sm:text-sm cursor-pointer">
                              Confirm Booking
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(booking.id, 'Checked-in')} className="text-black text-xs sm:text-sm cursor-pointer">
                              Check-in
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(booking.id, 'Completed')} className="text-black text-xs sm:text-sm cursor-pointer">
                              Complete
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(booking.id, 'Cancelled')} className="text-black text-xs sm:text-sm cursor-pointer">
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
        <DialogContent className="bg-gray-light border-gray-text/20 max-w-md mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="text-black text-lg sm:text-xl">Edit Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div>
                <Label className="text-black text-sm">Guest Name</Label>
                <Input
                  value={selectedBooking.guest}
                  className="bg-white border-gray-text/20 text-black mt-1"
                />
              </div>
              <div>
                <Label className="text-black text-sm">Check-in Date</Label>
                <Input
                  type="date"
                  value={selectedBooking.checkIn}
                  className="bg-white border-gray-text/20 text-black mt-1"
                />
              </div>
              <div>
                <Label className="text-black text-sm">Check-out Date</Label>
                <Input
                  type="date"
                  value={selectedBooking.checkOut}
                  className="bg-white border-gray-text/20 text-black mt-1"
                />
              </div>
              <Button
                onClick={() => {
                  toast.success('Booking updated successfully');
                  setIsEditDialogOpen(false);
                }}
                className="w-full bg-blue-primary text-white hover:bg-blue-primary/90"
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
