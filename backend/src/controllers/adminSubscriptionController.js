import Plan from '../models/Plan.js';
import Subscription from '../models/Subscription.js';
import Payment from '../models/Payment.js';
import User from '../models/User.js';

// @desc    Get all pending payments (admin)
// @route   GET /api/subscriptions/admin/payments
export const getPendingPayments = async (req, res) => {
  try {
    const { status, method, search } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (method) filter.method = method;
    if (search) {
      filter.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { senderNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const payments = await Payment.find(filter)
      .populate('user', 'name email phone')
      .populate('plan', 'name price duration')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: payments, count: payments.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve payment (admin)
// @route   PUT /api/subscriptions/admin/payments/:id/approve
export const approvePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('plan').populate('subscription');
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    
    if (payment.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Payment already processed' });
    }

    payment.status = 'approved';
    payment.reviewedBy = req.user.id;
    payment.reviewedAt = new Date();
    payment.adminNote = req.body.adminNote || '';
    await payment.save();

    // Activate subscription
    if (payment.subscription) {
      const subscription = await Subscription.findById(payment.subscription).populate('plan');
      if (subscription) {
        subscription.status = 'active';
        subscription.startDate = new Date();
        subscription.endDate = new Date(Date.now() + subscription.plan.duration * 24 * 60 * 60 * 1000);
        subscription.paymentMethod = payment.method;
        await subscription.save();
      }
    }

    // Populate for response
    const updatedPayment = await Payment.findById(payment._id)
      .populate('user', 'name email phone')
      .populate('plan', 'name price duration');

    res.json({
      success: true,
      data: updatedPayment,
      message: 'Payment approved and subscription activated!',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject payment (admin)
// @route   PUT /api/subscriptions/admin/payments/:id/reject
export const rejectPayment = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ success: false, message: 'Rejection reason is required' });

    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    
    if (payment.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Payment already processed' });
    }

    payment.status = 'rejected';
    payment.reviewedBy = req.user.id;
    payment.reviewedAt = new Date();
    payment.adminNote = reason;
    await payment.save();

    const updatedPayment = await Payment.findById(payment._id)
      .populate('user', 'name email phone')
      .populate('plan', 'name price duration');

    res.json({
      success: true,
      data: updatedPayment,
      message: 'Payment rejected',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all subscriptions (admin)
// @route   GET /api/subscriptions/admin/subscriptions
export const getAllSubscriptions = async (req, res) => {
  try {
    const { status, plan } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (plan) filter.plan = plan;

    const subscriptions = await Subscription.find(filter)
      .populate('user', 'name email phone')
      .populate('plan', 'name price duration')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: subscriptions, count: subscriptions.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update subscription status (admin)
// @route   PUT /api/subscriptions/admin/subscriptions/:id/status
export const updateSubscriptionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const subscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user', 'name email').populate('plan', 'name');
    
    if (!subscription) return res.status(404).json({ success: false, message: 'Subscription not found' });
    res.json({ success: true, data: subscription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Extend subscription (admin)
// @route   PUT /api/subscriptions/admin/subscriptions/:id/extend
export const extendSubscription = async (req, res) => {
  try {
    const { days } = req.body;
    if (!days || days < 1) return res.status(400).json({ success: false, message: 'Valid days required' });

    const subscription = await Subscription.findById(req.params.id).populate('plan');
    if (!subscription) return res.status(404).json({ success: false, message: 'Subscription not found' });

    const currentEnd = subscription.endDate || new Date();
    subscription.endDate = new Date(currentEnd.getTime() + days * 24 * 60 * 60 * 1000);
    subscription.status = 'active';
    if (!subscription.startDate) subscription.startDate = new Date();
    await subscription.save();

    res.json({ success: true, data: subscription, message: `Extended by ${days} days` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Suspend subscription (admin)
// @route   PUT /api/subscriptions/admin/subscriptions/:id/suspend
export const suspendSubscription = async (req, res) => {
  try {
    const { reason } = req.body;
    const subscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      { status: 'suspended', suspendedAt: new Date(), suspendedReason: reason || '' },
      { new: true }
    ).populate('user', 'name email').populate('plan', 'name');
    
    if (!subscription) return res.status(404).json({ success: false, message: 'Subscription not found' });
    res.json({ success: true, data: subscription, message: 'Subscription suspended' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};