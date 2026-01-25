import User from "../../models/user.model.js";
import { HttpStatusCodes as Code } from "../../utils/Enums.utils.js";
import { GenResObj } from "../../utils/responseFormatter.utils.js";
import { createToken } from "./user.helper.js";
import { signInType, signUpType } from "./user.validate.js";
import bcrypt from "bcrypt";
export const signupUser = async (payload: signUpType) => {
  try {
    const { fullName, email, password } = payload;

    const user = await User.findOne({ email, deleted: false });
    if (user) {
      return GenResObj(
        Code.BAD_REQUEST,
        false,
        "User with this email already exists"
      );
    }
    const hashpassword = await bcrypt.hash(password, 10);
    console.log("🚀 ~ signupUser ~ hashpassword:", hashpassword);

    const newUser = await User.create({
      ...payload,
      fullName: fullName,
      email,
      password: hashpassword,
    });
    console.log("🚀 ~ signupUser ~ newUser:", newUser);

    if (!newUser) {
      return GenResObj(Code.BAD_REQUEST, false, "User not created");
    }

    return GenResObj(Code.CREATED, true, "User created successfully", newUser);
  } catch (error) {
    console.log("🚀 ~ signupUser ~ error:", error);
    throw error;
  }
};

export const signinUser = async (payload: signInType) => {
  try {
    const { email, password } = payload;
    const checkAblUser = await User.findOne(
      { email, deleted: false },
      // {
      //   role: 1,
      //   isVerified: 1,
      //   _id: 1,
      //   email: 1,
      //   password: 1,
      // }
    ).lean();
    if (!checkAblUser) {
      return GenResObj(
        Code.BAD_REQUEST,
        false,
        "User not found Please create account first"
      );
    }
    const isPasswordMatch = await bcrypt.compare(
      password,
      checkAblUser.password
    );
    if (!isPasswordMatch) {
      return GenResObj(Code.BAD_REQUEST, false, "Password is incorrect");
    }

    let token;
    if (checkAblUser && checkAblUser._id) {
      token = createToken(checkAblUser._id.toString(), checkAblUser.role);
    }

    return GenResObj(Code.OK, true, "logged in successfully", {
      ...checkAblUser,
      token,
    });
  } catch (error) {
    console.log("🚀 ~ signupUser ~ error:", error);
    throw error;
  }
};
