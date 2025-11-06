# Inventory System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          NEW INVENTORY SYSTEM FLOW                           │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ STEP 1: ADMIN ADDS ROOM TO INVENTORY                                         │
└──────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────┐
    │  Admin Panel    │
    │  (Inventory)    │
    └────────┬────────┘
             │ Adds Room:
             │ • Name: "Deluxe Suite"
             │ • Quantity: 5
             │ • Price: R1500
             │ • Status: Available
             ▼
    ┌─────────────────┐
    │   PostgreSQL    │
    │    Database     │
    └────────┬────────┘
             │ Stores in rooms table:
             │ {
             │   id: 1,
             │   name: "Deluxe Suite",
             │   quantity: 5,
             │   status: "available",
             │   price_per_night: 1500
             │ }
             ▼
    ┌─────────────────┐
    │ Client Dashboard│  ← Automatically visible to all clients!
    └─────────────────┘
    Shows: "Deluxe Suite - 5 Available - R1500/night"


┌──────────────────────────────────────────────────────────────────────────────┐
│ STEP 2: CLIENT VIEWS AVAILABLE ROOMS                                         │
└──────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────┐
    │ Client Dashboard│
    │  (User View)    │
    └────────┬────────┘
             │ Selects dates:
             │ Check-in: 2025-11-10
             │ Check-out: 2025-11-15
             │ Guests: 2
             ▼
    ┌─────────────────┐
    │   Backend API   │
    │ GET /rooms/     │
    │   available     │
    └────────┬────────┘
             │ Queries database for:
             │ • Active rooms
             │ • Available status
             │ • Capacity ≥ guests
             │ • Not booked for dates
             ▼
    ┌─────────────────┐
    │  Room Availability
    │     View        │
    └────────┬────────┘
             │ Returns:
             │ [
             │   {
             │     name: "Deluxe Suite",
             │     total_quantity: 5,
             │     booked_quantity: 0,
             │     available_quantity: 5,
             │     price: 1500
             │   }
             │ ]
             ▼
    ┌─────────────────┐
    │ Client Dashboard│
    └─────────────────┘
    Displays:
    ╔═══════════════════════════════════╗
    ║  🏨 Deluxe Suite                  ║
    ║  📍 Cape Town                     ║
    ║  ✅ 5 Available                   ║
    ║  💰 R1,500/night                  ║
    ║  👥 Sleeps 4                      ║
    ║  [ Book Now ] ← Active button    ║
    ╚═══════════════════════════════════╝


┌──────────────────────────────────────────────────────────────────────────────┐
│ STEP 3: CLIENT BOOKS A ROOM                                                  │
└──────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────┐
    │ Client Dashboard│
    └────────┬────────┘
             │ User clicks "Book Now"
             │ Requests: 2 Deluxe Suites
             ▼
    ┌─────────────────┐
    │   Backend API   │
    │ POST /bookings  │
    └────────┬────────┘
             │ Transaction begins
             │
             ├─► Step 1: Check Availability
             │   ┌──────────────────┐
             │   │  Availability    │
             │   │  Validation      │
             │   └────────┬─────────┘
             │            │
             │            ├─ Total: 5
             │            ├─ Booked: 0
             │            ├─ Requested: 2
             │            └─► Available: 5 - 0 = 5 ✅
             │
             ├─► Step 2: Create Booking
             │   ┌──────────────────┐
             │   │  bookings table  │
             │   └────────┬─────────┘
             │            │ INSERT:
             │            │ {
             │            │   id: 101,
             │            │   user_id: 5,
             │            │   status: "pending",
             │            │   check_in: "2025-11-10",
             │            │   check_out: "2025-11-15"
             │            │ }
             │            ▼
             ├─► Step 3: Create Booking Items
             │   ┌──────────────────┐
             │   │ booking_items    │
             │   └────────┬─────────┘
             │            │ INSERT:
             │            │ {
             │            │   booking_id: 101,
             │            │   room_id: 1,
             │            │   quantity: 2
             │            │ }
             │            ▼
             ├─► Step 4: Update Room Status
             │   ┌──────────────────┐
             │   │  rooms table     │
             │   └────────┬─────────┘
             │            │ UPDATE:
             │            │ booked: 0 → 2
             │            │ available: 5 → 3
             │            │ status: "available" (still have 3 left)
             │            ▼
             │   Transaction commits ✅
             ▼
    ┌─────────────────┐
    │ Response sent   │
    │ to client       │
    └────────┬────────┘
             ▼
    ┌─────────────────┐
    │ Client Dashboard│
    │  (All Users)    │
    └─────────────────┘
    Now shows:
    ╔═══════════════════════════════════╗
    ║  🏨 Deluxe Suite                  ║
    ║  📍 Cape Town                     ║
    ║  ✅ 3 Available (updated!)        ║
    ║  💰 R1,500/night                  ║
    ║  👥 Sleeps 4                      ║
    ║  [ Book Now ] ← Still active     ║
    ╚═══════════════════════════════════╝


