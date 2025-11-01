import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Users, Shield, AlertTriangle } from 'lucide-react';
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
  fetchAllStaff, 
  createStaff, 
  updateStaff, 
  deleteStaff,
  type StaffMember 
} from '../../store/slices/staffSlice';
import backgroundImage from '../../assets/image/background/Offers-section.jpeg';

export function AdminStaff() {
  const dispatch = useAppDispatch();
  const { staff, loading, error } = useAppSelector((state) => state.staff);

  // Fetch staff on mount
  useEffect(() => {
    dispatch(fetchAllStaff({ page: 1, limit: 100 }));
  }, [dispatch]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Receptionist' as StaffMember['role'],
    department: '',
    hire_date: new Date().toISOString().split('T')[0],
    salary: 0,
    emergency_contact: '',
    address: '',
  });

  const handleOpenDialog = (staffMember?: StaffMember) => {
    if (staffMember) {
      setEditingStaff(staffMember);
      setFormData({
        name: staffMember.name,
        email: staffMember.email,
        phone: staffMember.phone,
        role: staffMember.role,
        department: staffMember.department || '',
        hire_date: staffMember.hire_date,
        salary: staffMember.salary || 0,
        emergency_contact: staffMember.emergency_contact || '',
        address: staffMember.address || '',
      });
    } else {
      setEditingStaff(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'Receptionist',
        department: '',
        hire_date: new Date().toISOString().split('T')[0],
        salary: 0,
        emergency_contact: '',
        address: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSaveStaff = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingStaff) {
        await dispatch(updateStaff({
          id: editingStaff.id,
          staffData: formData,
        })).unwrap();
        toast.success('Staff member updated successfully');
      } else {
        await dispatch(createStaff(formData)).unwrap();
        toast.success('Staff member added successfully');
      }
      setIsDialogOpen(false);
      // Refresh staff list
      dispatch(fetchAllStaff({ page: 1, limit: 100 }));
    } catch (err) {
      toast.error(editingStaff ? 'Failed to update staff member' : 'Failed to create staff member');
      console.error('Error saving staff:', err);
    }
  };

  const handleDeleteStaff = async (staffId: number) => {
    try {
      await dispatch(deleteStaff(staffId)).unwrap();
      toast.success('Staff member removed');
      // Refresh staff list
      dispatch(fetchAllStaff({ page: 1, limit: 100 }));
    } catch (err) {
      toast.error('Failed to delete staff member');
      console.error('Error deleting staff:', err);
    }
  };

  const activeStaff = staff.filter(s => s.status === 'active').length;

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

      {/* Loading State */}
      {loading && (
        <Card className="bg-gray-light border-0">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-primary"></div>
              <p className="text-black">Loading staff members...</p>
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
                      <th className="text-left py-3 px-4 text-xs sm:text-sm text-gray-text font-medium">Department</th>
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
                          <Badge className="bg-blue-primary text-white capitalize">
                            {member.role}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-text">{member.department || 'N/A'}</td>
                        <td className="py-3 px-4">
                          <Badge
                            className={member.status === 'active' ? 'bg-green-600 text-white' : member.status === 'on_leave' ? 'bg-yellow-600 text-white' : 'bg-gray-600 text-white'}
                          >
                            {member.status === 'on_leave' ? 'On Leave' : member.status}
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
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteStaff(member.id)}
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
              <Label className="text-black">Phone *</Label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-white border-gray-300 text-black"
              />
            </div>
            <div>
              <Label className="text-black">Role *</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as StaffMember['role'] })}>
                <SelectTrigger className="bg-white border-gray-300 text-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300">
                  <SelectItem value="Manager" className="text-black">Manager</SelectItem>
                  <SelectItem value="Receptionist" className="text-black">Receptionist</SelectItem>
                  <SelectItem value="Housekeeping" className="text-black">Housekeeping</SelectItem>
                  <SelectItem value="Maintenance" className="text-black">Maintenance</SelectItem>
                  <SelectItem value="Security" className="text-black">Security</SelectItem>
                  <SelectItem value="Other" className="text-black">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-black">Department</Label>
              <Input
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="bg-white border-gray-300 text-black"
              />
            </div>
            <div>
              <Label className="text-black">Hire Date *</Label>
              <Input
                type="date"
                value={formData.hire_date}
                onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                className="bg-white border-gray-300 text-black"
              />
            </div>
            <div>
              <Label className="text-black">Salary</Label>
              <Input
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) || 0 })}
                className="bg-white border-gray-300 text-black"
              />
            </div>
            <div>
              <Label className="text-black">Emergency Contact</Label>
              <Input
                value={formData.emergency_contact}
                onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                className="bg-white border-gray-300 text-black"
                placeholder="Phone number"
              />
            </div>
            <div>
              <Label className="text-black">Address</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="bg-white border-gray-300 text-black"
              />
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
