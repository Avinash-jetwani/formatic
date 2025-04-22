// src/services/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
}

// ─── FieldType & DTO Definitions ────────────────────────────────────────────
export enum FieldType {
  TEXT       = 'TEXT',
  LONG_TEXT  = 'LONG_TEXT',
  EMAIL      = 'EMAIL',
  PHONE      = 'PHONE',
  URL        = 'URL',
  NUMBER     = 'NUMBER',
  DATE       = 'DATE',
  TIME       = 'TIME',
  DATETIME   = 'DATETIME',
  RATING     = 'RATING',
  SLIDER     = 'SLIDER',
  SCALE      = 'SCALE',
  DROPDOWN   = 'DROPDOWN',
  CHECKBOX   = 'CHECKBOX',
  RADIO      = 'RADIO',
  FILE       = 'FILE',
}

export interface CreateFormFieldDto {
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  order: number;
  options?: string[];
  config?: Record<string, any>;
}
// ─────────────────────────────────────────────────────────────────────────────

export const fetchApi = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    let token = '';
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('token') || '';
    }

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
    const data = await response.json();

    if (!response.ok) {
      return { error: data.message || 'Something went wrong' };
    }
    return { data };
  } catch (error) {
    console.error('API error:', error);
    return { error: 'Network error' };
  }
};

// Authentication services
export const authService = {
  login: async (email: string, password: string) => {
    return fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (email: string, password: string, name?: string) => {
    return fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  },

  getProfile: async () => {
    return fetchApi('/auth/profile');
  },
};

// Forms services
export const formsService = {
  getAllForms: async () => fetchApi('/forms'),
  getForm: async (id: string) => fetchApi(`/forms/${id}`),
  createForm: async (formData: any) =>
    fetchApi('/forms', { method: 'POST', body: JSON.stringify(formData) }),
  updateForm: async (id: string, formData: any) =>
    fetchApi(`/forms/${id}`, { method: 'PATCH', body: JSON.stringify(formData) }),
  deleteForm: async (id: string) =>
    fetchApi(`/forms/${id}`, { method: 'DELETE' }),

  // New signatures:
  addField: async (formId: string, fieldData: CreateFormFieldDto) =>
    fetchApi(`/forms/${formId}/fields`, {
      method: 'POST',
      body: JSON.stringify(fieldData),
    }),

  updateField: async (
    formId: string,
    fieldId: string,
    fieldData: Partial<CreateFormFieldDto>
  ) =>
    fetchApi(`/forms/${formId}/fields/${fieldId}`, {
      method: 'PATCH',
      body: JSON.stringify(fieldData),
    }),

  deleteField: async (formId: string, fieldId: string) =>
    fetchApi(`/forms/${formId}/fields/${fieldId}`, { method: 'DELETE' }),

  getPublicForm: async (clientId: string, slug: string) =>
    fetchApi(`/forms/public/${clientId}/${slug}`),
};

// Submissions services
export const submissionsService = {
  getAllSubmissions: async () => fetchApi('/submissions'),
  getSubmission: async (id: string) => fetchApi(`/submissions/${id}`),
  getFormSubmissions: async (formId: string) =>
    fetchApi(`/submissions/form/${formId}`),
  createSubmission: async (submissionData: any) =>
    fetchApi('/submissions', {
      method: 'POST',
      body: JSON.stringify(submissionData),
    }),
  deleteSubmission: async (id: string) =>
    fetchApi(`/submissions/${id}`, { method: 'DELETE' }),
};

// Users services (Admin only)
export const usersService = {
  getAllUsers: async () => fetchApi('/users'),
  getUser: async (id: string) => fetchApi(`/users/${id}`),
  createUser: async (userData: any) => {
    // Convert status to uppercase enum if it exists
    if (userData.status && typeof userData.status === 'string') {
      userData.status = userData.status.toUpperCase();
    }
    return fetchApi('/users', { method: 'POST', body: JSON.stringify(userData) });
  },
  updateUser: async (id: string, userData: any) => {
    console.log('updateUser called with:', id, userData); // Debug log
    
    // Convert status to uppercase for backend enum
    if (userData.status && typeof userData.status === 'string') {
      userData.status = userData.status.toUpperCase();
    }
    
    return fetchApi(`/users/${id}`, { 
      method: 'PATCH', 
      body: JSON.stringify(userData) 
    });
  },
  deleteUser: async (id: string) =>
    fetchApi(`/users/${id}`, { method: 'DELETE' }),
};

// analyticsService
export const analyticsService = {
  // Get client growth data between two dates
  getClientGrowth: (start: string, end: string) => {
    return fetchApi(`/analytics/client-growth?start=${start}&end=${end}`);
  },
  
  // Get form quality metrics (e.g. average submissions per form)
  getFormQuality: () => {
    return fetchApi('/analytics/form-quality');
  },
  
  // Get completion rates for forms
  getFormCompletionRates: (clientId?: string) => {
    const url = clientId 
      ? `/analytics/form-completion-rates?clientId=${clientId}`
      : '/analytics/form-completion-rates';
    return fetchApi(url);
  },
  
  // Get submission funnel data for a specific client
  getSubmissionFunnel: (clientId: string) => {
    return fetchApi(`/analytics/submission-funnel?clientId=${clientId}`);
  },
  
  // Get field distribution data for a specific client
  getFieldDistribution: (clientId?: string) => {
    const url = clientId 
      ? `/analytics/field-distribution?clientId=${clientId}`
      : '/analytics/field-distribution';
    return fetchApi(url);
  },
  
  // Get conversion trends over time
  getConversionTrends: (clientId: string, start: string, end: string) => {
    return fetchApi(`/analytics/conversion-trends?clientId=${clientId}&start=${start}&end=${end}`);
  },
  
  // Export dashboard data as CSV
// Export dashboard data as CSV
exportDashboardData: async (role: string, userId: string, start: string, end: string) => {
  try {
    const token = localStorage.getItem('token') || '';
    
    const response = await fetch(`${API_URL}/analytics/export?role=${role}&userId=${userId}&start=${start}&end=${end}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'text/csv'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to export data');
    }
    
    // Get the CSV text directly
    const csvText = await response.text();
    
    // Create a blob and download
    const blob = new Blob([csvText], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-data-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    return { data: 'Export successful' };
  } catch (error) {
    console.error('Export error:', error);
    return { error: 'Failed to export data' };
  }
}
};