┌──────────────────────────────────────────────────────────────────────────────┐
│ STEP 4: MORE BOOKINGS (UNTIL FULLY BOOKED)                                   │
└──────────────────────────────────────────────────────────────────────────────┘

    User 2 books 3 more rooms
             ↓
    Database updated:
    • Booked: 2 → 5 (2 + 3)
    • Available: 3 → 0 (5 - 5)
    • Status: "available" → "booked" (trigger updates)
             ↓
    Client Dashboard shows:
    ╔═══════════════════════════════════╗
    ║  🏨 Deluxe Suite                  ║
    ║  📍 Cape Town                     ║
    ║  ❌ Fully Booked                  ║
    ║  💰 R1,500/night                  ║
    ║  👥 Sleeps 4                      ║
    ║  [ Not Available ] ← Disabled    ║
    ╚═══════════════════════════════════╝


┌──────────────────────────────────────────────────────────────────────────────┐
│ STEP 5: ADMIN CHECKS OUT GUESTS                                              │
└──────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────┐
    │  Admin Panel    │
    │  (Bookings)     │
    └────────┬────────┘
             │ Views booking #101
             │ Status: "confirmed"
             │ Check-out date passed
             │
             │ Clicks "Checkout"
             ▼
    ┌─────────────────┐
    │   Backend API   │
    │ POST /bookings/ │
    │   101/checkout  │
    └────────┬────────┘
             │ Transaction begins
             │
             ├─► Step 1: Update Booking
             │   ┌──────────────────┐
             │   │  bookings table  │
             │   └────────┬─────────┘
             │            │ UPDATE:
             │            │ {
             │            │   status: "completed",
             │            │   checked_out: true
             │            │ }
             │            ▼
             ├─► Step 2: Recalculate Room Status
             │   ┌──────────────────┐
             │   │  rooms table     │
             │   └────────┬─────────┘
             │            │ Current active bookings
             │            │ for this room:
             │            │ • Booking 101: 2 rooms (now completed)
             │            │ • Booking 102: 3 rooms (still active)
             │            │
             │            │ UPDATE:
             │            │ booked: 5 → 3 (only active bookings)
             │            │ available: 0 → 2 (5 - 3)
             │            │ status: "booked" → "available"
             │            ▼
             │   Transaction commits ✅
             ▼
    ┌─────────────────┐
    │ Client Dashboard│
    │  (All Users)    │
    └─────────────────┘
    Now shows:
    ╔═══════════════════════════════════╗
    ║  🏨 Deluxe Suite                  ║
    ║  📍 Cape Town                     ║
    ║  ✅ 2 Available (restored!)       ║
    ║  💰 R1,500/night                  ║
    ║  👥 Sleeps 4                      ║
    ║  [ Book Now ] ← Active again!    ║
    ╚═══════════════════════════════════╝


┌──────────────────────────────────────────────────────────────────────────────┐
│ AUTOMATIC CHECKOUT (OPTIONAL)                                                │
└──────────────────────────────────────────────────────────────────────────────┘

    Database has trigger that runs daily:
    
    ┌─────────────────┐
    │  Daily Cron Job │
    │  (or trigger)   │
    └────────┬────────┘
             │ Checks for:
             │ • check_out_date < TODAY
             │ • checked_out = false
             ▼
    ┌─────────────────┐
    │ auto_checkout   │
    │   _check()      │
    └────────┬────────┘
             │ Automatically:
             │ • Sets status = "completed"
             │ • Sets checked_out = true
             │ • Updates room availability
             ▼
    ┌─────────────────┐
    │ Rooms become    │
    │ available again │
    └─────────────────┘


