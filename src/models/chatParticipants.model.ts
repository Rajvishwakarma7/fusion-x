import mongoose, { Schema } from 'mongoose';
import { TChatParticipantsModel } from '../services/message/message.interface';

const chatParticipantSchema = new Schema<TChatParticipantsModel>(
  {
    chatTranscriptId: {
      type: Schema.Types.ObjectId,
      ref: 'chat_transcripts',
      required: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    chatType: { type: String, enum: ['ONE_TO_ONE', 'GROUP'], required: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    unreadCount: { type: Number, default: 0 },
    lastReadAt: { type: Date, default: null },
    joinedAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false },

    joinStatus: {
      type: String,
      enum: ['requested', 'joined', 'left', 'rejected', 'pending'],
      default: 'pending',
    },
  },
  { strict: true, timestamps: true }
);

const ChatParticipants = mongoose.model<TChatParticipantsModel>(
  'chat_participants',
  chatParticipantSchema
);

export default ChatParticipants;
