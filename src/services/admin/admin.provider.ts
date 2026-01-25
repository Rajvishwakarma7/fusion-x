import { stripe } from "../../config/stripe.config.js";
import StripeConnectAccount from "../../models/stripeConnectAccount.model.js";
import { HttpStatusCodes as Code } from "../../utils/Enums.utils.js";
import { GenResObj } from "../../utils/responseFormatter.utils.js";


  export const syncStripeConnectAccount = async (userId: any) => {
    try {
      if (!userId) {
        return GenResObj(Code.BAD_REQUEST, false, "User ID is required");
      }

      const connect = await StripeConnectAccount.findOne({ userId });

      if (!connect) {
        return GenResObj(
          Code.BAD_REQUEST,
          false,
          "Stripe account data not found"
        );
      }

      const account = await stripe.accounts.retrieve(connect.stripeAccountId);

      await StripeConnectAccount.updateOne(
        { userId },
        {
          $set: {
            chargesEnabled: account.charges_enabled,
            payoutsEnabled: account.payouts_enabled,
            detailsSubmitted: account.details_submitted,
            isActive:
              account.charges_enabled &&
              account.payouts_enabled &&
              account.details_submitted,
          },
        }
      );

      return GenResObj(Code.OK, true, "Checkout session created");
    } catch (error) {
      console.log("🚀 ~ signupUser ~ error:", error);
      throw error;
    }
  };



