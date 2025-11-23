import { useState, useEffect } from 'react';
import { Search, Mail, AlertCircle, Clock, Loader2 } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { toast } from '../../lib/toast';
import backgroundImage from '../../assets/image/background/Offers-section.jpeg';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchAllInquiries, respondToInquiry, updateInquiryStatus, type Inquiry } from '../../store/slices/inquiriesSlice';

export function AdminInquiries() {
  const dispatch = useAppDispatch();
  const { inquiries, loading, error } = useAppSelector((state) => state.inquiries);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    dispatch(fetchAllInquiries({ page: 1, limit: 100 }));
  }, [dispatch]);

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = 
      inquiry.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.guest_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || inquiry.status === filterStatus.toLowerCase().replace(' ', '_');
    const matchesPriority = filterPriority === 'all' || inquiry.priority === filterPriority.toLowerCase();

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleSendReply = async () => {
    if (!replyMessage.trim()) {
      toast.error('Please enter a reply message');
      return;
    }
    
    if (!selectedInquiry) return;

    try {
      await dispatch(respondToInquiry({ 
        id: selectedInquiry.id, 
        response: replyMessage 
      })).unwrap();
      toast.success('Reply sent successfully');
      setIsDialogOpen(false);
      setReplyMessage('');
      dispatch(fetchAllInquiries({ page: 1, limit: 100 }));
    } catch (error) {
      toast.error('Failed to send reply');
      console.error('Error sending reply:', error);
    }
  };

  const handleUpdateStatus = async (inquiryId: number, status: string) => {
    try {
      await dispatch(updateInquiryStatus({
        id: inquiryId,
        status: status.toLowerCase().replace(' ', '_') as 'new' | 'in_progress' | 'resolved' | 'closed'
      })).unwrap();
      toast.success('Status updated successfully');
      dispatch(fetchAllInquiries({ page: 1, limit: 100 }));
    } catch (error) {
      toast.error('Failed to update status');
      console.error('Error updating status:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    const p = priority.toLowerCase();
    switch (p) {
      case 'high':
      case 'urgent': return { bg: '#ff4444', text: '#ffffff' };
      case 'medium': return { bg: '#ffa500', text: '#ffffff' };
      case 'low': return { bg: '#0F51AF', text: '#ffffff' };
      default: return { bg: '#666', text: '#ffffff' };
    }
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase().replace('_', ' ');
    switch (s) {
      case 'new': return { bg: '#0F51AF', text: '#ffffff' };
      case 'in progress': return { bg: '#ffa500', text: '#ffffff' };
      case 'resolved':
      case 'closed': return { bg: '#666', text: '#ffffff' };
      default: return { bg: '#666', text: '#ffffff' };
    }
  };

  const newCount = inquiries.filter(i => i.status === 'new').length;
  const inProgressCount = inquiries.filter(i => i.status === 'in_progress').length;
  const highPriorityCount = inquiries.filter(i => (i.priority === 'high' || i.priority === 'urgent') && i.status !== 'resolved' && i.status !== 'closed').length;

  // Loading state
  if (loading && inquiries.length === 0) {
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
            <span className="ml-3 text-gray-text">Loading inquiries...</span>
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
              <p className="text-red-800 font-medium">Error loading inquiries</p>
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
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-white">Notifications & Inquiries</h1>
        <p className="text-sm sm:text-base text-white">Manage guest messages and system notifications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        <Card className="bg-gray-light border-gray-text/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 rounded-lg bg-white flex-shrink-0">
                <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-blue-primary" />
              </div>
              <div>
                <p className="text-gray-text text-xs sm:text-sm">New Messages</p>
                <p className="text-black text-xl sm:text-2xl font-bold">{newCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-light border-gray-text/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 rounded-lg bg-white flex-shrink-0">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: '#ffa500' }} />
              </div>
              <div>
                <p className="text-gray-text text-xs sm:text-sm">In Progress</p>
                <p className="text-black text-xl sm:text-2xl font-bold">{inProgressCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-light border-gray-text/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 rounded-lg bg-white flex-shrink-0">
                <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: '#ff4444' }} />
              </div>
              <div>
                <p className="text-gray-text text-xs sm:text-sm">High Priority</p>
                <p className="text-black text-xl sm:text-2xl font-bold">{highPriorityCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-gray-light border-gray-text/20">
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-text" />
              <Input
                placeholder="Search inquiries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-gray-text/20 text-black text-sm"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="bg-white border-gray-text/20 text-black text-sm">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-light border-gray-text/20">
                <SelectItem value="all" className="text-black">All Statuses</SelectItem>
                <SelectItem value="New" className="text-black">New</SelectItem>
                <SelectItem value="In Progress" className="text-black">In Progress</SelectItem>
                <SelectItem value="Resolved" className="text-black">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="bg-white border-gray-text/20 text-black text-sm">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent className="bg-gray-light border-gray-text/20">
                <SelectItem value="all" className="text-black">All Priorities</SelectItem>
                <SelectItem value="High" className="text-black">High</SelectItem>
                <SelectItem value="Medium" className="text-black">Medium</SelectItem>
                <SelectItem value="Low" className="text-black">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Inquiries List */}
      <div className="space-y-3 sm:space-y-4">
        {filteredInquiries.map((inquiry) => {
          const priorityColor = getPriorityColor(inquiry.priority);
          const statusColor = getStatusColor(inquiry.status);
          return (
            <Card key={inquiry.id} className="bg-gray-light border-gray-text/20">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-black text-base sm:text-lg font-medium">{inquiry.subject}</h3>
                      <Badge className="text-xs capitalize" style={{ backgroundColor: priorityColor.bg, color: priorityColor.text }}>
                        {inquiry.priority}
                      </Badge>
                      <Badge className="text-xs capitalize" style={{ backgroundColor: statusColor.bg, color: statusColor.text }}>
                        {inquiry.status.replace('_', ' ')}
                      </Badge>
                      <Badge className="text-xs border border-blue-primary text-blue-primary capitalize">
                        {inquiry.category}
                      </Badge>
                    </div>
                    <p className="text-gray-text text-xs sm:text-sm mb-2">
                      From: {inquiry.guest_email} ({inquiry.guest_name}) • {new Date(inquiry.created_at).toLocaleString()}
                    </p>
                    <p className="text-black text-sm">{inquiry.message}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedInquiry(inquiry);
                        setIsDialogOpen(true);
                      }}
                      className="bg-blue-primary text-white hover:bg-blue-primary/90 text-xs"
                    >
                      Reply
                    </Button>
                    {inquiry.status === 'new' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(inquiry.id, 'In Progress')}
                        className="border-blue-primary text-blue-primary hover:bg-blue-primary/10 text-xs"
                      >
                        Start
                      </Button>
                    )}
                    {inquiry.status === 'in_progress' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(inquiry.id, 'Resolved')}
                        className="border-blue-primary text-blue-primary hover:bg-blue-primary/10 text-xs"
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Reply Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-gray-light border-gray-text/20 max-w-2xl mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="text-black text-lg sm:text-xl">Reply to Inquiry</DialogTitle>
          </DialogHeader>
          {selectedInquiry && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-white">
                <p className="text-gray-text text-xs sm:text-sm">Original Message:</p>
                <p className="text-black mt-2 text-sm">{selectedInquiry.message}</p>
              </div>
              <div>
                <Textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply here..."
                  className="min-h-32 bg-white border-gray-text/20 text-black"
                />
              </div>
              <Button onClick={handleSendReply} className="bg-blue-primary text-white hover:bg-blue-primary/90 w-full sm:w-auto">
                <Mail className="h-4 w-4 mr-2" />
                Send Reply
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
