import { useState } from 'react';
import { Plus, Edit2, Trash2, Users, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { Badge } from '../../components/ui/badge';
import { Checkbox } from '../../components/ui/checkbox';
import { toast } from '../../lib/toast';
import backgroundImage from '../../assets/image/background/Offers-section.jpeg';

const mockStaff = [
  { id: 1, name: 'Admin User', email: 'admin@mlodge.com', role: 'Super Admin', active: true, permissions: ['all'], lastLogin: '2025-10-19 14:30' },
  { id: 2, name: 'Jane Manager', email: 'jane@mlodge.com', role: 'Manager', active: true, permissions: ['bookings', 'reviews', 'analytics', 'reports', 'inquiries', 'inventory'], lastLogin: '2025-10-19 10:15' },
  { id: 3, name: 'John Receptionist', email: 'john@mlodge.com', role: 'Front Desk', active: true, permissions: ['bookings', 'inquiries'], lastLogin: '2025-10-18 16:45' },
  { id: 4, name: 'Sarah Finance', email: 'sarah@mlodge.com', role: 'Finance', active: true, permissions: ['bookings', 'refunds', 'analytics', 'reports'], lastLogin: '2025-10-19 09:20' },
  { id: 5, name: 'Mike Support', email: 'mike@mlodge.com', role: 'Support', active: false, permissions: ['inquiries', 'reviews'], lastLogin: '2025-10-15 12:00' },
];

const allPermissions = [
  { id: 'bookings', label: 'Bookings Management' },
  { id: 'refunds', label: 'Refunds Tracker' },
  { id: 'reviews', label: 'Review Moderation' },
  { id: 'analytics', label: 'Performance Analytics' },
  { id: 'reports', label: 'Summary Reports' },
  { id: 'inquiries', label: 'Inquiries & Notifications' },
  { id: 'inventory', label: 'Room Inventory' },
  { id: 'promos', label: 'Promo Codes' },
  { id: 'staff', label: 'Staff Management' },
  { id: 'logs', label: 'Audit Logs' },
  { id: 'emails', label: 'Email Templates' },
];

export function AdminStaff() {
  const [staff, setStaff] = useState(mockStaff);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<typeof mockStaff[0] | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Front Desk',
    active: true,
    permissions: [] as string[],
  });

  const handleOpenDialog = (staffMember?: typeof mockStaff[0]) => {
    if (staffMember) {
      setEditingStaff(staffMember);
      setFormData({
        name: staffMember.name,
        email: staffMember.email,
        role: staffMember.role,
        active: staffMember.active,
        permissions: staffMember.permissions,
      });
    } else {
      setEditingStaff(null);
      setFormData({
        name: '',
        email: '',
        role: 'Front Desk',
        active: true,
        permissions: [],
      });
    }
    setIsDialogOpen(true);
  };

  const handleSaveStaff = () => {
    if (!formData.name || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingStaff) {
      setStaff(staff.map(s => 
        s.id === editingStaff.id 
          ? { 
              ...s, 
              name: formData.name,
              email: formData.email,
              role: formData.role,
              active: formData.active,
              permissions: formData.permissions,
            } 
          : s
      ));
      toast.success('Staff member updated successfully');
    } else {
      const newStaff = {
        id: Math.max(...staff.map(s => s.id)) + 1,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        active: formData.active,
        permissions: formData.permissions,
        lastLogin: 'Never',
      };
      setStaff([...staff, newStaff]);
      toast.success('Staff member added successfully');
    }
    setIsDialogOpen(false);
  };

  const handleDeleteStaff = (staffId: number) => {
    setStaff(staff.filter(s => s.id !== staffId));
    toast.success('Staff member removed');
  };

  const togglePermission = (permissionId: string) => {
    setFormData({
      ...formData,
      permissions: formData.permissions.includes(permissionId)
        ? formData.permissions.filter(p => p !== permissionId)
        : [...formData.permissions, permissionId],
    });
  };

  const activeStaff = staff.filter(s => s.active).length;

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
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Staff Roles & Permissions</h1>
          <p className="text-sm text-white mt-1">Manage admin users and their access levels</p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-blue-primary hover:bg-blue-primary/90 text-white w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Staff Member
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <Card className="bg-gray-light border-0">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-primary" />
              <div>
                <p className="text-xs sm:text-sm text-gray-text">Active Staff</p>
                <p className="text-xl sm:text-2xl font-bold text-black">{activeStaff}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-light border-0">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-blue-primary" />
              <div>
                <p className="text-xs sm:text-sm text-gray-text">Total Staff</p>
                <p className="text-xl sm:text-2xl font-bold text-black">{staff.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staff Table */}
      <Card className="bg-gray-light border-0">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg text-black">Staff Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden">
                <table className="min-w-[800px] w-full">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="text-left py-3 px-4 text-xs sm:text-sm text-gray-text font-medium">Name</th>
                      <th className="text-left py-3 px-4 text-xs sm:text-sm text-gray-text font-medium">Email</th>
                      <th className="text-left py-3 px-4 text-xs sm:text-sm text-gray-text font-medium">Role</th>
                      <th className="text-left py-3 px-4 text-xs sm:text-sm text-gray-text font-medium">Last Login</th>
                      <th className="text-left py-3 px-4 text-xs sm:text-sm text-gray-text font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-xs sm:text-sm text-gray-text font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.map((member) => (
                      <tr key={member.id} className="border-b border-gray-300 hover:bg-white/50">
                        <td className="py-3 px-4 text-sm font-medium text-black">{member.name}</td>
                        <td className="py-3 px-4 text-sm text-gray-text">{member.email}</td>
                        <td className="py-3 px-4">
                          <Badge
                            className={member.role === 'Super Admin' ? 'bg-blue-primary text-white' : 'bg-sky-500 text-white'}
                          >
                            {member.role}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-text">{member.lastLogin}</td>
                        <td className="py-3 px-4">
                          <Badge
                            className={member.active ? 'bg-blue-primary text-white' : 'bg-gray-600 text-white'}
                          >
                            {member.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleOpenDialog(member)}
                              className="text-blue-primary hover:text-blue-primary hover:bg-blue-primary/10"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            {member.role !== 'Super Admin' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteStaff(member.id)}
                                className="text-red-500 hover:text-red-500 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
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
        <DialogContent className="bg-white border-gray-light max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-black">{editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-black">Full Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-white border-gray-300 text-black"
              />
            </div>
            <div>
              <Label className="text-black">Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-white border-gray-300 text-black"
              />
            </div>
            <div>
              <Label className="text-black">Role *</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger className="bg-white border-gray-300 text-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300">
                  <SelectItem value="Super Admin" className="text-black">Super Admin</SelectItem>
                  <SelectItem value="Manager" className="text-black">Manager</SelectItem>
                  <SelectItem value="Front Desk" className="text-black">Front Desk</SelectItem>
                  <SelectItem value="Finance" className="text-black">Finance</SelectItem>
                  <SelectItem value="Support" className="text-black">Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
              <Label className="text-black">Active Account</Label>
            </div>
            <div>
              <Label className="text-black mb-2 block">Permissions</Label>
              <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                {allPermissions.map((permission) => (
                  <div key={permission.id} className="flex items-center gap-2 p-2 rounded bg-gray-light">
                    <Checkbox
                      checked={formData.permissions.includes(permission.id)}
                      onCheckedChange={() => togglePermission(permission.id)}
                    />
                    <label className="text-black cursor-pointer" onClick={() => togglePermission(permission.id)}>
                      {permission.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSaveStaff}
                className="bg-blue-primary hover:bg-blue-primary/90 text-white"
              >
                {editingStaff ? 'Update' : 'Add'} Staff Member
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
