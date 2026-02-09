import mongoose, { Schema } from "mongoose";
import { TUserModel } from "../services/user/user.interface";

const userSchema = new Schema<TUserModel>(
  {
    fullName: { type: String, required: true, min: 3, max: 50 },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    status: {
      type: String,
      default: "active",
      enum: ["active", "inactive"],
    },
    deleted: {
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
