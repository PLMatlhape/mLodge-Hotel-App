import { useState } from 'react';
import { Calendar as CalendarIcon, TrendingUp, Users, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import backgroundImage from '../../assets/image/background/Offers-section.jpeg';

const monthlyData = [
  { month: 'Jan', bookings: 85, revenue: 180000, occupancy: 75 },
  { month: 'Feb', bookings: 92, revenue: 195000, occupancy: 78 },
  { month: 'Mar', bookings: 105, revenue: 225000, occupancy: 82 },
  { month: 'Apr', bookings: 98, revenue: 210000, occupancy: 80 },
  { month: 'May', bookings: 115, revenue: 245000, occupancy: 85 },
  { month: 'Jun', bookings: 125, revenue: 268000, occupancy: 88 },
  { month: 'Jul', bookings: 135, revenue: 290000, occupancy: 92 },
  { month: 'Aug', bookings: 130, revenue: 275000, occupancy: 90 },
  { month: 'Sep', bookings: 118, revenue: 250000, occupancy: 84 },
  { month: 'Oct', bookings: 110, revenue: 235000, occupancy: 82 },
];

const roomTypeData = [
  { name: 'Premium', value: 35, color: '#0F51AF' },
  { name: 'Deluxe', value: 45, color: '#00bfff' },
  { name: 'Standard', value: 20, color: '#ffa500' },
];

const bookingSourceData = [
  { source: 'Direct Website', bookings: 450 },
  { source: 'Booking.com', bookings: 320 },
  { source: 'Expedia', bookings: 180 },
  { source: 'Airbnb', bookings: 150 },
  { source: 'Walk-in', bookings: 100 },
];

export function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState('year');

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
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
