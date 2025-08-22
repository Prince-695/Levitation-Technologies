import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api'; //https://levitation-technologies-backend.onrender.com/api

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: async (userData: {
    fullName: string;
    email: string;
    password: string;
  }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  logout: async () => {
    // For JWT-based auth, logout is mainly client-side
    // Clear token from localStorage and redirect
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // If server had a logout endpoint, we would call it here:
    // const response = await api.post('/auth/logout');
    // return response.data;
    
    return { success: true, message: 'Logged out successfully' };
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

// Invoice API calls
export const invoiceAPI = {
  generatePDF: async (invoiceData: {
    products: Array<{
      name: string;
      quantity: number;
      rate: number;
      totalAmount?: number;
    }>;
    summary?: {
      totalCharges: number;
      gst: number;
      finalAmount: number;
    };
  }) => {
    const response = await api.post('/invoices/generate-pdf', invoiceData, {
      responseType: 'blob', // Important for PDF download
    });
    return response;
  },

  getHistory: async (page = 1, limit = 10) => {
    const response = await api.get(`/invoices/history?page=${page}&limit=${limit}`);
    return response.data;
  },

  getInvoice: async (id: string) => {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  },

  downloadInvoice: async (id: string) => {
    const response = await api.get(`/invoices/${id}/download`, {
      responseType: 'blob',
    });
    return response;
  },
};

export default api;
