import { useState } from 'react';
import { Plus, Edit2, Trash2, Hotel, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { Badge } from '../../components/ui/badge';
import { toast } from '../../lib/toast';
import backgroundImage from '../../assets/image/background/Offers-section.jpeg';

const mockRooms = [
  { id: 1, name: 'Luxury Penthouse', type: 'Premium', price: 8000, location: 'Cape Town', beds: 2, guests: 4, size: 120, available: true, amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Ocean View'] },
  { id: 2, name: 'Executive Suite', type: 'Deluxe', price: 4000, location: 'Johannesburg', beds: 1, guests: 2, size: 75, available: true, amenities: ['WiFi', 'TV', 'Air Conditioning', 'Work Desk'] },
  { id: 3, name: 'Standard Room', type: 'Standard', price: 1200, location: 'Durban', beds: 1, guests: 2, size: 40, available: true, amenities: ['WiFi', 'TV'] },
  { id: 4, name: 'Deluxe Ocean View', type: 'Deluxe', price: 5000, location: 'Durban', beds: 1, guests: 2, size: 85, available: false, amenities: ['WiFi', 'TV', 'Air Conditioning', 'Balcony', 'Ocean View'] },
];

const amenitiesList = ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Ocean View', 'Balcony', 'Work Desk', 'Kitchen', 'Washing Machine', 'Pool Access'];

export function AdminInventory() {
  const [rooms, setRooms] = useState(mockRooms);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<typeof mockRooms[0] | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Standard',
    price: '',
    location: 'Cape Town',
    beds: '1',
    guests: '2',
    size: '',
    available: true,
    amenities: [] as string[],
  });

  const handleOpenDialog = (room?: typeof mockRooms[0]) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        name: room.name,
        type: room.type,
        price: room.price.toString(),
        location: room.location,
        beds: room.beds.toString(),
        guests: room.guests.toString(),
        size: room.size.toString(),
        available: room.available,
        amenities: room.amenities,
      });
    } else {
      setEditingRoom(null);
      setFormData({
        name: '',
        type: 'Standard',
        price: '',
        location: 'Cape Town',
        beds: '1',
        guests: '2',
        size: '',
        available: true,
        amenities: [],
      });
    }
    setIsDialogOpen(true);
  };

  const handleSaveRoom = () => {
    if (!formData.name || !formData.price || !formData.size) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingRoom) {
      setRooms(rooms.map(r => 
        r.id === editingRoom.id 
          ? { 
              ...r, 
              name: formData.name,
              type: formData.type,
              price: parseInt(formData.price),
              location: formData.location,
              beds: parseInt(formData.beds),
              guests: parseInt(formData.guests),
              size: parseInt(formData.size),
              available: formData.available,
              amenities: formData.amenities,
            } 
          : r
      ));
      toast.success('Room updated successfully');
    } else {
      const newRoom = {
        id: Math.max(...rooms.map(r => r.id)) + 1,
        name: formData.name,
        type: formData.type,
        price: parseInt(formData.price),
        location: formData.location,
        beds: parseInt(formData.beds),
        guests: parseInt(formData.guests),
        size: parseInt(formData.size),
        available: formData.available,
        amenities: formData.amenities,
      };
      setRooms([...rooms, newRoom]);
      toast.success('Room added successfully');
    }
    setIsDialogOpen(false);
  };

  const handleDeleteRoom = (roomId: number) => {
    setRooms(rooms.filter(r => r.id !== roomId));
    toast.success('Room deleted successfully');
  };

  const toggleAmenity = (amenity: string) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.includes(amenity)
        ? formData.amenities.filter(a => a !== amenity)
        : [...formData.amenities, amenity],
    });
  };

  return (
    <div className="relative p-4 sm:p-6 space-y-4 sm:space-y-6">
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Room Inventory Management</h1>
          <p className="text-sm text-white mt-1">Add, edit, and manage room listings</p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-blue-primary hover:bg-blue-primary/90 text-white w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Room
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-gray-light border-0">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <Hotel className="h-5 w-5 sm:h-6 sm:w-6 text-blue-primary" />
              <div>
                <p className="text-xs sm:text-sm text-gray-text">Total Rooms</p>
                <p className="text-xl sm:text-2xl font-bold text-black">{rooms.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-light border-0">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <Hotel className="h-5 w-5 sm:h-6 sm:w-6 text-blue-primary" />
              <div>
                <p className="text-xs sm:text-sm text-gray-text">Available</p>
                <p className="text-xl sm:text-2xl font-bold text-black">{rooms.filter(r => r.available).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-light border-0">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-blue-primary" />
              <div>
                <p className="text-xs sm:text-sm text-gray-text">Avg Price</p>
                <p className="text-xl sm:text-2xl font-bold text-black">
                  R {Math.round(rooms.reduce((sum, r) => sum + r.price, 0) / rooms.length).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-light border-0">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <Hotel className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500" />
              <div>
                <p className="text-xs sm:text-sm text-gray-text">Unavailable</p>
                <p className="text-xl sm:text-2xl font-bold text-black">{rooms.filter(r => !r.available).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {rooms.map((room) => (
          <Card key={room.id} className="bg-gray-light border-0">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base sm:text-lg text-black">{room.name}</CardTitle>
                  <p className="text-xs sm:text-sm text-gray-text mt-1">{room.location}</p>
                </div>
                <Badge
                  className={room.available ? 'bg-blue-primary text-white' : 'bg-red-500 text-white'}
                >
                  {room.available ? 'Available' : 'Unavailable'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-text">Type</p>
                  <p className="text-black font-medium">{room.type}</p>
                </div>
                <div>
                  <p className="text-gray-text">Price/Night</p>
                  <p className="text-black font-medium">R {room.price.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-text">Beds</p>
                  <p className="text-black font-medium">{room.beds}</p>
                </div>
                <div>
                  <p className="text-gray-text">Max Guests</p>
                  <p className="text-black font-medium">{room.guests}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-text">Size</p>
                  <p className="text-black font-medium">{room.size}m²</p>
                </div>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-text mb-2">Amenities:</p>
                <div className="flex flex-wrap gap-1">
                  {room.amenities.map((amenity, index) => (
                    <Badge key={index} variant="outline" className="border-blue-primary text-blue-primary text-xs">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  onClick={() => handleOpenDialog(room)}
                  className="bg-blue-primary hover:bg-blue-primary/90 text-white flex-1"
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleDeleteRoom(room.id)}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white border-gray-light max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-black">{editingRoom ? 'Edit Room' : 'Add New Room'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-black">Room Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-white border-gray-300 text-black"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-black">Type *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger className="bg-white border-gray-300 text-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300">
                    <SelectItem value="Standard" className="text-black">Standard</SelectItem>
                    <SelectItem value="Deluxe" className="text-black">Deluxe</SelectItem>
                    <SelectItem value="Premium" className="text-black">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-black">Location *</Label>
                <Select value={formData.location} onValueChange={(value) => setFormData({ ...formData, location: value })}>
                  <SelectTrigger className="bg-white border-gray-300 text-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300">
                    <SelectItem value="Cape Town" className="text-black">Cape Town</SelectItem>
                    <SelectItem value="Johannesburg" className="text-black">Johannesburg</SelectItem>
                    <SelectItem value="Durban" className="text-black">Durban</SelectItem>
                    <SelectItem value="Pretoria" className="text-black">Pretoria</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-black">Price (R) *</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="bg-white border-gray-300 text-black"
                />
              </div>
              <div>
                <Label className="text-black">Beds *</Label>
                <Input
                  type="number"
                  value={formData.beds}
                  onChange={(e) => setFormData({ ...formData, beds: e.target.value })}
                  className="bg-white border-gray-300 text-black"
                />
              </div>
              <div>
                <Label className="text-black">Max Guests *</Label>
                <Input
                  type="number"
                  value={formData.guests}
                  onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                  className="bg-white border-gray-300 text-black"
                />
              </div>
            </div>
            <div>
              <Label className="text-black">Size (m²) *</Label>
              <Input
                type="number"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                className="bg-white border-gray-300 text-black"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.available}
                onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
              />
              <Label className="text-black">Available for Booking</Label>
            </div>
            <div>
              <Label className="text-black mb-2 block">Amenities</Label>
              <div className="grid grid-cols-2 gap-2">
                {amenitiesList.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2 p-2 rounded bg-gray-light">
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => toggleAmenity(amenity)}
                      className="cursor-pointer"
                    />
                    <label className="text-black cursor-pointer" onClick={() => toggleAmenity(amenity)}>
                      {amenity}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSaveRoom}
                className="bg-blue-primary hover:bg-blue-primary/90 text-white"
              >
                {editingRoom ? 'Update Room' : 'Add Room'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-gray-300 text-black"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
