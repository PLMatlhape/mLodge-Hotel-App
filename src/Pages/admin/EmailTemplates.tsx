import { useState } from 'react';
import { Mail, Edit2, Eye, Send } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from '../../lib/toast';
import backgroundImage from '../../assets/image/background/Offers-section.jpeg';

const mockTemplates = [
  { 
    id: 1, 
    name: 'Booking Confirmation', 
    subject: 'Your Booking Confirmation - {booking_id}', 
    category: 'Bookings',
    body: 'Dear {guest_name},\n\nThank you for booking with mLodge Hotel. Your booking has been confirmed.\n\nBooking Details:\nReference: {booking_id}\nRoom: {room_name}\nCheck-in: {check_in_date}\nCheck-out: {check_out_date}\nTotal Amount: R{total_amount}\n\nWe look forward to welcoming you!\n\nBest regards,\nmLodge Hotel Team',
    variables: ['guest_name', 'booking_id', 'room_name', 'check_in_date', 'check_out_date', 'total_amount']
  },
  { 
    id: 2, 
    name: 'Booking Cancellation', 
    subject: 'Booking Cancelled - {booking_id}', 
    category: 'Bookings',
    body: 'Dear {guest_name},\n\nYour booking {booking_id} has been cancelled as requested.\n\nA refund of R{refund_amount} will be processed within 5-7 business days.\n\nWe hope to see you again in the future.\n\nBest regards,\nmLodge Hotel Team',
    variables: ['guest_name', 'booking_id', 'refund_amount']
  },
  { 
    id: 3, 
    name: 'Refund Approved', 
    subject: 'Refund Approved - {refund_id}', 
    category: 'Refunds',
    body: 'Dear {guest_name},\n\nYour refund request ({refund_id}) has been approved.\n\nRefund Amount: R{refund_amount}\nOriginal Booking: {booking_id}\n\nThe refund will be processed to your original payment method within 5-7 business days.\n\nBest regards,\nmLodge Hotel Team',
    variables: ['guest_name', 'refund_id', 'refund_amount', 'booking_id']
  },
  { 
    id: 4, 
    name: 'Review Request', 
    subject: 'How was your stay at mLodge Hotel?', 
    category: 'Reviews',
    body: 'Dear {guest_name},\n\nThank you for staying with us! We hope you enjoyed your time at mLodge Hotel.\n\nWe would love to hear about your experience. Please take a moment to leave us a review.\n\nYour booking reference: {booking_id}\n\n[Leave a Review Button]\n\nBest regards,\nmLodge Hotel Team',
    variables: ['guest_name', 'booking_id']
  },
  { 
    id: 5, 
    name: 'Welcome Email', 
    subject: 'Welcome to mLodge Hotel!', 
    category: 'Marketing',
    body: 'Dear {guest_name},\n\nWelcome to mLodge Hotel! We\'re thrilled to have you as our guest.\n\nEnjoy 15% off your first booking with code: WELCOME15\n\nDiscover our luxurious rooms and exceptional service across South Africa.\n\nBest regards,\nmLodge Hotel Team',
    variables: ['guest_name']
  },
  { 
    id: 6, 
    name: 'Payment Receipt', 
    subject: 'Payment Receipt - {booking_id}', 
    category: 'Payments',
    body: 'Dear {guest_name},\n\nThank you for your payment.\n\nPayment Details:\nBooking Reference: {booking_id}\nAmount Paid: R{payment_amount}\nPayment Method: {payment_method}\nDate: {payment_date}\n\nYour receipt is attached to this email.\n\nBest regards,\nmLodge Hotel Team',
    variables: ['guest_name', 'booking_id', 'payment_amount', 'payment_method', 'payment_date']
  },
];

