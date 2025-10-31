import { useState } from 'react';
import { Plus, Edit2, Trash2, Tag, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { Badge } from '../../components/ui/badge';
import { toast } from '../../lib/toast';
import backgroundImage from '../../assets/image/background/Offers-section.jpeg';

const mockPromos = [
  { id: 1, code: 'SUMMER2025', type: 'Percentage', value: 20, minSpend: 2000, maxDiscount: 1000, uses: 45, maxUses: 100, active: true, startDate: '2025-06-01', endDate: '2025-08-31' },
  { id: 2, code: 'FIRSTBOOK', type: 'Fixed', value: 500, minSpend: 1000, maxDiscount: 500, uses: 28, maxUses: 50, active: true, startDate: '2025-01-01', endDate: '2025-12-31' },
  { id: 3, code: 'WEEKEND15', type: 'Percentage', value: 15, minSpend: 1500, maxDiscount: 750, uses: 67, maxUses: 200, active: true, startDate: '2025-01-01', endDate: '2025-12-31' },
  { id: 4, code: 'LOYALTY25', type: 'Percentage', value: 25, minSpend: 3000, maxDiscount: 1500, uses: 12, maxUses: 30, active: false, startDate: '2025-03-01', endDate: '2025-05-31' },
];

export function AdminPromoCodes() {
  const [promos, setPromos] = useState(mockPromos);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<typeof mockPromos[0] | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    type: 'Percentage',
    value: '',
    minSpend: '',
    maxDiscount: '',
    maxUses: '',
    active: true,
    startDate: '',
    endDate: '',
  });

  const handleOpenDialog = (promo?: typeof mockPromos[0]) => {
    if (promo) {
      setEditingPromo(promo);
      setFormData({
        code: promo.code,
        type: promo.type,
        value: promo.value.toString(),
        minSpend: promo.minSpend.toString(),
        maxDiscount: promo.maxDiscount.toString(),
        maxUses: promo.maxUses.toString(),
        active: promo.active,
        startDate: promo.startDate,
        endDate: promo.endDate,
      });
    } else {
      setEditingPromo(null);
      setFormData({
        code: '',
        type: 'Percentage',
        value: '',
        minSpend: '',
        maxDiscount: '',
        maxUses: '',
        active: true,
        startDate: '',
        endDate: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSavePromo = () => {
    if (!formData.code || !formData.value || !formData.maxUses) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingPromo) {
      setPromos(promos.map(p => 
        p.id === editingPromo.id 
          ? { 
              ...p, 
              code: formData.code,
              type: formData.type,
              value: parseInt(formData.value),
              minSpend: parseInt(formData.minSpend || '0'),
              maxDiscount: parseInt(formData.maxDiscount || '0'),
              maxUses: parseInt(formData.maxUses),
              active: formData.active,
              startDate: formData.startDate,
              endDate: formData.endDate,
            } 
          : p
      ));
      toast.success('Promo code updated successfully');
    } else {
      const newPromo = {
        id: Math.max(...promos.map(p => p.id)) + 1,
        code: formData.code,
        type: formData.type,
        value: parseInt(formData.value),
        minSpend: parseInt(formData.minSpend || '0'),
        maxDiscount: parseInt(formData.maxDiscount || '0'),
        uses: 0,
        maxUses: parseInt(formData.maxUses),
        active: formData.active,
        startDate: formData.startDate,
        endDate: formData.endDate,
      };
      setPromos([...promos, newPromo]);
      toast.success('Promo code created successfully');
    }
    setIsDialogOpen(false);
  };

  const handleDeletePromo = (promoId: number) => {
    setPromos(promos.filter(p => p.id !== promoId));
    toast.success('Promo code deleted successfully');
  };

  const toggleActive = (promoId: number) => {
    setPromos(promos.map(p => 
      p.id === promoId ? { ...p, active: !p.active } : p
    ));
    toast.success('Promo code status updated');
  };

  const activePromos = promos.filter(p => p.active).length;
  const totalUses = promos.reduce((sum, p) => sum + p.uses, 0);

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
                <p className="text-xl sm:text-2xl font-bold text-black">{promos.length}</p>
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
                    {promos.map((promo) => (
                      <tr key={promo.id} className="border-b border-gray-300 hover:bg-white/50">
                        <td className="py-3 px-4 text-sm font-medium text-black">{promo.code}</td>
                        <td className="py-3 px-4 text-sm text-gray-text">{promo.type}</td>
                        <td className="py-3 px-4 text-sm font-medium text-black">
                          {promo.type === 'Percentage' ? `${promo.value}%` : `R ${promo.value}`}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-black">
                            {promo.uses} / {promo.maxUses}
                          </div>
                          <div className="w-full bg-gray-300 rounded-full h-1.5 mt-1">
                            <div 
                              className="bg-blue-primary h-1.5 rounded-full"
                              style={{ width: `${(promo.uses / promo.maxUses) * 100}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-text">{promo.startDate} to {promo.endDate}</td>
                        <td className="py-3 px-4">
                          <Badge
                            className={promo.active ? 'bg-blue-primary text-white' : 'bg-gray-600 text-white'}
                          >
                            {promo.active ? 'Active' : 'Inactive'}
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
                              {promo.active ? 'Deactivate' : 'Activate'}
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
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger className="bg-white border-gray-300 text-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300">
                    <SelectItem value="Percentage" className="text-black">Percentage Off</SelectItem>
                    <SelectItem value="Fixed" className="text-black">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-black">Value *</Label>
                <Input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder={formData.type === 'Percentage' ? '20' : '500'}
                  className="bg-white border-gray-300 text-black"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-black">Min Spend (R)</Label>
                <Input
                  type="number"
                  value={formData.minSpend}
                  onChange={(e) => setFormData({ ...formData, minSpend: e.target.value })}
                  className="bg-white border-gray-300 text-black"
                />
              </div>
              <div>
                <Label className="text-black">Max Discount (R)</Label>
                <Input
                  type="number"
                  value={formData.maxDiscount}
                  onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                  className="bg-white border-gray-300 text-black"
                />
              </div>
            </div>
            <div>
              <Label className="text-black">Max Uses *</Label>
              <Input
                type="number"
                value={formData.maxUses}
                onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                className="bg-white border-gray-300 text-black"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-black">Start Date</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="bg-white border-gray-300 text-black"
                />
              </div>
              <div>
                <Label className="text-black">End Date</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="bg-white border-gray-300 text-black"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
              <Label className="text-black">Active</Label>
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
