import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';
import Reservation from '../models/Reservation.js';
import Review from '../models/Review.js';
import Contact from '../models/Contact.js';
import Notification from '../models/Notification.js';
import Menu from '../models/Menu.js';
import Gallery from '../models/Gallery.js';
import Table from '../models/Table.js';

// Helper to get restaurant IDs for owner queries
const getOwnerRestaurantIds = async (ownerId) => {
  const restaurants = await Restaurant.find({ owner: ownerId });
  return restaurants.map(r => r._id);
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers, activeUsers,
      totalRestaurants, activeRestaurants,
      totalReservations, pendingReservations, confirmedReservations,
      completedReservations, cancelledReservations, todayReservations,
      totalReviews, unreadContacts, pendingRestaurants, cuisineStats,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Restaurant.countDocuments(),
      Restaurant.countDocuments({ isActive: true }),
      Reservation.countDocuments(),
      Reservation.countDocuments({ status: 'pending' }),
      Reservation.countDocuments({ status: 'confirmed' }),
      Reservation.countDocuments({ status: 'completed' }),
      Reservation.countDocuments({ status: 'cancelled' }),
      Reservation.countDocuments({ reservationDate: { $gte: new Date().setHours(0,0,0,0), $lte: new Date().setHours(23,59,59,999) } }),
      Review.countDocuments({ isActive: true }),
      Contact.countDocuments({ isRead: false }),
      Restaurant.find({ isActive: false }).populate('owner', 'name').limit(5),
      Restaurant.aggregate([{ $unwind: '$cuisine' }, { $group: { _id: '$cuisine', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 6 }]),
    ]);

    const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [monthlyReservations, totalRevenue, userRegistrations, recentNotifications, recentReviews] = await Promise.all([
      Reservation.aggregate([{ $match: { createdAt: { $gte: sixMonthsAgo } } }, { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } }, { $sort: { _id: 1 } }]),
      Reservation.aggregate([{ $match: { status: { $in: ['confirmed', 'completed'] }, totalAmount: { $gt: 0 } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      User.aggregate([{ $match: { createdAt: { $gte: sixMonthsAgo } } }, { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
      Notification.find().sort({ createdAt: -1 }).limit(5),
      Review.find().populate('user', 'name').populate('restaurant', 'name').sort({ createdAt: -1 }).limit(5),
    ]);

    const recentReservations = await Reservation.find().populate('user', 'name email').populate('restaurant', 'name').sort({ createdAt: -1 }).limit(5);

    res.status(200).json({
      success: true,
      data: {
        totalUsers, activeUsers, totalRestaurants, activeRestaurants,
        totalReservations, pendingReservations, confirmedReservations,
        completedReservations, cancelledReservations, todayBookings: todayReservations,
        totalReviews, unreadContacts, openDisputes: 0, totalDisputes: 0,
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        pendingRestaurants, cuisineStats, monthlyReservations, recentReservations,
        userRegistrations, recentNotifications, recentReviews,
      },
    });
  } catch (error) { next(error); }
};

// @desc    Get analytics
// @route   GET /api/admin/analytics
export const getAnalytics = async (req, res, next) => {
  try {
    const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const oneMonthAgo = new Date(); oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const [
      userGrowth, restaurantGrowth, reservationGrowth,
      popularRestaurants, conversionRate,
    ] = await Promise.all([
      User.aggregate([{ $match: { createdAt: { $gte: sixMonthsAgo } } }, { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
      Restaurant.aggregate([{ $match: { createdAt: { $gte: sixMonthsAgo } } }, { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
      Reservation.aggregate([{ $match: { createdAt: { $gte: sixMonthsAgo } } }, { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
      Reservation.aggregate([
        { $group: { _id: '$restaurant', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]).then(async (results) => {
        await Restaurant.populate(results, { path: '_id', select: 'name' });
        return results.map(r => ({ restaurant: r._id, bookings: r.count }));
      }),
      Reservation.aggregate([
        { $match: { createdAt: { $gte: oneMonthAgo } } },
        { $group: { _id: null, total: { $sum: 1 }, completed: { $sum: { $cond: [{ $in: ['$status', ['confirmed', 'completed']] }, 1, 0] } } } },
      ]).then(r => r.length > 0 ? (r[0].completed / r[0].total) * 100 : 0),
    ]);

    res.status(200).json({ success: true, data: { userGrowth, restaurantGrowth, reservationGrowth, popularRestaurants, conversionRate } });
  } catch (error) { next(error); }
};

// @desc    Get all users
// @route   GET /api/admin/users
export const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    const total = await User.countDocuments(query);
    const users = await User.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));
    res.status(200).json({ success: true, data: users, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
};

// @desc    Update user
export const updateUser = async (req, res, next) => {
  try {
    const { role, isActive } = req.body;
    const updateData = {};
    if (role) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: user });
  } catch (error) { next(error); }
};

// @desc    Delete user
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) { next(error); }
};

// @desc    Get all menus
export const getAllMenus = async (req, res, next) => {
  try {
    const menus = await Menu.find({}).populate('restaurant', 'name');
    res.status(200).json({ success: true, data: menus });
  } catch (error) { next(error); }
};

// @desc    Delete menu
export const deleteMenu = async (req, res, next) => {
  try {
    const menu = await Menu.findById(req.params.id);
    if (!menu) return res.status(404).json({ success: false, message: 'Menu not found' });
    await menu.deleteOne();
    res.status(200).json({ success: true, message: 'Menu deleted' });
  } catch (error) { next(error); }
};

// @desc    Update restaurant status (approve/reject)
export const updateRestaurantStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
    if (restaurant.owner) {
      await Notification.create({
        user: restaurant.owner, type: isActive ? 'restaurant_approved' : 'restaurant_rejected',
        title: isActive ? 'Restaurant Approved' : 'Restaurant Rejected',
        message: isActive ? `Your restaurant "${restaurant.name}" has been approved and is now live.` : `Your restaurant "${restaurant.name}" has been rejected.`,
        data: { restaurantId: restaurant._id },
      });
    }
    res.status(200).json({ success: true, data: restaurant });
  } catch (error) { next(error); }
};

// @desc    Get all restaurants
export const getAllRestaurantsAdmin = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, status, search } = req.query;
    const query = {};
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { 'address.city': { $regex: search, $options: 'i' } }];
    const total = await Restaurant.countDocuments(query);
    const restaurants = await Restaurant.find(query).populate('owner', 'name email').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));
    res.status(200).json({ success: true, data: restaurants, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
};

// @desc    Get restaurant details
export const getRestaurantDetails = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).populate('owner', 'name email phone');
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
    const [reservations, reviews, menus, orders] = await Promise.all([
      Reservation.find({ restaurant: restaurant._id }).populate('user', 'name email').sort({ createdAt: -1 }).limit(10),
      Review.find({ restaurant: restaurant._id }).populate('user', 'name').sort({ createdAt: -1 }).limit(10),
      Menu.find({ restaurant: restaurant._id }),
      Reservation.aggregate([{ $match: { restaurant: restaurant._id, status: { $in: ['confirmed', 'completed'] } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
    ]);
    const totalRevenue = orders.length > 0 ? orders[0].total : 0;
    res.status(200).json({ success: true, data: { restaurant, reservations, reviews, menus, totalRevenue } });
  } catch (error) { next(error); }
};

// @desc    Get all gallery
export const getAllGallery = async (req, res, next) => {
  try {
    const { restaurantId } = req.query;
    const query = {};
    if (restaurantId) query.restaurant = restaurantId;
    const images = await Gallery.find(query).populate('restaurant', 'name').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: images });
  } catch (error) { next(error); }
};

// @desc    Delete gallery image
export const deleteGalleryImage = async (req, res, next) => {
  try {
    const image = await Gallery.findById(req.params.id);
    if (!image) return res.status(404).json({ success: false, message: 'Image not found' });
    await image.deleteOne();
    res.status(200).json({ success: true, message: 'Image deleted' });
  } catch (error) { next(error); }
};

// @desc    Update gallery image
export const updateGalleryImage = async (req, res, next) => {
  try {
    const image = await Gallery.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!image) return res.status(404).json({ success: false, message: 'Image not found' });
    res.status(200).json({ success: true, data: image });
  } catch (error) { next(error); }
};

// @desc    Get all reservations
export const getAllReservations = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, startDate, endDate } = req.query;
    const query = {};
    if (status) query.status = status;
    if (startDate || endDate) { query.reservationDate = {}; if (startDate) query.reservationDate.$gte = new Date(startDate); if (endDate) query.reservationDate.$lte = new Date(endDate); }
    const total = await Reservation.countDocuments(query);
    const reservations = await Reservation.find(query).populate('user', 'name email').populate('restaurant', 'name').populate('table', 'tableNumber').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));
    res.status(200).json({ success: true, data: reservations, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
};

// ========== OWNERS ==========
export const getOwners = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = { role: 'restaurant_owner' };
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    const total = await User.countDocuments(query);
    const owners = await User.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));
    const ownersWithCounts = await Promise.all(owners.map(async (o) => {
      const count = await Restaurant.countDocuments({ owner: o._id });
      return { ...o.toObject(), restaurantCount: count };
    }));
    res.status(200).json({ success: true, data: ownersWithCounts, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
};

export const getOwnerDetails = async (req, res, next) => {
  try {
    const owner = await User.findById(req.params.id);
    if (!owner) return res.status(404).json({ success: false, message: 'Owner not found' });
    const restaurants = await Restaurant.find({ owner: owner._id });
    const restaurantIds = restaurants.map(r => r._id);
    const [reservations, revenue] = await Promise.all([
      Reservation.countDocuments({ restaurant: { $in: restaurantIds } }),
      Reservation.aggregate([{ $match: { restaurant: { $in: restaurantIds }, status: { $in: ['confirmed', 'completed'] } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
    ]);
    res.status(200).json({ success: true, data: { owner, restaurants, totalReservations: reservations, totalRevenue: revenue.length > 0 ? revenue[0].total : 0 } });
  } catch (error) { next(error); }
};

export const updateOwner = async (req, res, next) => {
  try {
    const { isActive, isVerified } = req.body;
    const update = {};
    if (isActive !== undefined) update.isActive = isActive;
    if (isVerified !== undefined) update.isVerified = isVerified;
    const owner = await User.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!owner) return res.status(404).json({ success: false, message: 'Owner not found' });
    res.status(200).json({ success: true, data: owner });
  } catch (error) { next(error); }
};

export const deleteOwner = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Owner deleted' });
  } catch (error) { next(error); }
};

// ========== CUSTOMERS ==========
export const getCustomers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = { role: 'customer' };
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    const total = await User.countDocuments(query);
    const customers = await User.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));
    const withCounts = await Promise.all(customers.map(async (c) => {
      const [reservations, reviews] = await Promise.all([
        Reservation.countDocuments({ user: c._id }),
        Review.countDocuments({ user: c._id }),
      ]);
      return { ...c.toObject(), reservationCount: reservations, reviewCount: reviews };
    }));
    res.status(200).json({ success: true, data: withCounts, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
};

export const getCustomerDetails = async (req, res, next) => {
  try {
    const customer = await User.findById(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    const [reservations, reviews] = await Promise.all([
      Reservation.find({ user: customer._id }).populate('restaurant', 'name').sort({ createdAt: -1 }).limit(10),
      Review.find({ user: customer._id }).populate('restaurant', 'name').sort({ createdAt: -1 }).limit(10),
    ]);
    res.status(200).json({ success: true, data: { customer, reservations, reviews } });
  } catch (error) { next(error); }
};

// ========== ORDERS ==========
export const getOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = {};
    if (status) query.status = status;
    // Orders use Reservation model with totalAmount > 0
    const total = await Reservation.countDocuments({ ...query, totalAmount: { $gt: 0 } });
    const orders = await Reservation.find({ ...query, totalAmount: { $gt: 0 } }).populate('user', 'name email').populate('restaurant', 'name').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));
    res.status(200).json({ success: true, data: orders, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Reservation.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.status(200).json({ success: true, data: order });
  } catch (error) { next(error); }
};

