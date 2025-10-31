import { useState } from 'react';
import { Search, Mail, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { toast } from '../../lib/toast';
import backgroundImage from '../../assets/image/background/Offers-section.jpeg';

const mockInquiries = [
  { id: 'INQ-001', from: 'john@example.com', subject: 'Question about cancellation policy', message: 'Hi, I would like to know more about your cancellation policy for bookings made this month.', date: '2025-10-19 14:30', status: 'New', priority: 'Medium', category: 'Policies' },
  { id: 'INQ-002', from: 'jane@example.com', subject: 'Special dietary requirements', message: 'Do you accommodate gluten-free and vegan dietary requirements in your restaurant?', date: '2025-10-19 13:15', status: 'New', priority: 'Low', category: 'Services' },
  { id: 'INQ-003', from: 'mike@example.com', subject: 'Urgent: Booking modification needed', message: 'I need to change my check-in date urgently due to flight changes. Booking ref: BK-2025-1232', date: '2025-10-19 11:45', status: 'In Progress', priority: 'High', category: 'Booking' },
  { id: 'INQ-004', from: 'sarah@example.com', subject: 'Group booking inquiry', message: 'We are planning a corporate event for 50 people. Do you have facilities and group rates available?', date: '2025-10-18 16:20', status: 'Resolved', priority: 'Medium', category: 'Booking' },
  { id: 'INQ-005', from: 'david@example.com', subject: 'WiFi issue in room 305', message: 'The WiFi in my room is not working properly. Can someone help?', date: '2025-10-18 09:00', status: 'Resolved', priority: 'High', category: 'Technical' },
];

export function AdminInquiries() {
  const [inquiries, setInquiries] = useState(mockInquiries);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [selectedInquiry, setSelectedInquiry] = useState<typeof mockInquiries[0] | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = 
      inquiry.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || inquiry.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || inquiry.priority === filterPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleSendReply = () => {
    if (!replyMessage.trim()) {
      toast.error('Please enter a reply message');
      return;
    }
    
    setInquiries(inquiries.map(i => 
      i.id === selectedInquiry?.id ? { ...i, status: 'Resolved' } : i
    ));
    toast.success('Reply sent successfully');
    setIsDialogOpen(false);
    setReplyMessage('');
  };

  const handleUpdateStatus = (inquiryId: string, status: string) => {
    setInquiries(inquiries.map(i => 
      i.id === inquiryId ? { ...i, status } : i
    ));
    toast.success('Status updated');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return { bg: '#ff4444', text: '#ffffff' };
      case 'Medium': return { bg: '#ffa500', text: '#ffffff' };
      case 'Low': return { bg: '#0F51AF', text: '#ffffff' };
      default: return { bg: '#666', text: '#ffffff' };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return { bg: '#0F51AF', text: '#ffffff' };
      case 'In Progress': return { bg: '#ffa500', text: '#ffffff' };
      case 'Resolved': return { bg: '#666', text: '#ffffff' };
      default: return { bg: '#666', text: '#ffffff' };
    }
  };

  const newCount = inquiries.filter(i => i.status === 'New').length;
  const inProgressCount = inquiries.filter(i => i.status === 'In Progress').length;
  const highPriorityCount = inquiries.filter(i => i.priority === 'High' && i.status !== 'Resolved').length;

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
                      <Badge className="text-xs" style={{ backgroundColor: priorityColor.bg, color: priorityColor.text }}>
                        {inquiry.priority}
                      </Badge>
                      <Badge className="text-xs" style={{ backgroundColor: statusColor.bg, color: statusColor.text }}>
                        {inquiry.status}
                      </Badge>
                      <Badge className="text-xs border border-blue-primary text-blue-primary">
                        {inquiry.category}
                      </Badge>
                    </div>
                    <p className="text-gray-text text-xs sm:text-sm mb-2">
                      From: {inquiry.from} • {inquiry.date}
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
                    {inquiry.status === 'New' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(inquiry.id, 'In Progress')}
                        className="border-blue-primary text-blue-primary hover:bg-blue-primary/10 text-xs"
                      >
                        Start
                      </Button>
                    )}
                    {inquiry.status === 'In Progress' && (
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
