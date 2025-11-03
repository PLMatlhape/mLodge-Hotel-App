import { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, AlertTriangle, Star } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { toast } from '../../lib/toast';
import backgroundImage from '../../assets/image/background/Offers-section.jpeg';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchAllReviews, updateReviewStatus } from '../../store/slices/reviewsSlice';

export function AdminReviewModeration() {
  const dispatch = useAppDispatch();
  const { reviews, loading, error } = useAppSelector((state) => state.reviews);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRating, setFilterRating] = useState('all');

  // Fetch reviews on mount
  useEffect(() => {
    dispatch(fetchAllReviews({ page: 1, limit: 100 }));
  }, [dispatch]);

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.accommodation_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || review.status === filterStatus;
    const matchesRating = filterRating === 'all' || review.rating.toString() === filterRating;

    return matchesSearch && matchesStatus && matchesRating;
  });

  const handleApprove = async (reviewId: string) => {
    try {
      await dispatch(updateReviewStatus({ 
        id: parseInt(reviewId), 
        status: 'approved' 
      })).unwrap();
      toast.success('Review approved and published');
      // Refresh reviews
      dispatch(fetchAllReviews({ page: 1, limit: 100 }));
    } catch (err) {
      toast.error('Failed to approve review');
      console.error('Error approving review:', err);
    }
  };

  const handleReject = async (reviewId: string) => {
    try {
      await dispatch(updateReviewStatus({ 
        id: parseInt(reviewId), 
        status: 'rejected' 
      })).unwrap();
      toast.success('Review rejected');
      // Refresh reviews
      dispatch(fetchAllReviews({ page: 1, limit: 100 }));
    } catch (err) {
      toast.error('Failed to reject review');
      console.error('Error rejecting review:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return { bg: '#ffa500', text: '#FFFFFF' };
      case 'approved': return { bg: '#0F51AF', text: '#FFFFFF' };
      case 'rejected': return { bg: '#ff4444', text: '#ffffff' };
      default: return { bg: '#666', text: '#ffffff' };
    }
  };

  const pendingCount = reviews.filter(r => r.status === 'pending').length;
  const flaggedCount = 0; // Flagged feature not implemented yet

  return (
    <div className="relative p-6 space-y-6 min-h-screen">
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

      {/* Loading State */}
      {loading && (
        <Card style={{ backgroundColor: '#D9D9D9', borderColor: 'rgba(0, 28, 67, 0.2)' }}>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: '#0F51AF' }}></div>
              <p style={{ color: '#000000' }}>Loading reviews...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card style={{ backgroundColor: '#ff4444', borderColor: '#cc0000' }}>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" style={{ color: '#FFFFFF' }} />
              <p style={{ color: '#FFFFFF' }}>Error: {error}</p>
            </div>
          </CardContent>
        </Card>
      )}

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
                <SelectItem value="pending" style={{ color: '#000000' }}>Pending</SelectItem>
                <SelectItem value="approved" style={{ color: '#000000' }}>Approved</SelectItem>
                <SelectItem value="rejected" style={{ color: '#000000' }}>Rejected</SelectItem>
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
            <Card key={review.id} style={{ backgroundColor: '#D9D9D9', borderColor: 'rgba(0, 28, 67, 0.2)' }}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 style={{ color: '#000000' }}>{review.user_name || 'Anonymous'}</h3>
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
                      <Badge style={{ 
                        backgroundColor: statusColor.bg, 
                        color: statusColor.text,
                        textTransform: 'capitalize'
                      }}>
                        {review.status}
                      </Badge>
                    </div>
                    <p style={{ color: '#627182', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                      {review.accommodation_name || `Room #${review.accommodation_id}`} • {new Date(review.created_at).toLocaleDateString()}
                    </p>
                    <p style={{ color: '#000000' }}>{review.comment}</p>
                  </div>
                  {review.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(review.id.toString())}
                        style={{ backgroundColor: '#0F51AF', color: '#FFFFFF' }}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleReject(review.id.toString())}
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
