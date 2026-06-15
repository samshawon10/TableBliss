import Plan from '../models/Plan.js';
import Subscription from '../models/Subscription.js';
import Payment from '../models/Payment.js';
import User from '../models/User.js';

// @desc    Get all plans (public)
// @route   GET /api/subscriptions/plans
export const getPlans = async (req, res) => {
  try {
    let plans = await Plan.find({ isActive: true }).sort({ sortOrder: 1, price: 1 });
    if (plans.length === 0) {
      const defaults = [
        { name: 'Free', price: 0, duration: 30, sortOrder: 0, features: ['Up to 1 restaurant', 'Basic support', 'Standard listing'], maxRestaurants: 1, maxTables: 5, maxMenus: 3, analyticsEnabled: false, prioritySupport: false, featuredListing: false, apiAccess: false },
        { name: 'Basic', price: 999, duration: 30, sortOrder: 1, features: ['Up to 3 restaurants', 'Email support', 'Basic analytics', 'Menu management', 'Up to 15 tables'], maxRestaurants: 3, maxTables: 15, maxMenus: 10, analyticsEnabled: true, prioritySupport: false, featuredListing: false, apiAccess: false },
        { name: 'Premium', price: 2999, duration: 30, sortOrder: 2, features: ['Up to 10 restaurants', 'Priority support', 'Full analytics', 'Featured listing', 'Advanced reporting'], maxRestaurants: 10, maxTables: 50, maxMenus: 30, analyticsEnabled: true, prioritySupport: true, featuredListing: true, apiAccess: false },
        { name: 'Enterprise', price: 9999, duration: 30, sortOrder: 3, features: ['Unlimited restaurants', 'Dedicated support', 'Custom integrations', 'API access', 'Priority listing', 'White-label option'], maxRestaurants: 99, maxTables: 999, maxMenus: 999, analyticsEnabled: true, prioritySupport: true, featuredListing: true, apiAccess: true },
      ];
      plans = await Plan.insertMany(defaults);
    }
    res.json({ success: true, data: plans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a plan (admin)
// @route   POST /api/subscriptions/plans
export const createPlan = async (req, res) => {
  try {
    const plan = await Plan.create(req.body);
    res.status(201).json({ success: true, data: plan });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update a plan (admin)
// @route   PUT /api/subscriptions/plans/:id
export const updatePlan = async (req, res) => {
  try {
    const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
    res.json({ success: true, data: plan });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete a plan (admin)
// @route   DELETE /api/subscriptions/plans/:id
export const deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findByIdAndDelete(req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
    res.json({ success: true, message: 'Plan deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's current subscription
// @route   GET /api/subscriptions/my-subscription
export const getMySubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user.id, status: { $in: ['active', 'pending'] } })
      .populate('plan')
      .sort({ createdAt: -1 });

    const allSubscriptions = await Subscription.find({ user: req.user.id })
      .populate('plan')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { current: subscription, history: allSubscriptions } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Select a plan (creates pending subscription)
// @route   POST /api/subscriptions/select-plan
export const selectPlan = async (req, res) => {
  try {
    const { planId } = req.body;
    const plan = await Plan.findById(planId);
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

    // Check if user already has active subscription for this plan
    const existing = await Subscription.findOne({
      user: req.user.id,
      plan: planId,
      status: { $in: ['active', 'pending'] },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `You already have a ${existing.status} subscription for this plan`,
      });
    }

    // For free plan, activate immediately
    if (plan.price === 0) {
      const subscription = await Subscription.create({
        user: req.user.id,
        plan: planId,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000),
      });
      const populated = await subscription.populate('plan');
      return res.json({ success: true, data: populated, message: 'Free plan activated!' });
    }

    // For paid plans, create pending subscription
    const subscription = await Subscription.create({
      user: req.user.id,
      plan: planId,
      status: 'pending',
    });
    const populated = await subscription.populate('plan');

    res.json({
      success: true,
      data: populated,
      message: 'Plan selected! Please complete payment to activate.',
      paymentRequired: true,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Submit payment proof
// @route   POST /api/subscriptions/submit-payment
export const submitPayment = async (req, res) => {
  try {
    const { subscriptionId, transactionId, method, senderNumber, amount, screenshot } = req.body;

    if (!transactionId || !method || !senderNumber || !amount) {
      return res.status(400).json({ success: false, message: 'Transaction ID, method, sender number and amount are required' });
    }

    // Validate method
    const validMethods = ['bkash', 'nagad', 'rocket'];
    if (!validMethods.includes(method)) {
      return res.status(400).json({ success: false, message: 'Invalid payment method. Use bkash, nagad, or rocket' });
    }

    // Check unique transaction ID
    const existingPayment = await Payment.findOne({ transactionId });
    if (existingPayment) {
      return res.status(400).json({ success: false, message: 'Transaction ID already exists. Please use a unique transaction ID.' });
    }

    // Find or create pending subscription
    let subscription;
    if (subscriptionId) {
      subscription = await Subscription.findById(subscriptionId);
      if (!subscription) return res.status(404).json({ success: false, message: 'Subscription not found' });
      if (subscription.status !== 'pending') {
        return res.status(400).json({ success: false, message: 'Subscription is not in pending status' });
      }
    } else {
      return res.status(400).json({ success: false, message: 'Subscription ID is required' });
    }

    const plan = await Plan.findById(subscription.plan);
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

    // Validate amount
    if (Math.abs(amount - plan.price) > 0.01) {
      return res.status(400).json({
        success: false,
        message: `Amount mismatch. Expected ৳${plan.price} but received ৳${amount}`,
      });
    }

    const payment = await Payment.create({
      user: req.user.id,
      subscription: subscription._id,
      plan: subscription.plan,
      transactionId,
      method,
      senderNumber,
      amount,
      screenshot: screenshot || '',
    });

    res.status(201).json({
      success: true,
      data: payment,
      message: 'Payment proof submitted! Awaiting admin verification.',
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Duplicate transaction ID' });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get user's payment history
// @route   GET /api/subscriptions/my-payments
export const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.id })
      .populate('plan', 'name price')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};