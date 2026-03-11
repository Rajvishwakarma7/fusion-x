import mongoose from 'mongoose';
import { TUserBlockModel } from '../services/message/message.interface';

const userBlockSchema = new mongoose.Schema<TUserBlockModel>(
  {
    blockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    blockedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    isActive: { type: Boolean, default: true },
    blockReason: { type: String },
  },
  {
    timestamps: true,
    strict: true,
  }
);

const UserBlock = mongoose.model<TUserBlockModel>(
  'user_blocks',
  userBlockSchema
);

export default UserBlock;
