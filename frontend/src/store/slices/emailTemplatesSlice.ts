import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

// Types
export interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  body: string;
  type: 'booking_confirmation' | 'cancellation' | 'payment_receipt' | 'reminder' | 'welcome' | 'custom';
  variables: string[]; // e.g., ['{{guest_name}}', '{{booking_reference}}']
  is_active: boolean;
  last_used?: string;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

interface EmailTemplatesState {
  templates: EmailTemplate[];
  currentTemplate: EmailTemplate | null;
  loading: boolean;
  error: string | null;
}

const initialState: EmailTemplatesState = {
  templates: [],
  currentTemplate: null,
  loading: false,
  error: null,
};

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const getAuthToken = () => localStorage.getItem('token');

// Async Thunks
export const fetchAllTemplates = createAsyncThunk(
  'emailTemplates/fetchAll',
  async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/email-templates`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch email templates');
    const data = await response.json();
    return data.templates || [];
  }
);

export const createTemplate = createAsyncThunk(
  'emailTemplates/create',
  async (templateData: {
    name: string;
    subject: string;
    body: string;
    type: string;
    variables?: string[];
  }) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/email-templates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(templateData),
    });
    if (!response.ok) throw new Error('Failed to create template');
    return response.json();
  }
);

export const updateTemplate = createAsyncThunk(
  'emailTemplates/update',
  async ({ id, templateData }: { id: number; templateData: Partial<EmailTemplate> }) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/email-templates/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(templateData),
    });
    if (!response.ok) throw new Error('Failed to update template');
    return response.json();
  }
);

export const toggleTemplateStatus = createAsyncThunk(
  'emailTemplates/toggleStatus',
  async (id: number) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/email-templates/${id}/toggle`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to toggle template status');
    return response.json();
  }
);

export const deleteTemplate = createAsyncThunk(
  'emailTemplates/delete',
  async (id: number) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/email-templates/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to delete template');
    return id;
  }
);

// Slice
const emailTemplatesSlice = createSlice({
  name: 'emailTemplates',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    setCurrentTemplate: (state, action: PayloadAction<EmailTemplate | null>) => {
      state.currentTemplate = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.templates = action.payload;
      })
      .addCase(fetchAllTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch templates';
      })
      .addCase(createTemplate.fulfilled, (state, action) => {
        state.templates.unshift(action.payload);
      })
      .addCase(updateTemplate.fulfilled, (state, action) => {
        const index = state.templates.findIndex(t => t.id === action.payload.id);
        if (index !== -1) state.templates[index] = action.payload;
      })
      .addCase(toggleTemplateStatus.fulfilled, (state, action) => {
        const index = state.templates.findIndex(t => t.id === action.payload.id);
        if (index !== -1) state.templates[index] = action.payload;
      })
      .addCase(deleteTemplate.fulfilled, (state, action) => {
        state.templates = state.templates.filter(t => t.id !== action.payload);
      });
  },
});

export const { clearError, setCurrentTemplate } = emailTemplatesSlice.actions;
export default emailTemplatesSlice.reducer;
