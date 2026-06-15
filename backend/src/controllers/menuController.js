import Menu from '../models/Menu.js';

// @desc    Get menu for restaurant
// @route   GET /api/menus/:restaurantId
export const getMenus = async (req, res, next) => {
  try {
    const menus = await Menu.find({ restaurant: req.params.restaurantId, isActive: true });
    res.status(200).json({ success: true, data: menus });
  } catch (error) {
    next(error);
  }
};

// @desc    Create menu
// @route   POST /api/menus/:restaurantId
export const createMenu = async (req, res, next) => {
  try {
    req.body.restaurant = req.params.restaurantId;
    const menu = await Menu.create(req.body);
    res.status(201).json({ success: true, data: menu });
  } catch (error) {
    next(error);
  }
};

// @desc    Update menu
// @route   PUT /api/menus/:id
export const updateMenu = async (req, res, next) => {
  try {
    const menu = await Menu.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!menu) {
      return res.status(404).json({ success: false, message: 'Menu not found' });
    }
    res.status(200).json({ success: true, data: menu });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete menu
// @route   DELETE /api/menus/:id
export const deleteMenu = async (req, res, next) => {
  try {
    const menu = await Menu.findByIdAndDelete(req.params.id);
    if (!menu) {
      return res.status(404).json({ success: false, message: 'Menu not found' });
    }
    res.status(200).json({ success: true, message: 'Menu deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add menu item
// @route   POST /api/menus/:menuId/items
export const addMenuItem = async (req, res, next) => {
  try {
    const menu = await Menu.findById(req.params.menuId);
    if (!menu) {
      return res.status(404).json({ success: false, message: 'Menu not found' });
    }
    menu.items.push(req.body);
    await menu.save();
    res.status(201).json({ success: true, data: menu });
  } catch (error) {
    next(error);
  }
};

// @desc    Update menu item
// @route   PUT /api/menus/:menuId/items/:itemId
export const updateMenuItem = async (req, res, next) => {
  try {
    const menu = await Menu.findById(req.params.menuId);
    if (!menu) {
      return res.status(404).json({ success: false, message: 'Menu not found' });
    }
    const item = menu.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }
    Object.assign(item, req.body);
    await menu.save();
    res.status(200).json({ success: true, data: menu });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete menu item
// @route   DELETE /api/menus/:menuId/items/:itemId
export const deleteMenuItem = async (req, res, next) => {
  try {
    const menu = await Menu.findById(req.params.menuId);
    if (!menu) {
      return res.status(404).json({ success: false, message: 'Menu not found' });
    }
    menu.items.pull({ _id: req.params.itemId });
    await menu.save();
    res.status(200).json({ success: true, message: 'Menu item deleted' });
  } catch (error) {
    next(error);
  }
};