import { NextFunction, Request, Response } from 'express';
import { TGenResObj } from '../../utils/commonInterface.utils';
import * as MessageProvider from './message.provider';
import { chatTranscriptValidator, joinGroupValidator, messageValidator } from './message.validate';

export const messageController = {
  createChatTranscript: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const payload = {
        from: req?.userData?.userId as string,
        groupAdmin: req?.userData?.userId as string,
        ...req.body,
      };

      chatTranscriptValidator.assert(payload);

      const { code, data }: TGenResObj = await MessageProvider.createChatTranscript(payload);

      res.status(code).json(data);

      return;
    } catch (error) {
      console.log('error is coming from stripe list plans:>> ', error);
      next(error);
    }
  },

    joinGroup: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const payload = {
        userId: req?.userData?.userId as string,
        ...req.body,
      };

      joinGroupValidator.assert(payload);

      const { code, data }: TGenResObj = await MessageProvider.joinGroup(payload);

      res.status(code).json(data);

      return;
    } catch (error) {
      console.log('error is coming from stripe list plans:>> ', error);
      next(error);
    }
  },
  
  sendMessage:async( req: Request, res: Response, next: NextFunction)=>{
    try {
      const payload = {
        senderId: req?.userData?.userId as string,
        ...req.body,
      };
      messageValidator.assert(payload);

      const { code, data }: TGenResObj = await MessageProvider.sendMessage(payload);

      res.status(code).json(data);

      return;
    } catch (error) {
      console.log('error is coming from stripe list plans:>> ', error);
      next(error);
    }
  }
};
