import { stripe } from '../../config/stripe.config.js';
import StripeConnectAccount from '../../models/stripeConnectAccount.model.js';
import Subscriptions from '../../models/subscirption.model.js';
import Transactions from '../../models/transaction.model.js';
import users from '../../models/user.model.js';
import { HttpStatusCodes as Code } from '../../utils/Enums.utils.js';
import { GenResObj } from '../../utils/responseFormatter.utils.js';
import { getStripeCustomerId } from './stripe.helper.js';
import { cancelPlanType, createPlanType, getUserMembershipType, upgradeSubscriptionType, userTransactionsHistoryType } from './stripe.validate.js';


export const listPlans = async () => {
  try {

    const plans = await stripe.prices.search({
      query: 'active:"true"',
    });

    // const plans = await stripe.prices.list({
    //   active: true,
    //   expand: ['data.product'],
    // });

    return GenResObj(Code.OK, true, 'Plans fetched successfully', plans);

  } catch (error) {
    console.log('error in listPlans :>> ', error);
    throw error;
  }
};

export const createCheckoutSessionSubscription = async (payload: createPlanType) => {
  try {
    const { priceId, userId } = payload;

    // const userSubscription = await Subscriptions.findOne({ userId, isActive: true, status: 'active' }).lean();

    // if (userSubscription) {
    //   return GenResObj(Code.OK, true, 'User has already active subscription', userSubscription);
    // }

    const stripeCustomerId = await getStripeCustomerId(userId);

    console.log("🚀 ~ createCheckoutSessionSubscription ~ stripeCustomerId:", stripeCustomerId)

    const priceDetails = await stripe.prices.retrieve(priceId,{
      expand: ['product'],
    })
    console.log("🚀 ~ createCheckoutSessionSubscription ~ priceDetails:", priceDetails)

    // const session = await stripe.checkout.sessions.create({
    //   mode: 'subscription',
    //   customer: stripeCustomerId,
    //   line_items: [
    //     {
    //       price: priceId,
    //       quantity: 1,
    //     },
    //   ],
    //   metadata: {
    //     userId,
    //     priceId,
    //   },
    //   success_url: `${process.env.FRONTEND_BASE_URL}/payment/success`,
    //   cancel_url: `${process.env.FRONTEND_BASE_URL}/payment/failed`,
    // });

    // create subscription

    // const subscription = await Subscriptions.create({
    //   userId,
    //   isActive: false,
    //   stripeCustomerId,
    //   status: 'inactive',
    // });
    // create transaction

    // const transaction = await Transactions.create({
    //   userId,
    //   stripeCustomerId,
    //   status: 'pending',
    // });

    // update session metadata
    // await stripe.checkout.sessions.update(session.id, {
    //   metadata: {
    //     ...session.metadata,
    //     subscriptionId: subscription._id.toString() || '',
    //     // transactionId: transaction._id.toString() || '',
    //   },
    // });

    return GenResObj(Code.OK, true, 'Checkout Session created successfully', {
      // sessionId: session.id,
      // sessionUrl: session.url,
    });

  } catch (error) {
    console.log('error in createCheckoutSessionSubscription :>> ', error);
    throw error;
  }
};


export const createCheckoutSessionOneTime = async (payload: createPlanType) => {
  try {
    const { priceId, userId } = payload;

    // const userSubscription = await Subscriptions.findOne({ userId, isActive: true, status: 'active' }).lean();

    // if (userSubscription) {
    //   return GenResObj(Code.OK, true, 'User has already active subscription', userSubscription);
    // }

    const stripeCustomerId = await getStripeCustomerId(userId);

    console.log("🚀 ~ createCheckoutSessionOneTime ~ stripeCustomerId:", stripeCustomerId)

    const priceDetails = await stripe.prices.retrieve(priceId,{
      expand: ['product'],
    })
    console.log("🚀 ~ createCheckoutSessionOneTime ~ priceDetails:", priceDetails)

    // const session = await stripe.checkout.sessions.create({
    //   mode: 'subscription',
    //   customer: stripeCustomerId,
    //   line_items: [
    //     {
    //       price: priceId,
    //       quantity: 1,
    //     },
    //   ],
    //   metadata: {
    //     userId,
    //     priceId,
    //   },
    //   success_url: `${process.env.FRONTEND_BASE_URL}/payment/success`,
    //   cancel_url: `${process.env.FRONTEND_BASE_URL}/payment/failed`,
    // });

    // create subscription

    // const subscription = await Subscriptions.create({
    //   userId,
    //   isActive: false,
    //   stripeCustomerId,
    //   status: 'inactive',
    // });
    // create transaction

    // const transaction = await Transactions.create({
    //   userId,
    //   stripeCustomerId,
    //   status: 'pending',
    // });

    // update session metadata
    // await stripe.checkout.sessions.update(session.id, {
    //   metadata: {
    //     ...session.metadata,
    //     subscriptionId: subscription._id.toString() || '',
    //     // transactionId: transaction._id.toString() || '',
    //   },
    // });

    return GenResObj(Code.OK, true, 'Checkout Session created successfully', {
      // sessionId: session.id,
      // sessionUrl: session.url,
    });

  } catch (error) {
    console.log('error in createCheckoutSessionOneTime :>> ', error);
    throw error;
  }
};

