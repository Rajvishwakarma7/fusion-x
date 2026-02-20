import { SchemaTimestampsConfig, Types } from "mongoose";

export type TChatTranscript = {
  type: string;
  participants: string[]; // Array of user IDs
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