import User from '../models/User.js';
import { generateResetToken, getTokenExpiry, sendTokenResponse } from '../utils/token.js';
import { sendWelcomeEmail, sendResetPasswordEmail } from '../utils/emailService.js';

// @desc    Register user
// @route   POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
    const isAdminEmail = adminEmails.includes(email.toLowerCase());

    let user = await User.findOne({ email });
    if (user) {
      // Update role to admin if it's an admin email
      if (isAdminEmail && user.role !== 'admin') {
        user.role = 'admin';
        await user.save();
      }
      sendTokenResponse(user, 200, res);
      return;
    }

    const validRoles = ['customer', 'restaurant_owner'];
    let userRole = validRoles.includes(role) ? role : 'customer';
    
    // Auto-assign admin to configured admin email
    if (isAdminEmail) {
      userRole = 'admin';
    }
    
    user = await User.create({ name, email, password, role: userRole });

    // Send welcome email
    try {
      await sendWelcomeEmail(user);
    } catch (err) {
      console.error('Welcome email failed:', err.message);
    }

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.password) {
      return res.status(401).json({ success: false, message: 'Account uses social login' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account has been deactivated' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Google login
// @route   POST /api/auth/google
export const googleLogin = async (req, res, next) => {
  try {
    const { email, name, firebaseUid, avatar } = req.body;

    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
    const isAdminEmail = adminEmails.includes(email.toLowerCase());

    let user = await User.findOne({ email });

    if (user) {
      if (!user.firebaseUid) {
        user.firebaseUid = firebaseUid;
        user.authProvider = 'google';
        if (avatar) user.avatar = avatar;
      }
      // Auto-promote to admin if admin email
      if (isAdminEmail && user.role !== 'admin') {
        user.role = 'admin';
      }
      await user.save();
    } else {
      user = await User.create({
        name,
        email,
        firebaseUid,
        authProvider: 'google',
        avatar: avatar || '',
        isEmailVerified: true,
        role: isAdminEmail ? 'admin' : 'customer',
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/me
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (avatar) updateData.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const resetToken = generateResetToken();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = getTokenExpiry();
    await user.save();

    try {
      await sendResetPasswordEmail(user, resetToken);
      res.status(200).json({ success: true, message: 'Email sent' });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.status(500).json({ success: false, message: 'Email could not be sent' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
export const resetPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/auth/update-password
export const updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password');

    if (!user.password) {
      return res.status(400).json({ success: false, message: 'No password set. Please use "Set Password" option instead.' });
    }

    const isMatch = await user.comparePassword(req.body.currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Set password for social login users
// @route   PUT /api/auth/set-password
export const setPassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password');

    if (user.password) {
      return res.status(400).json({ success: false, message: 'Password already set. Use update password instead.' });
    }

    if (!req.body.password || req.body.password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    user.password = req.body.password;
    user.authProvider = 'email';
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Add/Remove favorite
// @route   PUT /api/auth/favorites/:restaurantId
export const toggleFavorite = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const restaurantId = req.params.restaurantId;

    if (user.favorites.includes(restaurantId)) {
      user.favorites.pull(restaurantId);
    } else {
      user.favorites.push(restaurantId);
    }
    await user.save();

    res.status(200).json({ success: true, data: user.favorites });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user favorites with populated data
// @route   GET /api/auth/favorites
export const getFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'favorites',
      select: 'name images.logo cuisine rating priceRange address.city slug',
    });
    res.status(200).json({ success: true, data: user.favorites });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete account
// @route   DELETE /api/auth/me
export const deleteAccount = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.status(200).json({ success: true, message: 'Account deleted' });
  } catch (error) {
    next(error);
  }
};