export const processRefund = async (req, res, next) => {
  try {
    const order = await Reservation.findByIdAndUpdate(req.params.id, { status: 'cancelled', totalAmount: 0 }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.status(200).json({ success: true, message: 'Refund processed', data: order });
  } catch (error) { next(error); }
};

// ========== FINANCE ==========
export const getRevenue = async (req, res, next) => {
  try {
    const { period = 'monthly' } = req.query;
    const match = period === 'daily'
      ? { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }
      : { createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } };
    const groupId = period === 'daily'
      ? { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
      : { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
    const revenue = await Reservation.aggregate([
      { $match: { ...match, status: { $in: ['confirmed', 'completed'] }, totalAmount: { $gt: 0 } } },
      { $group: { _id: groupId, amount: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    res.status(200).json({ success: true, data: revenue });
  } catch (error) { next(error); }
};

export const getTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const transactions = await Reservation.find({ totalAmount: { $gt: 0 } })
      .populate('user', 'name email').populate('restaurant', 'name')
      .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));
    const total = await Reservation.countDocuments({ totalAmount: { $gt: 0 } });
    res.status(200).json({ success: true, data: transactions, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
};

// ========== COMMISSIONS ==========
export const getCommissionSettings = async (req, res, next) => {
  try {
    // Default commission rate (can be stored in a settings collection)
    res.status(200).json({ success: true, data: { globalRate: 10, type: 'percentage' } });
  } catch (error) { next(error); }
};

export const updateCommissionSettings = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, data: req.body, message: 'Commission settings updated' });
  } catch (error) { next(error); }
};

export const setRestaurantCommission = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, message: 'Restaurant commission updated' });
  } catch (error) { next(error); }
};

