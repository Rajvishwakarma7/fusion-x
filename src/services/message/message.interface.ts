import { SchemaTimestampsConfig, Types } from "mongoose";

export type TChatTranscript = {
  chatType: 'ONE_TO_ONE' | 'GROUP';
  groupName:String;
  groupAdmin:Types.ObjectId;
  lastMessage: string;
  lastMessageAt: Date;
  lastMessageSendBy: Types.ObjectId;
  isActive: boolean;
  isDeleted: boolean;
  groupProfileImage: string;
};


export type TChatTranscriptModel = TChatTranscript & Document & SchemaTimestampsConfig;

export type TMessage={
  chatTranscriptId: Types.ObjectId; 
  senderId: Types.ObjectId;
  text: string;
  isDeleted?: boolean;
}

export type TMessageModel = TMessage & Document & SchemaTimestampsConfig;


export type TChatParticipants ={
  chatTranscriptId: Types.ObjectId;
  userId: Types.ObjectId;
  chatType: 'ONE_TO_ONE' | 'GROUP';
  status: 'active' | 'inactive';
  unreadCount: number;
  lastReadAt: Date;
  joinedAt: Date;
  isDeleted: boolean;
  joinStatus: 'requested' | 'joined' | 'left' | 'rejected' | 'pending';
}

export type TChatParticipantsModel = TChatParticipants & Document & SchemaTimestampsConfig;

export type TUserBlock = {
  blockedBy: Types.ObjectId;
  blockedUser: Types.ObjectId;
  isActive: boolean;
  blockReason: string;
}

export type TUserBlockModel = TUserBlock & Document & SchemaTimestampsConfig