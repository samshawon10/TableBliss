import express from 'express';
import {
  getRestaurants,
  getRestaurant,
  getRestaurantBySlug,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getFeaturedRestaurants,
  getNearbyRestaurants,
} from '../controllers/restaurantController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Static routes MUST come before dynamic :id routes
router.get('/featured', getFeaturedRestaurants);
router.get('/nearby', getNearbyRestaurants);
router.get('/slug/:slug', getRestaurantBySlug);
router.get('/', getRestaurants);
router.get('/:id', getRestaurant);

router.post('/', protect, authorize('admin'), createRestaurant);
router.put('/:id', protect, authorize('admin'), updateRestaurant);
router.delete('/:id', protect, authorize('admin'), deleteRestaurant);

export default router;