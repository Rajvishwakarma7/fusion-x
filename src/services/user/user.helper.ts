import jwt, { JwtPayload } from "jsonwebtoken";



export const createToken = (id: string, role: string) => {
  const maxAge = 30 * 24 * 60 * 60; //valid for 30days
  const secretKey = process.env.JWT_SECRET_KEY as string;
  return `Bearer ${jwt.sign({ id, role }, secretKey, { expiresIn: maxAge })}`;
};