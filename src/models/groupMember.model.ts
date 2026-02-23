import mongoose, { Schema } from "mongoose";
import { TGroupMemberModel } from "../services/message/message.interface";

const groupMemberSchema = new Schema<TGroupMemberModel>(
    {
      groupId:{type:Schema.Types.ObjectId,ref:'chat_transcripts',required:true},
      userId:{type:Schema.Types.ObjectId,ref:'users',required:true},
      status:{type:String,enum:['active','inactive'],default:'active'},
      joinStatus:{type:String,enum:['requested','accepted','rejected','pending'],default:'pending'},

    },
    { strict: true, timestamps: true }
)

const GroupMember = mongoose.model<TGroupMemberModel>('GroupMember', groupMemberSchema);

export default GroupMember;