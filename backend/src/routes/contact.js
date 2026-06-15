import express from 'express';
import {
  submitContact,
  getContacts,
  markAsRead,
  markAsResolved,
} from '../controllers/contactController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', submitContact);
router.get('/', protect, authorize('admin'), getContacts);
router.put('/:id/read', protect, authorize('admin'), markAsRead);
router.put('/:id/resolve', protect, authorize('admin'), markAsResolved);

export default router;