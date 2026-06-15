import mongoose from 'mongoose';

const tableSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    tableNumber: {
      type: String,
      required: [true, 'Table number is required'],
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: 1,
    },
    section: {
      type: String,
      enum: ['indoor', 'outdoor', 'patio', 'bar', 'private'],
      default: 'indoor',
    },
    description: {
      type: String,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    minimumGuests: {
      type: Number,
      default: 1,
    },
    maximumGuests: {
      type: Number,
      default: 10,
    },
  },
  {
    timestamps: true,
  }
);

tableSchema.index({ restaurant: 1, tableNumber: 1 }, { unique: true });

const Table = mongoose.model('Table', tableSchema);
export default Table;