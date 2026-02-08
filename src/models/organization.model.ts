import mongoose, { Schema } from 'mongoose';

const organizationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'users',
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
    country: {
      type: String,
    },
    state: {
      type: String,
    },
    city: {
      type: String,
    },
    location: {
      type: String,
    },
  },
  {
    strict: true,
    timestamps: true,
  }
);

const Organization = mongoose.model('organizations', organizationSchema);

export default Organization;
