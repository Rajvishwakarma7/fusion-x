import { Request, Response } from "express";
import { stripe } from "../../config/stripe.config.js";
import StripeConnectAccount from "../../models/stripeConnectAccount.model.js";

export const stripeWebhookPlatform = async (req: Request, res: Response) => {
  try {
    console.log(req.headers);
    const sig = req.headers["stripe-signature"] as string;
    console.log("Event Secret :", process.env.STRIPE_WEBHOOK_SECRET);
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

    let event: any;

    // Verify the webhook signature
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err: any) {
      console.log("Error from the signature fail", err);
      console.error(`Webhook signature verification failed: ${err.message}`);
    }

    if (!event && !event.type) {
      console.log("Event not found");
      res.sendStatus(400);
      return;
    }

    console.log("🚀 ~ stripeWebhook ~ event type:", event.type);

    let stripeObject = event.data.object;
    var transactionType: string | null = null;
    var status: string | null = null;

    switch (event?.type) {
      case "checkout.session.completed": {
        console.log(
          "checkout.session.completed ........triggered........>>>>>"
        );
        console.log("💰 Checkout completed");
        console.log("Session ID:", stripeObject.id);
        console.log("Payment Status:", stripeObject.payment_status);
        console.log("Customer:", stripeObject.customer);
        console.log("PaymentIntent:", stripeObject.payment_intent);

        /**
         * 👉 DO YOUR DB WORK HERE
         * - Mark order as PAID
         * - Grant access to video / course
         * - Save transaction
         */

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.sendStatus(200);
  } catch (err) {
    console.log("🚀 ~ stripe webhook failed ~ err:", err);
    res.sendStatus(400);
  }
};

export const stripeWebhookConnect = async (req: Request, res: Response) => {
  try {
    console.log(req.headers);
    const sig = req.headers["stripe-signature"] as string;
    console.log("Event Secret :", process.env.STRIPE_CONNECT_WEBHOOK_SECRET);
    const endpointSecret = process.env.STRIPE_CONNECT_WEBHOOK_SECRET as string;

    let event: any;

    // Verify the webhook signature
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err: any) {
      console.log("Error from the signature fail", err);
      console.error(`Webhook signature verification failed: ${err.message}`);
    }

    if (!event && !event.type) {
      console.log("Event not found");
      res.sendStatus(400);
      return;
    }

    console.log("🚀 ~ stripeWebhook ~ event type:", event.type);

    let stripeObject = event.data.object;
    var transactionType: string | null = null;
    var status: string | null = null;

    switch (event?.type) {
      case "account.updated":
        console.log("account.updated ................");
        console.log("🚀 ~ stripeWebhook ~ stripeObject:", stripeObject);
        await StripeConnectAccount.findOneAndUpdate(
          { stripeAccountId: stripeObject.id },
          {
            $set:{

                chargesEnabled: stripeObject.charges_enabled,
                payoutsEnabled: stripeObject.payouts_enabled,
                detailsSubmitted: stripeObject.details_submitted,
                isActive:
                  stripeObject.charges_enabled &&
                  stripeObject.payouts_enabled &&
                  stripeObject.details_submitted,
              }
            }
        );

        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.sendStatus(200);
  } catch (err) {
    console.log("🚀 ~ stripe webhook failed ~ err:", err);
    res.sendStatus(400);
  }
};
