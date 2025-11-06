import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { toast } from '../../lib/toast';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchAllPromoCodes,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
  togglePromoCodeStatus,
  type PromoCode
} from '../../store/slices/promoCodesSlice';
import backgroundImage from '../../assets/image/background/Offers-section.jpeg';

export function AdminPromoCodes() {
  const dispatch = useAppDispatch();
  const { promoCodes, loading, error } = useAppSelector((state) => state.promoCodes);

  // Fetch promo codes on mount
  useEffect(() => {
    dispatch(fetchAllPromoCodes({ page: 1, limit: 100 }));
  }, [dispatch]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    type: 'Percentage' as PromoCode['type'],
    discount_value: '',
    min_booking_amount: '',
    max_discount_amount: '',
    usage_limit: '',
    valid_from: '',
    valid_until: '',
    description: '',
  });

  const handleOpenDialog = (promo?: PromoCode) => {
    if (promo) {
      setEditingPromo(promo);
      setFormData({
        code: promo.code,
        type: promo.type,
        discount_value: promo.discount_value.toString(),
        min_booking_amount: promo.min_booking_amount?.toString() || '',
        max_discount_amount: promo.max_discount_amount?.toString() || '',
        usage_limit: promo.usage_limit?.toString() || '',
        valid_from: promo.valid_from.split('T')[0],
        valid_until: promo.valid_until.split('T')[0],
        description: promo.description || '',
      });
    } else {
      setEditingPromo(null);
      setFormData({
        code: '',
        type: 'Percentage',
        discount_value: '',
        min_booking_amount: '',
        max_discount_amount: '',
        usage_limit: '',
        valid_from: '',
        valid_until: '',
        description: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSavePromo = async () => {
    if (!formData.code || !formData.discount_value || !formData.valid_from || !formData.valid_until) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const promoData = {
        code: formData.code,
        type: formData.type,
        discount_value: parseFloat(formData.discount_value),
        min_booking_amount: formData.min_booking_amount ? parseFloat(formData.min_booking_amount) : undefined,
        max_discount_amount: formData.max_discount_amount ? parseFloat(formData.max_discount_amount) : undefined,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : undefined,
        valid_from: formData.valid_from,
        valid_until: formData.valid_until,
        description: formData.description || undefined,
      };

      if (editingPromo) {
        await dispatch(updatePromoCode({
          id: editingPromo.id,
          promoData,
        })).unwrap();
        toast.success('Promo code updated successfully');
      } else {
        await dispatch(createPromoCode(promoData)).unwrap();
        toast.success('Promo code created successfully');
      }
      setIsDialogOpen(false);
      // Refresh promo codes list
      dispatch(fetchAllPromoCodes({ page: 1, limit: 100 }));
    } catch (err) {
      toast.error(editingPromo ? 'Failed to update promo code' : 'Failed to create promo code');
      console.error('Error saving promo code:', err);
    }
  };

  const handleDeletePromo = async (promoId: number) => {
    try {
      await dispatch(deletePromoCode(promoId)).unwrap();
      toast.success('Promo code deleted successfully');
      // Refresh promo codes list
      dispatch(fetchAllPromoCodes({ page: 1, limit: 100 }));
    } catch (err) {
      toast.error('Failed to delete promo code');
      console.error('Error deleting promo code:', err);
    }
  };

  const toggleActive = async (promoId: number) => {
    try {
      await dispatch(togglePromoCodeStatus(promoId)).unwrap();
      toast.success('Promo code status updated');
      // Refresh promo codes list
      dispatch(fetchAllPromoCodes({ page: 1, limit: 100 }));
    } catch (err) {
      toast.error('Failed to update promo code status');
      console.error('Error toggling status:', err);
    }
  };

  const activePromos = promoCodes.filter(p => p.is_active).length;
  const totalUses = promoCodes.reduce((sum, p) => sum + p.times_used, 0);

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Promo Codes & Discounts</h1>
          <p className="text-sm text-white mt-1">Create and manage promotional offers</p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-blue-primary hover:bg-blue-primary/90 text-white w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Promo Code
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <Card className="bg-gray-light border-0">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-primary"></div>
              <p className="text-black">Loading promo codes...</p>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        <Card className="bg-gray-light border-0">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <Tag className="h-5 w-5 sm:h-6 sm:w-6 text-blue-primary" />
              <div>
                <p className="text-xs sm:text-sm text-gray-text">Active Promos</p>
                <p className="text-xl sm:text-2xl font-bold text-black">{activePromos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-light border-0">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-blue-primary" />
              <div>
                <p className="text-xs sm:text-sm text-gray-text">Total Uses</p>
                <p className="text-xl sm:text-2xl font-bold text-black">{totalUses}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-light border-0">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <Tag className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
              <div>
                <p className="text-xs sm:text-sm text-gray-text">Total Promos</p>
                <p className="text-xl sm:text-2xl font-bold text-black">{promoCodes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Promos Table */}
      <Card className="bg-gray-light border-0">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg text-black">All Promo Codes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden">
                <table className="min-w-[800px] w-full">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="text-left py-3 px-4 text-xs sm:text-sm text-gray-text font-medium">Code</th>
                      <th className="text-left py-3 px-4 text-xs sm:text-sm text-gray-text font-medium">Type</th>
                      <th className="text-left py-3 px-4 text-xs sm:text-sm text-gray-text font-medium">Value</th>
                      <th className="text-left py-3 px-4 text-xs sm:text-sm text-gray-text font-medium">Usage</th>
                      <th className="text-left py-3 px-4 text-xs sm:text-sm text-gray-text font-medium">Valid Period</th>
                      <th className="text-left py-3 px-4 text-xs sm:text-sm text-gray-text font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-xs sm:text-sm text-gray-text font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {promoCodes.map((promo) => (
                      <tr key={promo.id} className="border-b border-gray-300 hover:bg-white/50">
                        <td className="py-3 px-4 text-sm font-medium text-black">{promo.code}</td>
                        <td className="py-3 px-4 text-sm text-gray-text">{promo.type}</td>
                        <td className="py-3 px-4 text-sm font-medium text-black">
                          {promo.type === 'Percentage' ? `${promo.discount_value}%` : `R ${promo.discount_value}`}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-black">
                            {promo.times_used} {promo.usage_limit ? `/ ${promo.usage_limit}` : '(unlimited)'}
                          </div>
                          {promo.usage_limit && (
                            <div className="w-full bg-gray-300 rounded-full h-1.5 mt-1">
                              <div 
                                className="bg-blue-primary h-1.5 rounded-full"
                                style={{ width: `${Math.min((promo.times_used / promo.usage_limit) * 100, 100)}%` }}
                              />
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-text">
                          {new Date(promo.valid_from).toLocaleDateString()} to {new Date(promo.valid_until).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            className={promo.is_active ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'}
                          >
                            {promo.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleActive(promo.id)}
                              className="text-blue-primary hover:text-blue-primary hover:bg-blue-primary/10"
                            >
                              {promo.is_active ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleOpenDialog(promo)}
                              className="text-blue-primary hover:text-blue-primary hover:bg-blue-primary/10"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeletePromo(promo.id)}
                              className="text-red-500 hover:text-red-500 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white border-gray-light max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-black">{editingPromo ? 'Edit Promo Code' : 'Create Promo Code'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-black">Promo Code *</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g., SUMMER2025"
                className="bg-white border-gray-300 text-black"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-black">Discount Type *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as PromoCode['type'] })}>
                  <SelectTrigger className="bg-white border-gray-300 text-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300">
                    <SelectItem value="Percentage" className="text-black">Percentage Off</SelectItem>
                    <SelectItem value="Fixed Amount" className="text-black">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-black">Discount Value *</Label>
                <Input
                  type="number"
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                  placeholder={formData.type === 'Percentage' ? '20' : '500'}
                  className="bg-white border-gray-300 text-black"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-black">Min Booking Amount (R)</Label>
                <Input
                  type="number"
                  value={formData.min_booking_amount}
                  onChange={(e) => setFormData({ ...formData, min_booking_amount: e.target.value })}
                  className="bg-white border-gray-300 text-black"
                />
              </div>
              <div>
                <Label className="text-black">Max Discount Amount (R)</Label>
                <Input
                  type="number"
                  value={formData.max_discount_amount}
                  onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value })}
                  className="bg-white border-gray-300 text-black"
                />
              </div>
            </div>
            <div>
              <Label className="text-black">Usage Limit</Label>
              <Input
                type="number"
                value={formData.usage_limit}
                onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                placeholder="Leave empty for unlimited"
                className="bg-white border-gray-300 text-black"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-black">Valid From *</Label>
                <Input
                  type="date"
                  value={formData.valid_from}
                  onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                  className="bg-white border-gray-300 text-black"
                />
              </div>
              <div>
                <Label className="text-black">Valid Until *</Label>
                <Input
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                  className="bg-white border-gray-300 text-black"
                />
              </div>
            </div>
            <div>
              <Label className="text-black">Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
                className="bg-white border-gray-300 text-black"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSavePromo}
                className="bg-blue-primary hover:bg-blue-primary/90 text-white"
              >
                {editingPromo ? 'Update' : 'Create'} Promo Code
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-gray-300 text-black"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
