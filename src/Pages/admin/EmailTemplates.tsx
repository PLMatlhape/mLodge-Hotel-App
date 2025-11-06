import { useState, useEffect } from 'react';
import { Mail, Edit2, Eye, Send, Loader2, AlertCircle } from 'lucide-react';
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
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchAllTemplates, updateTemplate, type EmailTemplate } from '../../store/slices/emailTemplatesSlice';

export function AdminEmailTemplates() {
  const dispatch = useAppDispatch();
  const { templates, loading, error } = useAppSelector((state) => state.emailTemplates);
  
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    subject: '',
    body: '',
  });

  useEffect(() => {
    dispatch(fetchAllTemplates());
  }, [dispatch]);

  const handleEditTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setEditFormData({
      subject: template.subject,
      body: template.body,
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveTemplate = async () => {
    if (!editFormData.subject || !editFormData.body || !selectedTemplate) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await dispatch(updateTemplate({
        id: selectedTemplate.id,
        templateData: {
          subject: editFormData.subject,
          body: editFormData.body,
        }
      })).unwrap();
      toast.success('Email template updated successfully');
      setIsEditDialogOpen(false);
      dispatch(fetchAllTemplates());
    } catch (error) {
      toast.error('Failed to update template');
      console.error('Error updating template:', error);
    }
  };

  const handlePreview = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsPreviewDialogOpen(true);
  };

  const handleSendTest = () => {
    toast.success('Test email sent to your email address');
  };

  const getPreviewContent = (template: EmailTemplate) => {
    let subject = template.subject;
    let body = template.body;

    // Replace variables with sample data
    const sampleData: { [key: string]: string } = {
      guest_name: 'John Doe',
      booking_id: 'BK-2025-1234',
      booking_reference: 'BK-2025-1234',
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
      const cleanVar = variable.replace(/[{}]/g, '');
      const regex = new RegExp(`{{${cleanVar}}}|{${cleanVar}}`, 'g');
      subject = subject.replace(regex, sampleData[cleanVar] || cleanVar);
      body = body.replace(regex, sampleData[cleanVar] || cleanVar);
    });

    return { subject, body };
  };

  const categories = Array.from(new Set(templates.map(t => t.type)));

  // Loading state
  if (loading && templates.length === 0) {
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
            <span className="ml-3 text-gray-text">Loading templates...</span>
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
              <p className="text-red-800 font-medium">Error loading templates</p>
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
            {templates.filter(t => t.type === category).map(template => (
              <Card key={template.id} className="bg-gray-light border-0">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-base sm:text-lg font-semibold text-black">{template.name}</h3>
                        <Badge className="bg-blue-primary text-white">
                          {template.type}
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
