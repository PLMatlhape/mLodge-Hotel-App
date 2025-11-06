import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, TrendingUp, Users, DollarSign, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import backgroundImage from '../../assets/image/background/Offers-section.jpeg';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchDashboardStats, fetchBookingTrends, fetchRevenueTrends } from '../../store/slices/analyticsSlice';

export function AdminAnalytics() {
  const dispatch = useAppDispatch();
  const { dashboardStats, bookingTrends, revenueTrends, loading, error } = useAppSelector((state) => state.analytics);
  
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('year');

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchBookingTrends({ period: timeRange }));
    dispatch(fetchRevenueTrends({ period: timeRange }));
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
    <div className="relative p-6 space-y-6">
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
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ color: '#FFFFFF', fontSize: '2rem', marginBottom: '0.5rem' }}>Performance Analytics</h1>
          <p style={{ color: '#FFFFFF' }}>Comprehensive insights into booking trends and performance</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
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
                <p style={{ color: '#000000', fontSize: '1.5rem' }}>1,213</p>
                <p className="text-sm mt-1" style={{ color: '#0F51AF' }}>+12.5% vs last period</p>
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
                <p style={{ color: '#000000', fontSize: '1.5rem' }}>R 2.6M</p>
                <p className="text-sm mt-1" style={{ color: '#0F51AF' }}>+18.2% vs last period</p>
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
                <p style={{ color: '#000000', fontSize: '1.5rem' }}>84%</p>
                <p className="text-sm mt-1" style={{ color: '#0F51AF' }}>+5.1% vs last period</p>
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
                <p style={{ color: '#000000', fontSize: '1.5rem' }}>2.8 nights</p>
                <p className="text-sm mt-1" style={{ color: '#0F51AF' }}>+0.3 vs last period</p>
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
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={roomTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {roomTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0, 28, 67, 0.2)' }}
                  labelStyle={{ color: '#000' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Booking Sources */}
      <Card style={{ backgroundColor: '#D9D9D9', borderColor: 'rgba(0, 28, 67, 0.2)' }}>
        <CardHeader>
          <CardTitle style={{ color: '#000000' }}>Booking Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bookingSourceData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 28, 67, 0.15)" />
              <XAxis type="number" stroke="#627182" />
              <YAxis dataKey="source" type="category" stroke="#627182" width={120} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0, 28, 67, 0.2)' }}
                labelStyle={{ color: '#000' }}
              />
              <Bar dataKey="bookings" fill="#0F51AF" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
