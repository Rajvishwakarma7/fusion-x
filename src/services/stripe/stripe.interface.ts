import { SchemaTimestampsConfig, Types } from "mongoose";

export type TStripeConnect = {
  organizationId: Types.ObjectId;
  userId: Types.ObjectId;
  stripeAccountId: string;
  isActive: boolean;
  chargesEnabled: { type: Boolean; default: false };
  payoutsEnabled: { type: Boolean; default: false };
  detailsSubmitted: { type: Boolean; default: false };
};

export type TStripeConnectModelType = TStripeConnect & Document & SchemaTimestampsConfig;