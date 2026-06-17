import axios from 'axios';
import Swal from 'sweetalert2';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/auth/login') window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  googleLogin: (data) => api.post('/auth/google', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (token, data) => api.put(`/auth/reset-password/${token}`, data),
  updatePassword: (data) => api.put('/auth/update-password', data),
  setPassword: (data) => api.put('/auth/set-password', data),
  getFavorites: () => api.get('/auth/favorites'),
  toggleFavorite: (restaurantId) => api.put(`/auth/favorites/${restaurantId}`),
  deleteAccount: () => api.delete('/auth/me'),
};

// Restaurants API
export const restaurantAPI = {
  getAll: (params) => api.get('/restaurants', { params }),
  getById: (id) => api.get(`/restaurants/${id}`),
  getBySlug: (slug) => api.get(`/restaurants/slug/${slug}`),
  getFeatured: () => api.get('/restaurants/featured'),
  getNearby: (params) => api.get('/restaurants/nearby', { params }),
  create: (data) => api.post('/restaurants', data),
  update: (id, data) => api.put(`/restaurants/${id}`, data),
  delete: (id) => api.delete(`/restaurants/${id}`),
};

// Reservations API
export const reservationAPI = {
  getAll: (params) => api.get('/reservations', { params }),
  getById: (id) => api.get(`/reservations/${id}`),
  create: (data) => api.post('/reservations', data),
  cancel: (id, data) => api.put(`/reservations/${id}/cancel`, data),
  updateStatus: (id, data) => api.put(`/reservations/${id}/status`, data),
  checkAvailability: (data) => api.post('/reservations/check-availability', data),
  getTimeSlots: (restaurantId, params) => api.get(`/reservations/time-slots/${restaurantId}`, { params }),
};

// Menus API
export const menuAPI = {
  getByRestaurant: (id) => api.get(`/menus/${id}`),
  create: (id, data) => api.post(`/menus/${id}`, data),
  update: (id, data) => api.put(`/menus/${id}`, data),
  delete: (id) => api.delete(`/menus/${id}`),
  addItem: (menuId, data) => api.post(`/menus/${menuId}/items`, data),
  updateItem: (menuId, itemId, data) => api.put(`/menus/${menuId}/items/${itemId}`, data),
  deleteItem: (menuId, itemId) => api.delete(`/menus/${menuId}/items/${itemId}`),
};

// Reviews API
export const reviewAPI = {
  getByRestaurant: (restaurantId, params) => api.get(`/reviews/${restaurantId}`, { params }),
  create: (restaurantId, data) => api.post(`/reviews/${restaurantId}`, data),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
  toggleLike: (id) => api.put(`/reviews/${id}/like`),
};

// Tables API
export const tableAPI = {
  getByRestaurant: (id) => api.get(`/tables/${id}`),
  create: (id, data) => api.post(`/tables/${id}`, data),
  update: (id, data) => api.put(`/tables/${id}`, data),
  delete: (id) => api.delete(`/tables/${id}`),
};

// Gallery API
export const galleryAPI = {
  getByRestaurant: (id, params) => api.get(`/gallery/${id}`, { params }),
  upload: (id, data) => api.post(`/gallery/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/gallery/${id}`, data),
  delete: (id) => api.delete(`/gallery/${id}`),
};

// Notifications API
export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// Contact API
export const contactAPI = {
  submit: (data) => api.post('/contact', data),
  getAll: (params) => api.get('/contact', { params }),
  markAsRead: (id) => api.put(`/contact/${id}/read`),
  markAsResolved: (id) => api.put(`/contact/${id}/resolve`),
};

