import { useState, useEffect } from 'react';
import { Plus, Hotel, DollarSign } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { toast } from '../../lib/toast';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchRooms, createRoom, updateRoomAsync } from '../../store/slices/roomsSlice';
import backgroundImage from '../../assets/image/background/Offers-section.jpeg';

// Import icons
import starIcon from '../../assets/icons/yellow-star-rate-icon.png';
import heartIcon from '../../assets/icons/yellow-heart-icon.png';
import bathIcon from '../../assets/icons/black/black-bath-icon.png';
import bedIcon from '../../assets/icons/black/black-bed-icon.png';
import locationIcon from '../../assets/icons/black/black-location-icon.png';
import squareIcon from '../../assets/icons/black/black-square-border-icon.png';
import groupIcon from '../../assets/icons/black/black-group-icon.png';
import wifiIcon from '../../assets/icons/black/black-wifi-icon.png';
import carIcon from '../../assets/icons/black/black-car-icon.png';
import breakfastIcon from '../../assets/icons/black/black-breakfast-icon.png';
import tvIcon from '../../assets/icons/black/black-smart-tv-icon.png';
import airIcon from '../../assets/icons/black/black-air-icon.png';
import securityIcon from '../../assets/icons/black/black-card-security-icon.png';
import teaIcon from '../../assets/icons/black/black-tea-icon.png';
import doneIcon from '../../assets/icons/black/black-doneTick-icon.png';

