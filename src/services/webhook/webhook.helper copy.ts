import Transactions from '../../models/transaction.model.js';
import Subscriptions from '../../models/subscirption.model.js';
import mongoose from 'mongoose';

// Helper to check if event was already processed (idempotency)
const isEventProcessed = async (stripeEventId: string): Promise<boolean> => {
  const existingTransaction = await Transactions.findOne({ stripeEventId });
  return !!existingTransaction;
};

// Helper to calculate revenue split (can be customized based on your business logic)
const calculateRevenue = (amount: number) => {
  const platformFee = Math.round(amount * 0.1); // 10% platform fee example
  return {
    platform: {
      percentage: 10,
      amount: platformFee,
    },
    organization: {
      percentage: 90,
      amount: amount - platformFee,
      stripeAccountId: null,
    },
  };
};

// ============================================
// ONE-TIME PAYMENT HANDLERS
// ============================================

export const handleOneTimePaymentSuccess = async (eventBody: any) => {
  try {
    const stripeEventId = eventBody.id;

    // Idempotency check - prevent duplicate processing
    if (await isEventProcessed(stripeEventId)) {
      console.log(`Event ${stripeEventId} already processed, skipping...`);
      return;
    }

    const { customer, amount, currency, payment_intent, metadata } = eventBody;

    // Extract userId from metadata (passed during checkout creation)
    const userId = metadata?.userId
      ? new mongoose.Types.ObjectId(metadata.userId)
      : null;

    // Calculate revenue split
    const revenue = calculateRevenue(amount);

    // Create transaction record
    const transaction = new Transactions({
      userId,
      stripeCustomerId: customer,
      paymentIntentId: payment_intent,
      stripeSubscriptionId: null,
      type: 'one_time',
      status: 'succeeded',
      amount,
      currency,
      revenue,
      transactionId: payment_intent,
      paymentMethod: eventBody.payment_method_types?.[0] || 'card',
      hostedInvoiceUrl: eventBody.hosted_invoice_url || null,
      invoicePdfUrl: eventBody.invoice_pdf || null,
      stripeEventId,
    });

    await transaction.save();
    console.log(
      `One-time payment successful: ${payment_intent}, amount: ${amount}`
    );
  } catch (error) {
    console.error('Error in handleOneTimePaymentSuccess:', error);
    throw error;
  }
};

export const handlePaymentIntentFailed = async (eventBody: any) => {
  try {
    const stripeEventId = eventBody.id;
    const {
      customer,
      amount,
      currency,
      payment_intent,
      last_payment_error,
      invoice,
      metadata,
    } = eventBody;

    // Skip if this is related to an invoice (handled by invoice.payment_failed)
    if (invoice) {
      console.log(
        `Payment intent failed for invoice: ${invoice}, skipping (handled by invoice.payment_failed)`
      );
      return;
    }

    // Extract userId from metadata
    const userId = metadata?.userId
      ? new mongoose.Types.ObjectId(metadata.userId)
      : null;

    // Create failed transaction record
    const transaction = new Transactions({
      userId,
      stripeCustomerId: customer,
      paymentIntentId: payment_intent,
      stripeSubscriptionId: null,
      type: 'one_time',
      status: 'failed',
      amount: amount || 0,
      currency: currency || 'usd',
      revenue: {
        platform: { percentage: 0, amount: 0 },
        organization: { percentage: 0, amount: 0, stripeAccountId: null },
      },
      transactionId: payment_intent,
      paymentMethod: eventBody.payment_method_types?.[0] || 'card',
      stripeEventId,
    });

    await transaction.save();
    console.log(
      `One-time payment failed: ${payment_intent}, error: ${last_payment_error?.message}`
    );
  } catch (error) {
    console.error('Error in handlePaymentIntentFailed:', error);
    throw error;
  }
};

export const handlePaymentIntentSucceeded = async (eventBody: any) => {
  try {
    const stripeEventId = eventBody.id;

    // Idempotency check
    if (await isEventProcessed(stripeEventId)) {
      console.log(`Event ${stripeEventId} already processed, skipping...`);
      return;
    }

    const { customer, amount, currency, payment_intent, metadata } = eventBody;
    const userId = metadata?.userId
      ? new mongoose.Types.ObjectId(metadata.userId)
      : null;

    const revenue = calculateRevenue(amount);

    const transaction = new Transactions({
      userId,
      stripeCustomerId: customer,
      paymentIntentId: payment_intent,
      stripeSubscriptionId: null,
      type: 'one_time',
      status: 'succeeded',
      amount,
      currency,
      revenue,
      transactionId: payment_intent,
      paymentMethod: eventBody.payment_method?.type || 'card',
      stripeEventId,
    });

    await transaction.save();
    console.log(`Payment intent succeeded: ${payment_intent}`);
  } catch (error) {
    console.error('Error in handlePaymentIntentSucceeded:', error);
    throw error;
  }
};

