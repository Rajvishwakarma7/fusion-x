import { Schema, Types, model } from 'mongoose';
import { TChatTranscriptModel } from '../services/message/message.interface';

const chatTranscriptSchema = new Schema<TChatTranscriptModel>(
  {
    type: { type: String },
    participants: [{ type: Types.ObjectId, ref: 'users' }],
    lastMessage: { type: String },
  },
  { timestamps: true, strict: true }
);

const ChatTranscript = model<TChatTranscriptModel>('chat_transcripts', chatTranscriptSchema);

export default ChatTranscript;
