import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Hotel } from 'lucide-react';
import { toast } from '../lib/toast';

// Import icons - using black PNG icons that exist in the project
import bedIcon from '../assets/icons/black/black-bed-icon.png';
import bathIcon from '../assets/icons/black/black-bath-icon.png';
import squareIcon from '../assets/icons/black/black-square-border-icon.png';
import groupIcon from '../assets/icons/black/black-group-icon.png';
import locationIcon from '../assets/icons/black/black-location-icon.png';
import doneIcon from '../assets/icons/black/black-doneTick-icon.png';
import wifiIcon from '../assets/icons/black/black-wifi-icon.png';
import tvIcon from '../assets/icons/black/black-smart-tv-icon.png';
import airIcon from '../assets/icons/black/black-air-icon.png';
import carIcon from '../assets/icons/black/black-car-icon.png';
import breakfastIcon from '../assets/icons/black/black-breakfast-icon.png';
import securityIcon from '../assets/icons/black/black-card-security-icon.png';
import teaIcon from '../assets/icons/black/black-tea-icon.png';

const MIN_IMAGES = 4;
const MAX_IMAGES = 4;

interface RoomDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (roomData: any) => void;
  editingRoom: any | null;
  accommodations: Array<{ id: number; name: string; city: string }>;
}

export const RoomDialog: React.FC<RoomDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  editingRoom,
  accommodations
}) => {
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [newImageUploaded, setNewImageUploaded] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    accommodation_id: '',
    location: '',
    beds: '',
    baths: '',
    area: '',
    capacity: '',
    description: '',
    amenities: [] as string[],
    roomFeatures: [] as string[],
    type: 'Standard',
    price_per_night: '',
    quantity: '1',
    status: 'available'
  });

  const amenitiesList = [
    { label: 'Free High-Speed Wi-Fi', icon: wifiIcon },
    { label: '65" Smart TV', icon: tvIcon },
    { label: 'Climate Control', icon: airIcon },
    { label: 'Complimentary Parking', icon: carIcon },
    { label: 'Breakfast Included', icon: breakfastIcon },
    { label: '24/7 Security', icon: securityIcon },
    { label: 'Room Service', icon: teaIcon }
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

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isOpen && editingRoom) {
      // Populate form with editing room data
      setFormData({
        name: editingRoom.name || '',
        accommodation_id: editingRoom.accommodation_id?.toString() || '',
        location: editingRoom.location || '',
        beds: editingRoom.beds?.toString() || '',
        baths: editingRoom.baths?.toString() || '',
        area: editingRoom.area?.toString() || '',
        capacity: editingRoom.capacity?.toString() || '',
        description: editingRoom.description || '',
        amenities: editingRoom.amenities || [],
        roomFeatures: editingRoom.room_features || [],
        type: editingRoom.type || 'Standard',
        price_per_night: editingRoom.price_per_night?.toString() || '',
        quantity: editingRoom.quantity?.toString() || '1',
        status: editingRoom.status || 'available'
      });

      // Parse and set images
      let photosArray = [];
      if (typeof editingRoom.photos === 'string') {
        try {
          photosArray = JSON.parse(editingRoom.photos);
        } catch (e) {
          console.error('Failed to parse photos:', e);
        }
      } else if (Array.isArray(editingRoom.photos)) {
        photosArray = editingRoom.photos;
      }
      const roomImages = photosArray.map((p: string | { url: string }) => 
        typeof p === 'string' ? p : p.url
      );
      setImagePreviews(roomImages);
      setNewImageUploaded(false);
    } else if (isOpen && !editingRoom) {
      // Reset for new room
      setFormData({
        name: '',
        accommodation_id: '',
        location: '',
        beds: '',
        baths: '',
        area: '',
        capacity: '',
        description: '',
        amenities: [],
        roomFeatures: [],
        type: 'Standard',
        price_per_night: '',
        quantity: '1',
        status: 'available'
      });
      setImagePreviews([]);
      setNewImageUploaded(false);
    }
  }, [isOpen, editingRoom]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const currentCount = imagePreviews.length;
    const remainingSlots = MAX_IMAGES - currentCount;

    if (files.length > remainingSlots) {
      toast.error(`You can only add ${remainingSlots} more image(s). Maximum ${MAX_IMAGES} images allowed.`);
      return;
    }

    const newPreviews: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result as string);
          if (newPreviews.length === files.length) {
            setImagePreviews([...imagePreviews, ...newPreviews]);
            setNewImageUploaded(true);
            toast.success('Image uploaded and compressed');
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
    setNewImageUploaded(true);
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const toggleRoomFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      roomFeatures: prev.roomFeatures.includes(feature)
        ? prev.roomFeatures.filter(f => f !== feature)
        : [...prev.roomFeatures, feature]
    }));
  };

  const handleSave = () => {
    // Validation
    if (!formData.name.trim()) {
      toast.error('Please enter a room name');
      return;
    }
    if (!formData.accommodation_id) {
      toast.error('Please select a hotel location');
      return;
    }
    if (!formData.location.trim()) {
      toast.error('Please enter location/address');
      return;
    }
    if (!formData.beds || parseInt(formData.beds) <= 0) {
      toast.error('Please enter number of beds');
      return;
    }
    if (!formData.baths || parseInt(formData.baths) <= 0) {
      toast.error('Please enter number of bathrooms');
      return;
    }
    if (!formData.area || parseInt(formData.area) <= 0) {
      toast.error('Please enter room size (square meters)');
      return;
    }
    if (!formData.capacity || parseInt(formData.capacity) <= 0) {
      toast.error('Please enter guest capacity');
      return;
    }
    if (imagePreviews.length < MIN_IMAGES) {
      toast.error(`Please upload at least ${MIN_IMAGES} images`);
      return;
    }
    if (!formData.price_per_night || parseFloat(formData.price_per_night) <= 0) {
      toast.error('Please enter a valid price per night');
      return;
    }
    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      toast.error('Please enter available quantity');
      return;
    }

    const roomData = {
      ...formData,
      // Convert string fields to numbers to prevent 400 errors
      beds: parseInt(formData.beds),
      baths: parseInt(formData.baths),
      area: parseInt(formData.area),
      capacity: parseInt(formData.capacity),
      price_per_night: parseFloat(formData.price_per_night),
      quantity: parseInt(formData.quantity),
      accommodation_id: parseInt(formData.accommodation_id),
      photos: imagePreviews,
      newImageUploaded,
      isEditing: !!editingRoom,
      roomId: editingRoom?.id
    };

    onSave(roomData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="bg-white border-0 p-0" 
        style={{ 
          width: '1019px', 
          minWidth: '1019px',
          maxWidth: '1019px',
          height: '90vh', 
          minHeight: '90vh',
          maxHeight: '90vh',
          overflow: 'hidden'
        }}
      >
        <div className="flex flex-col h-full w-full">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-4 z-10 flex-shrink-0">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {editingRoom ? editingRoom.name : 'Add New Accommodation'}
            </DialogTitle>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8 space-y-6" style={{ maxHeight: 'calc(90vh - 140px)', minHeight: 'calc(90vh - 140px)' }}>
          {/* Top Section: Image Upload (Left) + Room Details (Right) */}
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column: Image Gallery - 50% Width */}
            <div className="space-y-4">
              {/* Main Image */}
              {imagePreviews.length > 0 && (
                <div className="relative h-48 rounded-2xl overflow-hidden">
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

              {/* Thumbnail Images Grid */}
              {imagePreviews.length > 1 && (
                <div className="grid grid-cols-3 gap-2">
                  {imagePreviews.slice(1, 4).map((preview, index) => (
                    <div key={index + 1} className="relative group h-24 rounded-xl overflow-hidden">
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
                    <label key={`empty-${index}`} className="h-24 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-primary hover:bg-blue-50 transition-colors">
                      <div className="text-center">
                        <svg className="w-6 h-6 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
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
                <label className="h-80 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-primary hover:bg-blue-50 transition-colors">
                  <div className="text-center">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-base font-medium text-gray-700 mb-1">Upload Images</p>
                    <p className="text-xs text-gray-500">{MIN_IMAGES}-{MAX_IMAGES} images</p>
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

            {/* Right Column: Room Details - 50% Width */}
            <div className="space-y-4">
              {/* Room Name */}
              <div>
                <Label className="text-gray-700 font-semibold mb-2 block">Room Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Presidential Suite"
                  className="text-xl font-bold text-gray-900 border-gray-300 px-4 py-2"
                />
              </div>

              {/* Hotel Location */}
              <div>
                <Label className="text-gray-700 font-semibold mb-2 block">Hotel Location *</Label>
                {accommodations.length === 0 && (
                  <p className="text-sm text-red-600 mb-2">⚠️ No hotels available. Please check backend connection.</p>
                )}
                <div className="flex items-start gap-2">
                  <Hotel className="w-5 h-5 mt-3 flex-shrink-0 text-gray-500" />
                  <Select
                    value={formData.accommodation_id}
                    onValueChange={(value) => {
                      console.log('🏨 Selected accommodation ID:', value);
                      const selectedAccommodation = accommodations.find(acc => acc.id.toString() === value);
                      setFormData({ 
                        ...formData, 
                        accommodation_id: value,
                        // Auto-fill location with just city name
                        location: selectedAccommodation ? selectedAccommodation.city : formData.location
                      });
                    }}
                  >
                    <SelectTrigger className="w-full text-base text-gray-700 border-gray-300 px-4 py-2">
                      <SelectValue placeholder="Select hotel location" />
                    </SelectTrigger>
                    <SelectContent className="z-[9999] bg-white border border-gray-300 shadow-lg max-h-[300px] overflow-auto">
                      {accommodations.length === 0 && (
                        <div className="px-3 py-2 text-gray-500">No hotels available</div>
                      )}
                      {accommodations.map((accommodation) => (
                        <SelectItem key={accommodation.id} value={accommodation.id.toString()}>
                          {accommodation.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Location/Address */}
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
          </div>

          {/* Room Info Grid */}
          <div className="grid grid-cols-4 gap-8">
            <div className="bg-gray-100 rounded-xl p-6 text-center">
              <img src={bedIcon} alt="Beds" className="w-10 h-10 mx-auto mb-3" />
              <Input
                type="number"
                value={formData.beds}
                onChange={(e) => setFormData({ ...formData, beds: e.target.value })}
                className="text-center font-bold text-2xl border-0 bg-transparent mb-2 w-full h-12"
                placeholder="0"
              />
              <p className="text-base text-gray-600 font-medium">beds</p>
            </div>
            <div className="bg-gray-100 rounded-xl p-6 text-center">
              <img src={bathIcon} alt="Baths" className="w-10 h-10 mx-auto mb-3" />
              <Input
                type="number"
                value={formData.baths}
                onChange={(e) => setFormData({ ...formData, baths: e.target.value })}
                className="text-center font-bold text-2xl border-0 bg-transparent mb-2 w-full h-12"
                placeholder="0"
              />
              <p className="text-base text-gray-600 font-medium">baths</p>
            </div>
            <div className="bg-gray-100 rounded-xl p-6 text-center">
              <img src={squareIcon} alt="Area" className="w-10 h-10 mx-auto mb-3" />
              <Input
                type="number"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className="text-center font-bold text-2xl border-0 bg-transparent mb-2 w-full h-12 focus:outline-none focus:ring-0"
                placeholder="0"
              />
              <p className="text-base text-gray-600 font-medium">size</p>
            </div>
            <div className="bg-gray-100 rounded-xl p-6 text-center">
              <img src={groupIcon} alt="Guests" className="w-10 h-10 mx-auto mb-3" />
              <Input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="text-center font-bold text-2xl border-0 bg-transparent mb-2 w-full h-12"
                placeholder="0"
              />
              <p className="text-base text-gray-600 font-medium">Guests</p>
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
                <SelectContent className="bg-white border-gray-300 z-[9999]">
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
            <div>
              <Label className="text-black">Available Quantity *</Label>
              <Input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="10"
                className="bg-white border-gray-300 text-black"
              />
              <p className="text-xs text-gray-500 mt-1">Number of rooms of this type</p>
            </div>
            <div>
              <Label className="text-black">Status *</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger className="bg-white border-gray-300 text-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300 z-[9999]">
                  <SelectItem value="available" className="text-black">Available</SelectItem>
                  <SelectItem value="unavailable" className="text-black">Unavailable</SelectItem>
                  <SelectItem value="maintenance" className="text-black">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 pb-2">
            <Button
              onClick={handleSave}
              className="bg-[#0F51AF] hover:bg-[#0F51AF]/90 text-white flex-1 h-12 text-base font-semibold"
            >
              {editingRoom ? 'Update Room' : 'Save Room'}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 h-12 text-base font-semibold border-gray-300"
            >
              Cancel
            </Button>
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
