import { useState } from 'react';
import { Search, CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { toast } from '../../lib/toast';
import backgroundImage from '../../assets/image/background/Offers-section.jpeg';

type RefundStatus = 'Pending' | 'Approved' | 'Processed' | 'Rejected';

interface Refund {
  id: string;
  bookingId: string;
  guest: string;
  amount: number;
  requestDate: string;
  reason: string;
  status: RefundStatus;
  email: string;
  approvedDate?: string;
  processedDate?: string;
  rejectedDate?: string;
  rejectionReason?: string;
}

const mockRefunds: Refund[] = [
  { id: 'RF-2025-001', bookingId: 'BK-2025-1228', guest: 'Robert Wilson', amount: 9600, requestDate: '2025-10-18', reason: 'Personal emergency', status: 'Pending', email: 'robert@example.com' },
  { id: 'RF-2025-002', bookingId: 'BK-2025-1225', guest: 'Anna Taylor', amount: 5000, requestDate: '2025-10-17', reason: 'Flight cancelled', status: 'Approved', email: 'anna@example.com', approvedDate: '2025-10-18' },
  { id: 'RF-2025-003', bookingId: 'BK-2025-1222', guest: 'Chris Martin', amount: 2400, requestDate: '2025-10-16', reason: 'Overbooked', status: 'Processed', email: 'chris@example.com', processedDate: '2025-10-17' },
  { id: 'RF-2025-004', bookingId: 'BK-2025-1220', guest: 'Diana Prince', amount: 8000, requestDate: '2025-10-15', reason: 'Medical reasons', status: 'Rejected', email: 'diana@example.com', rejectedDate: '2025-10-16', rejectionReason: 'Outside refund policy window' },
  { id: 'RF-2025-005', bookingId: 'BK-2025-1218', guest: 'Tom Hardy', amount: 1600, requestDate: '2025-10-14', reason: 'Change of plans', status: 'Pending', email: 'tom@example.com' },
];

const statsData = [
  { label: 'Pending', value: '2', icon: Clock, color: '#ffa500' },
  { label: 'Approved', value: '1', icon: CheckCircle, color: '#0F51AF' },
  { label: 'Processed', value: '1', icon: DollarSign, color: '#00bfff' },
  { label: 'Rejected', value: '1', icon: XCircle, color: '#ff4444' },
];

export function AdminRefunds() {
  const [refunds, setRefunds] = useState<Refund[]>(mockRefunds);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  const filteredRefunds = refunds.filter(refund => {
    const matchesSearch = 
      refund.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.guest.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || refund.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleApprove = (refundId: string) => {
    setRefunds(refunds.map(r => 
      r.id === refundId ? { ...r, status: 'Approved', approvedDate: new Date().toISOString().split('T')[0] } : r
    ));
    toast.success('Refund approved successfully');
    setIsDialogOpen(false);
  };

  const handleReject = (refundId: string) => {
    if (!adminNotes) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    setRefunds(refunds.map(r => 
      r.id === refundId ? { ...r, status: 'Rejected', rejectedDate: new Date().toISOString().split('T')[0], rejectionReason: adminNotes } : r
    ));
    toast.success('Refund rejected');
    setIsDialogOpen(false);
    setAdminNotes('');
  };

  const handleProcess = (refundId: string) => {
    setRefunds(refunds.map(r => 
      r.id === refundId ? { ...r, status: 'Processed', processedDate: new Date().toISOString().split('T')[0] } : r
    ));
    toast.success('Refund processed successfully');
    setIsDialogOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return { bg: '#ffa500', text: '#FFFFFF' };
      case 'Approved': return { bg: '#0F51AF', text: '#FFFFFF' };
      case 'Processed': return { bg: '#00bfff', text: '#FFFFFF' };
      case 'Rejected': return { bg: '#ff4444', text: '#ffffff' };
      default: return { bg: '#666', text: '#ffffff' };
    }
  };

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
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-white">Refunds Tracker</h1>
        <p className="text-sm sm:text-base text-white">Monitor and manage refund requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-gray-light border-gray-text/20">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 rounded-lg bg-white flex-shrink-0">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: stat.color }} />
                  </div>
                  <div>
                    <p className="text-gray-text text-xs sm:text-sm">{stat.label}</p>
                    <p className="text-black text-xl sm:text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card className="bg-gray-light border-gray-text/20">
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-text" />
              <Input
                placeholder="Search by refund ID, booking ID, or guest name..."
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
                <SelectItem value="Pending" className="text-black">Pending</SelectItem>
                <SelectItem value="Approved" className="text-black">Approved</SelectItem>
                <SelectItem value="Processed" className="text-black">Processed</SelectItem>
                <SelectItem value="Rejected" className="text-black">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Refunds Table */}
      <Card className="bg-gray-light border-gray-text/20">
        <CardHeader>
          <CardTitle className="text-black text-lg sm:text-xl">Refund Requests ({filteredRefunds.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-text/20">
                  <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-gray-text text-xs sm:text-sm font-medium">Refund ID</th>
                  <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-gray-text text-xs sm:text-sm font-medium">Booking ID</th>
                  <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-gray-text text-xs sm:text-sm font-medium">Guest</th>
                  <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-gray-text text-xs sm:text-sm font-medium">Amount</th>
                  <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-gray-text text-xs sm:text-sm font-medium">Request Date</th>
                  <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-gray-text text-xs sm:text-sm font-medium">Reason</th>
                  <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-gray-text text-xs sm:text-sm font-medium">Status</th>
                  <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-gray-text text-xs sm:text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRefunds.map((refund) => {
                  const statusColor = getStatusColor(refund.status);
                  return (
                    <tr key={refund.id} className="border-b border-gray-text/10 hover:bg-white/50 transition-colors">
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-black text-xs sm:text-sm font-medium">{refund.id}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-black text-xs sm:text-sm font-medium">{refund.bookingId}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4">
                        <div>
                          <div className="text-black text-xs sm:text-sm font-medium">{refund.guest}</div>
                          <div className="text-gray-text text-xs">{refund.email}</div>
                        </div>
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-black text-xs sm:text-sm font-medium">R {refund.amount.toLocaleString()}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-gray-text text-xs sm:text-sm">{refund.requestDate}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-gray-text text-xs sm:text-sm">{refund.reason}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4">
                        <Badge
                          className="text-xs"
                          style={{
                            backgroundColor: statusColor.bg,
                            color: statusColor.text,
                          }}
                        >
                          {refund.status}
                        </Badge>
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedRefund(refund);
                            setIsDialogOpen(true);
                          }}
                          className="bg-blue-primary text-white hover:bg-blue-primary/90 text-xs"
                        >
                          Review
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-gray-light border-gray-text/20 max-w-2xl mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="text-black text-lg sm:text-xl">Review Refund Request</DialogTitle>
          </DialogHeader>
          {selectedRefund && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-text text-sm">Refund ID</Label>
                  <p className="text-black font-medium">{selectedRefund.id}</p>
                </div>
                <div>
                  <Label className="text-gray-text text-sm">Booking ID</Label>
                  <p className="text-black font-medium">{selectedRefund.bookingId}</p>
                </div>
                <div>
                  <Label className="text-gray-text text-sm">Guest</Label>
                  <p className="text-black font-medium">{selectedRefund.guest}</p>
                </div>
                <div>
                  <Label className="text-gray-text text-sm">Amount</Label>
                  <p className="text-black font-medium">R {selectedRefund.amount.toLocaleString()}</p>
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <Label className="text-gray-text text-sm">Reason</Label>
                  <p className="text-black">{selectedRefund.reason}</p>
                </div>
              </div>

              {selectedRefund.status === 'Pending' && (
                <>
                  <div>
                    <Label className="text-black text-sm">Admin Notes</Label>
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add notes for rejection reason (optional for approval)"
                      className="min-h-24 bg-white border-gray-text/20 text-black mt-1"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => handleApprove(selectedRefund.id)}
                      className="bg-blue-primary text-white hover:bg-blue-primary/90"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(selectedRefund.id)}
                      className="bg-red-500 text-white hover:bg-red-600"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </>
              )}

              {selectedRefund.status === 'Approved' && (
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleProcess(selectedRefund.id)}
                    className="bg-blue-primary text-white hover:bg-blue-primary/90"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Mark as Processed
                  </Button>
                </div>
              )}

              {(selectedRefund.status === 'Processed' || selectedRefund.status === 'Rejected') && (
                <div className="p-4 rounded-lg bg-white">
                  <p className="text-gray-text text-sm">
                    This refund has been {selectedRefund.status.toLowerCase()}.
                    {selectedRefund.processedDate && ` Processed on: ${selectedRefund.processedDate}`}
                    {selectedRefund.rejectedDate && ` Rejected on: ${selectedRefund.rejectedDate}`}
                  </p>
                  {selectedRefund.rejectionReason && (
                    <p className="text-black mt-2">Reason: {selectedRefund.rejectionReason}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
