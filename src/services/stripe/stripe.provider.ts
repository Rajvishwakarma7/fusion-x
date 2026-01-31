import { stripe } from '../../config/stripe.config.js';
import StripeConnectAccount from '../../models/stripeConnectAccount.model.js';
import User from '../../models/user.model.js';
import { HttpStatusCodes as Code } from '../../utils/Enums.utils.js';
import { GenResObj } from '../../utils/responseFormatter.utils.js';

export const connectStripe = async (userId: string) => {
  try {
    if (!userId) {
      return GenResObj(Code.BAD_REQUEST, false, 'User ID is required');
    }
    const user = await User.findById(userId).lean();
    if (!user) {
      return GenResObj(Code.BAD_REQUEST, false, 'User not found');
    }
    const checkStripeAccount = await StripeConnectAccount.findOne({ userId });

    if(checkStripeAccount && checkStripeAccount.isActive && checkStripeAccount.chargesEnabled && checkStripeAccount.payoutsEnabled && checkStripeAccount.detailsSubmitted){
      return GenResObj(Code.OK, true, 'Account is already connected', checkStripeAccount);
    }

    let stripeAccountId;
    if (checkStripeAccount) {
      stripeAccountId = checkStripeAccount.stripeAccountId;
    } else {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US',
        email: user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });
      stripeAccountId = account.id;
      await StripeConnectAccount.create({
        userId,
        stripeAccountId: account.id,
      });
    }

    if (!stripeAccountId) {
      return GenResObj(
        Code.BAD_REQUEST,
        false,
        'stripe account not found try again !'
      );
    }

    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,

      // Used when the user leaves the onboarding flow early
      // OR the onboarding link expires.
      // Stripe will redirect here so the user can restart onboarding.
      refresh_url: `${process.env.FRONTEND_URL}/seller/connect`,

      // Stripe ALWAYS redirects here after the onboarding UI finishes
      // This does NOT mean success or failure.
      // You MUST check the Stripe Account object (charges_enabled / payouts_enabled)
      // to determine onboarding status.
      return_url: `${process.env.FRONTEND_URL}/seller/redirect`,

      type: 'account_onboarding',
    });

    return GenResObj(Code.OK, true, 'stripe account link created', accountLink);
  } catch (error) {
    console.log('🚀 ~ signupUser ~ error:', error);
    throw error;
  }
};

export const createCheckoutSessionUrl = async (payload: any) => {
  try {
    const { userId, priceId } = payload;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/checkout/cancel`,
    });

    return GenResObj(Code.OK, true, 'Checkout session created', session.url);
  } catch (error) {
    console.log('🚀 ~ signupUser ~ error:', error);
    throw error;
  }
};

export const connectedAccountStatus = async (userId: any) => {
  try {
    if (!userId) {
      return GenResObj(Code.BAD_REQUEST, false, 'User ID is required');
    }

    const connect = await StripeConnectAccount.findOne({
      userId,
    });

    if (!connect) {
      return GenResObj(Code.NOT_FOUND, false, 'Account is not Found');
    }
    if (!connect.isActive) {
      return GenResObj(Code.NOT_FOUND, false, 'Account is not connected');
    }

    return GenResObj(Code.OK, true, 'Account is connected', connect);
  } catch (error) {
    console.log('🚀 ~ signupUser ~ error:', error);
    throw error;
  }
};
