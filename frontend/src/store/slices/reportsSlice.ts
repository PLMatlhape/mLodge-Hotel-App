import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Types
export interface Report {
  id: number;
  name: string;
  type: 'bookings' | 'revenue' | 'occupancy' | 'guests' | 'custom';
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  format: 'pdf' | 'csv' | 'excel';
  start_date?: string;
  end_date?: string;
  generated_by: number;
  created_at: string;
  generated_at?: string;
  file_url?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

interface ReportsState {
  reports: Report[];
  currentReport: Report | null;
  loading: boolean;
  generating: boolean;
  error: string | null;
}

const initialState: ReportsState = {
  reports: [],
  currentReport: null,
  loading: false,
  generating: false,
  error: null,
};

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const getAuthToken = () => localStorage.getItem('token');

// Async Thunks
export const fetchReports = createAsyncThunk(
  'reports/fetchAll',
  async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/reports`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch reports');
    return response.json();
  }
);

export const generateReport = createAsyncThunk(
  'reports/generate',
  async (reportData: {
    type: string;
    period: string;
    format: string;
    startDate?: string;
    endDate?: string;
    filters?: Record<string, unknown>;
  }) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/reports/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        type: reportData.type,
        period: reportData.period,
        format: reportData.format,
        date_from: reportData.startDate,
        date_to: reportData.endDate,
        filters: reportData.filters,
      }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to generate report' }));
      throw new Error(errorData.error || 'Failed to generate report');
    }
    return response.json();
  }
);

export const downloadReport = createAsyncThunk(
  'reports/download',
  async (reportId: number) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/reports/${reportId}/download`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    if (!response.ok) throw new Error('Failed to download report');
    
    // Handle file download
    const blob = await response.blob();
    const contentDisposition = response.headers.get('content-disposition');
    const filename = contentDisposition
      ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
      : `report-${reportId}.pdf`;
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    return { success: true, reportId };
  }
);

export const deleteReport = createAsyncThunk(
  'reports/delete',
  async (id: number) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/reports/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to delete report');
    return id;
  }
);

export const scheduleReport = createAsyncThunk(
  'reports/schedule',
  async (scheduleData: {
    reportType: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
    format: string;
  }) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/reports/schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(scheduleData),
    });
    if (!response.ok) throw new Error('Failed to schedule report');
    return response.json();
  }
);

// Slice
const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentReport: (state, action) => {
      state.currentReport = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload.reports || action.payload || [];
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch reports';
      })
      .addCase(generateReport.pending, (state) => {
        state.generating = true;
        state.error = null;
      })
      .addCase(generateReport.fulfilled, (state, action) => {
        state.generating = false;
        const newReport = action.payload.report || action.payload;
        if (newReport && typeof newReport === 'object' && 'id' in newReport) {
          state.reports.unshift(newReport as Report);
        }
      })
      .addCase(generateReport.rejected, (state, action) => {
        state.generating = false;
        state.error = action.error.message || 'Failed to generate report';
      })
      .addCase(downloadReport.pending, (state) => {
        state.loading = true;
      })
      .addCase(downloadReport.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(downloadReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to download report';
      })
      .addCase(deleteReport.fulfilled, (state, action) => {
        state.reports = state.reports.filter(r => r.id !== action.payload);
      })
      .addCase(scheduleReport.fulfilled, (state) => {
        state.loading = false;
      });
  },
});

export const { clearError, setCurrentReport } = reportsSlice.actions;
export default reportsSlice.reducer;
