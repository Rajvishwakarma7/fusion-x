import { Schema, Types, model } from 'mongoose';
import { TChatTranscriptModel } from '../services/message/message.interface';

const chatTranscriptSchema = new Schema<TChatTranscriptModel>(
  {
    chatType: { type: String, enum: ['ONE_TO_ONE', 'GROUP'], required: true },
    participants: [{ type: Types.ObjectId, ref: 'users' }],
    groupName: { type: String }, 
    groupAdmin: { type: Schema.Types.ObjectId, ref: 'User' },
    lastMessage: { type: String },
  },
  { timestamps: true, strict: true }
);

const ChatTranscript = model<TChatTranscriptModel>(
  'chat_transcripts',
  chatTranscriptSchema
);

export default ChatTranscript;
