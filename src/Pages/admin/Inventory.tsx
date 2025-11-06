import { useState, useEffect } from 'react';
import { Plus, Hotel, DollarSign } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { RoomDialog } from '../../components/RoomDialog';
import { toast } from '../../lib/toast';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchRooms, createRoom, updateRoomAsync, deleteRoomAsync } from '../../store/slices/roomsSlice';
import { accommodationsAPI } from '../../services/api';
import backgroundImage from '../../assets/image/background/Offers-section.jpeg';
// Icons used in room cards display
import bathIcon from '../../assets/icons/black/black-bath-icon.png';
import bedIcon from '../../assets/icons/black/black-bed-icon.png';
import locationIcon from '../../assets/icons/black/black-location-icon.png';
import squareIcon from '../../assets/icons/black/black-square-border-icon.png';
import groupIcon from '../../assets/icons/black/black-group-icon.png';

export function AdminInventory() {
  const dispatch = useAppDispatch();
  const { rooms } = useAppSelector((state) => state.rooms);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<typeof rooms[0] | null>(null);
  const [accommodations, setAccommodations] = useState<Array<{ id: number; name: string; city: string }>>([]);

  // Fetch rooms on component mount
  useEffect(() => {
    dispatch(fetchRooms());
  }, [dispatch]);

  // Fetch accommodations
  useEffect(() => {
    const fetchAccommodations = async () => {
      try {
        console.log('🔍 Fetching accommodations from API...');
        const response = await accommodationsAPI.getAll();
        console.log('📡 Full API Response:', response);
        console.log('📡 Response.data:', response.data);
        
        // Handle response structure - API returns { success, data: [...] }
        let accommodationsArray: any[] = [];
        const responseData = response.data as any;
        
        if (Array.isArray(responseData)) {
          // Direct array
          accommodationsArray = responseData;
        } else if (responseData && Array.isArray(responseData.data)) {
          // Nested data property { success: true, data: [...] }
          accommodationsArray = responseData.data;
        }
        
        const accommodationsData = accommodationsArray.map((acc: any) => ({
          id: acc.id,
          name: acc.name,
          city: acc.city
        }));
        
        console.log('📍 Accommodations loaded:', accommodationsData);
        console.log('📍 Count:', accommodationsData.length);
        setAccommodations(accommodationsData);
        
        if (accommodationsData.length === 0) {
          console.warn('⚠️ No accommodations found in response');
          toast.error('No hotel locations found. Please contact administrator.');
        }
      } catch (error: any) {
        console.error('❌ Error fetching accommodations:', error);
        console.error('❌ Error details:', error?.response || error?.message);
        toast.error('Failed to load hotel locations. Please check if backend server is running.');
      }
    };
    fetchAccommodations();
  }, []);

  // Debug: Log accommodations when dialog opens
  useEffect(() => {
    if (isDialogOpen) {
      console.log('🏨 Dialog opened. Current accommodations:', accommodations);
      console.log('🏨 Accommodations count:', accommodations.length);
    }
  }, [isDialogOpen, accommodations]);

  const handleOpenDialog = (room?: typeof rooms[0]) => {
    console.log('Opening dialog for:', room ? 'EDIT' : 'CREATE');
    setEditingRoom(room || null);
    setIsDialogOpen(true);
  };

  const handleSaveRoom = async (roomData: any) => {
    console.log('Saving room:', roomData.isEditing ? 'UPDATE' : 'CREATE');
    console.log('Room data:', JSON.stringify(roomData, null, 2));
    console.log('Images count:', roomData.photos?.length || 0);

    // Prepare API payload
    const apiData = {
      name: roomData.name,
      location: roomData.location,
      description: roomData.description || `${roomData.type} room with ${roomData.beds} bed(s) and ${roomData.baths} bath(s)`,
      type: roomData.type,
      capacity: parseInt(roomData.capacity),
      beds: parseInt(roomData.beds),
      baths: parseInt(roomData.baths),
      area: parseInt(roomData.area),
      price_per_night: parseFloat(roomData.price_per_night),
      quantity: parseInt(roomData.quantity),
      status: roomData.status,
      refundable: roomData.refundable,
      accommodation_id: parseInt(roomData.accommodation_id),
      amenities: roomData.amenities,
      roomFeatures: roomData.roomFeatures,
      images: roomData.photos,
    };

    try {
      if (roomData.isEditing && roomData.roomId) {
        await dispatch(updateRoomAsync({ id: roomData.roomId, data: apiData })).unwrap();
        toast.success('Room updated successfully');
      } else {
        await dispatch(createRoom(apiData)).unwrap();
        toast.success('Room added successfully');
      }
      setIsDialogOpen(false);
      setEditingRoom(null);
      dispatch(fetchRooms());
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string }; status?: number }; message?: string };
      let errorMessage = roomData.isEditing ? 'Failed to update room' : 'Failed to create room';
      
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

  const handleDeleteRoom = async (roomId: number) => {
    if (!window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
      return;
    }

    try {
      await dispatch(deleteRoomAsync(roomId)).unwrap();
      toast.success('Room deleted successfully');
      dispatch(fetchRooms());
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string }; status?: number }; message?: string };
      let errorMessage = 'Failed to delete room';
      
      if (err.response?.status === 403) {
        errorMessage = 'Access denied. Please log in as admin.';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast.error(errorMessage);
      console.error('Delete room error:', error);
    }
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
              
              {/* Hotel Location Badge */}
              {room.accommodation_city && (
                <div className="flex items-center gap-2 mb-2">
                  <Hotel className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    {room.accommodation_city}
                  </span>
                </div>
              )}
              
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
              <div className="flex items-center justify-between gap-2 mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <img src={groupIcon} alt="Guests" className="w-5 h-5" />
                  <span className="text-gray-900">upto <strong>{room.capacity} guests</strong></span>
                </div>
                {room.quantity && (
                  <div className="bg-blue-50 px-3 py-1 rounded-full">
                    <span className="text-blue-700 text-sm font-semibold">{room.quantity} available</span>
                  </div>
                )}
              </div>

              {/* Price and Action */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-gray-900 text-3xl font-bold">R{room.price_per_night.toLocaleString()}</span>
                  <p className="text-gray-500 text-sm">per night</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleOpenDialog(room)}
                    className="bg-[#0F51AF] hover:bg-[#0F51AF]/90 text-white px-4 py-2 text-sm font-semibold rounded-lg"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDeleteRoom(room.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 text-sm font-semibold rounded-lg"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Room Dialog Component */}
      <RoomDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveRoom}
        editingRoom={editingRoom}
        accommodations={accommodations}
      />
    </div>
  );
}
