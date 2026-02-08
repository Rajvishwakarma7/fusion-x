import mongoose, { Schema } from 'mongoose';

const teamSchema = new Schema(
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
    about: {
      type: String,
    },
    profileImage: {
      type: Schema.Types.ObjectId,
      ref: '',
    },
    coverImage: {
      type: Schema.Types.ObjectId,
      ref: '',
    },
    goal: {
      type: String,
    },
    achievement: {
      type: String,
    },
  },
  {
    strict: true,
    timestamps: true,
  }
);

const Team = mongoose.model('teams', teamSchema);

export default Team;
