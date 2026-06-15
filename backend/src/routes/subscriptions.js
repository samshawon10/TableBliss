import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
  getMySubscription,
  selectPlan,
  submitPayment,
  getMyPayments,
} from '../controllers/subscriptionController.js';
import {
  getPendingPayments,
  approvePayment,
  rejectPayment,
  getAllSubscriptions,
  updateSubscriptionStatus,
  extendSubscription,
  suspendSubscription,
} from '../controllers/adminSubscriptionController.js';

const router = express.Router();

// Public routes
router.get('/plans', getPlans);

// Protected routes - user
router.get('/my-subscription', protect, getMySubscription);
router.post('/select-plan', protect, selectPlan);
router.post('/submit-payment', protect, submitPayment);
router.get('/my-payments', protect, getMyPayments);

// Admin routes
router.post('/plans', protect, authorize('admin'), createPlan);
router.put('/plans/:id', protect, authorize('admin'), updatePlan);
router.delete('/plans/:id', protect, authorize('admin'), deletePlan);

router.get('/admin/payments', protect, authorize('admin'), getPendingPayments);
router.put('/admin/payments/:id/approve', protect, authorize('admin'), approvePayment);
router.put('/admin/payments/:id/reject', protect, authorize('admin'), rejectPayment);

router.get('/admin/subscriptions', protect, authorize('admin'), getAllSubscriptions);
router.put('/admin/subscriptions/:id/status', protect, authorize('admin'), updateSubscriptionStatus);
router.put('/admin/subscriptions/:id/extend', protect, authorize('admin'), extendSubscription);
router.put('/admin/subscriptions/:id/suspend', protect, authorize('admin'), suspendSubscription);

export default router;