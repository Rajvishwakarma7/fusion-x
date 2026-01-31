import { NextFunction, Request, Response } from "express";
import { TGenResObj } from "../../utils/commonInterface.utils";
import * as UserProvider from "./user.provider";
import { signInValidator, signUpValidator } from "./user.validate";

export const userController = {
  signupUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { body } = req;
      signUpValidator.assert(body);
      const { code, data }: TGenResObj = await UserProvider.signupUser(body);
      res.status(code).json(data);
      return;
    } catch (error) {
      next(error);
    }
  },

    signinUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { body } = req;
      signInValidator.assert(body);
      const { code, data }: TGenResObj = await UserProvider.signinUser(body);
      res.status(code).json(data);
      return;
    } catch (error) {
      next(error);
    }
  },

  getMe: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userData?.userId as string;
      const {code,data}:TGenResObj = await UserProvider.getMe(userId);
      res.status(code).json(data);
      return;
    } catch (error) {
      next(error);
    }
  }
};

