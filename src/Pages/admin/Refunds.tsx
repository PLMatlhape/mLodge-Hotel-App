import { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Clock, DollarSign, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { toast } from '../../lib/toast';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchAllRefunds,
  approveRefund,
  rejectRefund,
  processRefund,
  type Refund
} from '../../store/slices/refundsSlice';
import backgroundImage from '../../assets/image/background/Offers-section.jpeg';

export function AdminRefunds() {
  const dispatch = useAppDispatch();
  const { refunds, loading, error } = useAppSelector((state) => state.refunds);

  // Fetch refunds on mount
  useEffect(() => {
    dispatch(fetchAllRefunds({ page: 1, limit: 100 }));
  }, [dispatch]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  const filteredRefunds = refunds.filter(refund => {
    const matchesSearch = 
      refund.id.toString().includes(searchTerm.toLowerCase()) ||
      refund.booking_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.guest_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || refund.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleApprove = async (refundId: number) => {
    try {
      await dispatch(approveRefund({ id: refundId, adminNotes })).unwrap();
      toast.success('Refund approved successfully');
      setIsDialogOpen(false);
      setAdminNotes('');
      // Refresh refunds list
      dispatch(fetchAllRefunds({ page: 1, limit: 100 }));
    } catch (err) {
      toast.error('Failed to approve refund');
      console.error('Error approving refund:', err);
    }
  };

  const handleReject = async (refundId: number) => {
    if (!adminNotes) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    try {
      await dispatch(rejectRefund({ id: refundId, rejectionReason: adminNotes })).unwrap();
      toast.success('Refund rejected');
      setIsDialogOpen(false);
      setAdminNotes('');
      // Refresh refunds list
      dispatch(fetchAllRefunds({ page: 1, limit: 100 }));
    } catch (err) {
      toast.error('Failed to reject refund');
      console.error('Error rejecting refund:', err);
    }
  };

  const handleProcess = async (refundId: number) => {
    try {
      await dispatch(processRefund({ id: refundId, adminNotes })).unwrap();
      toast.success('Refund processed successfully');
      setIsDialogOpen(false);
      setAdminNotes('');
      // Refresh refunds list
      dispatch(fetchAllRefunds({ page: 1, limit: 100 }));
    } catch (err) {
      toast.error('Failed to process refund');
      console.error('Error processing refund:', err);
    }
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

  const statsCount = {
    pending: refunds.filter(r => r.status === 'Pending').length,
    approved: refunds.filter(r => r.status === 'Approved').length,
    processed: refunds.filter(r => r.status === 'Processed').length,
    rejected: refunds.filter(r => r.status === 'Rejected').length,
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

      {/* Loading State */}
      {loading && (
        <Card className="bg-gray-light border-0">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-primary"></div>
              <p className="text-black">Loading refunds...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="bg-red-100 border-red-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <p className="text-red-600">Error: {error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-gray-light border-gray-text/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 rounded-lg bg-white flex-shrink-0">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: '#ffa500' }} />
              </div>
              <div>
                <p className="text-gray-text text-xs sm:text-sm">Pending</p>
                <p className="text-black text-xl sm:text-2xl font-bold">{statsCount.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-light border-gray-text/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 rounded-lg bg-white flex-shrink-0">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: '#0F51AF' }} />
              </div>
              <div>
                <p className="text-gray-text text-xs sm:text-sm">Approved</p>
                <p className="text-black text-xl sm:text-2xl font-bold">{statsCount.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-light border-gray-text/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 rounded-lg bg-white flex-shrink-0">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: '#00bfff' }} />
              </div>
              <div>
                <p className="text-gray-text text-xs sm:text-sm">Processed</p>
                <p className="text-black text-xl sm:text-2xl font-bold">{statsCount.processed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-light border-gray-text/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 rounded-lg bg-white flex-shrink-0">
                <XCircle className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: '#ff4444' }} />
              </div>
              <div>
                <p className="text-gray-text text-xs sm:text-sm">Rejected</p>
                <p className="text-black text-xl sm:text-2xl font-bold">{statsCount.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>
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
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-black text-xs sm:text-sm font-medium">#{refund.id}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-black text-xs sm:text-sm font-medium">{refund.booking_reference}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4">
                        <div>
                          <div className="text-black text-xs sm:text-sm font-medium">{refund.guest_name}</div>
                          <div className="text-gray-text text-xs">{refund.guest_email}</div>
                        </div>
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-black text-xs sm:text-sm font-medium">R {refund.amount.toLocaleString()}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-gray-text text-xs sm:text-sm">
                        {new Date(refund.requested_date).toLocaleDateString()}
                      </td>
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
                  <p className="text-black font-medium">#{selectedRefund.id}</p>
                </div>
                <div>
                  <Label className="text-gray-text text-sm">Booking Reference</Label>
                  <p className="text-black font-medium">{selectedRefund.booking_reference}</p>
                </div>
                <div>
                  <Label className="text-gray-text text-sm">Guest</Label>
                  <p className="text-black font-medium">{selectedRefund.guest_name}</p>
                  <p className="text-gray-text text-xs">{selectedRefund.guest_email}</p>
                </div>
                <div>
                  <Label className="text-gray-text text-sm">Amount</Label>
                  <p className="text-black font-medium">R {selectedRefund.amount.toLocaleString()}</p>
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <Label className="text-gray-text text-sm">Reason</Label>
                  <p className="text-black">{selectedRefund.reason}</p>
                </div>
                <div>
                  <Label className="text-gray-text text-sm">Requested Date</Label>
                  <p className="text-black">{new Date(selectedRefund.requested_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-gray-text text-sm">Status</Label>
                  <Badge className="capitalize">{selectedRefund.status}</Badge>
                </div>
                {selectedRefund.rejection_reason && (
                  <div className="col-span-1 sm:col-span-2">
                    <Label className="text-gray-text text-sm">Rejection Reason</Label>
                    <p className="text-red-600">{selectedRefund.rejection_reason}</p>
                  </div>
                )}
              </div>

              {selectedRefund.status === 'Pending' && (
                <>
                  <div>
                    <Label className="text-black text-sm">Admin Notes</Label>
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add notes for rejection reason (required for rejection, optional for approval)"
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
