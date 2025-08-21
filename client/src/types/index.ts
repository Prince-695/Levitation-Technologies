// User types
export interface User {
  id: string;
  fullName: string;
  email: string;
  createdAt?: string;
}

// Product types
export interface Product {
  id?: string | number;
  name: string;
  quantity: number;
  rate: number;
  totalAmount?: number;
  gst?: number;
}

// Simple product for frontend forms
export interface SimpleProduct {
  id?: string | number;
  name: string;
  qty: number;
  rate: number;
}

// Invoice types
export interface Invoice {
  _id: string;
  invoiceNumber: string;
  customerInfo: {
    name: string;
    email: string;
  };
  products: Product[];
  totalCharges: number;
  gst: number;
  finalAmount: number;
  invoiceDate: string;
  createdAt: string;
}

// Form types
export interface RegisterForm {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface ProductForm {
  name: string;
  quantity: number;
  rate: number;
}

// Invoice form for frontend
export interface InvoiceForm {
  products: SimpleProduct[];
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

export interface InvoiceHistoryResponse {
  success: boolean;
  invoices: Invoice[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalInvoices: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
