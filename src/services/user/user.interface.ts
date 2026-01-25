import type { Document, SchemaTimestampsConfig } from "mongoose";
import { Types } from "mongoose";
export type TUser = {
  fullName: string;
  email: string;
  password: string;
  status: string;
  deleted: boolean;
  deletedAt: Date;
  stripeCustomerId: string;
  role: "user" | "seller" | "admin";
};

export type TUserModel = TUser & Document & SchemaTimestampsConfig;

export type TTokenUser = {
  userId: string;
  role: string;
};