export function AdminInventory() {
  const dispatch = useAppDispatch();
  const { rooms } = useAppSelector((state) => state.rooms);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<typeof rooms[0] | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [newImagesAdded, setNewImagesAdded] = useState(false); // Track if new images were uploaded
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    type: 'Standard',
    price_per_night: '',
    capacity: '4',
    beds: '2',
    baths: '2',
    area: '120',
    refundable: true,
    amenities: [] as string[],
    images: [] as string[],
    roomFeatures: [] as string[],
  });

  const MAX_IMAGES = 5;
  const MIN_IMAGES = 3;

  const amenitiesList = [
    { icon: wifiIcon, label: 'Free High-Speed Wi-Fi' },
    { icon: carIcon, label: 'Complimentary Parking' },
    { icon: breakfastIcon, label: 'Breakfast Included' },
    { icon: tvIcon, label: '65" Smart TV' },
    { icon: airIcon, label: 'Climate Control' },
    { icon: securityIcon, label: '24/7 Security' },
    { icon: teaIcon, label: 'Room Service' },
  ];

  const roomFeaturesList = [
    'King-size beds with premium linens',
    'Separate living and dining areas',
    'Marble bathroom with jacuzzi',
    'Private balcony with city views',
    'Minibar and Nespresso machine',
    'Work desk with ergonomic chair',
    'Blackout curtains',
    'In-room safe',
  ];

  // Fetch rooms on component mount
  useEffect(() => {
    dispatch(fetchRooms());
  }, [dispatch]);

  // Debug: Log rooms when they change
  useEffect(() => {
    console.log('Rooms updated:', rooms);
    if (rooms.length > 0) {
      console.log('First room photos:', rooms[0].photos);
    }
  }, [rooms]);

  const handleOpenDialog = (room?: typeof rooms[0]) => {
    console.log('Opening dialog for:', room ? 'EDIT' : 'CREATE');
    if (room) {
      setEditingRoom(room);
      const roomImages = room.photos?.map((p: { url: string }) => p.url) || [];
      console.log('Loading existing images:', roomImages.length);
      setFormData({
        name: room.name || '',
        location: room.location || '',
        description: room.description || '',
        type: room.type || 'Standard',
        price_per_night: room.price_per_night?.toString() || '',
        capacity: room.capacity?.toString() || '4',
        beds: room.beds?.toString() || '2',
        baths: room.baths?.toString() || '2',
        area: room.area?.toString() || '120',
        refundable: room.refundable !== undefined ? room.refundable : true,
        amenities: room.amenities || [],
        images: roomImages,
        roomFeatures: room.roomFeatures || [],
      });
      setImagePreviews(roomImages);
      setNewImagesAdded(false); // Reset flag when opening edit dialog
      console.log('Flag reset to false');
    } else {
      setEditingRoom(null);
      setFormData({
        name: '',
        location: '',
        description: '',
        type: 'Standard',
        price_per_night: '',
        capacity: '4',
        beds: '2',
        baths: '2',
        area: '120',
        refundable: true,
        amenities: [],
        images: [],
        roomFeatures: [],
      });
      setImagePreviews([]);
      setNewImagesAdded(false); // Reset flag
    }
    setIsDialogOpen(true);
  };

  const toggleAmenity = (amenity: string) => {
    const currentAmenities = formData.amenities || [];
    setFormData({
      ...formData,
      amenities: currentAmenities.includes(amenity)
        ? currentAmenities.filter(a => a !== amenity)
        : [...currentAmenities, amenity],
    });
  };

  const toggleRoomFeature = (feature: string) => {
    const currentFeatures = formData.roomFeatures || [];
    setFormData({
      ...formData,
      roomFeatures: currentFeatures.includes(feature)
        ? currentFeatures.filter(f => f !== feature)
        : [...currentFeatures, feature],
    });
  };

  const handleSaveRoom = async () => {
    if (!formData.name || !formData.price_per_night || !formData.location) {
      toast.error('Please fill in all required fields (Name, Location, and Price)');
      return;
    }

    // Prepare room data
    const roomData = {
      name: formData.name,
      location: formData.location,
      description: formData.description || `${formData.type} room with ${formData.beds} bed(s) and ${formData.baths} bath(s)`,
      type: formData.type,
      capacity: parseInt(formData.capacity),
      beds: parseInt(formData.beds),
      baths: parseInt(formData.baths),
      area: parseInt(formData.area),
      price_per_night: parseFloat(formData.price_per_night),
      refundable: formData.refundable,
      amenities: formData.amenities,
      roomFeatures: formData.roomFeatures,
      // Only include images if new ones were uploaded during this edit session
      images: (editingRoom && !newImagesAdded) ? undefined : (imagePreviews.length > 0 ? imagePreviews : undefined),
    };

    console.log('Saving room:', editingRoom ? 'UPDATE' : 'CREATE');
    console.log('Room data:', JSON.stringify(roomData, null, 2));
    console.log('Images count:', imagePreviews.length);
    console.log('New images added:', newImagesAdded);

    try {
      if (editingRoom) {
        await dispatch(updateRoomAsync({ id: editingRoom.id, data: roomData })).unwrap();
        toast.success('Room updated successfully');
      } else {
        await dispatch(createRoom(roomData)).unwrap();
        toast.success('Room added successfully');
      }
      setIsDialogOpen(false);
      dispatch(fetchRooms());
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string }; status?: number }; message?: string };
      let errorMessage = editingRoom ? 'Failed to update room' : 'Failed to create room';
      
      if (err.response?.status === 403) {
        errorMessage = 'Access denied. Please log in as admin.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Session expired. Please log in again.';
      } else if (err.response?.status === 400) {
        errorMessage = 'Invalid data. Please check all fields.';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast.error(errorMessage);
      console.error('Save room error:', error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check if adding these files would exceed the maximum
    const currentImagesCount = imagePreviews.length;
    const newFilesCount = files.length;
    const totalCount = currentImagesCount + newFilesCount;

    if (totalCount > MAX_IMAGES) {
      toast.error(`You can only upload a maximum of ${MAX_IMAGES} images. Currently you have ${currentImagesCount} image(s).`);
      return;
    }

    // Process each file
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
          
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, compressedImage]
          }));
          setImagePreviews(prev => [...prev, compressedImage]);
          setNewImagesAdded(true); // Mark that new images were added
          console.log('NEW IMAGE UPLOADED - Flag set to TRUE');
          toast.success('Image uploaded and compressed');
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    console.log('IMAGE REMOVED - Flag set to TRUE');
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setNewImagesAdded(true); // Mark that images were modified
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
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
              <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-blue-primary flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-text">Avg Price</p>
                <p className="text-xl sm:text-2xl font-bold text-black">
                  {rooms.length > 0 ? `R ${Math.round(rooms.reduce((sum, r) => sum + r.price_per_night, 0) / rooms.length).toLocaleString()}` : 'N/A'}
                </p>
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
                <p className="text-xl sm:text-2xl font-bold text-black">{rooms.filter(r => r.status === 'available').length}</p>
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
            <div className="relative h-56">
              <img src={(room.photos && room.photos[0]?.url) || '/placeholder-room.svg'} alt={room.name} className="w-full h-full object-cover" />
              
              {/* Type Badge - Top Left */}
              <div className={`absolute top-4 left-4 ${getBadgeColor(room.type || 'Standard')} text-white px-4 py-1.5 rounded-full text-sm font-bold uppercase shadow-lg`}>
                {room.type || 'Standard'}
              </div>

              {/* Rating Badge - Top Right */}
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                <svg className="w-4 h-4 fill-yellow-500" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span className="text-gray-900 font-bold text-sm">5</span>
                <span className="text-gray-500 text-xs">(128)</span>
              </div>

              {/* Favorite Icon - Bottom Right */}
              <div className="absolute bottom-4 right-4">
                <div className="bg-yellow-500 p-2 rounded-full shadow-lg">
                  <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Room Details */}
            <div className="p-5">
              {/* Room Title */}
              <h3 className="text-gray-900 text-xl font-bold mb-2">{room.name}</h3>
              
              {/* Location */}
              <div className="flex items-center gap-2 text-gray-700 mb-4">
                <img src={locationIcon} alt="Location" className="w-5 h-5" />
                <span className="text-base font-medium">{room.location || 'Cape Town'}</span>
              </div>

              {/* Room Features */}
              <div className="flex items-center gap-6 mb-4">
                <div className="flex items-center gap-2">
                  <img src={bedIcon} alt="Beds" className="w-5 h-5" />
                  <span className="text-gray-900 font-semibold">{room.beds}</span>
                </div>
                <div className="flex items-center gap-2">
                  <img src={bathIcon} alt="Baths" className="w-5 h-5" />
                  <span className="text-gray-900 font-semibold">{room.baths || 2}</span>
                </div>
                <div className="flex items-center gap-2">
                  <img src={squareIcon} alt="Area" className="w-5 h-5" />
                  <span className="text-gray-900 font-semibold">{room.area || 120}m²</span>
                </div>
              </div>

              {/* Guest Capacity */}
              <div className="flex items-center gap-2 mb-6 pb-6 border-b border-gray-200">
                <img src={groupIcon} alt="Guests" className="w-5 h-5" />
                <span className="text-gray-900">upto <strong>{room.capacity} guests</strong></span>
              </div>

              {/* Price and Action */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-gray-900 text-3xl font-bold">R{room.price_per_night.toLocaleString()}</span>
                  <p className="text-gray-500 text-sm">per night</p>
                </div>
                <Button
                  onClick={() => handleOpenDialog(room)}
                  className="bg-[#0F51AF] hover:bg-[#0F51AF]/90 text-white px-6 py-6 text-base font-semibold rounded-lg"
                >
                  Edit
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white border-0 max-w-[650px] w-[650px] max-h-[95vh] overflow-y-auto p-0">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
            <DialogTitle className="text-2xl font-bold text-gray-900">{editingRoom ? editingRoom.name : 'Add New Accommodation'}</DialogTitle>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Image Gallery Section */}
            <div className="space-y-4">
              {/* Main Image */}
              {imagePreviews.length > 0 && (
                <div className="relative h-96 rounded-2xl overflow-hidden">
                  <img 
                    src={imagePreviews[0]} 
                    alt="Main room view" 
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(0)}
                    className="absolute top-4 right-4 w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg"
                  >
                    ×
                  </button>
                  {/* Yellow Heart Icon */}
                  <div className="absolute bottom-4 right-4">
                    <div className="bg-yellow-500 p-2 rounded-full shadow-lg">
                      <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* Thumbnail Images Grid - 3 images layout */}
              {imagePreviews.length > 1 && (
                <div className="grid grid-cols-3 gap-3">
                  {imagePreviews.slice(1, 4).map((preview, index) => (
                    <div key={index + 1} className="relative group h-40 rounded-xl overflow-hidden">
                      <img 
                        src={preview} 
                        alt={`Room view ${index + 2}`} 
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index + 1)}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {/* Empty slots for remaining images */}
                  {Array.from({ length: Math.max(0, 3 - (imagePreviews.length - 1)) }).map((_, index) => (
                    <label key={`empty-${index}`} className="h-40 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-primary hover:bg-blue-50 transition-colors">
                      <div className="text-center">
                        <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="text-sm text-gray-500">Add Image</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  ))}
                </div>
              )}

              {/* Upload Button - Show when no images */}
              {imagePreviews.length === 0 && (
                <label className="h-96 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-primary hover:bg-blue-50 transition-colors">
                  <div className="text-center">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-lg font-medium text-gray-700 mb-2">Upload Room Images</p>
                    <p className="text-sm text-gray-500">Click to upload {MIN_IMAGES}-{MAX_IMAGES} images</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Room Title */}
            <div className="space-y-3">
              <div>
                <Label className="text-gray-700 font-semibold mb-2 block">Room Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Presidential Suite"
                  className="text-2xl font-bold text-gray-900 border-gray-300 px-4 py-2"
                />
              </div>
              <div>
                <Label className="text-gray-700 font-semibold mb-2 block">Location/Address *</Label>
                <div className="flex items-start gap-2">
                  <img src={locationIcon} alt="Location" className="w-5 h-5 mt-3 flex-shrink-0" />
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., 45 Loop Street Cape Town City Centre, Cape Town, 8001 South Africa"
                    className="text-base text-gray-700 border-gray-300 px-4 py-2"
                  />
                </div>
              </div>
            </div>

            {/* Room Info Grid */}
            <div className="grid grid-cols-4 gap-6">
              <div className="bg-gray-100 rounded-xl p-4 text-center">
                <img src={bedIcon} alt="Beds" className="w-8 h-8 mx-auto mb-2" />
                <Input
                  type="number"
                  value={formData.beds}
                  onChange={(e) => setFormData({ ...formData, beds: e.target.value })}
                  className="text-center font-bold text-xl border-0 bg-transparent mb-1 w-full"
                />
                <p className="text-sm text-gray-600">beds</p>
              </div>
              <div className="bg-gray-100 rounded-xl p-4 text-center">
                <img src={bathIcon} alt="Baths" className="w-8 h-8 mx-auto mb-2" />
                <Input
                  type="number"
                  value={formData.baths}
                  onChange={(e) => setFormData({ ...formData, baths: e.target.value })}
                  className="text-center font-bold text-xl border-0 bg-transparent mb-1 w-full"
                />
                <p className="text-sm text-gray-600">baths</p>
              </div>
              <div className="bg-gray-100 rounded-xl p-4 text-center">
                <img src={squareIcon} alt="Area" className="w-8 h-8 mx-auto mb-2" />
                <Input
                  type="number"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="text-center font-bold text-xl border-0 bg-transparent mb-1 w-full focus:outline-none focus:ring-0"
                />
                <p className="text-sm text-gray-600">size</p>
              </div>
              <div className="bg-gray-100 rounded-xl p-4 text-center">
                <img src={groupIcon} alt="Guests" className="w-8 h-8 mx-auto mb-2" />
                <Input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className="text-center font-bold text-xl border-0 bg-transparent mb-1 w-full"
                />
                <p className="text-sm text-gray-600">Guests</p>
              </div>
            </div>

            {/* Description Section */}
            <div className="border-t border-b border-gray-200 py-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Description</h3>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Experience the ultimate in luxury with our Presidential Suite. This expansive accommodation features stunning panoramic city views, a private terrace, and a sophisticated design that combines modern elegance with timeless comfort. Perfect for those seeking the finest hospitality experience"
                rows={4}
                className="bg-white border-gray-300 text-gray-700 text-base resize-none"
              />
            </div>

            {/* Amenities Section */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Amenities</h3>
              <div className="grid grid-cols-2 gap-4">
                {amenitiesList.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id={`amenity-${index}`}
                      checked={formData.amenities?.includes(amenity.label) || false}
                      onChange={() => toggleAmenity(amenity.label)}
                      className="w-5 h-5 cursor-pointer"
                    />
                    <label htmlFor={`amenity-${index}`} className="flex items-center gap-2 cursor-pointer">
                      <img src={amenity.icon} alt={amenity.label} className="w-6 h-6" />
                      <span className="text-gray-700">{amenity.label}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Room Features Section */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Room Features</h3>
              <div className="grid grid-cols-2 gap-3">
                {roomFeaturesList.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id={`feature-${index}`}
                      checked={formData.roomFeatures?.includes(feature) || false}
                      onChange={() => toggleRoomFeature(feature)}
                      className="w-5 h-5 cursor-pointer mt-0.5"
                    />
                    <label htmlFor={`feature-${index}`} className="flex items-start gap-2 cursor-pointer">
                      <img src={doneIcon} alt="Done" className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-black">Room Type *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger className="bg-white border-gray-300 text-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300">
                    <SelectItem value="Standard" className="text-black">Standard</SelectItem>
                    <SelectItem value="Deluxe" className="text-black">Deluxe</SelectItem>
                    <SelectItem value="Premium" className="text-black">Premium</SelectItem>
                    <SelectItem value="Suite" className="text-black">Suite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-black">Price per Night (R) *</Label>
                <Input
                  type="number"
                  value={formData.price_per_night}
                  onChange={(e) => setFormData({ ...formData, price_per_night: e.target.value })}
                  placeholder="8000"
                  className="bg-white border-gray-300 text-black"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 sticky bottom-0 bg-white border-t border-gray-200 -mx-6 px-6 pb-6 -mb-6">
              <Button
                onClick={handleSaveRoom}
                className="bg-[#0F51AF] hover:bg-[#0F51AF]/90 text-white flex-1 h-12 text-base font-semibold"
              >
                {editingRoom ? 'Save Changes' : 'Add Accommodation'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-gray-300 text-gray-700 h-12 px-8"
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
