import mongoose, { Schema } from 'mongoose';

const transactionSchema = new Schema({
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
  plan: {
    type: String,
    enum: ['monthly', 'yearly'],
  },
  amount: {
    type: Number,
  },
  currency: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'succeeded', 'failed'],
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
},
{ timestamps: true },
);

const Transactions = mongoose.model('Transactions', transactionSchema);

export default Transactions;
