# Analytics System Documentation

## Overview

The mLodge Hotel App now has a comprehensive analytics system that tracks all bookings, revenue, occupancy, and guest behavior across the entire hotel management platform.

## Features

### 📊 Key Metrics Tracked

1. **Total Bookings**
   - Current period bookings count
   - Period-over-period growth percentage
   - Trend indicators (increase/decrease)

2. **Revenue Analytics**
   - Total revenue from confirmed/completed bookings
   - Revenue trends over time (line chart)
   - Period comparison and growth rates
   - Average booking value by source

3. **Occupancy Rate**
   - Real-time room occupancy calculation
   - Historical occupancy trends (bar chart)
   - Room utilization percentages
   - Day-by-day occupancy tracking

4. **Average Stay Duration**
   - Average nights per booking
   - Stay duration trends
   - Comparison across time periods

5. **Room Type Distribution** (NEW!)
   - Bookings by room type (Pie Chart)
   - Revenue per room type
   - Guest preferences analysis
   - Room type performance metrics

6. **Booking Sources** (NEW!)
   - Website bookings
   - Mobile App bookings
   - Phone reservations
   - Walk-in bookings
   - Partner bookings
   - Revenue and average value per source

### 🎯 Time Range Analysis

Analytics can be viewed across multiple time periods:
- **Week**: Last 7 days
- **Month**: Last 30 days
- **Quarter**: Last 90 days  
- **Year**: Last 365 days

## Database Schema

### New Columns Added

#### `bookings` table:
```sql
source VARCHAR(50) DEFAULT 'Website'  -- Tracks where booking originated
booking_reference VARCHAR(100) UNIQUE -- Unique booking identifier (e.g., BK000123)
```

#### `rooms` table:
```sql
room_type VARCHAR(100) DEFAULT 'Standard' -- Categorizes rooms (Standard, Deluxe, Suite, etc.)
```

### Room Types Supported

- **Suite** - Presidential, penthouse suites
- **Deluxe** - Luxury, deluxe rooms
- **Premium** - Superior, premium rooms
- **Executive** - Business-class rooms
- **Family** - Multi-bed family rooms
- **Single** - Single occupancy
- **Double** - Double occupancy
- **Twin** - Twin beds
- **Standard** - Default category

### Booking Sources

1. **Website** - Direct bookings via hotel website
2. **Mobile App** - Bookings through mobile application
3. **Phone** - Telephone reservations
4. **Walk-in** - Front desk walk-in bookings
5. **Partner** - Third-party booking platforms (Booking.com, Expedia, etc.)

## API Endpoints

### Analytics Routes (`/api/analytics/*`)

All endpoints require admin authentication.

#### 1. Dashboard Stats
```
GET /api/analytics/dashboard
```
Returns comprehensive dashboard metrics including bookings, revenue, occupancy, users, and ratings.

#### 2. Booking Trends
```
GET /api/analytics/booking-trends?period=month
```
Query params: `period` (week|month|quarter|year)

Returns daily/weekly booking counts for the specified period.

#### 3. Revenue Trends
```
GET /api/analytics/revenue-trends?period=month
```
Returns revenue over time for trend analysis.

#### 4. Performance Stats
```
GET /api/analytics/performance-stats?period=month
```
Returns current vs previous period comparison with percentage changes.

#### 5. Room Type Distribution ⭐ NEW
```
GET /api/analytics/room-type-distribution
```
Returns:
```json
[
  {
    "name": "Deluxe",
    "value": 45,
    "revenue": 15000,
    "guests": 38,
    "color": "#00C49F",
    "percentage": 35.2
  },
  ...
]
```

#### 6. Booking Sources ⭐ NEW
```
GET /api/analytics/booking-sources
```
Returns:
```json
[
  {
    "source": "Website",
    "bookings": 120,
    "revenue": 45000,
    "avgValue": 375
  },
  ...
]
```

#### 7. Recent Bookings
```
GET /api/analytics/recent-bookings?limit=10
```
Returns list of most recent bookings with guest and room details.

