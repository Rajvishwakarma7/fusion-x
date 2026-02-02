import StripeConnectAccount from '../../models/stripeConnectAccount.model.js';
import User from '../../models/user.model.js';
import { HttpStatusCodes as Code } from '../../utils/Enums.utils.js';
import { GenResObj } from '../../utils/responseFormatter.utils.js';
import { createToken } from './user.helper.js';
import { getMeType, signInType, signUpType } from './user.validate.js';
import bcrypt from 'bcrypt';
export const signupUser = async (payload: signUpType) => {
  try {
    const { fullName, email, password } = payload;

    const user = await User.findOne({ email, deleted: false });
    if (user) {
      return GenResObj(
        Code.BAD_REQUEST,
        false,
        'User with this email already exists'
      );
    }
    const hashpassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      ...payload,
      fullName: fullName,
      email,
      password: hashpassword,
    });

    if (!newUser) {
      return GenResObj(Code.BAD_REQUEST, false, 'User not created');
    }

    return GenResObj(Code.CREATED, true, 'User created successfully', newUser);
  } catch (error) {
    console.log('🚀 ~ signupUser ~ error:', error);
    throw error;
  }
};

export const signinUser = async (payload: signInType) => {
  try {
    const { email, password } = payload;
    const checkAblUser = await User.findOne(
      { email, deleted: false }
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
        'User not found Please create account first'
      );
    }
    const isPasswordMatch = await bcrypt.compare(
      password,
      checkAblUser.password
    );
    if (!isPasswordMatch) {
      return GenResObj(Code.BAD_REQUEST, false, 'Password is incorrect');
    }

    let token;
    if (checkAblUser && checkAblUser._id) {
      token = createToken(checkAblUser._id.toString(), checkAblUser.role);
    }

    return GenResObj(Code.OK, true, 'logged in successfully', {
      ...checkAblUser,
      token,
    });
  } catch (error) {
    console.log('🚀 ~ signupUser ~ error:', error);
    throw error;
  }
};

export const getMe = async (payload: getMeType) => {
  try {
    const { userId, role } = payload;

    console.log('🚀 ~ getMe ~ payload:', payload);

    const user = await User.findById(userId).select('-password').lean();
    if (!user) {
      return GenResObj(Code.BAD_REQUEST, false, 'User not found');
    }

    const userData: any = { ...user };

    if (role === 'seller') {
      const accountConnect = await StripeConnectAccount.findOne({
        userId,
      });

      if (accountConnect) {
        userData.accountConnect = accountConnect;
      }else{
        userData.accountConnect = null
      }
    };

    return GenResObj(Code.OK, true, 'User found', userData);
  } catch (error) {
    console.log('🚀 ~ getMe ~ error:', error);
    throw error;
  }
};
