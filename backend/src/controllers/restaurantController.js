import Restaurant from '../models/Restaurant.js';
import Review from '../models/Review.js';

// @desc    Get all restaurants
// @route   GET /api/restaurants
export const getRestaurants = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, search, cuisine, priceRange, rating, city, sort } = req.query;
    const query = { isActive: true };

    if (search) {
      query.$text = { $search: search };
    }
    if (cuisine) {
      query.cuisine = { $in: cuisine.split(',') };
    }
    if (priceRange) {
      query.priceRange = { $in: priceRange.split(',') };
    }
    if (rating) {
      query.rating = { $gte: parseFloat(rating) };
    }
    if (city) {
      query['address.city'] = { $regex: city, $options: 'i' };
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };
    if (sort === 'name') sortOption = { name: 1 };

    const total = await Restaurant.countDocuments(query);
    const restaurants = await Restaurant.find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('owner', 'name avatar');

    res.status(200).json({
      success: true,
      data: restaurants,
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

// @desc    Get single restaurant
// @route   GET /api/restaurants/:id
export const getRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
      .populate('owner', 'name avatar');

    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    res.status(200).json({ success: true, data: restaurant });
  } catch (error) {
    next(error);
  }
};

// @desc    Get restaurant by slug
// @route   GET /api/restaurants/slug/:slug
export const getRestaurantBySlug = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ slug: req.params.slug });

    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    res.status(200).json({ success: true, data: restaurant });
  } catch (error) {
    next(error);
  }
};

// @desc    Create restaurant
// @route   POST /api/restaurants
export const createRestaurant = async (req, res, next) => {
  try {
    req.body.owner = req.user._id;
    const restaurant = await Restaurant.create(req.body);
    res.status(201).json({ success: true, data: restaurant });
  } catch (error) {
    next(error);
  }
};

// @desc    Update restaurant
// @route   PUT /api/restaurants/:id
export const updateRestaurant = async (req, res, next) => {
  try {
    let restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: restaurant });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete restaurant
// @route   DELETE /api/restaurants/:id
export const deleteRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    await restaurant.deleteOne();
    res.status(200).json({ success: true, message: 'Restaurant deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured restaurants
// @route   GET /api/restaurants/featured
export const getFeaturedRestaurants = async (req, res, next) => {
  try {
    const restaurants = await Restaurant.find({ isActive: true, isFeatured: true })
      .sort({ rating: -1 })
      .limit(4);
    res.status(200).json({ success: true, data: restaurants });
  } catch (error) {
    next(error);
  }
};

// @desc    Get nearby restaurants
// @route   GET /api/restaurants/nearby
export const getNearbyRestaurants = async (req, res, next) => {
  try {
    const { lng, lat, maxDistance = 5000 } = req.query;

    if (!lng || !lat) {
      return res.status(400).json({ success: false, message: 'Please provide coordinates' });
    }

    const restaurants = await Restaurant.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(maxDistance),
        },
      },
      isActive: true,
    }).limit(10);

    res.status(200).json({ success: true, data: restaurants });
  } catch (error) {
    next(error);
  }
};