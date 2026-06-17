import Restaurant from '../models/Restaurant.js';
import Reservation from '../models/Reservation.js';
import Menu from '../models/Menu.js';
import Table from '../models/Table.js';
import Review from '../models/Review.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

// @desc    Get restaurant owner dashboard stats
// @route   GET /api/owner/stats
export const getOwnerStats = async (req, res, next) => {
  try {
    const restaurants = await Restaurant.find({ owner: req.user._id });
    const restaurantIds = restaurants.map((r) => r._id);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [
      totalReservations,
      pendingReservations,
      confirmedReservations,
      completedReservations,
      cancelledReservations,
      todayReservations,
      totalReviews,
      totalTables,
      averageRating,
      totalCustomers,
    ] = await Promise.all([
      Reservation.countDocuments({ restaurant: { $in: restaurantIds } }),
      Reservation.countDocuments({ restaurant: { $in: restaurantIds }, status: 'pending' }),
      Reservation.countDocuments({ restaurant: { $in: restaurantIds }, status: 'confirmed' }),
      Reservation.countDocuments({ restaurant: { $in: restaurantIds }, status: 'completed' }),
      Reservation.countDocuments({ restaurant: { $in: restaurantIds }, status: 'cancelled' }),
      Reservation.countDocuments({ restaurant: { $in: restaurantIds }, reservationDate: { $gte: todayStart, $lte: todayEnd } }),
      Review.countDocuments({ restaurant: { $in: restaurantIds } }),
      Table.countDocuments({ restaurant: { $in: restaurantIds }, isActive: true }),
      Review.aggregate([
        { $match: { restaurant: { $in: restaurantIds } } },
        { $group: { _id: null, avgRating: { $avg: '$rating' } } },
      ]),
      // Count unique users who made reservations
      Reservation.distinct('user', { restaurant: { $in: restaurantIds } }),
    ]);

    const avgRating = averageRating.length > 0 ? Math.round(averageRating[0].avgRating * 10) / 10 : 0;

    const recentReservations = await Reservation.find({ restaurant: { $in: restaurantIds } })
      .populate('user', 'name email')
      .populate('restaurant', 'name')
      .populate('table', 'tableNumber')
      .sort({ createdAt: -1 })
      .limit(10);

    const monthlyReservations = await Reservation.aggregate([
      { $match: { restaurant: { $in: restaurantIds }, createdAt: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
      { $sort: { _id: 1 } },
    ]);

    // Revenue overview
    const revenueData = await Reservation.aggregate([
      { $match: { restaurant: { $in: restaurantIds }, status: { $in: ['confirmed', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    // Popular tables
    const popularTables = await Reservation.aggregate([
      { $match: { restaurant: { $in: restaurantIds }, table: { $ne: null } } },
      { $group: { _id: '$table', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);
    await Table.populate(popularTables, { path: '_id', select: 'tableNumber section capacity' });

    // Customer trends (daily reservations last 30 days)
    const customerTrends = await Reservation.aggregate([
      {
        $match: {
          restaurant: { $in: restaurantIds },
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Recent notifications
    const recentNotifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalRestaurants: restaurants.length,
          totalReservations,
          pendingReservations,
          confirmedReservations,
          completedReservations,
          cancelledReservations,
          todayReservations,
          totalReviews,
          totalTables,
          averageRating: avgRating,
          totalCustomers: totalCustomers.length,
          totalRevenue,
        },
        recentReservations,
        monthlyReservations,
        popularTables: popularTables.map(pt => ({
          table: pt._id,
          reservations: pt.count,
        })),
        customerTrends,
        recentNotifications,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get owner's restaurants
// @route   GET /api/owner/restaurants
export const getOwnerRestaurants = async (req, res, next) => {
  try {
    const restaurants = await Restaurant.find({ owner: req.user._id });
    res.status(200).json({ success: true, data: restaurants });
  } catch (error) {
    next(error);
  }
};

// @desc    Get owner's reservations
// @route   GET /api/owner/reservations
export const getOwnerReservations = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, restaurantId, date } = req.query;
    const restaurants = await Restaurant.find({ owner: req.user._id });
    const restaurantIds = restaurants.map((r) => r._id);

    const query = { restaurant: { $in: restaurantIds } };
    if (status) query.status = status;
    if (restaurantId) query.restaurant = restaurantId;
    if (date) {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      query.reservationDate = { $gte: dayStart, $lte: dayEnd };
    }

    const total = await Reservation.countDocuments(query);
    const reservations = await Reservation.find(query)
      .populate('user', 'name email')
      .populate('restaurant', 'name')
      .populate('table', 'tableNumber section')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: reservations,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update reservation status by owner
// @route   PUT /api/owner/reservations/:id/status
export const updateOwnerReservationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    const restaurant = await Restaurant.findById(reservation.restaurant);
    if (!restaurant || restaurant.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    reservation.status = status;
    if (status === 'confirmed') reservation.confirmedAt = new Date();
    if (status === 'completed') reservation.completedAt = new Date();
    if (status === 'cancelled') reservation.cancelledAt = new Date();
    await reservation.save();

    const statusMessages = {
      confirmed: 'has been confirmed',
      completed: 'has been completed',
      cancelled: 'has been cancelled',
      pending: 'is pending',
    };

    await Notification.create({
      user: reservation.user,
      type: `reservation_${status}`,
      title: `Reservation ${status}`,
      message: `Your reservation at ${restaurant.name} ${statusMessages[status] || status}.`,
      data: { reservationId: reservation._id },
    });

    res.status(200).json({ success: true, data: reservation });
  } catch (error) {
    next(error);
  }
};

// @desc    Manage owner's tables
// @route   GET /api/owner/tables
export const getOwnerTables = async (req, res, next) => {
  try {
    const restaurants = await Restaurant.find({ owner: req.user._id });
    const restaurantIds = restaurants.map((r) => r._id);
    const tables = await Table.find({ restaurant: { $in: restaurantIds } }).populate('restaurant', 'name');
    res.status(200).json({ success: true, data: tables });
  } catch (error) {
    next(error);
  }
};

// @desc    Manage owner's menus
// @route   GET /api/owner/menus
export const getOwnerMenus = async (req, res, next) => {
  try {
    const restaurants = await Restaurant.find({ owner: req.user._id });
    const restaurantIds = restaurants.map((r) => r._id);
    const menus = await Menu.find({ restaurant: { $in: restaurantIds } }).populate('restaurant', 'name');
    res.status(200).json({ success: true, data: menus });
  } catch (error) {
    next(error);
  }
};

// @desc    Manage owner's reviews
// @route   GET /api/owner/reviews
export const getOwnerReviews = async (req, res, next) => {
  try {
    const restaurants = await Restaurant.find({ owner: req.user._id });
    const restaurantIds = restaurants.map((r) => r._id);
    const reviews = await Review.find({ restaurant: { $in: restaurantIds } })
      .populate('user', 'name avatar')
      .populate('restaurant', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Create restaurant
// @route   POST /api/owner/restaurants
export const createRestaurant = async (req, res, next) => {
  try {
    const restaurantData = { ...req.body, owner: req.user._id };

    // Handle uploaded images
    if (req.files) {
      if (req.files.cover) restaurantData.images = { ...restaurantData.images, cover: req.files.cover[0].path };
      if (req.files.logo) restaurantData.images = { ...restaurantData.images, logo: req.files.logo[0].path };
      if (req.files.gallery) {
        const galleryImages = req.files.gallery.map(f => f.path);
        restaurantData.images = { ...restaurantData.images, gallery: galleryImages };
      }
    }

    // Parse nested string fields if sent as JSON strings
    if (typeof restaurantData.address === 'string') restaurantData.address = JSON.parse(restaurantData.address);
    if (typeof restaurantData.contact === 'string') restaurantData.contact = JSON.parse(restaurantData.contact);
    if (typeof restaurantData.capacity === 'string') restaurantData.capacity = JSON.parse(restaurantData.capacity);
    if (typeof restaurantData.operatingHours === 'string') restaurantData.operatingHours = JSON.parse(restaurantData.operatingHours);
    if (typeof restaurantData.features === 'string') restaurantData.features = JSON.parse(restaurantData.features);
    if (typeof restaurantData.cuisine === 'string') restaurantData.cuisine = JSON.parse(restaurantData.cuisine);
    if (typeof restaurantData.location === 'string') restaurantData.location = JSON.parse(restaurantData.location);

    const restaurant = await Restaurant.create(restaurantData);
    res.status(201).json({ success: true, data: restaurant });
  } catch (error) {
    next(error);
  }
};

// @desc    Update restaurant
// @route   PUT /api/owner/restaurants/:id
export const updateRestaurant = async (req, res, next) => {
  try {
    let restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
    if (restaurant.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updateData = { ...req.body };

    // Handle uploaded images
    if (req.files) {
      if (req.files.cover) updateData['images.cover'] = req.files.cover[0].path;
      if (req.files.logo) updateData['images.logo'] = req.files.logo[0].path;
      if (req.files.gallery) {
        const existingGallery = restaurant.images?.gallery || [];
        const newImages = req.files.gallery.map(f => f.path);
        updateData['images.gallery'] = [...existingGallery, ...newImages];
      }
    }

    // Parse nested string fields if sent as JSON strings
    if (typeof updateData.address === 'string') updateData.address = JSON.parse(updateData.address);
    if (typeof updateData.contact === 'string') updateData.contact = JSON.parse(updateData.contact);
    if (typeof updateData.capacity === 'string') updateData.capacity = JSON.parse(updateData.capacity);
    if (typeof updateData.operatingHours === 'string') updateData.operatingHours = JSON.parse(updateData.operatingHours);
    if (typeof updateData.features === 'string') updateData.features = JSON.parse(updateData.features);
    if (typeof updateData.cuisine === 'string') updateData.cuisine = JSON.parse(updateData.cuisine);
    if (typeof updateData.location === 'string') updateData.location = JSON.parse(updateData.location);

    restaurant = await Restaurant.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: restaurant });
  } catch (error) { next(error); }
};

// @desc    Delete restaurant
// @route   DELETE /api/owner/restaurants/:id
export const deleteRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
    if (restaurant.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await restaurant.deleteOne();
    res.status(200).json({ success: true, message: 'Restaurant deleted' });
  } catch (error) { next(error); }
};

// @desc    Create table
// @route   POST /api/owner/tables
export const createTable = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.body.restaurant);
    if (!restaurant || restaurant.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const table = await Table.create(req.body);
    res.status(201).json({ success: true, data: table });
  } catch (error) { next(error); }
};

// @desc    Update table
// @route   PUT /api/owner/tables/:id
export const updateTable = async (req, res, next) => {
  try {
    let table = await Table.findById(req.params.id);
    if (!table) return res.status(404).json({ success: false, message: 'Table not found' });
    const restaurant = await Restaurant.findById(table.restaurant);
    if (!restaurant || restaurant.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    table = await Table.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: table });
  } catch (error) { next(error); }
};

// @desc    Delete table
// @route   DELETE /api/owner/tables/:id
export const deleteTable = async (req, res, next) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) return res.status(404).json({ success: false, message: 'Table not found' });
    const restaurant = await Restaurant.findById(table.restaurant);
    if (!restaurant || restaurant.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await table.deleteOne();
    res.status(200).json({ success: true, message: 'Table deleted' });
  } catch (error) { next(error); }
};

// @desc    Create menu
// @route   POST /api/owner/menus
export const createMenu = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.body.restaurant);
    if (!restaurant || restaurant.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const menuData = { ...req.body };
    if (req.file) menuData.image = req.file.path;
    if (menuData.startingPrice) menuData.startingPrice = parseFloat(menuData.startingPrice);
    if (menuData.serves) menuData.serves = parseInt(menuData.serves);
    const menu = await Menu.create(menuData);
    res.status(201).json({ success: true, data: menu });
  } catch (error) { next(error); }
};

// @desc    Update menu
// @route   PUT /api/owner/menus/:id
export const updateMenu = async (req, res, next) => {
  try {
    let menu = await Menu.findById(req.params.id);
    if (!menu) return res.status(404).json({ success: false, message: 'Menu not found' });
    const restaurant = await Restaurant.findById(menu.restaurant);
    if (!restaurant || restaurant.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const updateData = { ...req.body };
    if (req.file) updateData.image = req.file.path;
    if (updateData.startingPrice) updateData.startingPrice = parseFloat(updateData.startingPrice);
    if (updateData.serves) updateData.serves = parseInt(updateData.serves);
    menu = await Menu.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: menu });
  } catch (error) { next(error); }
};

// @desc    Delete menu
// @route   DELETE /api/owner/menus/:id
export const deleteMenu = async (req, res, next) => {
  try {
    const menu = await Menu.findById(req.params.id);
    if (!menu) return res.status(404).json({ success: false, message: 'Menu not found' });
    const restaurant = await Restaurant.findById(menu.restaurant);
    if (!restaurant || restaurant.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await menu.deleteOne();
    res.status(200).json({ success: true, message: 'Menu deleted' });
  } catch (error) { next(error); }
};

// @desc    Add menu item
// @route   POST /api/owner/menus/:menuId/items
export const addMenuItem = async (req, res, next) => {
  try {
    const menu = await Menu.findById(req.params.menuId);
    if (!menu) return res.status(404).json({ success: false, message: 'Menu not found' });
    const restaurant = await Restaurant.findById(menu.restaurant);
    if (!restaurant || restaurant.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const itemData = { ...req.body };
    if (req.file) itemData.image = req.file.path;
    ['isVegetarian', 'isVegan', 'isGlutenFree', 'isSpicy', 'isPopular', 'isAvailable'].forEach(field => {
      if (itemData[field] !== undefined) itemData[field] = itemData[field] === 'true' || itemData[field] === true;
    });
    if (itemData.price) itemData.price = parseFloat(itemData.price);
    if (itemData.preparationTime) itemData.preparationTime = parseInt(itemData.preparationTime);
    menu.items.push(itemData);
    await menu.save();
    res.status(201).json({ success: true, data: menu });
  } catch (error) { next(error); }
};

// @desc    Update menu item
// @route   PUT /api/owner/menus/:menuId/items/:itemId
export const updateMenuItem = async (req, res, next) => {
  try {
    const menu = await Menu.findById(req.params.menuId);
    if (!menu) return res.status(404).json({ success: false, message: 'Menu not found' });
    const restaurant = await Restaurant.findById(menu.restaurant);
    if (!restaurant || restaurant.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const item = menu.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Menu item not found' });
    const updateData = { ...req.body };
    if (req.file) updateData.image = req.file.path;
    ['isVegetarian', 'isVegan', 'isGlutenFree', 'isSpicy', 'isPopular', 'isAvailable'].forEach(field => {
      if (updateData[field] !== undefined) updateData[field] = updateData[field] === 'true' || updateData[field] === true;
    });
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.preparationTime) updateData.preparationTime = parseInt(updateData.preparationTime);
    Object.assign(item, updateData);
    await menu.save();
    res.status(200).json({ success: true, data: menu });
  } catch (error) { next(error); }
};

// @desc    Delete menu item
// @route   DELETE /api/owner/menus/:menuId/items/:itemId
export const deleteMenuItem = async (req, res, next) => {
  try {
    const menu = await Menu.findById(req.params.menuId);
    if (!menu) return res.status(404).json({ success: false, message: 'Menu not found' });
    const restaurant = await Restaurant.findById(menu.restaurant);
    if (!restaurant || restaurant.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    menu.items.pull({ _id: req.params.itemId });
    await menu.save();
    res.status(200).json({ success: true, message: 'Menu item deleted' });
  } catch (error) { next(error); }
};

// @desc    Reply to review
// @route   PUT /api/owner/reviews/:id/respond
export const respondToReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    const restaurant = await Restaurant.findById(review.restaurant);
    if (!restaurant || restaurant.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    review.response = { message: req.body.message, respondedBy: req.user._id, respondedAt: new Date() };
    await review.save();
    await Notification.create({
      user: review.user,
      type: 'review_response',
      title: 'Owner replied to your review',
      message: `The owner of ${restaurant.name} responded to your review.`,
      data: { reviewId: review._id },
    });
    res.status(200).json({ success: true, data: review });
  } catch (error) { next(error); }
};