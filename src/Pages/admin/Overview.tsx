import { useEffect } from 'react';
import { Calendar, DollarSign, Users, Star, Hotel, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import backgroundImage from '../../assets/image/background/Offers-section.jpeg';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchDashboardStats,
  fetchBookingTrends,
  fetchRevenueTrends,
  fetchRecentBookings,
} from '../../store/slices/analyticsSlice';

export function AdminOverview() {
  const dispatch = useAppDispatch();
  const { dashboardStats, bookingTrends, revenueTrends, recentBookings, loading, error } = useAppSelector(
    (state) => state.analytics
  );

  useEffect(() => {
    // Fetch all analytics data on component mount
    dispatch(fetchDashboardStats());
    dispatch(fetchBookingTrends({ period: 'month' }));
    dispatch(fetchRevenueTrends({ period: 'month' }));
    dispatch(fetchRecentBookings(5));
  }, [dispatch]);

  // Prepare stats data from Redux state
  const statsData = dashboardStats
    ? [
        {
          icon: Calendar,
          label: 'Total Bookings',
          value: dashboardStats.totalBookings.toLocaleString(),
          change: '+12.5%',
          trend: 'up' as const,
        },
        {
          icon: DollarSign,
          label: 'Revenue',
          value: `R ${(dashboardStats.totalRevenue / 1000000).toFixed(1)}M`,
          change: '+18.2%',
          trend: 'up' as const,
        },
        {
          icon: Users,
          label: 'Total Guests',
          value: dashboardStats.totalGuests.toLocaleString(),
          change: '+8.3%',
          trend: 'up' as const,
        },
        {
          icon: Hotel,
          label: 'Occupancy Rate',
          value: `${dashboardStats.occupancyRate}%`,
          change: '+5.1%',
          trend: 'up' as const,
        },
        {
          icon: Star,
          label: 'Avg Rating',
          value: dashboardStats.averageRating.toFixed(1),
          change: '+0.2',
          trend: 'up' as const,
        },
      ]
    : [];

  // Transform booking trends for chart (use month name from date)
  const bookingTrendData = bookingTrends.map((trend) => ({
    month: new Date(trend.date).toLocaleDateString('en-US', { month: 'short' }),
    bookings: trend.bookings,
    revenue: trend.revenue,
  }));

  // Loading state
  if (loading && !dashboardStats) {
    return (
      <div className="relative p-4 sm:p-6 space-y-4 sm:space-y-6 min-h-screen">
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
        <Card className="bg-gray-light border-gray-text/20">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-primary" />
            <span className="ml-3 text-gray-text">Loading analytics data...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="relative p-4 sm:p-6 space-y-4 sm:space-y-6 min-h-screen">
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
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-white">Dashboard Overview</h1>
        <p className="text-sm sm:text-base text-white">Welcome back, Admin. Here's what's happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-gray-light border-gray-text/20">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="p-2 rounded-lg bg-white">
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-primary" />
                  </div>
                  <span
                    className="text-xs sm:text-sm font-medium"
                    style={{ color: stat.trend === 'up' ? '#0F51AF' : '#ff4444' }}
                  >
                    {stat.change}
                  </span>
                </div>
                <div>
                  <p className="text-gray-text text-xs sm:text-sm mb-1">{stat.label}</p>
                  <p className="text-black text-xl sm:text-2xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Booking Trends */}
        <Card className="bg-gray-light border-gray-text/20">
          <CardHeader>
            <CardTitle className="text-black text-lg sm:text-xl">Booking Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <LineChart data={bookingTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 28, 67, 0.15)" />
                <XAxis dataKey="month" stroke="#627182" style={{ fontSize: '12px' }} />
                <YAxis stroke="#627182" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0, 28, 67, 0.2)', fontSize: '12px' }}
                  labelStyle={{ color: '#000' }}
                />
                <Line type="monotone" dataKey="bookings" stroke="#0F51AF" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card className="bg-gray-light border-gray-text/20">
          <CardHeader>
            <CardTitle className="text-black text-lg sm:text-xl">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <BarChart data={bookingTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 28, 67, 0.15)" />
                <XAxis dataKey="month" stroke="#627182" style={{ fontSize: '12px' }} />
                <YAxis stroke="#627182" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0, 28, 67, 0.2)', fontSize: '12px' }}
                  labelStyle={{ color: '#000' }}
                />
                <Bar dataKey="revenue" fill="#0F51AF" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card className="bg-gray-light border-gray-text/20">
        <CardHeader>
          <CardTitle className="text-black text-lg sm:text-xl">Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-gray-text/20">
                  <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-gray-text text-xs sm:text-sm font-medium">Reference</th>
                  <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-gray-text text-xs sm:text-sm font-medium">Guest</th>
                  <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-gray-text text-xs sm:text-sm font-medium">Room</th>
                  <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-gray-text text-xs sm:text-sm font-medium">Check-in</th>
                  <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-gray-text text-xs sm:text-sm font-medium">Amount</th>
                  <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-gray-text text-xs sm:text-sm font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-gray-text/10 hover:bg-white/50">
                    <td className="py-2 sm:py-3 px-3 sm:px-4 text-black text-xs sm:text-sm font-medium">{booking.reference}</td>
                    <td className="py-2 sm:py-3 px-3 sm:px-4 text-black text-xs sm:text-sm">{booking.guest_name}</td>
                    <td className="py-2 sm:py-3 px-3 sm:px-4 text-gray-text text-xs sm:text-sm">{booking.room_name}</td>
                    <td className="py-2 sm:py-3 px-3 sm:px-4 text-gray-text text-xs sm:text-sm">
                      {new Date(booking.check_in_date).toLocaleDateString()}
                    </td>
                    <td className="py-2 sm:py-3 px-3 sm:px-4 text-black text-xs sm:text-sm font-medium">
                      R {booking.total_price.toLocaleString()}
                    </td>
                    <td className="py-2 sm:py-3 px-3 sm:px-4">
                      <span
                        className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium text-white"
                        style={{
                          backgroundColor: booking.status === 'Confirmed' ? '#0F51AF' : '#ffa500',
                        }}
                      >
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
