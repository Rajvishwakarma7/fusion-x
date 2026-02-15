import type { Document, SchemaTimestampsConfig } from "mongoose";
import { Types } from "mongoose";
export type TTeam = {
  organizationId: Types.ObjectId;
  teamName: string;
  ourStory: string;
  profileImage: string;
  coverImage: string;
  teamGoals: string[];
  achievement: string;
};

export type TTeamModel = TTeam & Document & SchemaTimestampsConfig;


// team media 

export type TTeamMedia = {
  teamId: Types.ObjectId;
  url: string;
  size: number;
  mimeType: string;
  type: string;
};

export type TTeamMediaModel = TTeamMedia & Document & SchemaTimestampsConfig;