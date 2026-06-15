import Gallery from '../models/Gallery.js';
import { cloudinary } from '../config/cloudinary.js';

// @desc    Get gallery images
// @route   GET /api/gallery/:restaurantId
export const getGallery = async (req, res, next) => {
  try {
    const { category } = req.query;
    const query = { restaurant: req.params.restaurantId, isActive: true };
    if (category) query.category = category;

    const images = await Gallery.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: images });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload image
// @route   POST /api/gallery/:restaurantId
export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image' });
    }

    const image = await Gallery.create({
      restaurant: req.params.restaurantId,
      image: req.file.path,
      publicId: req.file.filename,
      caption: req.body.caption || '',
      category: req.body.category || 'other',
      uploadedBy: req.user._id,
    });

    res.status(201).json({ success: true, data: image });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete image
// @route   DELETE /api/gallery/:id
export const deleteImage = async (req, res, next) => {
  try {
    const image = await Gallery.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    if (image.publicId) {
      await cloudinary.uploader.destroy(image.publicId);
    }

    await image.deleteOne();
    res.status(200).json({ success: true, message: 'Image deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update image details
// @route   PUT /api/gallery/:id
export const updateImage = async (req, res, next) => {
  try {
    const image = await Gallery.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!image) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }
    res.status(200).json({ success: true, data: image });
  } catch (error) {
    next(error);
  }
};