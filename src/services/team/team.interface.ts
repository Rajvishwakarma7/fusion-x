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
