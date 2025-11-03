# Inventory System Redesign - Implementation Plan
**Date:** November 3, 2025  
**Project:** mLodge Hotel Application  
**Feature:** Unified Admin-to-Client Inventory System

---

## 📋 Overview

### Current System Issues
- ❌ Disconnected inventory between admin and client
- ❌ No real-time availability tracking
- ❌ Manual synchronization required
- ❌ Confusing booking status management

### New System Goals
✅ **Single Source of Truth**: Admin adds rooms/accommodations → Automatically available to clients  
✅ **Real-Time Availability**: Rooms flagged as "booked" when reserved  
✅ **Automatic Status Updates**: Rooms become available after checkout  
✅ **Unified Database**: One inventory system for both admin and clients

---

## 🏗️ Architecture Design

### Data Flow
```
Admin Panel (Add Room) 
    ↓
Database (rooms table)
    ↓
Client Dashboard (Display Available Rooms)
    ↓
User Books Room
    ↓
Database (Mark as booked + Create booking record)
    ↓
Client Dashboard (Show "Booked" status)
    ↓
Checkout (Manual or Automatic)
    ↓
Database (Mark as available again)
    ↓
Client Dashboard (Room available for booking)
```

---

## 🗄️ Database Schema Changes

### 1. Rooms Table Enhancement

**Current Schema:**
```sql
CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    accommodation_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    capacity INTEGER NOT NULL,
    beds INTEGER NOT NULL,
    price_per_night NUMERIC(10,2) NOT NULL,
    refundable BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**New Enhanced Schema:**
```sql
-- Add new columns for booking status tracking
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'available';
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS current_booking_id INTEGER;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'Standard';

-- Status values: 'available', 'booked', 'maintenance', 'inactive'
-- Add constraint
ALTER TABLE rooms ADD CONSTRAINT rooms_status_check 
    CHECK (status IN ('available', 'booked', 'maintenance', 'inactive'));

-- Add index for faster availability queries
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_accommodation_status ON rooms(accommodation_id, status);
```

### 2. Bookings Table Enhancement

**Add checkout tracking:**
```sql
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS checked_in BOOLEAN DEFAULT false;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS checked_out BOOLEAN DEFAULT false;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS auto_checkout_date TIMESTAMP;

-- Add trigger for automatic checkout
CREATE OR REPLACE FUNCTION auto_checkout_check()
RETURNS TRIGGER AS $$
BEGIN
    -- If checkout date has passed and not checked out, mark as completed
    IF NEW.check_out_date < CURRENT_DATE AND NEW.checked_out = false THEN
        NEW.status = 'completed';
        NEW.checked_out = true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bookings_auto_checkout
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION auto_checkout_check();
```

### 3. Room Availability View

**Create a view for easy availability checking:**
```sql
CREATE OR REPLACE VIEW room_availability AS
SELECT 
    r.id,
    r.accommodation_id,
    r.name,
    r.description,
    r.capacity,
    r.beds,
    r.price_per_night,
    r.refundable,
    r.quantity,
    r.type,
    r.status,
    a.name as accommodation_name,
    a.city as accommodation_city,
    CASE 
        WHEN r.status = 'available' THEN r.quantity
        ELSE 0
    END as available_quantity,
    COALESCE(
        (SELECT COUNT(*) 
         FROM bookings b 
         JOIN booking_items bi ON bi.booking_id = b.id 
         WHERE bi.room_id = r.id 
         AND b.status IN ('confirmed', 'pending')
         AND b.check_out_date >= CURRENT_DATE
        ), 0
    ) as active_bookings
