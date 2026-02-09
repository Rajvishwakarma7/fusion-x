import { Types } from "mongoose";

export type TStripeConnectModel = {
  organizationId: Types.ObjectId;
  teamId: Types.ObjectId;
  stripeAccountId: string;
  isActive: boolean;
  chargesEnabled: { type: Boolean; default: false };
  payoutsEnabled: { type: Boolean; default: false };
  detailsSubmitted: { type: Boolean; default: false };
};
