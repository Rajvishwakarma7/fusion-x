import mongoose, { Schema } from "mongoose";
import { TUserModel } from "../services/user/user.interface";

const userSchema = new Schema<TUserModel>(
  {
    fullName: { type: String, required: true, min: 3, max: 50 },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImage: { type: String, default: '' },
    status: {
      type: String,
      default: "active",
      enum: ["active", "inactive"],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    stripeCustomerId: {
      type: String,
      default: null,
    },
    role:{
        type:String,
        enum:["user","organization","admin"],
        default:"user"
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    isActive:{
        type:Boolean,
        default:true
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { 
    strict: true,
    timestamps: true,
  }
);
userSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret, options) => {
    // delete ret.password

  },
});

const users = mongoose.model<TUserModel>("users", userSchema);
export default users;
