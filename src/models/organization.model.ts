import mongoose, { Schema } from 'mongoose';
import { TOrganizationModel } from '../services/organization/organization.interface';

const organizationSchema = new Schema<TOrganizationModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    organizationName: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String,
    },
    address: {
      type: String,
    },
    zipCode: {
      type: String,
    },
    phone: {
      type: String,
    },

    location: {
      type: String,
    },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  {
    strict: true,
    timestamps: true,
  }
);

const Organization = mongoose.model<TOrganizationModel>('organizations', organizationSchema);

export default Organization;