// Admin API
export const adminAPI = {
  // Dashboard
  getStats: () => api.get('/admin/stats'),
  // Users
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  // Restaurants
  getAllRestaurants: (params) => api.get('/admin/restaurants', { params }),
  updateRestaurantStatus: (id, data) => api.put(`/admin/restaurants/${id}/status`, data),
  deleteRestaurant: (id) => api.delete(`/admin/restaurants/${id}`),
  getRestaurantDetails: (id) => api.get(`/admin/restaurants/${id}`),
  featureRestaurant: (id, data) => api.put(`/admin/restaurants/${id}/feature`, data),
  // Orders
  getOrders: (params) => api.get('/admin/orders', { params }),
  updateOrderStatus: (id, data) => api.put(`/admin/orders/${id}/status`, data),
  processRefund: (id) => api.post(`/admin/orders/${id}/refund`),
  // Finance
  getRevenue: (params) => api.get('/admin/finance/revenue', { params }),
  getTransactions: (params) => api.get('/admin/finance/transactions', { params }),
  // Commissions
  getCommissionSettings: () => api.get('/admin/commissions/settings'),
  updateCommissionSettings: (data) => api.put('/admin/commissions/settings', data),
  setRestaurantCommission: (id, data) => api.put(`/admin/commissions/restaurants/${id}`, data),
  getCommissionAnalytics: (params) => api.get('/admin/commissions/analytics', { params }),
  // Subscriptions
  getSubscriptions: (params) => api.get('/admin/subscriptions', { params }),
  getPlans: () => api.get('/admin/subscriptions/plans'),
  createPlan: (data) => api.post('/admin/subscriptions/plans', data),
  updatePlan: (id, data) => api.put(`/admin/subscriptions/plans/${id}`, data),
  deletePlan: (id) => api.delete(`/admin/subscriptions/plans/${id}`),
  // Menus
  getMenus: () => api.get('/admin/menus'),
  deleteMenu: (id) => api.delete(`/admin/menus/${id}`),
  // Gallery
  getGallery: (params) => api.get('/admin/gallery', { params }),
  updateGalleryImage: (id, data) => api.put(`/admin/gallery/${id}`, data),
  deleteGalleryImage: (id) => api.delete(`/admin/gallery/${id}`),
  // Reservations
  getReservations: (params) => api.get('/admin/reservations', { params }),
  // Reviews
  getReviews: (params) => api.get('/admin/reviews', { params }),
  deleteReview: (id) => api.delete(`/admin/reviews/${id}`),
  // Support Tickets
  getSupportTickets: (params) => api.get('/admin/support', { params }),
  updateTicketStatus: (id, data) => api.put(`/admin/support/${id}/status`, data),
  replyTicket: (id, data) => api.post(`/admin/support/${id}/reply`, data),
  // Advertisements
  getAdvertisements: (params) => api.get('/admin/advertisements', { params }),
  createAdvertisement: (data) => api.post('/admin/advertisements', data),
  updateAdvertisement: (id, data) => api.put(`/admin/advertisements/${id}`, data),
  deleteAdvertisement: (id) => api.delete(`/admin/advertisements/${id}`),
  // CMS
  getCMSPages: () => api.get('/admin/cms'),
  updateCMSPage: (id, data) => api.put(`/admin/cms/${id}`, data),
  // Activity Logs
  getActivityLogs: (params) => api.get('/admin/activity-logs', { params }),
  // Settings
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
  // Notifications
  sendNotification: (data) => api.post('/admin/notifications/send', data),
  // Analytics
  getAnalytics: (params) => api.get('/admin/analytics', { params }),
  // Payouts
  getPayouts: (params) => api.get('/admin/payouts', { params }),
  processPayout: (id, data) => api.post(`/admin/payouts/${id}/process`, data),
  // Owners
  getOwners: (params) => api.get('/admin/owners', { params }),
  updateOwner: (id, data) => api.put(`/admin/owners/${id}`, data),
  deleteOwner: (id) => api.delete(`/admin/owners/${id}`),
  getOwnerDetails: (id) => api.get(`/admin/owners/${id}`),
  // Customers
  getCustomers: (params) => api.get('/admin/customers', { params }),
  getCustomerDetails: (id) => api.get(`/admin/customers/${id}`),
  // Admins & Roles
  getAdmins: (params) => api.get('/admin/admins', { params }),
  createAdmin: (data) => api.post('/admin/admins', data),
  updateAdmin: (id, data) => api.put(`/admin/admins/${id}`, data),
  deleteAdmin: (id) => api.delete(`/admin/admins/${id}`),
  getRoles: () => api.get('/admin/roles'),
  updateRole: (id, data) => api.put(`/admin/roles/${id}`, data),
};

