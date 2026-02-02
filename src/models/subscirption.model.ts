import mongoose, { Schema } from 'mongoose';

const subscriptionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    isActive: { type: Boolean },
    stripeSubscriptionId: {
      type: String,
    },
    stripeCustomerId: { type: String },

    priceId: { type: String },
    amount: { type: Number },

    plan: {
      type: String,
      enum: ['free', 'monthly', 'yearly'],
    },

    interval: {
      type: String,
      enum: ['month', 'year'],
    },

    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled', 'expired'],
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    expiredDate: {
      type: Date,
    },
    renewalDate: { type: Date },
    cancelledDate: { type: Date },

  },
  { strict: true, timestamps: true },
);

const Subscriptions = mongoose.model('Subscriptions', subscriptionSchema);

export default Subscriptions;
