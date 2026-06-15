import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0,
  },
  originalPrice: {
    type: Number,
    min: 0,
  },
  image: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'appetizers',
      'main-course',
      'desserts',
      'beverages',
      'sides',
      'specials',
      'breakfast',
      'lunch',
      'dinner',
      'wine',
      'cocktails',
    ],
  },
  tags: [String],
  isVegetarian: {
    type: Boolean,
    default: false,
  },
  isVegan: {
    type: Boolean,
    default: false,
  },
  isGlutenFree: {
    type: Boolean,
    default: false,
  },
  isSpicy: {
    type: Boolean,
    default: false,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  isPopular: {
    type: Boolean,
    default: false,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  preparationTime: {
    type: Number, // in minutes
    default: 15,
  },
  allergens: [String],
  nutritionalInfo: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
  },
});

const menuSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    name: {
      type: String,
      default: 'Main Menu',
    },
    description: String,
    category: {
      type: String,
      enum: ['all', 'breakfast', 'lunch', 'dinner', 'drinks', 'desserts', 'specials'],
      default: 'all',
    },
    image: {
      type: String,
      default: '',
    },
    startingPrice: {
      type: Number,
      min: 0,
    },
    serves: {
      type: Number,
      min: 1,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    items: [menuItemSchema],
  },
  {
    timestamps: true,
  }
);

menuSchema.index({ restaurant: 1, 'items.category': 1 });

const Menu = mongoose.model('Menu', menuSchema);
export default Menu;