#### 8. Top Accommodations
```
GET /api/analytics/top-accommodations?limit=5
```
Returns best-performing accommodations by booking count.

#### 9. Booking Status Distribution
```
GET /api/analytics/booking-status
```
Returns breakdown of bookings by status (pending, confirmed, cancelled, completed).

## Frontend Components

### Admin Analytics Dashboard
**Location**: `src/Pages/admin/Analytics.tsx`

Features:
- 4 metric cards with growth indicators
- Booking trends area chart
- Revenue trends line chart
- Occupancy rate bar chart
- **Room type distribution pie chart** ⭐ NEW
- **Booking sources bar chart** ⭐ NEW

### Admin Overview
**Location**: `src/Pages/admin/Overview.tsx`

Quick stats dashboard showing:
- Total bookings
- Total revenue
- Total guests
- Occupancy rate
- Average rating

## Redux State Management

**Location**: `src/store/slices/analyticsSlice.ts`

### State Structure
```typescript
interface AnalyticsState {
  dashboardStats: DashboardStats | null;
  performanceStats: PerformanceStats | null;
  roomTypeData: RoomTypeData[];       // ⭐ NEW
  bookingSourceData: BookingSourceData[]; // ⭐ NEW
  bookingTrends: BookingTrend[];
  revenueTrends: RevenueTrend[];
  roomTypeStats: RoomTypeStats[];
  recentBookings: RecentBooking[];
  loading: boolean;
  error: string | null;
}
```

### Thunks
- `fetchDashboardStats()` - Load all dashboard metrics
- `fetchBookingTrends({ period })` - Get booking trends
- `fetchRevenueTrends({ period })` - Get revenue trends
- `fetchPerformanceStats({ period })` - Get performance comparison
- `fetchRoomTypeDistribution()` - Get room type breakdown ⭐ NEW
- `fetchBookingSources()` - Get booking source analytics ⭐ NEW
- `fetchRecentBookings({ limit })` - Get recent bookings
- `fetchRoomTypeStats()` - Get detailed room stats

## Database Migration

### Running the Migration

To add analytics columns and update existing data:

```bash
# Navigate to backend directory
cd src/backend

# Run migration script
npx ts-node scripts/migrateAnalytics.ts
```

### What the Migration Does

1. ✅ Adds `source` column to `bookings` table
2. ✅ Adds `booking_reference` column to `bookings` table
3. ✅ Adds `room_type` column to `rooms` table
4. ✅ Creates performance indexes on frequently queried columns
5. ✅ Updates existing bookings with auto-generated references (BK000001, BK000002, etc.)
6. ✅ Sets default source ('Website') for existing bookings
7. ✅ Intelligently infers room types from room names
8. ✅ Displays summary of database state after migration

### Migration Safety

