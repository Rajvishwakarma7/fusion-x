import { Schema, model } from 'mongoose';
import { TChatTranscriptModel } from '../services/message/message.interface';

const chatTranscriptSchema = new Schema<TChatTranscriptModel>(
  {
    chatType: { type: String, enum: ['ONE_TO_ONE', 'GROUP'], required: true },
    groupName: { type: String },
    groupAdmin: { type: Schema.Types.ObjectId, ref: 'users' },
    lastMessage: { type: String },
    lastMessageAt: { type: Date },
    lastMessageSendBy: { type: Schema.Types.ObjectId, ref: 'users' },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    groupProfileImage: { type: String },
  },
  { timestamps: true, strict: true }
);

const ChatTranscript = model<TChatTranscriptModel>(
  'chat_transcripts',
  chatTranscriptSchema
);

export default ChatTranscript;
