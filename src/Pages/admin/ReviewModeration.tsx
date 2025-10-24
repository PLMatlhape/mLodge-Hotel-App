import { useState } from 'react';
import { Search, CheckCircle, XCircle, AlertTriangle, Star } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { toast } from '../../lib/toast';
import backgroundImage from '../../assets/image/background/Offers-section.jpeg';

const mockReviews = [
  { id: 'RV-001', guest: 'John Doe', room: 'Luxury Penthouse', rating: 5, comment: 'Absolutely amazing experience! The view was breathtaking and service was impeccable.', date: '2025-10-18', status: 'Pending', flagged: false, bookingId: 'BK-2025-1234' },
  { id: 'RV-002', guest: 'Jane Smith', room: 'Deluxe Ocean View', rating: 4, comment: 'Great stay, loved the ocean view. Only minor issue was the WiFi speed.', date: '2025-10-17', status: 'Approved', flagged: false, bookingId: 'BK-2025-1233' },
  { id: 'RV-003', guest: 'Mike Johnson', room: 'Standard Suite', rating: 2, comment: 'This place was terrible! Dirty rooms and rude staff. Would not recommend!', date: '2025-10-16', status: 'Pending', flagged: true, bookingId: 'BK-2025-1232' },
  { id: 'RV-004', guest: 'Sarah Williams', room: 'Presidential Suite', rating: 5, comment: 'Perfect for our anniversary! Staff went above and beyond.', date: '2025-10-15', status: 'Approved', flagged: false, bookingId: 'BK-2025-1231' },
  { id: 'RV-005', guest: 'David Brown', room: 'Deluxe City View', rating: 3, comment: 'Decent hotel but overpriced for what you get.', date: '2025-10-14', status: 'Pending', flagged: false, bookingId: 'BK-2025-1230' },
  { id: 'RV-006', guest: 'Emily Davis', room: 'Standard Room', rating: 1, comment: 'Worst experience ever! Full of inappropriate language and spam content here.', date: '2025-10-13', status: 'Rejected', flagged: true, bookingId: 'BK-2025-1229' },
];

