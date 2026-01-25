import { NextFunction, Request, Response } from "express";
import { TGenResObj } from "../../utils/commonInterface.utils";
import * as StripeProvider from "./stripe.provider";

export const stripeController = {
  connectStripe: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userData?.userId as string;

      const { code, data }: TGenResObj = await StripeProvider.connectStripe(
        userId
      );
      res.status(code).json(data);
      return;
    } catch (error) {
      next(error);
    }
  },

  createCheckoutSessionUrl: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let payload = {
        ...req.userData,
        ...req.body,
      };

      const { code, data }: TGenResObj =
        await StripeProvider.createCheckoutSessionUrl(payload);
      res.status(code).json(data);
      return;
    } catch (error) {
      next(error);
    }
  },




    connectedAccountStatus: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
         const userId = req.userData?.userId as string;
      const { code, data }: TGenResObj =
        await StripeProvider.connectedAccountStatus(userId);
      res.status(code).json(data);
      return;
    } catch (error) {
      next(error);
    }
  },

};
