import { NextFunction, Request, Response } from 'express';
import { TGenResObj } from '../../utils/commonInterface.utils';
import * as StripeProvider from './stripe.provider';
import {
  cancelPlanValidator,
  createPlanValidator,
  getUserMembershipValidator,
  upgradeSubscriptionValidator,
  userTransactionsHistoryValidator,
} from './stripe.validate';

export const stripeController = {
  listPlans: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code, data } = await StripeProvider.listPlans();
    
      res.status(code).json(data);

      return;
    } catch (error) {
      console.log('error is coming from stripe list plans:>> ', error);
      next(error);
    }
  },

  createCheckoutSession: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const payload = { ...req.body, userId: req.userData?.userId };

      createPlanValidator.assert(payload);

      const { code, data } =
        await StripeProvider.createCheckoutSession(payload);

      res.status(code).json(data);
    } catch (error) {
      console.log('error is coming from create checkout session:>> ', error);
      next(error);
    }
  },
  cancelSubscription: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const payload = { userId: req.userData?.userId };

      cancelPlanValidator.assert(payload);

      const { code, data } = await StripeProvider.cancelSubscription(payload);

      res.status(code).json(data);
    } catch (error) {
      console.log('error is coming from cancel subscription:>> ', error);
      next(error);
    }
  },
  upgradeSubscription: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const payload = { ...req.body, userId: req.userData?.userId };

      upgradeSubscriptionValidator.assert(payload);

      const { code, data } = await StripeProvider.upgradeSubscription(payload);

      res.status(code).json(data);
    } catch (error) {
      console.log('error is coming from update subscription:>> ', error);
      next(error);
    }
  },
  userTransactionsHistory: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const payload = {
        userId: req.userData?.userId,
        ...req.query,
        page: Number(req.query.page) || 1,
        pageSize: Number(req.query.pageSize) || 10,
      };

      userTransactionsHistoryValidator.assert(payload);

      const { code, data } =
        await StripeProvider.userTransactionsHistory(payload);

      res.status(code).json(data);
    } catch (error) {
      console.log('error is coming from user transactions history:>> ', error);
      next(error);
    }
  },
  getUserMembership: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const payload = { userId: req.userData?.userId };

      getUserMembershipValidator.assert(payload);

      const { code, data } = await StripeProvider.getUserMembership(payload);

      res.status(code).json(data);
    } catch (error) {
      console.log('error is coming from get user membership:>> ', error);
      next(error);
    }
  },

  // connect accounts flow ----->>>>

  connectStripe: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userData?.userId as string;

      const { code, data }: TGenResObj =
        await StripeProvider.connectStripe(userId);
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
