import { NextFunction, Request, Response } from 'express';
import { TGenResObj } from '../../utils/commonInterface.utils';
import * as MessageProvider from './message.provider';
import {
  blockUserValidator,
  chatHistoryValidator,
  chatTranscriptValidator,
  groupChatValidator,
  groupListValidator,
  joinGroupValidator,
  messageValidator,
  oneToOneListValidator,
  uploadMessageMediaValidator,
} from './message.validate';

export const messageController = {
  uploadMessageMedia: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const files = req.files as any;
      const payload = { messageMedia: files?.messageMedia || [] };

      uploadMessageMediaValidator.assert(payload);

      const { code, data }: TGenResObj =
        await MessageProvider.uploadMessageMedia(payload);

      res.status(code).json(data);

      return;
    } catch (error) {
      console.log('error is coming from upload message media:>> ', error);
      next(error);
    }
  },

  createChatTranscript: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const payload = {
        from: req?.userData?.userId as string,
        ...req.body,
      };

      chatTranscriptValidator.assert(payload);

      const { code, data }: TGenResObj =
        await MessageProvider.createChatTranscript(payload);

      res.status(code).json(data);

      return;
    } catch (error) {
      console.log('error is coming from create chat transcript:>> ', error);
      next(error);
    }
  },

  joinGroup: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = {
        userId: req?.userData?.userId as string,
        ...req.body,
      };

      joinGroupValidator.assert(payload);

      const { code, data }: TGenResObj =
        await MessageProvider.joinGroup(payload);

      res.status(code).json(data);

      return;
    } catch (error) {
      console.log('error is coming from join group:>> ', error);
      next(error);
    }
  },

  sendMessage: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = {
        senderId: req?.userData?.userId as string,
        ...req.body,
      };
      messageValidator.assert(payload);

      const { code, data }: TGenResObj =
        await MessageProvider.sendMessage(payload);

      res.status(code).json(data);

      return;
    } catch (error) {
      console.log('error is coming from send message:>> ', error);
      next(error);
    }
  },

  getOneToOneChatsList: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const payload = {
        userId: req?.userData?.userId as string,
        ...req.query,
        page: Number(req.query.page) || 1,
        pageSize: Number(req.query.pageSize) || 10,
      };
      oneToOneListValidator.assert(payload);

      const { code, data }: TGenResObj =
        await MessageProvider.getOneToOneChatsList(payload);

      res.status(code).json(data);

      return;
    } catch (error) {
      console.log('error is coming from get one to one chats list:>> ', error);
      next(error);
    }
  },

  getMyGroupChatsList: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const payload = {
        userId: req?.userData?.userId as string,
        ...req.query,
        page: Number(req.query.page) || 1,
        pageSize: Number(req.query.pageSize) || 10,
      };
      groupListValidator.assert(payload);

      const { code, data }: TGenResObj =
        await MessageProvider.getMyGroupChatsList(payload);

      res.status(code).json(data);

      return;
    } catch (error) {
      console.log('error is coming from get my group chats list:>> ', error);
      next(error);
    }
  },

  getOtherGroupChatsList: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const payload = {
        userId: req?.userData?.userId as string,
        ...req.query,
        page: Number(req.query.page) || 1,
        pageSize: Number(req.query.pageSize) || 10,
      };
      groupListValidator.assert(payload);

      const { code, data }: TGenResObj =
        await MessageProvider.getOtherGroupChatsList(payload);

      res.status(code).json(data);

      return;
    } catch (error) {
      console.log('error is coming from get other group chats list:>> ', error);
      next(error);
    }
  },

  getHeaderInfo: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = {
        userId: req?.userData?.userId as string,
        chatTranscriptId: req.params.chatTranscriptId as string,
      };
      groupChatValidator.assert(payload);

      const { code, data }: TGenResObj =
        await MessageProvider.getHeaderInfo(payload);

      res.status(code).json(data);

      return;
    } catch (error) {
      console.log('error is coming from get header info:>> ', error);
      next(error);
    }
  },

  getChatHistory: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = {
        userId: req?.userData?.userId as string,
        chatTranscriptId: req.query.chatTranscriptId as string,
        page: Number(req.query.page) || 1,
        pageSize: Number(req.query.pageSize) || 10,
      };
      chatHistoryValidator.assert(payload);

      const { code, data }: TGenResObj =
        await MessageProvider.getChatHistory(payload);

      res.status(code).json(data);

      return;
    } catch (error) {
      console.log('error is coming from get header info:>> ', error);
      next(error);
    }
  },

   blockUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = {
        userId: req?.userData?.userId as string,
        ...req.body,
      };
      blockUserValidator.assert(payload);

      const { code, data }: TGenResObj =
        await MessageProvider.blockUser(payload);

      res.status(code).json(data);

      return;
    } catch (error) {
      console.log('error is coming from block user:>> ', error);
      next(error);
    }
  },
};



