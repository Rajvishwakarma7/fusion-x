import mongoose, { Schema } from 'mongoose';

const organizationSchema = new Schema(
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
  },
  {
    strict: true,
    timestamps: true,
  }
);

const Organization = mongoose.model('organizations', organizationSchema);

export default Organization;