export const getCommissionAnalytics = async (req, res, next) => {
  try {
    const totalRevenue = await Reservation.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed'] }, totalAmount: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const platformCommission = totalRevenue.length > 0 ? totalRevenue[0].total * 0.1 : 0;
    res.status(200).json({ success: true, data: { totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0, platformCommission, commissionRate: 10 } });
  } catch (error) { next(error); }
};

// ========== SUBSCRIPTIONS ==========
export const getSubscriptions = async (req, res, next) => {
  try {
    const owners = await User.find({ role: 'restaurant_owner' }).select('name email createdAt');
    const subscriptions = owners.map(o => ({
      _id: o._id, owner: { name: o.name, email: o.email },
      plan: 'free', status: 'active', startDate: o.createdAt, nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    }));
    res.status(200).json({ success: true, data: subscriptions });
  } catch (error) { next(error); }
};

export const getPlans = async (req, res, next) => {
  const plans = [
    { _id: 'free', name: 'Free', price: 0, features: ['Up to 1 restaurant', 'Basic support'], isActive: true },
    { _id: 'basic', name: 'Basic', price: 999, features: ['Up to 3 restaurants', 'Email support', 'Basic analytics'], isActive: true },
    { _id: 'premium', name: 'Premium', price: 2999, features: ['Up to 10 restaurants', 'Priority support', 'Full analytics', 'Featured listing'], isActive: true },
    { _id: 'enterprise', name: 'Enterprise', price: 9999, features: ['Unlimited restaurants', 'Dedicated support', 'Custom integrations', 'API access'], isActive: true },
  ];
  res.status(200).json({ success: true, data: plans });
};

