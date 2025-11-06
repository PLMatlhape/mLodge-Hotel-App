import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, TrendingUp, Users, DollarSign, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import backgroundImage from '../../assets/image/background/Offers-section.jpeg';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchDashboardStats, fetchBookingTrends, fetchRevenueTrends, fetchPerformanceStats, fetchRoomTypeDistribution, fetchBookingSources } from '../../store/slices/analyticsSlice';

export function AdminAnalytics() {
  const dispatch = useAppDispatch();
  const { dashboardStats, bookingTrends, performanceStats, loading, error } = useAppSelector((state) => state.analytics);
  
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('year');

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchBookingTrends({ period: timeRange }));
    dispatch(fetchRevenueTrends({ period: timeRange }));
    dispatch(fetchPerformanceStats({ period: timeRange }));
    dispatch(fetchRoomTypeDistribution());
    dispatch(fetchBookingSources());
  }, [dispatch, timeRange]);

  // Transform data for charts
  const monthlyData = bookingTrends.map((trend) => ({
    month: new Date(trend.date).toLocaleDateString('en-US', { month: 'short' }),
    bookings: trend.bookings,
    revenue: trend.revenue,
  }));

  // Loading state
  if (loading && !dashboardStats) {
    return (
      <div className="relative p-6 space-y-6 min-h-screen">
        <div 
          className="fixed inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${backgroundImage})`,
            zIndex: -2
          }}
        />
        <div 
          className="fixed inset-0"
          style={{ 
            backgroundColor: 'rgba(0, 28, 67, 0.5)',
            zIndex: -1
          }}
        />
        <Card style={{ backgroundColor: '#D9D9D9', borderColor: 'rgba(0, 28, 67, 0.2)' }}>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-primary" />
            <span className="ml-3 text-gray-text">Loading analytics...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="relative p-6 space-y-6 min-h-screen">
        <div 
          className="fixed inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${backgroundImage})`,
            zIndex: -2
          }}
        />
        <div 
          className="fixed inset-0"
          style={{ 
            backgroundColor: 'rgba(0, 28, 67, 0.5)',
            zIndex: -1
          }}
        />
        <Card className="bg-red-50 border-red-200">
          <CardContent className="flex items-center py-4">
            <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
            <div>
              <p className="text-red-800 font-medium">Error loading analytics</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
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
      
      {/* Content with padding */}
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 style={{ color: '#FFFFFF', fontSize: '2rem', marginBottom: '0.5rem' }}>Performance Analytics</h1>
            <p style={{ color: '#FFFFFF' }}>Comprehensive insights into booking trends and performance</p>
          </div>
        <Select value={timeRange} onValueChange={(value) => setTimeRange(value as typeof timeRange)}>
          <SelectTrigger className="w-48" style={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(0, 28, 67, 0.2)', color: '#000000' }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent style={{ backgroundColor: '#D9D9D9', borderColor: 'rgba(0, 28, 67, 0.2)' }}>
            <SelectItem value="week" style={{ color: '#000000' }}>Last 7 Days</SelectItem>
            <SelectItem value="month" style={{ color: '#000000' }}>Last 30 Days</SelectItem>
            <SelectItem value="quarter" style={{ color: '#000000' }}>Last Quarter</SelectItem>
            <SelectItem value="year" style={{ color: '#000000' }}>Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card style={{ backgroundColor: '#D9D9D9', borderColor: 'rgba(0, 28, 67, 0.2)' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p style={{ color: '#627182', fontSize: '0.875rem' }}>Total Bookings</p>
                <p style={{ color: '#000000', fontSize: '1.5rem' }}>
                  {performanceStats?.totalBookings?.value?.toLocaleString() || '0'}
                </p>
                <p className="text-sm mt-1" style={{ color: performanceStats?.totalBookings?.changeType === 'increase' ? '#0F51AF' : '#FF4444' }}>
                  {performanceStats?.totalBookings?.changeType === 'increase' ? '+' : ''}
                  {performanceStats?.totalBookings?.change?.toFixed(1)}% vs last period
                </p>
              </div>
              <TrendingUp className="h-8 w-8" style={{ color: '#0F51AF' }} />
            </div>
          </CardContent>
        </Card>
        <Card style={{ backgroundColor: '#D9D9D9', borderColor: 'rgba(0, 28, 67, 0.2)' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p style={{ color: '#627182', fontSize: '0.875rem' }}>Revenue</p>
                <p style={{ color: '#000000', fontSize: '1.5rem' }}>
                  R {(performanceStats?.revenue?.value || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
                <p className="text-sm mt-1" style={{ color: performanceStats?.revenue?.changeType === 'increase' ? '#0F51AF' : '#FF4444' }}>
                  {performanceStats?.revenue?.changeType === 'increase' ? '+' : ''}
                  {performanceStats?.revenue?.change?.toFixed(1)}% vs last period
                </p>
              </div>
              <DollarSign className="h-8 w-8" style={{ color: '#0F51AF' }} />
            </div>
          </CardContent>
        </Card>
        <Card style={{ backgroundColor: '#D9D9D9', borderColor: 'rgba(0, 28, 67, 0.2)' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p style={{ color: '#627182', fontSize: '0.875rem' }}>Avg Occupancy</p>
                <p style={{ color: '#000000', fontSize: '1.5rem' }}>
                  {performanceStats?.avgOccupancy?.value?.toFixed(1) || '0'}%
                </p>
                <p className="text-sm mt-1" style={{ color: performanceStats?.avgOccupancy?.changeType === 'increase' ? '#0F51AF' : '#FF4444' }}>
                  {performanceStats?.avgOccupancy?.changeType === 'increase' ? '+' : ''}
                  {performanceStats?.avgOccupancy?.change?.toFixed(1)}% vs last period
                </p>
              </div>
              <Users className="h-8 w-8" style={{ color: '#0F51AF' }} />
            </div>
          </CardContent>
        </Card>
        <Card style={{ backgroundColor: '#D9D9D9', borderColor: 'rgba(0, 28, 67, 0.2)' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p style={{ color: '#627182', fontSize: '0.875rem' }}>Avg Stay Duration</p>
                <p style={{ color: '#000000', fontSize: '1.5rem' }}>
                  {performanceStats?.avgStayDuration?.value?.toFixed(1) || '0'} nights
                </p>
                <p className="text-sm mt-1" style={{ color: performanceStats?.avgStayDuration?.changeType === 'increase' ? '#0F51AF' : '#FF4444' }}>
                  {performanceStats?.avgStayDuration?.changeType === 'increase' ? '+' : ''}
                  {performanceStats?.avgStayDuration?.change?.toFixed(1)} vs last period
                </p>
              </div>
              <CalendarIcon className="h-8 w-8" style={{ color: '#0F51AF' }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card style={{ backgroundColor: '#D9D9D9', borderColor: 'rgba(0, 28, 67, 0.2)' }}>
          <CardHeader>
            <CardTitle style={{ color: '#000000' }}>Booking Trends Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F51AF" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0F51AF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 28, 67, 0.15)" />
                <XAxis dataKey="month" stroke="#627182" />
                <YAxis stroke="#627182" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0, 28, 67, 0.2)' }}
                  labelStyle={{ color: '#000' }}
                />
                <Area type="monotone" dataKey="bookings" stroke="#0F51AF" fillOpacity={1} fill="url(#colorBookings)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: '#D9D9D9', borderColor: 'rgba(0, 28, 67, 0.2)' }}>
          <CardHeader>
            <CardTitle style={{ color: '#000000' }}>Revenue Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 28, 67, 0.15)" />
                <XAxis dataKey="month" stroke="#627182" />
                <YAxis stroke="#627182" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0, 28, 67, 0.2)' }}
                  labelStyle={{ color: '#000' }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#0F51AF" strokeWidth={3} dot={{ fill: '#0F51AF', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card style={{ backgroundColor: '#D9D9D9', borderColor: 'rgba(0, 28, 67, 0.2)' }}>
          <CardHeader>
            <CardTitle style={{ color: '#000000' }}>Occupancy Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 28, 67, 0.15)" />
                <XAxis dataKey="month" stroke="#627182" />
                <YAxis stroke="#627182" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0, 28, 67, 0.2)' }}
                  labelStyle={{ color: '#000' }}
                />
                <Bar dataKey="occupancy" fill="#0F51AF" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: '#D9D9D9', borderColor: 'rgba(0, 28, 67, 0.2)' }}>
          <CardHeader>
            <CardTitle style={{ color: '#000000' }}>Bookings by Room Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-[300px]">
              <div className="text-center">
                <p className="text-gray-text mb-2">Room type analytics coming soon</p>
                <p className="text-gray-text text-sm">Data will be populated from the database</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Booking Sources */}
      <Card style={{ backgroundColor: '#D9D9D9', borderColor: 'rgba(0, 28, 67, 0.2)' }}>
        <CardHeader>
          <CardTitle style={{ color: '#000000' }}>Booking Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <div className="text-center">
              <p className="text-gray-text mb-2">Booking source analytics coming soon</p>
              <p className="text-gray-text text-sm">Data will be populated from the database</p>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