export function AdminReviewModeration() {
  const [reviews, setReviews] = useState(mockReviews);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRating, setFilterRating] = useState('all');

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.guest.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || review.status === filterStatus;
    const matchesRating = filterRating === 'all' || review.rating.toString() === filterRating;

    return matchesSearch && matchesStatus && matchesRating;
  });

  const handleApprove = (reviewId: string) => {
    setReviews(reviews.map(r => 
      r.id === reviewId ? { ...r, status: 'Approved' } : r
    ));
    toast.success('Review approved and published');
  };

  const handleReject = (reviewId: string) => {
    setReviews(reviews.map(r => 
      r.id === reviewId ? { ...r, status: 'Rejected' } : r
    ));
    toast.success('Review rejected');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return { bg: '#ffa500', text: '#FFFFFF' };
      case 'Approved': return { bg: '#0F51AF', text: '#FFFFFF' };
      case 'Rejected': return { bg: '#ff4444', text: '#ffffff' };
      default: return { bg: '#666', text: '#ffffff' };
    }
  };

  const pendingCount = reviews.filter(r => r.status === 'Pending').length;
  const flaggedCount = reviews.filter(r => r.flagged && r.status === 'Pending').length;

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
      <div>
        <h1 style={{ color: '#FFFFFF', fontSize: '2rem', marginBottom: '0.5rem' }}>Review Moderation</h1>
        <p style={{ color: '#FFFFFF' }}>Approve or reject guest reviews before publishing</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card style={{ backgroundColor: '#D9D9D9', borderColor: 'rgba(0, 28, 67, 0.2)' }}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#FFFFFF' }}>
                <AlertTriangle className="h-6 w-6" style={{ color: '#ffa500' }} />
              </div>
              <div>
                <p style={{ color: '#627182', fontSize: '0.875rem' }}>Pending Review</p>
                <p style={{ color: '#000000', fontSize: '1.5rem' }}>{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card style={{ backgroundColor: '#D9D9D9', borderColor: 'rgba(0, 28, 67, 0.2)' }}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#FFFFFF' }}>
                <AlertTriangle className="h-6 w-6" style={{ color: '#ff4444' }} />
              </div>
              <div>
                <p style={{ color: '#627182', fontSize: '0.875rem' }}>Flagged Content</p>
                <p style={{ color: '#000000', fontSize: '1.5rem' }}>{flaggedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card style={{ backgroundColor: '#D9D9D9', borderColor: 'rgba(0, 28, 67, 0.2)' }}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#FFFFFF' }}>
                <Star className="h-6 w-6" style={{ color: '#0F51AF' }} />
              </div>
              <div>
                <p style={{ color: '#627182', fontSize: '0.875rem' }}>Avg Rating</p>
                <p style={{ color: '#000000', fontSize: '1.5rem' }}>4.3</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card style={{ backgroundColor: '#D9D9D9', borderColor: 'rgba(0, 28, 67, 0.2)' }}>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: '#627182' }} />
              <Input
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                style={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(0, 28, 67, 0.2)', color: '#000000' }}
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger style={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(0, 28, 67, 0.2)', color: '#000000' }}>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: '#D9D9D9', borderColor: 'rgba(0, 28, 67, 0.2)' }}>
                <SelectItem value="all" style={{ color: '#000000' }}>All Statuses</SelectItem>
                <SelectItem value="Pending" style={{ color: '#000000' }}>Pending</SelectItem>
                <SelectItem value="Approved" style={{ color: '#000000' }}>Approved</SelectItem>
                <SelectItem value="Rejected" style={{ color: '#000000' }}>Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterRating} onValueChange={setFilterRating}>
              <SelectTrigger style={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(0, 28, 67, 0.2)', color: '#000000' }}>
                <SelectValue placeholder="Filter by rating" />
              </SelectTrigger>
              <SelectContent style={{ backgroundColor: '#D9D9D9', borderColor: 'rgba(0, 28, 67, 0.2)' }}>
                <SelectItem value="all" style={{ color: '#000000' }}>All Ratings</SelectItem>
                <SelectItem value="5" style={{ color: '#000000' }}>5 Stars</SelectItem>
                <SelectItem value="4" style={{ color: '#000000' }}>4 Stars</SelectItem>
                <SelectItem value="3" style={{ color: '#000000' }}>3 Stars</SelectItem>
                <SelectItem value="2" style={{ color: '#000000' }}>2 Stars</SelectItem>
                <SelectItem value="1" style={{ color: '#000000' }}>1 Star</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => {
          const statusColor = getStatusColor(review.status);
          return (
            <Card key={review.id} style={{ backgroundColor: '#D9D9D9', borderColor: review.flagged ? '#ff4444' : 'rgba(0, 28, 67, 0.2)' }}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 style={{ color: '#000000' }}>{review.guest}</h3>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="h-4 w-4"
                            style={{
                              color: i < review.rating ? '#0F51AF' : '#666',
                              fill: i < review.rating ? '#0F51AF' : 'none',
                            }}
                          />
                        ))}
                      </div>
                      <Badge style={{ backgroundColor: statusColor.bg, color: statusColor.text }}>
                        {review.status}
                      </Badge>
                      {review.flagged && (
                        <Badge style={{ backgroundColor: '#ff4444', color: '#ffffff' }}>
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Flagged
                        </Badge>
                      )}
                    </div>
                    <p style={{ color: '#627182', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                      {review.room} • {review.date} • Booking: {review.bookingId}
                    </p>
                    <p style={{ color: '#000000' }}>{review.comment}</p>
                  </div>
                  {review.status === 'Pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(review.id)}
                        style={{ backgroundColor: '#0F51AF', color: '#FFFFFF' }}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleReject(review.id)}
                        style={{ backgroundColor: '#ff4444', color: '#ffffff' }}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
