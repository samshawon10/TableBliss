import express from 'express';
import {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
  toggleLike,
} from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/:restaurantId', getReviews);
router.post('/:restaurantId', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.put('/:id/like', protect, toggleLike);

export default router;