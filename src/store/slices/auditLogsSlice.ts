import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Types
export interface AuditLog {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  action: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'view' | 'approve' | 'reject';
  module: 'bookings' | 'rooms' | 'users' | 'staff' | 'reviews' | 'payments' | 'refunds' | 'promo_codes' | 'settings';
  entity_type: string;
  entity_id?: number;
  details: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

interface AuditLogsState {
  logs: AuditLog[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  totalPages: number;
  filters: {
    module?: string;
    action?: string;
    userId?: number;
    startDate?: string;
    endDate?: string;
  };
}

const initialState: AuditLogsState = {
  logs: [],
  loading: false,
  error: null,
  totalCount: 0,
  totalPages: 0,
  filters: {},
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const getAuthToken = () => localStorage.getItem('token');

// Async Thunks
export const fetchAuditLogs = createAsyncThunk(
  'auditLogs/fetchAll',
  async ({
    page = 1,
    limit = 20,
    module,
    action,
    userId,
    startDate,
    endDate,
  }: {
    page?: number;
    limit?: number;
    module?: string;
    action?: string;
    userId?: number;
    startDate?: string;
    endDate?: string;
  } = {}) => {
    const token = getAuthToken();
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (module) params.append('module', module);
    if (action) params.append('action', action);
    if (userId) params.append('userId', userId.toString());
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await fetch(`${API_BASE_URL}/audit-logs?${params.toString()}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    if (!response.ok) throw new Error('Failed to fetch audit logs');
    return response.json();
  }
);

export const fetchLogDetails = createAsyncThunk(
  'auditLogs/fetchDetails',
  async (id: number) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/audit-logs/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch log details');
    return response.json();
  }
);

export const exportAuditLogs = createAsyncThunk(
  'auditLogs/export',
  async (filters: {
    module?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
    format?: 'csv' | 'json';
  }) => {
    const token = getAuthToken();
    const params = new URLSearchParams();

    // Only add defined filters to avoid sending 'undefined' strings
    if (filters.module) params.append('module', filters.module);
    if (filters.action) params.append('action', filters.action);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.format) params.append('format', filters.format);

    const response = await fetch(`${API_BASE_URL}/audit-logs/export?${params.toString()}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to export audit logs' }));
      throw new Error(errorData.error || 'Failed to export audit logs');
    }

    // Handle file download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.${filters.format || 'csv'}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    return { success: true };
  }
);

// Slice
const auditLogsSlice = createSlice({
  name: 'auditLogs',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuditLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload.logs || action.payload;
        state.totalCount = action.payload.pagination?.total || action.payload.length;
        state.totalPages = action.payload.pagination?.pages || 1;
      })
      .addCase(fetchAuditLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch audit logs';
      })
      .addCase(exportAuditLogs.pending, (state) => {
        state.loading = true;
      })
      .addCase(exportAuditLogs.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(exportAuditLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to export audit logs';
      });
  },
});

export const { clearError, setFilters, clearFilters } = auditLogsSlice.actions;
export default auditLogsSlice.reducer;
