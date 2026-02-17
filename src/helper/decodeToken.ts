import jwt from 'jsonwebtoken';
import users from '../models/user.model';

export const decodeToken = async (token: string) => {
  try {
    if (!token) return false;

    const jwtToken = token.startsWith('Bearer ')
      ? token.split(' ')[1]
      : token;

    if (!jwtToken) return false;

    const secretKey = process.env.JWT_SECRET_KEY!;
    const decoded: any = jwt.verify(jwtToken, secretKey);

    const user = await users.findById(decoded.id);
    if (!user) return false;
    if (!user.isVerified) return false;
    if (!user.isActive) return false;

    return {
      userId: user._id,
      role: user.role,
    };
  } catch (error) {
    console.log('error comming from decodeToken:>> ', error);
    return false;
  }
};
