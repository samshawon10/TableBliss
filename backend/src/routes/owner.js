import express from 'express';
import {
  getOwnerStats,
  getOwnerRestaurants,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getOwnerReservations,
  updateOwnerReservationStatus,
  getOwnerTables,
  createTable,
  updateTable,
  deleteTable,
  getOwnerMenus,
  createMenu,
  updateMenu,
  deleteMenu,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getOwnerReviews,
  respondToReview,
} from '../controllers/restaurantOwnerController.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.use(protect, authorize('restaurant_owner', 'admin'));

// Stats
router.get('/stats', getOwnerStats);

// Subscription Plans (accessible by owners)
router.get('/plans', async (req, res) => {
  const plans = [
    { _id: 'free', name: 'Free', price: 0, features: ['Up to 1 restaurant', 'Basic support', 'Standard listing'], isActive: true },
    { _id: 'basic', name: 'Basic', price: 999, features: ['Up to 3 restaurants', 'Email support', 'Basic analytics'], isActive: true },
    { _id: 'premium', name: 'Premium', price: 2999, features: ['Up to 10 restaurants', 'Priority support', 'Full analytics', 'Featured listing'], isActive: true },
    { _id: 'enterprise', name: 'Enterprise', price: 9999, features: ['Unlimited restaurants', 'Dedicated support', 'Custom integrations', 'API access'], isActive: true },
  ];
  res.status(200).json({ success: true, data: plans });
});

// Restaurants CRUD
router.get('/restaurants', getOwnerRestaurants);
router.post('/restaurants', createRestaurant);
router.put('/restaurants/:id', updateRestaurant);
router.delete('/restaurants/:id', deleteRestaurant);

// Reservations
router.get('/reservations', getOwnerReservations);
router.put('/reservations/:id/status', updateOwnerReservationStatus);

// Tables CRUD
router.get('/tables', getOwnerTables);
router.post('/tables', createTable);
router.put('/tables/:id', updateTable);
router.delete('/tables/:id', deleteTable);

// Menus CRUD
router.get('/menus', getOwnerMenus);
router.post('/menus', upload.single('image'), createMenu);
router.put('/menus/:id', upload.single('image'), updateMenu);
router.delete('/menus/:id', deleteMenu);

// Menu Items CRUD (with image upload support)
router.post('/menus/:menuId/items', upload.single('image'), addMenuItem);
router.put('/menus/:menuId/items/:itemId', upload.single('image'), updateMenuItem);
router.delete('/menus/:menuId/items/:itemId', deleteMenuItem);

// Reviews
router.get('/reviews', getOwnerReviews);
router.put('/reviews/:id/respond', respondToReview);

export default router;