┌──────────────────────────────────────────────────────────────────────────────┐
│ KEY BENEFITS OF NEW SYSTEM                                                   │
└──────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────────────────────────────────────────────────────┐
    │  ✅ SINGLE SOURCE OF TRUTH                                   │
    │  Admin adds → Database → Client sees automatically           │
    │  No manual sync needed!                                      │
    └──────────────────────────────────────────────────────────────┘

    ┌──────────────────────────────────────────────────────────────┐
    │  ✅ REAL-TIME AVAILABILITY                                   │
    │  Booking updates → Instant availability change               │
    │  All users see same data!                                    │
    └──────────────────────────────────────────────────────────────┘

    ┌──────────────────────────────────────────────────────────────┐
    │  ✅ NO DOUBLE-BOOKING                                        │
    │  Database validates → Transaction ensures consistency        │
    │  Prevents overbooking!                                       │
    └──────────────────────────────────────────────────────────────┘

    ┌──────────────────────────────────────────────────────────────┐
    │  ✅ AUTOMATIC STATUS UPDATES                                 │
    │  Checkout → Room becomes available                           │
    │  No manual intervention!                                     │
    └──────────────────────────────────────────────────────────────┘

    ┌──────────────────────────────────────────────────────────────┐
    │  ✅ QUANTITY TRACKING                                        │
    │  Track multiple units → "3 of 5 available"                   │
    │  Better inventory management!                                │
    └──────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────────────────────┐
│ DATABASE TABLE RELATIONSHIPS                                                 │
└──────────────────────────────────────────────────────────────────────────────┘

    ┌────────────────────┐
    │   accommodations   │
    │                    │
    │ id (PK)            │
    │ name               │
    │ city               │
    │ address            │
    └──────────┬─────────┘
               │ 1:M
               │
    ┌──────────▼─────────┐
    │      rooms         │  ← NEW: Enhanced with inventory
    │                    │
    │ id (PK)            │
    │ accommodation_id   │
    │ name               │
    │ quantity ⭐NEW     │  ← How many available
    │ status ⭐NEW       │  ← available/booked/maintenance
    │ type ⭐NEW         │  ← Standard/Delux/Premium
    │ price_per_night    │
    │ capacity           │
    └──────────┬─────────┘
               │ 1:M
               │
    ┌──────────▼─────────┐
    │  booking_items     │
    │                    │
    │ id (PK)            │
    │ booking_id         │
    │ room_id            │
    │ quantity           │  ← How many rooms booked
    │ price_per_night    │
    └──────────┬─────────┘
               │ M:1
               │
    ┌──────────▼─────────┐
    │     bookings       │  ← NEW: Enhanced with checkout
    │                    │
    │ id (PK)            │
    │ user_id            │
    │ accommodation_id   │
    │ status             │
    │ checked_in ⭐NEW   │  ← Checkout tracking
    │ checked_out ⭐NEW  │  ← Checkout tracking
    │ check_in_date      │
    │ check_out_date     │
    │ total_amount       │
    └────────────────────┘


┌──────────────────────────────────────────────────────────────────────────────┐
│ AVAILABILITY CALCULATION LOGIC                                               │
└──────────────────────────────────────────────────────────────────────────────┘

    Available Quantity = Total Quantity - Active Bookings

    WHERE Active Bookings = 
        SUM(booking_items.quantity)
        WHERE booking.status IN ('confirmed', 'pending')
        AND booking.checked_out = false
        AND booking.check_out_date >= CURRENT_DATE
        AND date_ranges_overlap(
            booking.check_in_date,
            booking.check_out_date,
            requested_check_in,
            requested_check_out
        )

    Example:
    • Total Quantity: 5
    • Active Booking 1: 2 rooms (dates overlap)
    • Active Booking 2: 1 room (dates don't overlap)
    ─────────────────────────────────────────
    • Available: 5 - 2 = 3 ✅


┌──────────────────────────────────────────────────────────────────────────────┐
│ STATUS STATES & TRANSITIONS                                                  │
└──────────────────────────────────────────────────────────────────────────────┘

    Room Status States:
    
    ┌────────────┐
    │ available  │  ← Has rooms available for booking
    └─────┬──────┘
          │ When all quantities booked
          ▼
    ┌────────────┐
    │   booked   │  ← All rooms currently booked
    └─────┬──────┘
          │ When booking checked out
          ▼
    ┌────────────┐
    │ available  │  ← Back to available
    └────────────┘

    Manual Admin States:
    
    ┌─────────────┐
    │ maintenance │  ← Admin sets for repairs
    └─────────────┘

    ┌─────────────┐
    │  inactive   │  ← Admin sets to hide from clients
    └─────────────┘


═══════════════════════════════════════════════════════════════════════════════
                            END OF FLOW DIAGRAM
═══════════════════════════════════════════════════════════════════════════════
```
