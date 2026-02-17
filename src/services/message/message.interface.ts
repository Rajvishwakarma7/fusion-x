import { SchemaTimestampsConfig } from "mongoose";

export type TChatTranscript = {
  type: string;
  participants: string[]; // Array of user IDs
  lastMessage: string;
};


export type TChatTranscriptModel = TChatTranscript & Document & SchemaTimestampsConfig;
