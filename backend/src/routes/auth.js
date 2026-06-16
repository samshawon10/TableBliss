import express from 'express';
import {
  register,
  login,
  googleLogin,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  updatePassword,
  setPassword,
  toggleFavorite,
  getFavorites,
  deleteAccount,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.put('/update-password', protect, updatePassword);
router.put('/set-password', protect, setPassword);
router.get('/favorites', protect, getFavorites);
router.put('/favorites/:restaurantId', protect, toggleFavorite);
router.delete('/me', protect, deleteAccount);

export default router;