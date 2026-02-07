import mongoose, { Schema } from 'mongoose';

const transactionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'users',
    },
    stripeCustomerId: {
      type: String,
    },
    paymentIntentId: {
      type: String,
    },
    invoiceId: {
      type: String,
    },

    stripeSubscriptionId: {
      type: String,
    },
    // Transaction details
    type: {
      type: String,
      enum: ['one_time', 'subscription', 'refund'],
      required: true,
    },
    status: {
      type: String,
      enum: [
        'pending',
        'processing',
        'succeeded',
        'failed',
        'cancelled',
        'refunded',
      ],
    },
    amount: {
      type: Number,
    },
    currency: {
      type: String,
    },
    transactionId: {
      type: String,
    },
    paymentMethod: {
      type: String,
    },
    hostedInvoiceUrl: {
      type: String,
    },
    invoicePdfUrl: {
      type: String,
    },
    metadata: {
      type: Map,
      of: String,
    },
  },
  { timestamps: true }
);

// Indexes for faster queries
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ stripeCustomerId: 1 });

const Transactions = mongoose.model('transactions', transactionSchema);

export default Transactions;
