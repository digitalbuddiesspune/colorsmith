import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL ?? '/api/v1';

const client = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('colorsmith_admin_token') || localStorage.getItem('colorsmith_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('colorsmith_token');
      localStorage.removeItem('colorsmith_user');
      localStorage.removeItem('colorsmith_admin_token');
      window.dispatchEvent(new Event('auth-logout'));
    }
    return Promise.reject(err);
  }
);

export default client;

export const auth = {
  login: (email, password) => client.post('/auth/login', { email, password }),
  register: (data) => client.post('/auth/register', data),
  me: () => client.get('/auth/me'),
  changePassword: (currentPassword, newPassword) =>
    client.put('/auth/change-password', { currentPassword, newPassword }),
  updateProfile: (id, data) => client.put(`/update-user/${id}`, data),
};

export const categories = {
  list: () => client.get('/get-categories'),
  create: (data) => client.post('/create-category', data),
  update: (id, data) => client.put(`/update-category/${id}`, data),
  delete: (id) => client.delete(`/delete-category/${id}`),
};

export const products = {
  list: () => client.get('/get-products'),
  get: (id) => client.get(`/get-product/${id}`),
  create: (data) => client.post('/create-product', data),
  update: (id, data) => client.put(`/update-product/${id}`, data),
  delete: (id) => client.delete(`/delete-product/${id}`),
  grades: (productId) => ({
    list: () => client.get(`/products/${productId}/grades`),
    create: (data) => client.post(`/products/${productId}/grades`, data),
    update: (gradeId, data) => client.put(`/products/${productId}/grades/${gradeId}`, data),
    delete: (gradeId) => client.delete(`/products/${productId}/grades/${gradeId}`),
  }),
  colors: (productId) => ({
    list: () => client.get(`/products/${productId}/colors`),
    create: (data) => client.post(`/products/${productId}/colors`, data),
    update: (colorId, data) => client.put(`/products/${productId}/colors/${colorId}`, data),
    delete: (colorId) => client.delete(`/products/${productId}/colors/${colorId}`),
  }),
  availability: (productId) => ({
    list: () => client.get(`/products/${productId}/availability`),
    create: (data) => client.post(`/products/${productId}/availability`, data),
    update: (pgcId, data) => client.put(`/products/${productId}/availability/${pgcId}`, data),
    delete: (pgcId) => client.delete(`/products/${productId}/availability/${pgcId}`),
  }),
};

export const grades = {
  list: () => client.get('/get-grades'),
  get: (id) => client.get(`/get-grade/${id}`),
  create: (data) => client.post('/create-grade', data),
  update: (id, data) => client.put(`/update-grade/${id}`, data),
};

export const colors = {
  list: () => client.get('/get-colors'),
  get: (id) => client.get(`/get-color/${id}`),
  create: (data) => client.post('/create-color', data),
  update: (id, data) => client.put(`/update-color/${id}`, data),
  delete: (id) => client.delete(`/delete-color/${id}`),
};

export const colorSets = {
  list: () => client.get('/color-sets'),
  get: (id) => client.get(`/color-sets/${id}`),
  create: (data) => client.post('/color-sets', data),
  update: (id, data) => client.put(`/color-sets/${id}`, data),
  delete: (id) => client.delete(`/color-sets/${id}`),
  productColors: (productId) => client.get(`/color-sets/product/${productId}/colors`),
};

export const cart = {
  list: () => client.get('/cart'),
  add: (data) => client.post('/cart', data),
  update: (id, data) => client.put(`/cart/${id}`, data),
  remove: (id) => client.delete(`/cart/${id}`),
  clear: () => client.delete('/cart/clear'),
};

export const address = {
  list: () => client.get('/address'),
  create: (data) => client.post('/address', data),
  update: (id, data) => client.put(`/address/${id}`, data),
  delete: (id) => client.delete(`/address/${id}`),
};

export const colorSuggestions = {
  create: (data) => client.post('/color-suggestions', data),
  mine: () => client.get('/color-suggestions/mine'),
  adminList: () => client.get('/color-suggestions'),
  adminUpdate: (id, data) => client.put(`/color-suggestions/${id}`, data),
};

export const orders = {
  // Create Razorpay order for payment
  createRazorpayOrder: (amount) => client.post('/orders/razorpay/create', { amount }),
  // Verify Razorpay payment
  verifyRazorpayPayment: (data) => client.post('/orders/razorpay/verify', data),
  // Create order
  create: (data) => client.post('/orders', data),
  // Get user's orders
  list: () => client.get('/orders'),
  // Get single order
  get: (id) => client.get(`/orders/${id}`),
  // Cancel order
  cancel: (id) => client.put(`/orders/${id}/cancel`),
  // Admin: Get all orders
  adminList: (params) => client.get('/orders/admin/all', { params }),
  // Admin: Update order status
  adminUpdate: (id, data) => client.put(`/orders/admin/${id}`, data),
  // Admin: Get dashboard statistics
  getDashboardStats: () => client.get('/orders/admin/dashboard-stats'),
};
