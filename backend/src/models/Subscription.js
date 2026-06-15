import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'expired', 'suspended', 'cancelled'],
      default: 'pending',
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    autoRenew: {
      type: Boolean,
      default: false,
    },
    cancelledAt: {
      type: Date,
    },
    suspendedAt: {
      type: Date,
    },
    suspendedReason: {
      type: String,
    },
    paymentMethod: {
      type: String,
      enum: ['bkash', 'nagad', 'rocket', 'bank', 'card', 'none'],
      default: 'none',
    },
  },
  {
    timestamps: true,
  }
);

subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ plan: 1 });

const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;