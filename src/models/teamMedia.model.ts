import mongoose, { Schema } from 'mongoose';
import { TTeamMediaModel } from '../services/team/team.interface';

const teamMediaSchema = new Schema<TTeamMediaModel>(
  {
    teamId: {
      type: Schema.Types.ObjectId,
      ref: 'teams',
      required: true,
    },
    url: { type: String, required: true },
    size: { type: Number },
    mimeType: { type: String },
    type: { type: String, enum: ['image', 'video'], default: 'image' },
  },
  {
    strict: true,
    timestamps: true,
  }
);

const TeamMedia = mongoose.model<TTeamMediaModel>('team_media', teamMediaSchema);

export default TeamMedia;