// ============================================
// SUBSCRIPTION PAYMENT HANDLERS
// ============================================

export const handleSubscriptionSuccess = async (eventBody: any) => {
  try {
    const stripeEventId = eventBody.id;

    // Idempotency check
    if (await (stripeEventId)) {
      console.log(`Event ${stripeEventId} already processed, skipping...`);
      return;
    }

    const { customer, subscription, payment_intent, metadata } = eventBody;
    const userId = metadata?.userId
      ? new mongoose.Types.ObjectId(metadata.userId)
      : null;

    console.log(`Subscription checkout completed: ${subscription}`);
  } catch (error) {
    console.error('Error in handleSubscriptionSuccess:', error);
    throw error;
  }
};

export const handleSubscriptionCreated = async (eventBody: any) => {
  try {
    const stripeEventId = eventBody.id;

    // Idempotency check - use subscription ID as alternative check
    const existingSubscription = await Subscriptions.findOne({
      stripeSubscriptionId: eventBody.id,
    });
    if (existingSubscription) {
      console.log(`Subscription ${eventBody.id} already exists, skipping...`);
      return;
    }

    const {
      customer,
      id: stripeSubscriptionId,
      status,
      items,
      current_period_start,
      current_period_end,
      cancel_at_period_end,
      metadata,
    } = eventBody;

    // Extract userId from metadata or find by customer ID
    let userId = metadata?.userId
      ? new mongoose.Types.ObjectId(metadata.userId)
      : null;

    // Get price ID from subscription items
    const priceId = items?.data?.[0]?.price?.id;
    const plan =
      items?.data?.[0]?.price?.recurring?.interval?.toUpperCase() || 'MONTHLY';

    // Determine interval
    const interval = items?.data?.[0]?.price?.recurring?.interval || 'month';

    // Calculate dates
    const startDate = new Date(current_period_start * 1000);
    const expiredDate = new Date(current_period_end * 1000);
    const renewalDate = cancel_at_period_end ? null : expiredDate;

    // Create or update subscription record
    const subscription = new Subscriptions({
      userId,
      isActive: status === 'active',
      stripeSubscriptionId,
      stripeCustomerId: customer,
      priceId,
      plan,
      planType: 'recurring',
      interval,
      status: status === 'active' ? 'active' : 'inactive',
      startDate,
      expiredDate,
      renewalDate,
      cancelledDate: cancel_at_period_end ? new Date() : null,
    });

    await subscription.save();
    console.log(
      `Subscription created: ${stripeSubscriptionId}, status: ${status}`
    );
  } catch (error) {
    console.error('Error in handleSubscriptionCreated:', error);
    throw error;
  }
};

export const handleSubscriptionUpdated = async (eventBody: any) => {
  try {
    const {
      customer,
      id: stripeSubscriptionId,
      status,
      items,
      current_period_start,
      current_period_end,
      cancel_at_period_end,
      metadata,
    } = eventBody;

    // Find existing subscription
    const existingSubscription = await Subscriptions.findOne({
      stripeSubscriptionId,
    });

    if (!existingSubscription) {
      console.log(
        `Subscription ${stripeSubscriptionId} not found, creating new...`
      );
      // If subscription doesn't exist, create it (might be imported from Stripe)
      await handleSubscriptionCreated(eventBody);
      return;
    }

    // Get price ID from subscription items
    const priceId = items?.data?.[0]?.price?.id;
    const plan =
      items?.data?.[0]?.price?.recurring?.interval?.toUpperCase() ||
      existingSubscription.plan;

    // Calculate dates
    const expiredDate = new Date(current_period_end * 1000);
    const renewalDate = cancel_at_period_end ? null : expiredDate;

    // Update subscription record
    await Subscriptions.findOneAndUpdate(
      { stripeSubscriptionId },
      {
        $set: {
          isActive: status === 'active',
          priceId,
          plan,
          status:
            status === 'active'
              ? 'active'
              : status === 'canceled'
                ? 'cancelled'
                : 'inactive',
          expiredDate,
          renewalDate,
          cancelledDate: cancel_at_period_end ? new Date() : null,
        },
      }
    );

    console.log(
      `Subscription updated: ${stripeSubscriptionId}, status: ${status}`
    );
  } catch (error) {
    console.error('Error in handleSubscriptionUpdated:', error);
    throw error;
  }
};

