import express from 'express';
import {
  getUserReservations,
  getReservation,
  createReservation,
  cancelReservation,
  updateReservationStatus,
  checkAvailability,
  getTimeSlots,
} from '../controllers/reservationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/time-slots/:restaurantId', getTimeSlots);
router.post('/check-availability', checkAvailability);

router.get('/', protect, getUserReservations);
router.get('/:id', protect, getReservation);
router.post('/', protect, createReservation);
router.put('/:id/cancel', protect, cancelReservation);
router.put('/:id/status', protect, authorize('admin'), updateReservationStatus);

export default router;