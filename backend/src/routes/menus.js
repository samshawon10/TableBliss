import express from 'express';
import {
  getMenus,
  createMenu,
  updateMenu,
  deleteMenu,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from '../controllers/menuController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/:restaurantId', getMenus);
router.post('/:restaurantId', protect, authorize('admin'), createMenu);
router.put('/:id', protect, authorize('admin'), updateMenu);
router.delete('/:id', protect, authorize('admin'), deleteMenu);
router.post('/:menuId/items', protect, authorize('admin'), addMenuItem);
router.put('/:menuId/items/:itemId', protect, authorize('admin'), updateMenuItem);
router.delete('/:menuId/items/:itemId', protect, authorize('admin'), deleteMenuItem);

export default router;