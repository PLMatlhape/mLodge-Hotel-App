import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Hotel, DollarSign, Loader2 } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { toast } from '../../lib/toast';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchAccommodations, createRoom, updateRoomAsync, deleteRoomAsync } from '../../store/slices/roomsSlice';
import backgroundImage from '../../assets/image/background/Offers-section.jpeg';

const amenitiesList = ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Ocean View', 'Balcony', 'Work Desk', 'Kitchen', 'Washing Machine', 'Pool Access'];

export function AdminInventory() {
  const dispatch = useAppDispatch();
  const { rooms, loading, error } = useAppSelector((state) => state.rooms);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Standard',
    price: '',
    location: 'Cape Town',
    beds: '1',
    baths: '1',
    guests: '2',
    size: '',
    rating: '4.5',
    available: true,
    amenities: [] as string[],
    images: [] as string[],
  });

  // Fetch accommodations/rooms on component mount
  useEffect(() => {
    dispatch(fetchAccommodations({ limit: 100 }));
  }, [dispatch]);

  const handleOpenDialog = (room?: any) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        name: room.name,
        type: room.type || 'Standard',
        price: room.price_per_night?.toString() || room.price?.toString() || '',
        location: room.location || room.city || 'Cape Town',
        beds: room.beds?.toString() || '1',
        baths: room.baths?.toString() || '1',
        guests: room.capacity?.toString() || room.guests?.toString() || '2',
        size: room.size?.toString() || '',
        rating: room.rating?.toString() || '4.5',
        available: room.available !== undefined ? room.available : true,
        amenities: room.amenities || [],
        images: room.images || (room.image ? [room.image] : []),
      });
      setImagePreviews(room.images || (room.image ? [room.image] : []));
    } else {
      setEditingRoom(null);
      setFormData({
        name: '',
        type: 'Standard',
        price: '',
        location: 'Cape Town',
        beds: '1',
        baths: '1',
        guests: '2',
        size: '',
        rating: '4.5',
        available: true,
        amenities: [],
        images: [],
      });
      setImagePreviews([]);
    }
    setIsDialogOpen(true);
  };

  const handleSaveRoom = async () => {
    if (!formData.name || !formData.price || !formData.size) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    // Backend expects these exact field names
    const roomData = {
      accommodation_id: 1, // TODO: Get actual accommodation ID or make this selectable
      name: formData.name,
      description: `${formData.type} room in ${formData.location}`, // Generate description
      capacity: parseInt(formData.guests),
      beds: parseInt(formData.beds),
      price_per_night: parseInt(formData.price),
      refundable: true,
      // Additional fields for frontend display (not in backend schema but might be needed)
      type: formData.type,
      location: formData.location,
      baths: parseInt(formData.baths),
      area: parseInt(formData.size),
      rating: parseFloat(formData.rating),
      available: formData.available,
      amenities: formData.amenities,
      image: formData.images[0],
      images: formData.images,
    };

    try {
      if (editingRoom) {
        await dispatch(updateRoomAsync({ id: editingRoom.id, data: roomData })).unwrap();
        toast.success('Room updated successfully');
      } else {
        await dispatch(createRoom(roomData)).unwrap();
        toast.success('Room added successfully');
      }
      setIsDialogOpen(false);
      // Refresh rooms list
      dispatch(fetchAccommodations({ limit: 100 }));
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string }; status?: number }; message?: string };
      let errorMessage = editingRoom ? 'Failed to update room' : 'Failed to create room';
      
      if (err.response?.status === 403) {
        errorMessage = 'Access denied. Please log in as admin.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Session expired. Please log in again.';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast.error(errorMessage);
      console.error('Save room error:', error);
    }
  };

  const handleDeleteRoom = async (roomId: number) => {
    // Add confirmation dialog
    if (!window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
      return;
    }

    try {
      await dispatch(deleteRoomAsync(roomId)).unwrap();
      toast.success('Room deleted successfully');
      // Refresh rooms list
      dispatch(fetchAccommodations({ limit: 100 }));
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string }; status?: number }; message?: string };
      let errorMessage = 'Failed to delete room';
      
      if (err.response?.status === 403) {
        errorMessage = 'Access denied. Please log in as admin.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Session expired. Please log in again.';
      } else if (err.response?.status === 409) {
        errorMessage = 'Cannot delete room with existing bookings';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast.error(errorMessage);
      console.error('Delete room error:', error);
    }
  };

  const toggleAmenity = (amenity: string) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.includes(amenity)
        ? formData.amenities.filter(a => a !== amenity)
        : [...formData.amenities, amenity],
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImages: string[] = [];
    let filesProcessed = 0;

    Array.from(files).forEach((file) => {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload only image files');
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Each image should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          // Compress image to max 800x600 and 80% quality
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions (max 800x600)
          const maxWidth = 800;
          const maxHeight = 600;
          
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = width * ratio;
            height = height * ratio;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with 80% quality
          const compressedImage = canvas.toDataURL('image/jpeg', 0.8);
          newImages.push(compressedImage);
          filesProcessed++;

          if (filesProcessed === files.length) {
            const updatedImages = [...formData.images, ...newImages];
            setFormData({ ...formData, images: updatedImages });
            setImagePreviews(updatedImages);
            toast.success(`${newImages.length} image(s) uploaded and compressed`);
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: updatedImages });
    setImagePreviews(updatedImages);
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'Premium':
        return 'bg-[#00CD07]';
      case 'Deluxe':
        return 'bg-[#00CD07]';
      case 'Business':
        return 'bg-[#00CD07]';
      case 'Standard':
        return 'bg-[#00CD07]';
      default:
        return 'bg-[#0F51AF]';
    }
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
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <Hotel className="h-5 w-5 sm:h-6 sm:w-6 text-blue-primary flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-text">Total Rooms</p>
                <p className="text-xl sm:text-2xl font-bold text-black">{rooms.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <Hotel className="h-5 w-5 sm:h-6 sm:w-6 text-blue-primary flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-text">Available</p>
                <p className="text-xl sm:text-2xl font-bold text-black">{rooms.filter(r => r.available).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-blue-primary flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-text">Avg Price</p>
                <p className="text-xl sm:text-2xl font-bold text-black">
                  R {Math.round(rooms.reduce((sum, r) => sum + r.price, 0) / rooms.length).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <Hotel className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-text">Unavailable</p>
                <p className="text-xl sm:text-2xl font-bold text-black">{rooms.filter(r => !r.available).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {rooms.map((room) => (
          <div key={room.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
            {/* Room Image */}
            <div className="relative h-48">
              <img src={room.image || '/placeholder-room.jpg'} alt={room.name} className="w-full h-full object-cover" />
              
              {/* Type Badge */}
              <div className={`absolute top-3 left-3 ${getBadgeColor(room.type)} text-white px-3 py-1 rounded-lg text-xs font-semibold uppercase`}>
                {room.type}
              </div>

              {/* Rating */}
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-gray-900 font-semibold text-sm">{room.rating}</span>
              </div>

              {/* Availability Status */}
              <div className={`absolute bottom-3 right-3 ${room.available ? 'bg-blue-primary' : 'bg-red-500'} text-white px-3 py-1 rounded-lg text-xs font-semibold`}>
                {room.available ? 'Available' : 'Unavailable'}
              </div>
            </div>

            {/* Room Details */}
            <div className="p-4">
              <h3 className="text-gray-900 text-lg font-bold mb-1">{room.name}</h3>
              <div className="flex items-center gap-1 text-gray-600 text-sm mb-3">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                {room.location}
              </div>

              {/* Room Features */}
              <div className="flex items-center gap-4 mb-3 text-gray-600 text-sm">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/>
                  </svg>
                  {room.beds}
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 10h-2V4.5C19 3.12 17.88 2 16.5 2S14 3.12 14 4.5V6H9V4.5C9 3.12 7.88 2 6.5 2S4 3.12 4 4.5V10H2v2h2v10h16V12h2v-2zM6 4.5c0-.28.22-.5.5-.5s.5.22.5.5V10H6V4.5zm10 0c0-.28.22-.5.5-.5s.5.22.5.5V10h-1V4.5zM6 20v-8h12v8H6z"/>
                  </svg>
                  {room.baths}
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                  </svg>
                  {room.guests}
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 14H9v-2h2v2zm0-4H9v-2h2v2zm0-4H9V7h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/>
                  </svg>
                  {room.area || room.size || 'N/A'}m²
                </div>
              </div>

              {/* Amenities */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Amenities:</p>
                <div className="flex flex-wrap gap-1.5">
                  {room.amenities && room.amenities.length > 0 ? (
                    <>
                      {room.amenities.slice(0, 3).map((amenity, index) => (
                        <span key={index} className="text-xs bg-blue-50 text-blue-primary px-2 py-1 rounded border border-blue-primary">
                          {amenity}
                        </span>
                      ))}
                      {room.amenities.length > 3 && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          +{room.amenities.length - 3} more
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-xs text-gray-400">No amenities listed</span>
                  )}
                </div>
              </div>

              {/* Price and Actions */}
              <div className="flex items-center justify-between pt-3 border-t">
                <div>
                  <span className="text-gray-900 text-2xl font-bold">R{room.price.toLocaleString()}</span>
                  <span className="text-gray-500 text-sm ml-1">per night</span>
                </div>
              </div>

              {/* Admin Action Buttons */}
              <div className="flex gap-2 mt-3">
                <Button
                  onClick={() => handleOpenDialog(room)}
                  className="bg-blue-primary hover:bg-blue-primary/90 text-white flex-1 h-10"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  onClick={() => handleDeleteRoom(room.id)}
                  className="bg-red-500 hover:bg-red-600 text-white h-10 px-4"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
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
                <Label className="text-black">Baths *</Label>
                <Input
                  type="number"
                  value={formData.baths}
                  onChange={(e) => setFormData({ ...formData, baths: e.target.value })}
                  className="bg-white border-gray-300 text-black"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-black">Max Guests *</Label>
                <Input
                  type="number"
                  value={formData.guests}
                  onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                  className="bg-white border-gray-300 text-black"
                />
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
              <div>
                <Label className="text-black">Rating *</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  className="bg-white border-gray-300 text-black"
                />
              </div>
            </div>

            {/* Image Upload Section */}
            <div>
              <Label className="text-black mb-2 block">Room Images * (Upload 3 or more)</Label>
              <div className="space-y-3">
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {imagePreviews.map((img, index) => (
                      <div key={index} className="relative group">
                        <div className="relative h-32 rounded-lg overflow-hidden border-2 border-gray-300">
                          <img 
                            src={img} 
                            alt={`Room preview ${index + 1}`} 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-1 left-1 bg-black/70 text-white px-2 py-0.5 rounded text-xs">
                            {index === 0 ? 'Main' : `#${index + 1}`}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <label className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-primary hover:bg-blue-primary/90 text-white rounded-lg transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{imagePreviews.length > 0 ? 'Add More Images' : 'Upload Images'}</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      aria-label="Upload room images"
                    />
                  </label>
                  {imagePreviews.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, images: [] });
                        setImagePreviews([]);
                      }}
                      className="px-4 py-2 border-2 border-red-500 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Upload high-quality images (Max 5MB each, JPG/PNG). First image will be the main display.
                </p>
                <p className="text-xs text-gray-600 font-medium">
                  {imagePreviews.length} image(s) uploaded {imagePreviews.length < 3 && '(Minimum 3 recommended)'}
                </p>
              </div>
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
