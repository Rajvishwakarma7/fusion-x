import { NextFunction, Request, Response } from "express";
import { TGenResObj } from "../../utils/commonInterface.utils";
import * as AdminProvider from "./admin.provider";

export const adminController = {

  syncStripeConnectAccount: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let payload = {
        ...req.query,
      };

      const { code, data }: TGenResObj =
        await AdminProvider.syncStripeConnectAccount(payload);
      res.status(code).json(data);
      return;
    } catch (error) {
      next(error);
    }
  },

};