FROM rooms r
LEFT JOIN accommodations a ON a.id = r.accommodation_id
WHERE r.is_active = true;
```

---

## 🔧 Backend API Changes

### 1. Room Management Endpoints (Admin)

**CREATE Room - Enhanced**
```typescript
// POST /api/rooms
router.post('/', [
  authenticateToken,
  requireAdmin,
  body('accommodation_id').isInt(),
  body('name').trim().notEmpty(),
  body('description').optional().trim(),
  body('type').optional().isIn(['Standard', 'Delux', 'Premium', 'Business']),
  body('capacity').isInt({ min: 1 }),
  body('beds').isInt({ min: 1 }),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('price_per_night').isFloat({ min: 0 }),
  body('refundable').optional().isBoolean()
], async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const {
      accommodation_id,
      name,
      description,
      type = 'Standard',
      capacity,
      beds,
      quantity = 1,
      price_per_night,
      refundable = true
    } = req.body;

    const result = await db.query(
      `INSERT INTO rooms (
        accommodation_id, name, description, type, capacity, beds, 
        quantity, price_per_night, refundable, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        accommodation_id, name, description, type, capacity, beds,
        quantity, price_per_night, refundable, 'available'
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});
```

**UPDATE Room Status (Admin)**
```typescript
// PATCH /api/rooms/:id/status
router.patch('/:id/status', [
  authenticateToken,
  requireAdmin,
  body('status').isIn(['available', 'booked', 'maintenance', 'inactive'])
], async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await db.query(
      `UPDATE rooms 
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating room status:', error);
    res.status(500).json({ error: 'Failed to update room status' });
  }
});
```

### 2. Availability Check Endpoint (Public)

**GET Available Rooms**
```typescript
// GET /api/rooms/available
router.get('/available', [
  query('checkIn').optional().isISO8601(),
  query('checkOut').optional().isISO8601(),
  query('accommodation_id').optional().isInt(),
  query('guests').optional().isInt({ min: 1 })
], async (req: Request, res: Response): Promise<void> => {
  try {
    const { checkIn, checkOut, accommodation_id, guests } = req.query;

    let queryText = `
      SELECT 
        r.*,
        a.name as accommodation_name,
        a.city as accommodation_city,
        a.address as accommodation_address,
        COALESCE(r.quantity, 1) as total_quantity,
        (
          SELECT COALESCE(SUM(bi.quantity), 0)
          FROM booking_items bi
          JOIN bookings b ON b.id = bi.booking_id
          WHERE bi.room_id = r.id
          AND b.status IN ('confirmed', 'pending')
          ${checkIn && checkOut ? `
          AND (
            (b.check_in_date <= $1 AND b.check_out_date >= $1) OR
            (b.check_in_date <= $2 AND b.check_out_date >= $2) OR
            (b.check_in_date >= $1 AND b.check_out_date <= $2)
          )` : 'AND b.check_out_date >= CURRENT_DATE'}
        ) as booked_quantity,
        (
          COALESCE(r.quantity, 1) - (
            SELECT COALESCE(SUM(bi.quantity), 0)
            FROM booking_items bi
            JOIN bookings b ON b.id = bi.booking_id
            WHERE bi.room_id = r.id
            AND b.status IN ('confirmed', 'pending')
            ${checkIn && checkOut ? `
            AND (
              (b.check_in_date <= $1 AND b.check_out_date >= $1) OR
              (b.check_in_date <= $2 AND b.check_out_date >= $2) OR
              (b.check_in_date >= $1 AND b.check_out_date <= $2)
            )` : 'AND b.check_out_date >= CURRENT_DATE'}
          )
        ) as available_quantity
      FROM rooms r
      LEFT JOIN accommodations a ON a.id = r.accommodation_id
      WHERE r.is_active = true
      AND r.status IN ('available', 'booked')
    `;

    const params: (string | number)[] = [];
    
    if (checkIn && checkOut) {
      params.push(checkIn as string, checkOut as string);
    }

    if (accommodation_id) {
      queryText += ` AND r.accommodation_id = $${params.length + 1}`;
      params.push(Number(accommodation_id));
    }

    if (guests) {
      queryText += ` AND r.capacity >= $${params.length + 1}`;
      params.push(Number(guests));
    }

    queryText += ` 
      ORDER BY available_quantity DESC, r.price_per_night ASC
    `;

    const result = await db.query(queryText, params);

    // Filter out rooms with 0 availability
    const availableRooms = result.rows.filter(
      (room: { available_quantity: number }) => room.available_quantity > 0
    );

    res.json(availableRooms);
  } catch (error) {
    console.error('Error fetching available rooms:', error);
    res.status(500).json({ error: 'Failed to fetch available rooms' });
  }
});
```

### 3. Booking System Updates

**Enhanced Booking Creation with Room Status Update**
```typescript
// POST /api/bookings - Enhanced
router.post('/', [
  authenticateToken,
  body('accommodation_id').isInt(),
  body('check_in_date').isISO8601(),
  body('check_out_date').isISO8601(),
  body('rooms').isArray({ min: 1 }),
  body('rooms.*.room_id').isInt(),
  body('rooms.*.quantity').isInt({ min: 1 }),
  // ... other validations
], async (req: AuthRequest, res: Response): Promise<void> => {
  const client = await db.getClient();
  
  try {
    // Validation...
    await client.query('BEGIN');

    // Check availability (enhanced)
    for (const room of rooms) {
      const availabilityCheck = await client.query(
        `SELECT 
          r.id,
          r.name,
          COALESCE(r.quantity, 1) as total_quantity,
          COALESCE(
            (SELECT SUM(bi.quantity)
             FROM booking_items bi
             JOIN bookings b ON b.id = bi.booking_id
             WHERE bi.room_id = r.id
             AND b.status IN ('confirmed', 'pending')
             AND (
               (b.check_in_date <= $2 AND b.check_out_date >= $2) OR
               (b.check_in_date <= $3 AND b.check_out_date >= $3) OR
               (b.check_in_date >= $2 AND b.check_out_date <= $3)
             )
            ), 0
          ) as booked_quantity
         FROM rooms r
         WHERE r.id = $1 AND r.is_active = true`,
        [room.room_id, check_in_date, check_out_date]
      );

      if (availabilityCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        res.status(404).json({ error: `Room ${room.room_id} not found or inactive` });
        return;
      }

      const { total_quantity, booked_quantity } = availabilityCheck.rows[0];
      const available = total_quantity - booked_quantity;

      if (available < room.quantity) {
        await client.query('ROLLBACK');
        res.status(400).json({
          error: `Insufficient rooms available. Room: ${availabilityCheck.rows[0].name}, Available: ${available}, Requested: ${room.quantity}`
        });
        return;
      }
    }

    // Create booking (existing logic)
    const bookingResult = await client.query(
      `INSERT INTO bookings (...)
       VALUES (...)
       RETURNING *`,
      [...]
    );

    const booking = bookingResult.rows[0];

    // Create booking items
    for (const room of roomDetails) {
      await client.query(
        `INSERT INTO booking_items (booking_id, room_id, quantity, price_per_night)
         VALUES ($1, $2, $3, $4)`,
        [booking.id, room.room_id, room.quantity, room.price_per_night]
      );

      // Update room status if all quantities are booked
      await client.query(
        `UPDATE rooms 
         SET status = CASE 
           WHEN (
             SELECT COALESCE(SUM(bi.quantity), 0)
             FROM booking_items bi
             JOIN bookings b ON b.id = bi.booking_id
             WHERE bi.room_id = $1
             AND b.status IN ('confirmed', 'pending')
           ) >= COALESCE(quantity, 1) THEN 'booked'
           ELSE 'available'
         END,
         updated_at = NOW()
         WHERE id = $1`,
        [room.room_id]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      ...booking,
      rooms: roomDetails,
      nights
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  } finally {
    client.release();
  }
});
```

**Checkout Endpoint (New)**
```typescript
// POST /api/bookings/:id/checkout
router.post('/:id/checkout', [
  authenticateToken,
  requireAdmin
], async (req: AuthRequest, res: Response): Promise<void> => {
  const client = await db.getClient();
  
  try {
    const { id } = req.params;

    await client.query('BEGIN');

    // Get booking details
    const bookingResult = await client.query(
      `SELECT b.*, bi.room_id, bi.quantity
       FROM bookings b
       LEFT JOIN booking_items bi ON bi.booking_id = b.id
       WHERE b.id = $1`,
      [id]
    );

    if (bookingResult.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    // Update booking status
    await client.query(
      `UPDATE bookings
       SET status = 'completed',
           checked_out = true,
           updated_at = NOW()
       WHERE id = $1`,
      [id]
    );

    // Update room availability for each room in the booking
    const uniqueRooms = [...new Set(bookingResult.rows.map(r => r.room_id))];
    
    for (const roomId of uniqueRooms) {
      if (roomId) {
        await client.query(
          `UPDATE rooms 
           SET status = CASE 
             WHEN (
               SELECT COALESCE(SUM(bi.quantity), 0)
               FROM booking_items bi
               JOIN bookings b ON b.id = bi.booking_id
               WHERE bi.room_id = $1
               AND b.status IN ('confirmed', 'pending')
               AND b.check_out_date >= CURRENT_DATE
             ) >= COALESCE(quantity, 1) THEN 'booked'
             ELSE 'available'
           END,
           updated_at = NOW()
           WHERE id = $1`,
          [roomId]
        );
      }
    }

    await client.query('COMMIT');

    res.json({ 
      message: 'Checkout completed successfully',
      booking_id: id
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error during checkout:', error);
    res.status(500).json({ error: 'Failed to complete checkout' });
  } finally {
    client.release();
  }
});
```

---

## 💻 Frontend Changes

### 1. Admin Inventory Page Updates

**Enhanced Room Form:**
```typescript
// Add quantity field to form
const [formData, setFormData] = useState({
  accommodation_id: '',
  name: '',
  description: '',
  type: 'Standard',
  capacity: '2',
  beds: '1',
  quantity: '1', // NEW: Number of this room type available
  price_per_night: '',
  refundable: true,
  status: 'available', // NEW: Room status
  amenities: [] as string[],
  images: [] as string[],
});

// Add quantity and status to the form UI
<div>
  <Label htmlFor="quantity">Quantity Available</Label>
  <Input
    id="quantity"
    type="number"
    min="1"
    value={formData.quantity}
    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
    placeholder="Number of rooms of this type"
  />
  <p className="text-xs text-gray-500 mt-1">
    How many of this room type are available for booking?
  </p>
</div>

<div>
  <Label htmlFor="status">Room Status</Label>
  <Select
    value={formData.status}
    onValueChange={(value) => setFormData({ ...formData, status: value })}
  >
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="available">Available</SelectItem>
      <SelectItem value="booked">Booked</SelectItem>
      <SelectItem value="maintenance">Under Maintenance</SelectItem>
      <SelectItem value="inactive">Inactive</SelectItem>
    </SelectContent>
  </Select>
</div>
```

**Display Room Status in Inventory List:**
```typescript
const getStatusBadge = (status: string) => {
  const statusConfig = {
    available: { color: 'bg-green-500', text: 'Available' },
    booked: { color: 'bg-red-500', text: 'Booked' },
    maintenance: { color: 'bg-yellow-500', text: 'Maintenance' },
    inactive: { color: 'bg-gray-500', text: 'Inactive' }
  };
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
  
  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold text-white ${config.color}`}>
      {config.text}
    </span>
  );
};

// In the room card display:
<div className="flex items-center justify-between">
  <h3 className="font-semibold">{room.name}</h3>
  {getStatusBadge(room.status)}
</div>
<p className="text-sm text-gray-600">
  Quantity: {room.quantity} | Available: {room.available_quantity || 0}
</p>
```

**Add Checkout Button:**
```typescript
// In the admin bookings page
const handleCheckout = async (bookingId: number) => {
  if (!confirm('Are you sure you want to check out this booking?')) return;
  
  try {
    await api.post(`/bookings/${bookingId}/checkout`);
    toast.success('Checkout completed successfully');
    // Refresh bookings and room inventory
    dispatch(fetchAllBookings());
    dispatch(fetchRooms());
  } catch (error) {
    toast.error('Failed to complete checkout');
    console.error('Checkout error:', error);
  }
};

// Add button in booking list
{booking.status === 'confirmed' && (
  <Button
    variant="primary"
    size="sm"
    onClick={() => handleCheckout(booking.id)}
  >
    Checkout
  </Button>
)}
```

### 2. Client Dashboard Updates

**Fetch Only Available Rooms:**
```typescript
// Update the room fetching logic
useEffect(() => {
  const fetchAvailableRooms = async () => {
    try {
      const response = await api.get('/rooms/available', {
        params: {
          checkIn: selectedDates.checkIn,
          checkOut: selectedDates.checkOut,
          guests: guestCount
        }
      });
      
      // Transform to match UI format
      const rooms = response.data.map((room: any) => ({
        id: room.id,
        name: room.name,
        location: room.accommodation_city,
        beds: room.beds,
        baths: room.baths || 1,
        capacity: room.capacity,
        availableQuantity: room.available_quantity,
        totalQuantity: room.total_quantity,
        price: room.price_per_night,
        image: room.photos?.[0]?.url || '',
        images: room.photos?.map((p: any) => p.url) || [],
        type: room.type,
        status: room.status,
        isAvailable: room.available_quantity > 0
      }));
      
      setAvailableRooms(rooms);
    } catch (error) {
      console.error('Error fetching available rooms:', error);
      toast.error('Failed to load available rooms');
    }
  };
  
  fetchAvailableRooms();
}, [selectedDates, guestCount]);
```

**Display Availability Status:**
```typescript
// In room card component
<div className="room-card">
  <img src={room.image} alt={room.name} />
  
  <div className="room-info">
    <h3>{room.name}</h3>
    <p>{room.location}</p>
    
    {/* Availability badge */}
    {room.isAvailable ? (
      <div className="flex items-center gap-2">
        <Badge className="bg-green-500">
          {room.availableQuantity} Available
        </Badge>
        <span className="text-sm text-gray-600">
          of {room.totalQuantity}
        </span>
      </div>
    ) : (
      <Badge className="bg-red-500">Fully Booked</Badge>
    )}
    
    <div className="price">
      <span className="text-2xl font-bold">R{room.price}</span>
      <span className="text-gray-600">/night</span>
    </div>
    
    <Button
      disabled={!room.isAvailable}
      onClick={() => handleBookNow(room)}
    >
      {room.isAvailable ? 'Book Now' : 'Not Available'}
    </Button>
  </div>
</div>
```

### 3. Redux Slice Updates

**Update roomsSlice:**
```typescript
// Add new actions for availability
export const fetchAvailableRooms = createAsyncThunk(
  'rooms/fetchAvailable',
  async (params: {
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    accommodationId?: number;
  }) => {
    const response = await roomsAPI.getAvailable(params);
    return response.data;
  }
);

// Update state interface
interface RoomsState {
  rooms: Room[];
  availableRooms: Room[]; // NEW
  accommodations: Accommodation[];
  selectedRoom: Room | null;
  loading: boolean;
  error: string | null;
}

// Update reducers
const roomsSlice = createSlice({
  name: 'rooms',
  initialState,
  reducers: {
    // ...existing reducers
  },
  extraReducers: (builder) => {
    // ...existing cases
    builder
      .addCase(fetchAvailableRooms.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAvailableRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.availableRooms = action.payload;
      })
      .addCase(fetchAvailableRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch available rooms';
      });
  },
});
```

---

## 🚀 Implementation Steps

### Phase 1: Database Setup (Week 1)
1. ✅ Run database migration scripts
2. ✅ Add new columns to rooms table
3. ✅ Create availability view
4. ✅ Add triggers for auto-checkout
5. ✅ Test database changes with sample data

### Phase 2: Backend API (Week 1-2)
1. ✅ Update room creation endpoint
2. ✅ Create availability check endpoint
3. ✅ Enhance booking creation with status updates
4. ✅ Add checkout endpoint
5. ✅ Add room status update endpoint
6. ✅ Write API tests

### Phase 3: Admin Frontend (Week 2)
1. ✅ Update Inventory page with quantity field
2. ✅ Add status dropdown and badges
3. ✅ Show availability metrics
4. ✅ Add checkout button to bookings
5. ✅ Test admin workflows

### Phase 4: Client Frontend (Week 3)
1. ✅ Update Dashboard to fetch available rooms
2. ✅ Display availability status
3. ✅ Disable booking for unavailable rooms
4. ✅ Add date picker for availability checking
5. ✅ Test booking flow

### Phase 5: Testing & Optimization (Week 4)
1. ✅ End-to-end testing
2. ✅ Performance optimization
3. ✅ Bug fixes
4. ✅ Documentation updates
5. ✅ Deploy to production

---

## 🧪 Testing Checklist

### Admin Tests
- [ ] Create room with quantity > 1
- [ ] Update room status manually
- [ ] View room availability metrics
- [ ] Checkout a booking
- [ ] Verify room becomes available after checkout

### Client Tests
- [ ] View only available rooms
- [ ] See "Booked" status for fully booked rooms
- [ ] Cannot book unavailable rooms
- [ ] Book available room successfully
- [ ] Room status updates after booking

### System Tests
- [ ] Multiple concurrent bookings
- [ ] Date range availability checks
- [ ] Automatic checkout trigger
- [ ] Room status transitions
- [ ] Data consistency checks

---

## 📊 Expected Benefits

### For Admin
✅ Single inventory management location  
✅ Real-time booking status visibility  
✅ Easy checkout process  
✅ Automated availability updates  
✅ Better inventory control

### For Clients
✅ See real-time availability  
✅ No booking conflicts  
✅ Clear room status indicators  
✅ Better user experience  
✅ Confidence in bookings

### For System
✅ Single source of truth  
✅ Reduced data inconsistencies  
✅ Automated processes  
✅ Scalable architecture  
✅ Better performance

---

## 🔒 Security Considerations

1. **Authorization**: Only admins can update room status
2. **Validation**: Strict validation on booking creation
3. **Concurrency**: Transaction locks prevent double-booking
4. **Audit**: Log all inventory changes
5. **Access Control**: Role-based access to endpoints

---

## 📝 Next Steps

1. Review this implementation plan
2. Approve database schema changes
3. Begin Phase 1 implementation
4. Schedule regular progress reviews
5. Plan user acceptance testing

---

**Status:** Ready for Implementation  
**Priority:** High  
**Estimated Completion:** 4 weeks  
**Team:** Full Stack (Backend + Frontend + Database)
