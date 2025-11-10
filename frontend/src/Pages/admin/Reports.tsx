import { Download, FileText, Loader2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from '../../lib/toast';
import backgroundImage from '../../assets/image/background/Offers-section.jpeg';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchReports, generateReport, downloadReport } from '../../store/slices/reportsSlice';

export function AdminReports() {
  const dispatch = useAppDispatch();
  const { reports, loading, error } = useAppSelector((state) => state.reports);
  
  const [reportType, setReportType] = useState<'bookings' | 'revenue' | 'occupancy' | 'guests' | 'custom'>('bookings');
  const [timePeriod, setTimePeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'>('monthly');
  const [format, setFormat] = useState<'pdf' | 'csv' | 'excel'>('pdf');

  // Ensure reports is always an array
  const reportsList = Array.isArray(reports) ? reports : [];

  useEffect(() => {
    dispatch(fetchReports());
  }, [dispatch]);

  const handleDownloadReport = async (reportId: number) => {
    try {
      await dispatch(downloadReport(reportId)).unwrap();
      toast.success('Report downloaded successfully');
    } catch (error) {
      toast.error('Failed to download report');
      console.error('Error downloading report:', error);
    }
  };

  const handleGenerateReport = async () => {
    try {
      const result = await dispatch(generateReport({
        type: reportType,
        period: timePeriod,
        format: format,
      })).unwrap();
      toast.success('Report generation started successfully');
      // Refresh reports list to show the new report
      dispatch(fetchReports());
    } catch (error) {
      toast.error('Failed to generate report');
      console.error('Error generating report:', error);
    }
  };

  // Loading state
  if (loading && reportsList.length === 0) {
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
            <span className="ml-3 text-gray-text">Loading reports...</span>
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
              <p className="text-red-800 font-medium">Error loading reports</p>
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
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-white">Summary Reports</h1>
        <p className="text-sm sm:text-base text-white">Auto-generated performance reports and statistics</p>
      </div>

      {/* Report Generator */}
      <Card className="bg-gray-light border-gray-text/20">
        <CardHeader>
          <CardTitle className="text-black text-lg sm:text-xl">Custom Report Generator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Select value={reportType} onValueChange={(value) => setReportType(value as typeof reportType)}>
              <SelectTrigger className="bg-white border-gray-text/20 text-black text-sm">
                <SelectValue placeholder="Report Type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-light border-gray-text/20">
                <SelectItem value="bookings" className="text-black">Bookings Report</SelectItem>
                <SelectItem value="revenue" className="text-black">Revenue Report</SelectItem>
                <SelectItem value="occupancy" className="text-black">Occupancy Report</SelectItem>
                <SelectItem value="guests" className="text-black">Guest Report</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timePeriod} onValueChange={(value) => setTimePeriod(value as typeof timePeriod)}>
              <SelectTrigger className="bg-white border-gray-text/20 text-black text-sm">
                <SelectValue placeholder="Time Period" />
              </SelectTrigger>
              <SelectContent className="bg-gray-light border-gray-text/20">
                <SelectItem value="weekly" className="text-black">Last 7 Days</SelectItem>
                <SelectItem value="monthly" className="text-black">Last 30 Days</SelectItem>
                <SelectItem value="quarterly" className="text-black">Last Quarter</SelectItem>
                <SelectItem value="yearly" className="text-black">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Select value={format} onValueChange={(value) => setFormat(value as typeof format)}>
              <SelectTrigger className="bg-white border-gray-text/20 text-black text-sm">
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent className="bg-gray-light border-gray-text/20">
                <SelectItem value="pdf" className="text-black">PDF</SelectItem>
                <SelectItem value="excel" className="text-black">Excel</SelectItem>
                <SelectItem value="csv" className="text-black">CSV</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={handleGenerateReport}
              className="bg-blue-primary text-white hover:bg-blue-primary/90 text-sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Generate
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Historical Reports */}
      <Card className="bg-gray-light border-gray-text/20">
        <CardHeader>
          <CardTitle className="text-black text-lg sm:text-xl">Generated Reports ({reportsList.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {reportsList.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-text mx-auto mb-4" />
              <p className="text-gray-text">No reports generated yet</p>
              <p className="text-gray-text text-sm mt-2">Click "Generate" to create your first report</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-gray-text/20">
                    <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-gray-text text-xs sm:text-sm font-medium">Name</th>
                    <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-gray-text text-xs sm:text-sm font-medium">Type</th>
                    <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-gray-text text-xs sm:text-sm font-medium">Period</th>
                    <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-gray-text text-xs sm:text-sm font-medium">Format</th>
                    <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-gray-text text-xs sm:text-sm font-medium">Status</th>
                    <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-gray-text text-xs sm:text-sm font-medium">Generated On</th>
                    <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-gray-text text-xs sm:text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reportsList.map((report) => (
                    <tr key={report.id} className="border-b border-gray-text/10 hover:bg-white/50 transition-colors">
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-black text-xs sm:text-sm font-medium">{report.name}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-black text-xs sm:text-sm capitalize">{report.type}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-black text-xs sm:text-sm capitalize">{report.period}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-black text-xs sm:text-sm uppercase">{report.format}</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4">
                        <span className={`px-2 py-1 rounded-full text-xs capitalize ${
                          report.status === 'completed' ? 'bg-blue-primary text-white' :
                          report.status === 'processing' ? 'bg-orange-500 text-white' :
                          report.status === 'failed' ? 'bg-red-500 text-white' :
                          'bg-gray-500 text-white'
                        }`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-gray-text text-xs sm:text-sm">
                        {new Date(report.created_at || report.generated_at).toLocaleDateString()}
                      </td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadReport(report.id)}
                          disabled={report.status !== 'completed'}
                          className="border-blue-primary text-blue-primary hover:bg-blue-primary/10 text-xs"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
