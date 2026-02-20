import { Request, Response } from 'express';
import { stripe } from '../../config/stripe.config.js';
import StripeConnectAccount from '../../models/stripeConnectAccount.model.js';
import {
  handleInvoicePaid,
  handleInvoicePaymentFailed,
  handleInvoicePaymentSucceeded,
  handleOneTimePaymentSuccess,
  handlePaymentIntentFailed,
  handlePaymentIntentSucceeded,
  handleSubscriptionCreated,
  handleSubscriptionDeleted,
  handleSubscriptionUpdated,
} from './webhook.helper.js';

export const stripeWebhookPlatform = async (req: Request, res: Response) => {
  try {
    const sig = req.headers['stripe-signature'] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

    if (!endpointSecret) {
      console.error('WEBHOOK_SECRET is not configured');
      res.status(500).json({ error: 'web-hook configuration error' });
      return;
    }

    let event: any;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err: any) {
      console.log('Error from the signature fail', err);
      console.error(`Webhook signature verification failed: ${err.message}`);
      res.status(400).json({ error: 'web-hook signature verification failed' });
      return;
    }

    if (!event || !event?.type) {
      console.log('Event not found');
      res.status(400).json({ error: 'Event not found' });
      return;
    }

    console.log('🚀 ~ stripeWebhook ~ event type:', event.type);

    let stripeObject = event?.data?.object;

    switch (event?.type) {
      case 'checkout.session.completed':
        if (stripeObject?.mode === 'payment') {
          // one time payment success
          await handleOneTimePaymentSuccess(stripeObject);
        } else if (stripeObject?.mode === 'subscription') {
          // subscription checkout completed
          await handleSubscriptionCreated(stripeObject);
        }
        break;

      // subscription
      case 'customer.subscription.created':
        await handleSubscriptionCreated(stripeObject);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(stripeObject);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(stripeObject);
        break;

      // invoice
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(stripeObject);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(stripeObject);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(stripeObject);
        break;

      // payment intent
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(stripeObject);
        break;

      case 'payment_intent.payment_failed':
        if (stripeObject.invoice) {
          break;
        }
        await handlePaymentIntentFailed(stripeObject);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (err: any) {
    console.log('error in stripe web-hook', err);
    res.status(400).json({ error: 'web-hook handler failed' });
  }
};

export const stripeWebhookConnect = async (req: Request, res: Response) => {
  try {
    const sig = req.headers['stripe-signature'] as string;
    const endpointSecret = process.env.STRIPE_CONNECT_WEBHOOK_SECRET as string;

    if (!endpointSecret) {
      console.error('WEBHOOK_SECRET is not configured');
      res.status(500).json({ error: 'web-hook configuration error' });
      return;
    }

    let event: any;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err: any) {
      console.log('Error from the signature fail', err);
      console.error(`Webhook signature verification failed: ${err.message}`);
      res.status(400).json({ error: 'web-hook signature verification failed' });
      return;
    }

    if (!event || !event?.type) {
      console.log('Event not found');
      res.status(400).json({ error: 'Event not found' });
      return;
    }

    console.log('🚀 ~ stripeWebhook ~ event type:', event.type);

    let stripeObject = event.data.object;

    switch (event?.type) {
      case 'account.updated':
        await StripeConnectAccount.findOneAndUpdate(
          { stripeAccountId: stripeObject.id },
          {
            $set: {
              chargesEnabled: stripeObject.charges_enabled,
              payoutsEnabled: stripeObject.payouts_enabled,
              detailsSubmitted: stripeObject.details_submitted,
              isActive:
                stripeObject.charges_enabled &&
                stripeObject.payouts_enabled &&
                stripeObject.details_submitted,
            },
          }
        );
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (err: any) {
    console.log('error in stripe web-hook', err);
    res.status(400).json({ error: 'web-hook handler failed' });
  }
};