export const handleSubscriptionDeleted = async (eventBody: any) => {
  try {
    const { id: stripeSubscriptionId } = eventBody;

    // Update subscription to cancelled/expired status
    await Subscriptions.findOneAndUpdate(
      { stripeSubscriptionId },
      {
        $set: {
          isActive: false,
          status: 'cancelled',
          cancelledDate: new Date(),
        },
      }
    );

    console.log(`Subscription deleted/cancelled: ${stripeSubscriptionId}`);
  } catch (error) {
    console.error('Error in handleSubscriptionDeleted:', error);
    throw error;
  }
};

// ============================================
// INVOICE HANDLERS (Subscription Payments)
// ============================================

export const handleInvoicePaid = async (eventBody: any) => {
  try {
    const stripeEventId = eventBody.id;

    // Idempotency check
    if (await isEventProcessed(stripeEventId)) {
      console.log(`Event ${stripeEventId} already processed, skipping...`);
      return;
    }

    const {
      customer,
      subscription: stripeSubscriptionId,
      amount_paid,
      currency,
      invoice: invoiceId,
      payment_intent,
      hosted_invoice_url,
      invoice_pdf,
      metadata,
    } = eventBody;

    // Extract userId from metadata
    const userId = metadata?.userId
      ? new mongoose.Types.ObjectId(metadata.userId)
      : null;

    // Calculate revenue split
    const revenue = calculateRevenue(amount_paid);

    // Create transaction record for subscription payment
    const transaction = new Transactions({
      userId,
      stripeCustomerId: customer,
      paymentIntentId: payment_intent,
      invoiceId,
      stripeSubscriptionId,
      type: 'subscription',
      status: 'succeeded',
      amount: amount_paid,
      currency,
      revenue,
      transactionId: invoiceId,
      paymentMethod: 'card',
      hostedInvoiceUrl: hosted_invoice_url || null,
      invoicePdfUrl: invoice_pdf || null,
      stripeEventId,
    });

    await transaction.save();
    console.log(
      `Invoice paid: ${invoiceId}, amount: ${amount_paid}, subscription: ${stripeSubscriptionId}`
    );
  } catch (error) {
    console.error('Error in handleInvoicePaid:', error);
    throw error;
  }
};

export const handleInvoicePaymentFailed = async (eventBody: any) => {
  try {
    const stripeEventId = eventBody.id;

    // Idempotency check
    if (await isEventProcessed(stripeEventId)) {
      console.log(`Event ${stripeEventId} already processed, skipping...`);
      return;
    }

    const {
      customer,
      subscription: stripeSubscriptionId,
      amount_due,
      currency,
      invoice: invoiceId,
      payment_intent,
      hosted_invoice_url,
      invoice_pdf,
      metadata,
      error,
    } = eventBody;

    // Extract userId from metadata
    const userId = metadata?.userId
      ? new mongoose.Types.ObjectId(metadata.userId)
      : null;

    // Create failed transaction record
    const transaction = new Transactions({
      userId,
      stripeCustomerId: customer,
      paymentIntentId: payment_intent,
      invoiceId,
      stripeSubscriptionId,
      type: 'subscription',
      status: 'failed',
      amount: amount_due || 0,
      currency: currency || 'usd',
      revenue: {
        platform: { percentage: 0, amount: 0 },
        organization: { percentage: 0, amount: 0, stripeAccountId: null },
      },
      transactionId: invoiceId,
      paymentMethod: 'card',
      hostedInvoiceUrl: hosted_invoice_url || null,
      invoicePdfUrl: invoice_pdf || null,
      stripeEventId,
    });

    await transaction.save();
    console.log(
      `Invoice payment failed: ${invoiceId}, error: ${error?.message}`
    );

    // Update subscription status to reflect payment failure
    if (stripeSubscriptionId) {
      await Subscriptions.findOneAndUpdate(
        { stripeSubscriptionId },
        {
          $set: {
            isActive: false,
            status: 'inactive',
          },
        }
      );
    }
  } catch (error) {
    console.error('Error in handleInvoicePaymentFailed:', error);
    throw error;
  }
};

export const handleInvoicePaymentSucceeded = async (eventBody: any) => {
  try {
    // This is similar to invoice.paid but might have different use cases
    await handleInvoicePaid(eventBody);
  } catch (error) {
    console.error('Error in handleInvoicePaymentSucceeded:', error);
    throw error;
  }
};
