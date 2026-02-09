import type { Document, SchemaTimestampsConfig } from "mongoose";
export type TUser = {
  fullName: string;
  email: string;
  password: string;
  status: string;
  deleted: boolean;
  deletedAt: Date;
  stripeCustomerId: string;
  role: "user" | "organization" | "admin";
  profileCompleted: boolean;
};

export type TUserModel = TUser & Document & SchemaTimestampsConfig;

export type TTokenUser = {
  userId: string;
  role: string;
};