export const cancelSubscription = async (payload: cancelPlanType) => {
  try {
    const { userId } = payload;

    const userSubscription = await Subscriptions.findOne({ userId, isActive: true, status: 'active' }).lean();

    if (!userSubscription || !userSubscription.stripeSubscriptionId) {
      return GenResObj(Code.OK, true, 'User has no active subscription');
    }

    await stripe.subscriptions.update(userSubscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    return GenResObj(Code.OK, true, 'Subscription canceled successfully');

  } catch (error) {
    console.log('error in cancelSubscription :>> ', error);
    throw error;
  }
};

export const upgradeSubscription = async (payload: upgradeSubscriptionType) => {
  try {
    const { userId, priceId } = payload;

    const userSubscription = await Subscriptions.findOne({ userId, isActive: true, status: 'active' });

    if (!userSubscription || !userSubscription.stripeSubscriptionId) {
      return GenResObj(Code.BAD_REQUEST, false, 'User has no active subscription');
    }

    if (userSubscription.plan === 'yearly') {
      return GenResObj(Code.BAD_REQUEST, false, 'User already on yearly plan');
    }

    if (userSubscription.priceId === priceId) {
      return GenResObj(Code.BAD_REQUEST, false, 'User already has this plan');
    };

    // Get Stripe subscription
    const subscription = await stripe.subscriptions.retrieve(
      userSubscription.stripeSubscriptionId,
    );

    const subscriptionItemId = subscription.items.data[0].id;

    // Upgrade plan
    await stripe.subscriptions.update(
      userSubscription.stripeSubscriptionId,
      {
        items: [
          {
            id: subscriptionItemId,
            price: priceId, // yearly price
          },
        ],
        proration_behavior: 'create_prorations',
      },
    );

    return GenResObj(Code.OK, true, 'Subscription upgraded successfully');

  } catch (error) {
    console.log('error in updateSubscription :>> ', error);
    throw error;
  }
};

export const userTransactionsHistory = async (payload: userTransactionsHistoryType) => {
  try {
    const { userId, status, page, pageSize } = payload;

    const skip = (page - 1) * pageSize;

    const user = await users.findById(userId).lean();

    if (!user?.stripeCustomerId) {
      return GenResObj(Code.BAD_REQUEST, false, 'Stripe customer not found for this user');
    }

    const match: any = { stripeCustomerId: user.stripeCustomerId };

    if (status) {
      match.status = status;
    }

    const transactionsData = await Transactions.aggregate([
      {
        $match: match,
      },

      {
        $facet: {
          data: [
            {
              $sort: {
                createdAt: -1,
              },
            },
            {
              $skip: skip,
            },
            {
              $limit: pageSize,
            },
          ],
          totalCount: [{ $count: 'count' }],
        },
      },
    ]);

    const transaction = transactionsData[0].data;

    const totalRecords = transactionsData[0].totalCount[0]?.count || 0;

    const totalPages = Math.ceil(totalRecords / pageSize);

    const hasNextPage = page < totalPages;

    const resObj = {
      transaction,
      totalRecords,
      pageSize,
      currentPage: page,
      totalPages,
      hasNextPage,
    };

    return GenResObj(
      Code.OK,
      true,
      'Transactions fetched successfully',
      resObj,
    );

  } catch (error) {
    console.log('error in userTransactionsHistory :>> ', error);
    throw error;
  }
};

export const getUserMembership = async (payload: getUserMembershipType) => {
  try {
    const { userId } = payload;

    const userSubscription = await Subscriptions.findOne({ userId, isActive: true, status: 'active' }).lean();

    if (!userSubscription || !userSubscription.priceId) {
      return GenResObj(Code.OK, true, 'User has no active subscription');
    }

    return GenResObj(Code.OK, true, 'User membership fetched successfully', userSubscription);

  } catch (error) {
    console.log('error in getUserMembership :>> ', error);
    throw error;
  }
};



// connect account flow ----->>>>

export const connectStripe = async (userId: string) => {
  try {
    if (!userId) {
      return GenResObj(Code.BAD_REQUEST, false, 'User ID is required');
    }
    const user = await users.findById(userId).lean();
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
