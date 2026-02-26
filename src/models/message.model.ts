import mongoose, { Types } from "mongoose";
import { Schema } from "mongoose";
import { TMessageModel } from "../services/message/message.interface";

const messageSchema = new Schema<TMessageModel>(
    {
        chatTranscriptId: { type: Types.ObjectId, ref: 'chat_transcripts' },
        senderId:{type:Types.ObjectId,ref:'users'},
        text:{type:String},
        isDeleted:{type:Boolean,default:false},
    },
    { timestamps: true, strict: true }
)
messageSchema.index({ chatTranscriptId: 1, createdAt: -1 });

const Message =  mongoose.model<TMessageModel>('messages', messageSchema);

export default Message;