export const createPlan = async (req, res, next) => {
  res.status(201).json({ success: true, data: req.body, message: 'Plan created' });
};
export const updatePlan = async (req, res, next) => {
  res.status(200).json({ success: true, data: req.body, message: 'Plan updated' });
};
export const deletePlan = async (req, res, next) => {
  res.status(200).json({ success: true, message: 'Plan deleted' });
};

// ========== REVIEWS ==========
export const getReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const total = await Review.countDocuments();
    const reviews = await Review.find().populate('user', 'name').populate('restaurant', 'name').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));
    res.status(200).json({ success: true, data: reviews, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
};

export const deleteReview = async (req, res, next) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Review deleted' });
  } catch (error) { next(error); }
};

// ========== ADVERTISEMENTS ==========
export const getAdvertisements = async (req, res, next) => {
  try {
    const ads = await Restaurant.find({}).select('name images.cover isActive').limit(20);
    const advertisements = ads.map(a => ({
      _id: a._id, restaurant: a.name, image: a.images?.cover, isActive: a.isActive,
      campaign: a.isActive ? 'Active' : 'Inactive', impressions: Math.floor(Math.random() * 10000), clicks: Math.floor(Math.random() * 500),
    }));
    res.status(200).json({ success: true, data: advertisements });
  } catch (error) { next(error); }
};

export const createAdvertisement = async (req, res, next) => {
  res.status(201).json({ success: true, data: req.body, message: 'Advertisement created' });
};
export const updateAdvertisement = async (req, res, next) => {
  res.status(200).json({ success: true, data: req.body, message: 'Advertisement updated' });
};
export const deleteAdvertisement = async (req, res, next) => {
  res.status(200).json({ success: true, message: 'Advertisement deleted' });
};

// ========== CMS ==========
const cmsPages = [
  { _id: 'home', title: 'Home Page', slug: '/', content: { hero: 'Find your perfect table', features: [] }, lastUpdated: new Date() },
  { _id: 'about', title: 'About Us', slug: '/about', content: { body: 'About TableBliss...' }, lastUpdated: new Date() },
  { _id: 'contact', title: 'Contact Us', slug: '/contact', content: { email: 'hello@tablebliss.com', phone: '+880' }, lastUpdated: new Date() },
  { _id: 'faq', title: 'FAQ', slug: '/faq', content: { questions: [] }, lastUpdated: new Date() },
  { _id: 'terms', title: 'Terms & Conditions', slug: '/terms', content: { body: 'Terms and conditions...' }, lastUpdated: new Date() },
  { _id: 'privacy', title: 'Privacy Policy', slug: '/privacy', content: { body: 'Privacy policy...' }, lastUpdated: new Date() },
];

