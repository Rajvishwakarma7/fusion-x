import jwt from "jsonwebtoken";
import { HttpStatusCodes as Code, UserStatus } from "../utils/Enums.utils.js";
import type { NextFunction, Request, Response } from "express";
import User from "../models/user.model.js";

export const authCheck = (role: string[], checkRole: boolean = true) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      let jwtToken: string | undefined;
      // Check if headers has authorization
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
      ) {
        jwtToken = req.headers.authorization.split(" ")[1];
      }

      // Check if JWT token exists or not
      if (!jwtToken) {
        res.status(Code.RESTRICTED).json({
          success: false,
          message: "Access token not found",
          data: null,
        });
        return;
      }

      const secretKey = process.env.JWT_SECRET_KEY!;

      // Verify JWT token
      jwt.verify(jwtToken, secretKey, async (err: any, decodedToken: any) => {
        if (err) {
          const currentTime = new Date();

          // Handle expired token
          if (err.expiredAt && currentTime > err.expiredAt) {
            return res.status(Code.BAD_REQUEST).json({
              success: false,
              message: `Oops! You've been logged out. Please log in to keep going.`,
              data: null,
            });
          }

          return res.status(Code.BAD_REQUEST).json({
            success: false,
            message: "Token is invalid",
            data: null,
          });
        }

        // Check if user exists
        const checkAvlUser = await User.findOne({ _id: decodedToken.id });

        if (!checkAvlUser) {
          console.log("here user not found");
          return res.status(Code.BAD_REQUEST).json({
            success: false,
            message: "User not found",
            data: null,
          });
        }

        if (checkAvlUser.status == UserStatus.INACTIVE) {
          return res.status(Code.RESTRICTED).json({
            success: false,
            message: "User is inactive, Please contact to support",
            data: null,
          });
        }

        // Check if the user's role is allowed
        if (!role.includes(checkAvlUser.role) && checkRole) {
          return res.status(Code.BAD_REQUEST).json({
            success: false,
            message: "You are not authorized to access this route",
            data: null,
          });
        }

        // Attach user data to the request object and proceed
        req.userData = { userId: decodedToken.id, role: checkAvlUser.role };
        next();
      });
    } catch (error) {
      console.error("Error in Auth Middleware:", error);
      res.status(Code.INTERNAL_SERVER).json({
        success: false,
        message: "Internal server error",
        data: null,
      });
      return;
    }
  };
};
