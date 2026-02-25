import mongoose, { Schema, Types } from 'mongoose';

const messageMediaSchema = new Schema(
  {
    fileName: { type: String, required: true },
    url: { type: String, required: true },
    mimeType: { type: String },
    size: { type: Number },
    messageId: { type: Types.ObjectId, ref: 'messages', default: null },
    status: {
      type: String,
      enum: ['attached', 'uploaded'],
      default: 'uploaded',
    },
  },
  { timestamps: true, strict: true }
);

const MessageMedia = mongoose.model('MessageMedia', messageMediaSchema);

export default MessageMedia;
