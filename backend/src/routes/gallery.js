import express from 'express';
import {
  getGallery,
  uploadImage,
  deleteImage,
  updateImage,
} from '../controllers/galleryController.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.get('/:restaurantId', getGallery);
router.post('/:restaurantId', protect, authorize('admin'), upload.single('image'), uploadImage);
router.put('/:id', protect, authorize('admin'), updateImage);
router.delete('/:id', protect, authorize('admin'), deleteImage);

export default router;