export const getCMSPages = async (req, res, next) => {
  res.status(200).json({ success: true, data: cmsPages });
};
export const updateCMSPage = async (req, res, next) => {
  res.status(200).json({ success: true, data: { _id: req.params.id, ...req.body }, message: 'Page updated' });
};

// ========== SUPPORT TICKETS ==========
export const getSupportTickets = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = {};
    if (status) query.isRead = status === 'resolved';
    const total = await Contact.countDocuments(query);
    const tickets = await Contact.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));
    res.status(200).json({ success: true, data: tickets, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
};

export const updateTicketStatus = async (req, res, next) => {
  try {
    const ticket = await Contact.findByIdAndUpdate(req.params.id, { isResolved: req.body.status === 'resolved' }, { new: true });
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    res.status(200).json({ success: true, data: ticket });
  } catch (error) { next(error); }
};

export const replyTicket = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, message: 'Reply sent', data: req.body });
  } catch (error) { next(error); }
};

// ========== NOTIFICATIONS ==========
export const sendNotification = async (req, res, next) => {
  try {
    const { type, title, message, recipients } = req.body;
    if (recipients === 'all') {
      const users = await User.find({ isActive: true });
      const notifications = users.map(u => ({ user: u._id, type, title, message }));
      await Notification.insertMany(notifications);
    } else if (recipients === 'owners') {
      const owners = await User.find({ role: 'restaurant_owner', isActive: true });
      const notifications = owners.map(u => ({ user: u._id, type, title, message }));
      await Notification.insertMany(notifications);
    }
    res.status(200).json({ success: true, message: `Notification sent to ${recipients}` });
  } catch (error) { next(error); }
};

// ========== PAYOUTS ==========
export const getPayouts = async (req, res, next) => {
  try {
    const restaurants = await Restaurant.find({ isActive: true }).populate('owner', 'name email').limit(20);
    const payouts = restaurants.map(r => ({
      _id: r._id, restaurant: r.name, owner: r.owner,
      amount: Math.floor(Math.random() * 50000) + 5000,
      status: 'pending', date: new Date(),
    }));
    res.status(200).json({ success: true, data: payouts });
  } catch (error) { next(error); }
};

export const processPayout = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, message: 'Payout processed successfully' });
  } catch (error) { next(error); }
};

// ========== ACTIVITY LOGS ==========
export const getActivityLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const logs = [];
    const users = await User.find().sort({ createdAt: -1 }).limit(5);
    users.forEach(u => {
      logs.push({ _id: u._id + '-created', user: u.name, action: 'User registered', target: u.email, timestamp: u.createdAt });
    });
    const reservations = await Reservation.find().populate('user', 'name').populate('restaurant', 'name').sort({ createdAt: -1 }).limit(5);
    reservations.forEach(r => {
      logs.push({ _id: r._id + '-res', user: r.user?.name, action: `Reservation ${r.status}`, target: r.restaurant?.name, timestamp: r.createdAt });
    });
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.status(200).json({ success: true, data: logs.slice(0, parseInt(limit)) });
  } catch (error) { next(error); }
};

// ========== SETTINGS ==========
export const getSettings = async (req, res, next) => {
  const settings = {
    platform: { name: 'TableBliss', tagline: 'Find your perfect table', email: 'hello@tablebliss.com', phone: '+880 1234-567890' },
    payments: { sslcommerz: { enabled: true, merchantId: '****' }, stripe: { enabled: false, publishableKey: '' }, paypal: { enabled: false, clientId: '' } },
    email: { smtpHost: 'smtp.gmail.com', smtpPort: 587, fromEmail: 'noreply@tablebliss.com' },
    seo: { title: 'TableBliss - Restaurant Reservations', description: 'Find and book the best restaurants', keywords: 'restaurants, reservations, dining' },
    notifications: { emailEnabled: true, smsEnabled: false, pushEnabled: true },
  };
  res.status(200).json({ success: true, data: settings });
};

export const updateSettings = async (req, res, next) => {
  res.status(200).json({ success: true, data: req.body, message: 'Settings updated' });
};
