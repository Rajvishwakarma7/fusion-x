import type { Document, SchemaTimestampsConfig } from "mongoose";
import { Types } from "mongoose";

export type TOrganization = {
  userId: Types.ObjectId;
  organizationName: string;
  profileImage: string;
  address: string;
  zipCode: string;
  phone: string;
  location: string;
  isActive: boolean;
  isDeleted: boolean;
};

export type TOrganizationModel = TOrganization & Document & SchemaTimestampsConfig;