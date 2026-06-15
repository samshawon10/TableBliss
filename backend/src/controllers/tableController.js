import Table from '../models/Table.js';

// @desc    Get tables for restaurant
// @route   GET /api/tables/:restaurantId
export const getTables = async (req, res, next) => {
  try {
    const tables = await Table.find({ restaurant: req.params.restaurantId, isActive: true });
    res.status(200).json({ success: true, data: tables });
  } catch (error) {
    next(error);
  }
};

// @desc    Create table
// @route   POST /api/tables/:restaurantId
export const createTable = async (req, res, next) => {
  try {
    req.body.restaurant = req.params.restaurantId;
    const table = await Table.create(req.body);
    res.status(201).json({ success: true, data: table });
  } catch (error) {
    next(error);
  }
};

// @desc    Update table
// @route   PUT /api/tables/:id
export const updateTable = async (req, res, next) => {
  try {
    const table = await Table.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }
    res.status(200).json({ success: true, data: table });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete table
// @route   DELETE /api/tables/:id
export const deleteTable = async (req, res, next) => {
  try {
    const table = await Table.findByIdAndDelete(req.params.id);
    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }
    res.status(200).json({ success: true, message: 'Table deleted' });
  } catch (error) {
    next(error);
  }
};