export function AdminEmailTemplates() {
  const [templates, setTemplates] = useState(mockTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<typeof mockTemplates[0] | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    subject: '',
    body: '',
  });

  const handleEditTemplate = (template: typeof mockTemplates[0]) => {
    setSelectedTemplate(template);
    setEditFormData({
      subject: template.subject,
      body: template.body,
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveTemplate = () => {
    if (!editFormData.subject || !editFormData.body) {
      toast.error('Please fill in all fields');
      return;
    }

    setTemplates(templates.map(t => 
      t.id === selectedTemplate?.id 
        ? { ...t, subject: editFormData.subject, body: editFormData.body }
        : t
    ));
    toast.success('Email template updated successfully');
    setIsEditDialogOpen(false);
  };

  const handlePreview = (template: typeof mockTemplates[0]) => {
    setSelectedTemplate(template);
    setIsPreviewDialogOpen(true);
  };

  const handleSendTest = () => {
    toast.success('Test email sent to your email address');
  };

  const getPreviewContent = (template: typeof mockTemplates[0]) => {
    let subject = template.subject;
    let body = template.body;

    // Replace variables with sample data
    const sampleData: { [key: string]: string } = {
      guest_name: 'John Doe',
      booking_id: 'BK-2025-1234',
      room_name: 'Luxury Penthouse',
      check_in_date: '2025-10-25',
      check_out_date: '2025-10-28',
      total_amount: '24,000',
      refund_amount: '24,000',
      refund_id: 'RF-2025-001',
      payment_amount: '24,000',
      payment_method: 'Credit Card',
      payment_date: '2025-10-19',
    };

    template.variables.forEach(variable => {
      const regex = new RegExp(`{${variable}}`, 'g');
      subject = subject.replace(regex, sampleData[variable] || variable);
      body = body.replace(regex, sampleData[variable] || variable);
    });

    return { subject, body };
  };

  const categories = Array.from(new Set(templates.map(t => t.category)));

  return (
    <div className="relative p-4 sm:p-6 space-y-4 sm:space-y-6">
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
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Email Template Editor</h1>
        <p className="text-sm text-white mt-1">Customize automated email templates</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        <Card className="bg-gray-light border-0">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-blue-primary" />
              <div>
                <p className="text-xs sm:text-sm text-gray-text">Total Templates</p>
                <p className="text-xl sm:text-2xl font-bold text-black">{templates.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-light border-0">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-sky-500" />
              <div>
                <p className="text-xs sm:text-sm text-gray-text">Categories</p>
                <p className="text-xl sm:text-2xl font-bold text-black">{categories.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-light border-0">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <Send className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500" />
              <div>
                <p className="text-xs sm:text-sm text-gray-text">Active</p>
                <p className="text-xl sm:text-2xl font-bold text-black">{templates.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Templates by Category */}
      <Tabs defaultValue={categories[0]}>
        <TabsList className="bg-gray-light border-gray-300">
          {categories.map(category => (
            <TabsTrigger key={category} value={category} className="text-black data-[state=active]:bg-blue-primary data-[state=active]:text-white">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
        {categories.map(category => (
          <TabsContent key={category} value={category} className="space-y-4">
            {templates.filter(t => t.category === category).map(template => (
              <Card key={template.id} className="bg-gray-light border-0">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-base sm:text-lg font-semibold text-black">{template.name}</h3>
                        <Badge className="bg-blue-primary text-white">
                          {template.category}
                        </Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-text mb-3">
                        Subject: {template.subject}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {template.variables.map((variable, index) => (
                          <Badge key={index} className="border border-blue-primary text-blue-primary text-xs">
                            {`{${variable}}`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePreview(template)}
                        className="border-blue-primary text-blue-primary hover:bg-blue-primary/10"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleEditTemplate(template)}
                        className="bg-blue-primary hover:bg-blue-primary/90 text-white"
                      >
                        <Edit2 className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-white border-gray-light max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-black">Edit Email Template: {selectedTemplate?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-black">Subject Line</Label>
              <Input
                value={editFormData.subject}
                onChange={(e) => setEditFormData({ ...editFormData, subject: e.target.value })}
                className="bg-white border-gray-300 text-black"
              />
            </div>
            <div>
              <Label className="text-black">Email Body</Label>
              <Textarea
                value={editFormData.body}
                onChange={(e) => setEditFormData({ ...editFormData, body: e.target.value })}
                className="min-h-64 font-mono bg-white border-gray-300 text-black"
              />
            </div>
            <div className="p-4 rounded-lg bg-gray-light">
              <p className="text-xs sm:text-sm text-gray-text mb-2">Available Variables:</p>
              <div className="flex flex-wrap gap-2">
                {selectedTemplate?.variables.map((variable, index) => (
                  <Badge key={index} className="border border-blue-primary text-blue-primary">
                    {`{${variable}}`}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSaveTemplate}
                className="bg-blue-primary hover:bg-blue-primary/90 text-white"
              >
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="border-gray-300 text-black"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="bg-white border-gray-light max-w-3xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-black">Email Preview: {selectedTemplate?.name}</DialogTitle>
              <Button
                size="sm"
                onClick={handleSendTest}
                className="bg-blue-primary hover:bg-blue-primary/90 text-white"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Test
              </Button>
            </div>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-gray-light">
                <p className="text-xs sm:text-sm text-gray-text mb-2">Subject:</p>
                <p className="text-black font-medium">{getPreviewContent(selectedTemplate).subject}</p>
              </div>
              <div className="p-4 rounded-lg bg-white border border-gray-300">
                <div className="text-black" style={{ whiteSpace: 'pre-wrap' }}>{getPreviewContent(selectedTemplate).body}</div>
              </div>
              <p className="text-xs sm:text-sm text-gray-text">
                * Preview shows sample data for variables
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