- ✅ Uses transactions (ROLLBACK on error)
- ✅ Checks if columns exist before adding
- ✅ Non-destructive (doesn't delete data)
- ✅ Idempotent (can run multiple times safely)

## Performance Optimizations

### Database Indexes

```sql
idx_bookings_created_at  -- Speeds up date range queries
idx_bookings_status      -- Faster status filtering
idx_bookings_source      -- Quick source analytics
idx_bookings_dates       -- Efficient date range searches
```

### Query Optimization

- Uses `COALESCE()` for null handling
- Implements graceful degradation (returns zeros instead of errors)
- Limits queries to last 12 months for performance
- Uses `COUNT(DISTINCT)` for accurate unique counts

## Usage Examples

### Backend - Get Room Type Analytics

```typescript
import { Router } from 'express';
import db from '../config/database';

router.get('/room-analytics', async (req, res) => {
  const result = await db.query(`
    SELECT 
      COALESCE(r.room_type, 'Standard') as name,
      COUNT(b.id) as booking_count
    FROM rooms r
    LEFT JOIN bookings b ON b.room_id = r.id 
      AND b.status IN ('confirmed', 'completed')
    WHERE r.is_active = true
    GROUP BY r.room_type
  `);
  
  res.json(result.rows);
});
```

### Frontend - Display Analytics

```typescript
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchRoomTypeDistribution } from '../store/slices/analyticsSlice';

function AnalyticsDashboard() {
  const dispatch = useAppDispatch();
  const { roomTypeData, loading } = useAppSelector(state => state.analytics);
  
  useEffect(() => {
    dispatch(fetchRoomTypeDistribution());
  }, [dispatch]);
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {roomTypeData.map(room => (
        <div key={room.name}>
          {room.name}: {room.value} bookings
        </div>
      ))}
    </div>
  );
}
```

## Testing Analytics

### Manual Testing

1. **Create Test Bookings**
   - Create bookings with different room types
   - Use various booking sources
   - Mix confirmed, pending, and cancelled statuses

2. **Verify Dashboard**
   - Check that metrics update in real-time
   - Verify growth calculations are correct
   - Ensure charts render properly

3. **Test Time Ranges**
   - Switch between week, month, quarter, year
   - Verify data changes appropriately
   - Check that calculations are period-specific

### SQL Verification Queries

```sql
-- Check booking sources distribution
SELECT source, COUNT(*) FROM bookings GROUP BY source;

-- Check room type distribution
SELECT room_type, COUNT(*) FROM rooms GROUP BY room_type;

-- Verify revenue calculations
SELECT SUM(total_price) FROM bookings WHERE status IN ('confirmed', 'completed');

-- Check booking trends
SELECT DATE(created_at), COUNT(*) FROM bookings 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at) ORDER BY DATE(created_at);
```

## Troubleshooting

### Issue: "Cannot find name 'roomTypeData'"
**Solution**: Ensure you've imported the correct state property from Redux:
```typescript
const { roomTypeData, bookingSourceData } = useAppSelector(state => state.analytics);
```

### Issue: "Property 'source' does not exist on table 'bookings'"
**Solution**: Run the migration script:
```bash
npx ts-node src/backend/scripts/migrateAnalytics.ts
```

### Issue: Charts showing "No data available"
**Solution**: 
1. Check that bookings exist in database
2. Verify bookings have `status` = 'confirmed' or 'completed'
3. Check that rooms have `room_type` set
4. Ensure Redux thunks are dispatched on component mount

### Issue: Growth percentages showing as NaN or Infinity
**Solution**: Analytics now handle division by zero gracefully:
```typescript
const change = previous > 0 ? ((current - previous) / previous) * 100 : current > 0 ? 100 : 0;
```

## Future Enhancements

### Planned Features

- [ ] Real-time analytics with WebSocket updates
- [ ] Cached analytics snapshots for faster loading
- [ ] Export analytics to PDF/Excel
- [ ] Custom date range selector
- [ ] Guest demographics analytics
- [ ] Revenue forecasting
- [ ] Seasonal trend analysis
- [ ] Competitor pricing comparisons
- [ ] Email reports (daily/weekly/monthly)
- [ ] Analytics API webhooks
- [ ] Mobile analytics app

### Database Improvements

- [ ] Create `analytics_snapshots` table for historical tracking
- [ ] Add `daily_stats` table for granular metrics
- [ ] Implement materialized views for complex queries
- [ ] Add Redis caching layer
- [ ] Create stored procedures for heavy calculations

## Contributing

When adding new analytics features:

1. **Backend**: Add endpoint to `src/backend/routes/analytics.ts`
2. **Redux**: Add thunk to `src/store/slices/analyticsSlice.ts`
3. **Frontend**: Update `src/Pages/admin/Analytics.tsx`
4. **Types**: Update TypeScript interfaces in Redux slice
5. **Documentation**: Update this README

## Support

For issues or questions about the analytics system:
- Check this documentation first
- Review the migration script logs
- Inspect browser console for errors
- Check backend server logs

---

**Last Updated**: December 2024  
**Version**: 2.0.0  
**Status**: ✅ Production Ready
