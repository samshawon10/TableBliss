import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
    },
    reservationDate: {
      type: Date,
      required: [true, 'Reservation date is required'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required'],
    },
    guestCount: {
      type: Number,
      required: [true, 'Number of guests is required'],
      min: [1, 'At least 1 guest required'],
      max: [20, 'Maximum 20 guests allowed'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'],
      default: 'pending',
    },
    specialRequests: {
      type: String,
      maxlength: [500, 'Special requests cannot exceed 500 characters'],
    },
    occasion: {
      type: String,
      enum: ['none', 'birthday', 'anniversary', 'date', 'business', 'other'],
      default: 'none',
    },
    seatingPreference: {
      type: String,
      enum: ['indoor', 'outdoor', 'any'],
      default: 'any',
    },
    selectedItems: [
      {
        menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu' },
        name: String,
        price: Number,
        quantity: { type: Number, default: 1 },
      },
    ],
    totalAmount: {
      type: Number,
      default: 0,
    },
    contactInfo: {
      name: { type: String },
      phone: { type: String },
      email: { type: String },
    },
    cancellationReason: {
      type: String,
    },
    cancelledAt: Date,
    confirmedAt: Date,
    completedAt: Date,
  },
  {
    timestamps: true,
  }
);

reservationSchema.index({ user: 1, status: 1 });
reservationSchema.index({ restaurant: 1, reservationDate: 1 });
reservationSchema.index({ restaurant: 1, reservationDate: 1, timeSlot: 1 });

const Reservation = mongoose.model('Reservation', reservationSchema);
export default Reservation;