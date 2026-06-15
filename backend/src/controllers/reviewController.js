import Review from '../models/Review.js';
import Restaurant from '../models/Restaurant.js';
import Notification from '../models/Notification.js';

// @desc    Get reviews for restaurant
// @route   GET /api/reviews/:restaurantId
export const getReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, rating } = req.query;
    const query = { restaurant: req.params.restaurantId, isActive: true };

    if (rating) query.rating = parseInt(rating);

    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query)
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const averageRating = await Review.aggregate([
      { $match: { restaurant: req.params.restaurantId, isActive: true } },
      { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      data: reviews,
      stats: {
        averageRating: averageRating[0]?.average || 0,
        totalReviews: averageRating[0]?.count || 0,
      },
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

// @desc    Create review
// @route   POST /api/reviews/:restaurantId
export const createReview = async (req, res, next) => {
  try {
    req.body.user = req.user._id;
    req.body.restaurant = req.params.restaurantId;

    const existingReview = await Review.findOne({
      user: req.user._id,
      restaurant: req.params.restaurantId,
    });

    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this restaurant' });
    }

    const review = await Review.create(req.body);

    // Update restaurant rating
    const stats = await Review.aggregate([
      { $match: { restaurant: req.params.restaurantId, isActive: true } },
      { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    await Restaurant.findByIdAndUpdate(req.params.restaurantId, {
      rating: Math.round(stats[0]?.average * 10) / 10,
      totalReviews: stats[0]?.count || 0,
    });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
export const updateReview = async (req, res, next) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await review.deleteOne();
    res.status(200).json({ success: true, message: 'Review deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Like/unlike review
// @route   PUT /api/reviews/:id/like
export const toggleLike = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const isLiked = review.likes.includes(req.user._id);
    if (isLiked) {
      review.likes.pull(req.user._id);
    } else {
      review.likes.push(req.user._id);
    }

    await review.save();
    res.status(200).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};