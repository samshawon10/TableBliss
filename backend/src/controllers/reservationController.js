import Reservation from '../models/Reservation.js';
import Table from '../models/Table.js';
import Restaurant from '../models/Restaurant.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { sendReservationConfirmation } from '../utils/emailService.js';

// @desc    Get user reservations
// @route   GET /api/reservations
export const getUserReservations = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { user: req.user._id };

    if (status) query.status = status;

    const total = await Reservation.countDocuments(query);
    const reservations = await Reservation.find(query)
      .populate({
        path: 'restaurant',
        select: 'name images.logo address.city contact.phone',
      })
      .populate('table', 'tableNumber section')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: reservations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single reservation
// @route   GET /api/reservations/:id
export const getReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate({
        path: 'restaurant',
        select: 'name images.logo address contact phone email cuisine',
      })
      .populate('table', 'tableNumber section capacity');

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    res.status(200).json({ success: true, data: reservation });
  } catch (error) {
    next(error);
  }
};

// @desc    Create reservation
// @route   POST /api/reservations
export const createReservation = async (req, res, next) => {
  try {
    const { restaurant: restaurantId, reservationDate, timeSlot, guestCount, table: selectedTableId, selectedItems, totalAmount } = req.body;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    let assignedTableId;

    if (selectedTableId) {
      // Use the user-selected table if available
      const selectedTable = await Table.findOne({
        _id: selectedTableId,
        restaurant: restaurantId,
        isActive: true,
        isAvailable: true,
      });

      if (!selectedTable) {
        return res.status(400).json({ success: false, message: 'Selected table is not available' });
      }

      // Check if table is already booked for this time slot
      const existingRes = await Reservation.findOne({
        restaurant: restaurantId,
        table: selectedTableId,
        reservationDate: new Date(reservationDate),
        timeSlot,
        status: { $in: ['pending', 'confirmed'] },
      });

      if (existingRes) {
        return res.status(400).json({ success: false, message: 'This table is already booked for the selected time' });
      }

      assignedTableId = selectedTableId;
    } else {
      // Auto-assign an available table
      const tables = await Table.find({
        restaurant: restaurantId,
        isActive: true,
        isAvailable: true,
        minimumGuests: { $lte: guestCount },
        maximumGuests: { $gte: guestCount },
      });

      if (tables.length === 0) {
        return res.status(400).json({ success: false, message: 'No tables available for this party size' });
      }

      const existingReservations = await Reservation.find({
        restaurant: restaurantId,
        reservationDate: new Date(reservationDate),
        timeSlot,
        status: { $in: ['pending', 'confirmed'] },
      });

      const bookedTableIds = existingReservations.map((r) => r.table?.toString());
      const availableTable = tables.find((t) => !bookedTableIds.includes(t._id.toString()));

      if (!availableTable) {
        return res.status(400).json({ success: false, message: 'No tables available for this date and time' });
      }

      assignedTableId = availableTable._id;
    }

    req.body.user = req.user._id;
    req.body.table = assignedTableId;
    if (selectedItems && selectedItems.length > 0) {
      req.body.selectedItems = selectedItems;
      req.body.totalAmount = totalAmount || 0;
    }

    const reservation = await Reservation.create(req.body);

    // Create notification
    await Notification.create({
      user: req.user._id,
      type: 'reservation_pending',
      title: 'Reservation Pending',
      message: `Your reservation at ${restaurant.name} is pending confirmation.`,
      data: { reservationId: reservation._id },
    });

    res.status(201).json({ success: true, data: reservation });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel reservation
// @route   PUT /api/reservations/:id/cancel
export const cancelReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    if (reservation.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (['cancelled', 'completed', 'no-show'].includes(reservation.status)) {
      return res.status(400).json({ success: false, message: 'Reservation cannot be cancelled' });
    }

    reservation.status = 'cancelled';
    reservation.cancellationReason = req.body.reason || 'Cancelled by user';
    reservation.cancelledAt = new Date();
    await reservation.save();

    // Create notification
    await Notification.create({
      user: reservation.user,
      type: 'reservation_cancelled',
      title: 'Reservation Cancelled',
      message: `Your reservation has been cancelled.`,
      data: { reservationId: reservation._id },
    });

    res.status(200).json({ success: true, data: reservation });
  } catch (error) {
    next(error);
  }
};

// @desc    Update reservation status (admin)
// @route   PUT /api/reservations/:id/status
export const updateReservationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    reservation.status = status;
    if (status === 'confirmed') reservation.confirmedAt = new Date();
    if (status === 'completed') reservation.completedAt = new Date();
    await reservation.save();

    // Send confirmation email
    if (status === 'confirmed') {
      const user = await User.findById(reservation.user);
      const restaurant = await Restaurant.findById(reservation.restaurant);
      // Create a plain object for the email to avoid mutating the mongoose document
      const emailData = {
        ...reservation.toObject(),
        restaurant: restaurant.toObject(),
      };
      try {
        await sendReservationConfirmation(emailData, user);
      } catch (err) {
        console.error('Confirmation email failed:', err.message);
      }
    }

    res.status(200).json({ success: true, data: reservation });
  } catch (error) {
    next(error);
  }
};

// @desc    Check availability
// @route   POST /api/reservations/check-availability
export const checkAvailability = async (req, res, next) => {
  try {
    const { restaurantId, date, timeSlot, guestCount } = req.body;

    const tables = await Table.find({
      restaurant: restaurantId,
      isActive: true,
      minimumGuests: { $lte: guestCount },
      maximumGuests: { $gte: guestCount },
    });

    const existingReservations = await Reservation.find({
      restaurant: restaurantId,
      reservationDate: new Date(date),
      timeSlot,
      status: { $in: ['pending', 'confirmed'] },
    });

    const bookedTableIds = existingReservations.map((r) => r.table?.toString());
    const availableTables = tables.filter((t) => !bookedTableIds.includes(t._id.toString()));

    res.status(200).json({
      success: true,
      data: {
        isAvailable: availableTables.length > 0,
        availableTables: availableTables.length,
        totalTables: tables.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get time slots
// @route   GET /api/reservations/time-slots/:restaurantId
export const getTimeSlots = async (req, res, next) => {
  try {
    const { date } = req.query;
    const restaurant = await Restaurant.findById(req.params.restaurantId);

    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = dayNames[new Date(date).getDay()];
    const hours = restaurant.operatingHours[dayOfWeek];

    if (!hours || !hours.isOpen) {
      return res.status(200).json({ success: true, data: [] });
    }

    // Generate 30-minute time slots
    const slots = [];
    const [openH, openM] = hours.open.split(':').map(Number);
    const [closeH, closeM] = hours.close.split(':').map(Number);
    let startMin = openH * 60 + openM;
    const endMin = closeH * 60 + closeM;

    while (startMin < endMin) {
      const h = Math.floor(startMin / 60);
      const m = startMin % 60;
      const formatted = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      slots.push(formatted);
      startMin += 30;
    }

    res.status(200).json({ success: true, data: slots });
  } catch (error) {
    next(error);
  }
};