// Owner API
// Subscription & Payment API
export const subscriptionAPI = {
  getPlans: () => api.get('/subscriptions/plans'),
  getMySubscription: () => api.get('/subscriptions/my-subscription'),
  selectPlan: (planId) => api.post('/subscriptions/select-plan', { planId }),
  submitPayment: (data) => api.post('/subscriptions/submit-payment', data),
  getMyPayments: () => api.get('/subscriptions/my-payments'),
  // Admin
  getPendingPayments: (params) => api.get('/subscriptions/admin/payments', { params }),
  approvePayment: (id, adminNote) => api.put(`/subscriptions/admin/payments/${id}/approve`, { adminNote }),
  rejectPayment: (id, reason) => api.put(`/subscriptions/admin/payments/${id}/reject`, { reason }),
  getAllSubscriptions: (params) => api.get('/subscriptions/admin/subscriptions', { params }),
  createPlan: (data) => api.post('/subscriptions/plans', data),
  updatePlan: (id, data) => api.put(`/subscriptions/plans/${id}`, data),
  deletePlan: (id) => api.delete(`/subscriptions/plans/${id}`),
  extendSubscription: (id, days) => api.put(`/subscriptions/admin/subscriptions/${id}/extend`, { days }),
  suspendSubscription: (id, reason) => api.put(`/subscriptions/admin/subscriptions/${id}/suspend`, { reason }),
};

export const ownerAPI = {
  getStats: () => api.get('/owner/stats'),
  getRestaurants: () => api.get('/owner/restaurants'),
  createRestaurant: (data) => data instanceof FormData
    ? api.post('/owner/restaurants', data, { headers: { 'Content-Type': 'multipart/form-data' } })
    : api.post('/owner/restaurants', data),
  updateRestaurant: (id, data) => data instanceof FormData
    ? api.put(`/owner/restaurants/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
    : api.put(`/owner/restaurants/${id}`, data),
  deleteRestaurant: (id) => api.delete(`/owner/restaurants/${id}`),
  getReservations: (params) => api.get('/owner/reservations', { params }),
  updateReservationStatus: (id, data) => api.put(`/owner/reservations/${id}/status`, data),
  getTables: () => api.get('/owner/tables'),
  createTable: (data) => api.post('/owner/tables', data),
  updateTable: (id, data) => api.put(`/owner/tables/${id}`, data),
  deleteTable: (id) => api.delete(`/owner/tables/${id}`),
  getMenus: () => api.get('/owner/menus'),
  createMenu: (data) => data instanceof FormData
    ? api.post('/owner/menus', data, { headers: { 'Content-Type': 'multipart/form-data' } })
    : api.post('/owner/menus', data),
  updateMenu: (id, data) => data instanceof FormData
    ? api.put(`/owner/menus/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
    : api.put(`/owner/menus/${id}`, data),
  deleteMenu: (id) => api.delete(`/owner/menus/${id}`),
  addMenuItem: (menuId, data) => data instanceof FormData
    ? api.post(`/owner/menus/${menuId}/items`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
    : api.post(`/owner/menus/${menuId}/items`, data),
  updateMenuItem: (menuId, itemId, data) => data instanceof FormData
    ? api.put(`/owner/menus/${menuId}/items/${itemId}`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
    : api.put(`/owner/menus/${menuId}/items/${itemId}`, data),
  deleteMenuItem: (menuId, itemId) => api.delete(`/owner/menus/${menuId}/items/${itemId}`),
  getReviews: () => api.get('/owner/reviews'),
  respondToReview: (id, data) => api.put(`/owner/reviews/${id}/respond`, data),
  getPlans: () => api.get('/owner/plans'),
};

export const showToast = (icon, title) => {
  Swal.fire({ toast: true, position: 'top-end', icon, title, showConfirmButton: false, timer: 3000, timerProgressBar: true });
};

export default api;
