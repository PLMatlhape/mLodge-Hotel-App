import { useState, useEffect } from 'react';
import { Search, FileSearch, Download, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { toast } from '../../lib/toast';
import backgroundImage from '../../assets/image/background/Offers-section.jpeg';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchAuditLogs, exportAuditLogs } from '../../store/slices/auditLogsSlice';

const actionColors: { [key: string]: { bg: string; text: string } } = {
  'create': { bg: '#0F51AF', text: '#ffffff' },
  'update': { bg: '#0F51AF', text: '#ffffff' },
  'delete': { bg: '#ff4444', text: '#ffffff' },
  'approve': { bg: '#0F51AF', text: '#ffffff' },
  'reject': { bg: '#ff4444', text: '#ffffff' },
  'login': { bg: '#666', text: '#ffffff' },
  'logout': { bg: '#666', text: '#ffffff' },
  'view': { bg: '#a855f7', text: '#ffffff' },
};

export function AdminAuditLogs() {
  const dispatch = useAppDispatch();
  const { logs, loading, error } = useAppSelector((state) => state.auditLogs);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState('all');
  const [filterAction, setFilterAction] = useState('all');

  useEffect(() => {
    dispatch(fetchAuditLogs({ page: 1, limit: 100 }));
  }, [dispatch]);

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      log.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (typeof log.details === 'string' ? log.details.toLowerCase().includes(searchTerm.toLowerCase()) : JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesModule = filterModule === 'all' || log.module === filterModule;
    const matchesAction = filterAction === 'all' || log.action === filterAction;

    return matchesSearch && matchesModule && matchesAction;
  });

  const handleExportLogs = async () => {
    try {
      await dispatch(exportAuditLogs({
        module: filterModule !== 'all' ? filterModule : undefined,
        action: filterAction !== 'all' ? filterAction : undefined,
        format: 'csv'
      })).unwrap();
      toast.success('Audit logs exported successfully');
    } catch (error) {
      toast.error('Failed to export logs');
      console.error('Error exporting logs:', error);
    }
  };

  const modules = ['all', ...Array.from(new Set(logs.map(log => log.module)))];
  const actions = ['all', ...Array.from(new Set(logs.map(log => log.action)))];

  // Loading state
  if (loading && logs.length === 0) {
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
            <span className="ml-3 text-gray-text">Loading audit logs...</span>
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
              <p className="text-red-800 font-medium">Error loading audit logs</p>
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
                <p className="text-xl sm:text-2xl font-bold text-black">{logs.filter(l => l.created_at && l.created_at.startsWith(new Date().toISOString().split('T')[0])).length}</p>
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
                <p className="text-xl sm:text-2xl font-bold text-black">{Array.from(new Set(logs.map(l => l.user_id))).length}</p>
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
                          <td className="py-3 px-4 text-xs sm:text-sm text-gray-text">
                            {new Date(log.created_at).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-sm font-medium text-black">
                            {log.user_email}
                            <div className="text-xs text-gray-text">{log.user_name}</div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className="capitalize" style={{ backgroundColor: actionColor.bg, color: actionColor.text }}>
                              {log.action}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-text capitalize">{log.module.replace('_', ' ')}</td>
                          <td className="py-3 px-4 text-sm text-black">{typeof log.details === 'object' ? JSON.stringify(log.details) : log.details}</td>
                          <td className="py-3 px-4 text-xs sm:text-sm text-gray-text">{log.ip_address || 'N/A'}</td>
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
