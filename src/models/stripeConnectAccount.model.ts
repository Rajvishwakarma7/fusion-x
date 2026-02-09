import { Schema, model, Types } from "mongoose";
import { TStripeConnectModel } from "../services/stripe/stripe.interface.js";

const stripeConnectAccountSchema = new Schema<TStripeConnectModel>(
  {
    organizationId: { type: Types.ObjectId, ref: "organizations" },
    userId: { type: Types.ObjectId, ref: "users" },
    stripeAccountId: { type: String, required: true },
    isActive: { type: Boolean, default: false, required: true },

    chargesEnabled: { type: Boolean, default: false },
    payoutsEnabled: { type: Boolean, default: false },
    detailsSubmitted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

 const StripeConnectAccount = model("stripe_connect_accounts",stripeConnectAccountSchema);

export default StripeConnectAccount;