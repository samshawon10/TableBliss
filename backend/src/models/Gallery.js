import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    image: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    publicId: {
      type: String,
    },
    caption: {
      type: String,
      maxlength: [200, 'Caption cannot exceed 200 characters'],
    },
    category: {
      type: String,
      enum: ['interior', 'exterior', 'food', 'drinks', 'events', 'staff', 'other'],
      default: 'other',
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

gallerySchema.index({ restaurant: 1, category: 1 });

const Gallery = mongoose.model('Gallery', gallerySchema);
export default Gallery;