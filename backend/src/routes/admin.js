import express from 'express';
import {
  getDashboardStats,
  getUsers, updateUser, deleteUser,
  getAllMenus, deleteMenu,
  updateRestaurantStatus,
  getAllRestaurantsAdmin, getRestaurantDetails,
  getAllGallery, deleteGalleryImage, updateGalleryImage,
  getAllReservations,
  getOwners, updateOwner, deleteOwner, getOwnerDetails,
  getCustomers, getCustomerDetails,
  getOrders, updateOrderStatus, processRefund,
  getRevenue, getTransactions,
  getCommissionSettings, updateCommissionSettings, setRestaurantCommission, getCommissionAnalytics,
  getSubscriptions, getPlans, createPlan, updatePlan, deletePlan,
  getReviews, deleteReview,
  getAdvertisements, createAdvertisement, updateAdvertisement, deleteAdvertisement,
  getCMSPages, updateCMSPage,
  getSupportTickets, updateTicketStatus, replyTicket,
  sendNotification,
  getAnalytics,
  getPayouts, processPayout,
  getActivityLogs,
  getSettings, updateSettings,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, authorize('admin'));

// Dashboard
router.get('/stats', getDashboardStats);
router.get('/analytics', getAnalytics);

// Users
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Restaurants
router.get('/restaurants', getAllRestaurantsAdmin);
router.get('/restaurants/:id', getRestaurantDetails);
router.put('/restaurants/:id/status', updateRestaurantStatus);
router.put('/restaurants/:id/feature', (req, res) => {
  // TODO: implement feature toggle
  res.json({ success: true, message: 'Feature status updated' });
});

// Owners
router.get('/owners', getOwners);
router.get('/owners/:id', getOwnerDetails);
router.put('/owners/:id', updateOwner);
router.delete('/owners/:id', deleteOwner);

// Customers
router.get('/customers', getCustomers);
router.get('/customers/:id', getCustomerDetails);

// Orders
router.get('/orders', getOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.post('/orders/:id/refund', processRefund);

// Finance
router.get('/finance/revenue', getRevenue);
router.get('/finance/transactions', getTransactions);

// Commissions
router.get('/commissions/settings', getCommissionSettings);
router.put('/commissions/settings', updateCommissionSettings);
router.put('/commissions/restaurants/:id', setRestaurantCommission);
router.get('/commissions/analytics', getCommissionAnalytics);

// Subscriptions
router.get('/subscriptions', getSubscriptions);
router.get('/subscriptions/plans', getPlans);
router.post('/subscriptions/plans', createPlan);
router.put('/subscriptions/plans/:id', updatePlan);
router.delete('/subscriptions/plans/:id', deletePlan);

// Menus
router.get('/menus', getAllMenus);
router.delete('/menus/:id', deleteMenu);

// Gallery
router.get('/gallery', getAllGallery);
router.delete('/gallery/:id', deleteGalleryImage);
router.put('/gallery/:id', updateGalleryImage);

// Reservations
router.get('/reservations', getAllReservations);

// Reviews
router.get('/reviews', getReviews);
router.delete('/reviews/:id', deleteReview);

// Advertisements
router.get('/advertisements', getAdvertisements);
router.post('/advertisements', createAdvertisement);
router.put('/advertisements/:id', updateAdvertisement);
router.delete('/advertisements/:id', deleteAdvertisement);

// CMS
router.get('/cms', getCMSPages);
router.put('/cms/:id', updateCMSPage);

// Support
router.get('/support', getSupportTickets);
router.put('/support/:id/status', updateTicketStatus);
router.post('/support/:id/reply', replyTicket);

// Notifications
router.post('/notifications/send', sendNotification);

// Payouts
router.get('/payouts', getPayouts);
router.post('/payouts/:id/process', processPayout);

// Activity Logs
router.get('/activity-logs', getActivityLogs);

// Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

export default router;