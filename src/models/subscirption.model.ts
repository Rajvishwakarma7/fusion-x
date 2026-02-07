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
      enum: ['MONTHLY', 'QUARTERLY', 'SEMI_YEAR', 'ANNUAL', 'LIFE_TIME'],
    },
    planType: {
      type: String,
      enum: ["recurring", "one_time"],
    },
    interval: {
      type: String,
      enum: ['day', 'week', 'month', 'year','one_time'],
      default: 'month',
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
  { strict: true, timestamps: true }
);

// Indexes for faster queries
subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ stripeSubscriptionId: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ stripeCustomerId: 1 });



const Subscriptions = mongoose.model('Subscriptions', subscriptionSchema);

export default Subscriptions;
