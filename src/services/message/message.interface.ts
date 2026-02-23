import { SchemaTimestampsConfig, Types } from "mongoose";

export type TChatTranscript = {
  chatType: 'ONE_TO_ONE' | 'GROUP';
  participants: string[]; // Array of user IDs
  groupName:String;
  groupAdmin:Types.ObjectId;
  lastMessage: string;
};


export type TChatTranscriptModel = TChatTranscript & Document & SchemaTimestampsConfig;

export type TMessage={
  chatTranscriptId: Types.ObjectId; 
  senderId: Types.ObjectId;
  text: string;
  isRead?: boolean;
  isDeleted?: boolean;
}

export type TMessageModel = TMessage & Document & SchemaTimestampsConfig;


export type TGroupMember ={
  groupId: Types.ObjectId;
  userId: Types.ObjectId;
  status: 'active' | 'inactive';
  joinStatus: 'requested' | 'accepted' | 'rejected' | 'pending';
}

export type TGroupMemberModel = TGroupMember & Document & SchemaTimestampsConfig;