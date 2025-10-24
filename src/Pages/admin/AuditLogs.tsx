import { useState } from 'react';
import { Search, FileSearch, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { toast } from '../../lib/toast';
import backgroundImage from '../../assets/image/background/Offers-section.jpeg';

const mockLogs = [
  { id: 1, timestamp: '2025-10-19 14:35:22', user: 'admin@mlodge.com', action: 'Booking Updated', module: 'Bookings', details: 'Updated booking BK-2025-1234 status to Confirmed', ip: '192.168.1.100' },
  { id: 2, timestamp: '2025-10-19 14:30:15', user: 'jane@mlodge.com', action: 'Refund Approved', module: 'Refunds', details: 'Approved refund RF-2025-002 for R5,000', ip: '192.168.1.105' },
  { id: 3, timestamp: '2025-10-19 14:25:08', user: 'john@mlodge.com', action: 'Review Moderated', module: 'Reviews', details: 'Approved review RV-004 from Sarah Williams', ip: '192.168.1.108' },
  { id: 4, timestamp: '2025-10-19 14:20:33', user: 'sarah@mlodge.com', action: 'Report Generated', module: 'Reports', details: 'Generated monthly revenue report for October 2025', ip: '192.168.1.110' },
  { id: 5, timestamp: '2025-10-19 14:15:45', user: 'admin@mlodge.com', action: 'Room Updated', module: 'Inventory', details: 'Updated pricing for Luxury Penthouse from R7,500 to R8,000', ip: '192.168.1.100' },
  { id: 6, timestamp: '2025-10-19 14:10:12', user: 'jane@mlodge.com', action: 'Promo Created', module: 'Promos', details: 'Created new promo code: WEEKEND15', ip: '192.168.1.105' },
  { id: 7, timestamp: '2025-10-19 14:05:28', user: 'admin@mlodge.com', action: 'User Login', module: 'Authentication', details: 'Successful login from dashboard', ip: '192.168.1.100' },
  { id: 8, timestamp: '2025-10-19 13:58:41', user: 'mike@mlodge.com', action: 'Inquiry Resolved', module: 'Inquiries', details: 'Marked inquiry INQ-003 as resolved', ip: '192.168.1.112' },
  { id: 9, timestamp: '2025-10-19 13:50:15', user: 'admin@mlodge.com', action: 'Staff Updated', module: 'Staff', details: 'Updated permissions for john@mlodge.com', ip: '192.168.1.100' },
  { id: 10, timestamp: '2025-10-19 13:45:33', user: 'sarah@mlodge.com', action: 'Booking Cancelled', module: 'Bookings', details: 'Cancelled booking BK-2025-1228 with full refund', ip: '192.168.1.110' },
];

const actionColors: { [key: string]: { bg: string; text: string } } = {
  'Booking Updated': { bg: '#0F51AF', text: '#ffffff' },
  'Booking Cancelled': { bg: '#ff4444', text: '#ffffff' },
  'Refund Approved': { bg: '#0F51AF', text: '#ffffff' },
  'Review Moderated': { bg: '#ffa500', text: '#000000' },
  'Report Generated': { bg: '#a855f7', text: '#ffffff' },
  'Room Updated': { bg: '#0F51AF', text: '#ffffff' },
  'Promo Created': { bg: '#0F51AF', text: '#ffffff' },
  'User Login': { bg: '#666', text: '#ffffff' },
  'Inquiry Resolved': { bg: '#0F51AF', text: '#ffffff' },
  'Staff Updated': { bg: '#0F51AF', text: '#ffffff' },
};

export function AdminAuditLogs() {
  const [logs, setLogs] = useState(mockLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState('all');
  const [filterAction, setFilterAction] = useState('all');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesModule = filterModule === 'all' || log.module === filterModule;
    const matchesAction = filterAction === 'all' || log.action === filterAction;

    return matchesSearch && matchesModule && matchesAction;
  });

  const handleExportLogs = () => {
    toast.success('Exporting audit logs...');
  };

  const modules = ['all', ...Array.from(new Set(logs.map(log => log.module)))];
  const actions = ['all', ...Array.from(new Set(logs.map(log => log.action)))];

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
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">System Logs & Audit Trail</h1>
          <p className="text-sm text-white mt-1">Track all admin actions and system events</p>
        </div>
        <Button
          onClick={handleExportLogs}
          variant="outline"
          className="border-blue-primary text-blue-primary hover:bg-blue-primary/10 w-full sm:w-auto"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Logs
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-gray-light border-0">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <FileSearch className="h-5 w-5 sm:h-6 sm:w-6 text-blue-primary" />
              <div>
                <p className="text-xs sm:text-sm text-gray-text">Total Logs</p>
                <p className="text-xl sm:text-2xl font-bold text-black">{logs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-light border-0">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <FileSearch className="h-5 w-5 sm:h-6 sm:w-6 text-sky-500" />
              <div>
                <p className="text-xs sm:text-sm text-gray-text">Today</p>
                <p className="text-xl sm:text-2xl font-bold text-black">{logs.filter(l => l.timestamp.startsWith('2025-10-19')).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-light border-0">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <FileSearch className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500" />
              <div>
                <p className="text-xs sm:text-sm text-gray-text">Active Users</p>
                <p className="text-xl sm:text-2xl font-bold text-black">{Array.from(new Set(logs.map(l => l.user))).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-light border-0">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <FileSearch className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              <div>
                <p className="text-xs sm:text-sm text-gray-text">Modules</p>
                <p className="text-xl sm:text-2xl font-bold text-black">{Array.from(new Set(logs.map(l => l.module))).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-gray-light border-0">
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search logs by user, action, or details..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-gray-300 text-black"
              />
            </div>
            <Select value={filterModule} onValueChange={setFilterModule}>
              <SelectTrigger className="bg-white border-gray-300 text-black">
                <SelectValue placeholder="Filter by module" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-300">
                {modules.map(module => (
                  <SelectItem key={module} value={module} className="text-black">
                    {module === 'all' ? 'All Modules' : module}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="bg-white border-gray-300 text-black">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-300">
                {actions.map(action => (
                  <SelectItem key={action} value={action} className="text-black">
                    {action === 'all' ? 'All Actions' : action}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card className="bg-gray-light border-0">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg text-black">Audit Logs ({filteredLogs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden">
                <table className="min-w-[1000px] w-full">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="text-left py-3 px-4 text-xs sm:text-sm text-gray-text font-medium">Timestamp</th>
                      <th className="text-left py-3 px-4 text-xs sm:text-sm text-gray-text font-medium">User</th>
                      <th className="text-left py-3 px-4 text-xs sm:text-sm text-gray-text font-medium">Action</th>
                      <th className="text-left py-3 px-4 text-xs sm:text-sm text-gray-text font-medium">Module</th>
                      <th className="text-left py-3 px-4 text-xs sm:text-sm text-gray-text font-medium">Details</th>
                      <th className="text-left py-3 px-4 text-xs sm:text-sm text-gray-text font-medium">IP Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log) => {
                      const actionColor = actionColors[log.action] || { bg: '#666', text: '#ffffff' };
                      return (
                        <tr key={log.id} className="border-b border-gray-300 hover:bg-white/50">
                          <td className="py-3 px-4 text-xs sm:text-sm text-gray-text">{log.timestamp}</td>
                          <td className="py-3 px-4 text-sm font-medium text-black">{log.user}</td>
                          <td className="py-3 px-4">
                            <Badge style={{ backgroundColor: actionColor.bg, color: actionColor.text }}>
                              {log.action}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-text">{log.module}</td>
                          <td className="py-3 px-4 text-sm text-black">{log.details}</td>
                          <td className="py-3 px-4 text-xs sm:text-sm text-gray-text">{log.ip}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
