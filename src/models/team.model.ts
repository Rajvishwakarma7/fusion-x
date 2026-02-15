import mongoose, { Schema } from 'mongoose';
import { TTeamModel } from '../services/team/team.interface';

const teamSchema = new Schema<TTeamModel>(
  {

    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'organizations',
      required: true,
    },
    teamName: {
      type: String,
      required: true,
    },
    ourStory: {
      type: String,
    },
    profileImage: {
      type: String,
      default: null,
    },
    coverImage: {
      type: String,
      default: null,
    },
    teamGoals: { type: [String], default: [] },
    achievement: {
      type: String,
    },
  },
  {
    strict: true,
    timestamps: true,
  }
);

const Team = mongoose.model<TTeamModel>('teams', teamSchema);

export default Team;
