import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
});

// Attach JWT token from localStorage
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export const adminApi = {
  // Stats
  getStats: () => api.get('/admin/stats').then(r => r.data),

  // Products
  getProducts: (params?: Record<string, string | number>) => api.get('/admin/products', { params }).then(r => r.data),
  createProduct: (data: unknown) => api.post('/admin/products', data).then(r => r.data),
  updateProduct: (id: string, data: unknown) => api.put(`/admin/products/${id}`, data).then(r => r.data),
  deleteProduct: (id: string) => api.delete(`/admin/products/${id}`).then(r => r.data),

  // Orders
  getOrders: (params?: Record<string, string | number>) => api.get('/admin/orders', { params }).then(r => r.data),
  updateOrderStatus: (id: string, status: string) => api.patch(`/admin/orders/${id}/status`, { status }).then(r => r.data),

  // Users
  getUsers: (params?: Record<string, string | number>) => api.get('/admin/users', { params }).then(r => r.data),
  banUser: (id: string, isBanned: boolean) => api.patch(`/admin/users/${id}/ban`, { isBanned }).then(r => r.data),

  // Analytics
  getAnalytics: (period?: string) => api.get('/admin/analytics', { params: { period } }).then(r => r.data),

  // Invoices
  getInvoices: (params?: Record<string, string | number | undefined>) => api.get('/admin/invoices', { params }).then(r => r.data),
  generateInvoice: (data: unknown) => api.post('/admin/invoices/generate', data).then(r => r.data),

  // Bulk import
  bulkImportProducts: (products: unknown[]) => api.post('/admin/products/bulk', { products }).then(r => r.data),

  // Image uploads
  getUploads: () => api.get('/admin/uploads').then(r => r.data),
  uploadImages: (formData: FormData) => api.post('/admin/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data),
  deleteUpload: (filename: string) => api.delete(`/admin/uploads/${btoa(filename)}`).then(r => r.data),
};

export default api;
