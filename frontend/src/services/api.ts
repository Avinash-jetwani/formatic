// src/services/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
}

export const fetchApi = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    // Use localStorage only on the client side
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
  getAllForms: async () => {
    return fetchApi('/forms');
  },
  
  getForm: async (id: string) => {
    return fetchApi(`/forms/${id}`);
  },
  
  createForm: async (formData: any) => {
    return fetchApi('/forms', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
  },
  
  updateForm: async (id: string, formData: any) => {
    return fetchApi(`/forms/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(formData),
    });
  },
  
  deleteForm: async (id: string) => {
    return fetchApi(`/forms/${id}`, {
      method: 'DELETE',
    });
  },
  
  addField: async (formId: string, fieldData: any) => {
    return fetchApi(`/forms/${formId}/fields`, {
      method: 'POST',
      body: JSON.stringify(fieldData),
    });
  },
  
  getPublicForm: async (clientId: string, slug: string) => {
    return fetchApi(`/forms/public/${clientId}/${slug}`);
  },
};

// Submissions services
export const submissionsService = {
  getAllSubmissions: async () => {
    return fetchApi('/submissions');
  },
  
  getSubmission: async (id: string) => {
    return fetchApi(`/submissions/${id}`);
  },
  
  getFormSubmissions: async (formId: string) => {
    return fetchApi(`/submissions/form/${formId}`);
  },
  
  createSubmission: async (submissionData: any) => {
    return fetchApi('/submissions', {
      method: 'POST',
      body: JSON.stringify(submissionData),
    });
  },
  
  deleteSubmission: async (id: string) => {
    return fetchApi(`/submissions/${id}`, {
      method: 'DELETE',
    });
  },
};

// Users services (Admin only)
export const usersService = {
  getAllUsers: async () => {
    return fetchApi('/users');
  },
  
  getUser: async (id: string) => {
    return fetchApi(`/users/${id}`);
  },
  
  createUser: async (userData: any) => {
    return fetchApi('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
  
  updateUser: async (id: string, userData: any) => {
    return fetchApi(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  },
  
  deleteUser: async (id: string) => {
    return fetchApi(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};