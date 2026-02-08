import mongoose, { Schema } from 'mongoose';

const teamMediaSchema = new Schema(
  {
    teamId: {
      type: Schema.Types.ObjectId,
      ref: 'teams',
      required: true,
    },
    url: { type: String, required: true },
    size: { type: Number },
    mimeType: { type: String },
    type:{ type: String },
  },
  {
    strict: true,
    timestamps: true,
  }
);

const TeamMedia = mongoose.model('team_media', teamMediaSchema);

export default TeamMedia;
