import { NextFunction, Request, Response } from 'express';
import { TGenResObj } from '../../utils/commonInterface.utils';
import * as TeamProvider from './team.provider';
import {
  createTeamValidator,
  deleteTeamMediaValidator,
  getAllTeamsValidator,
  getTeamMediaValidator,
  updateTeamMediaValidator,
  uploadTeamMediaValidator,
} from './team.validate';

export const teamController = {
  getAllTeamsWithMedia: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const paylpad = {
        ...req.query,
        page: Number(req.query.page) || 1,
        pageSize: Number(req.query.pageSize) || 10,
      };
      getAllTeamsValidator.assert(paylpad);
      const { code, data }: TGenResObj =
        await TeamProvider.getAllTeamsWithMedia(paylpad);
      res.status(code).json(data);
      return;
    } catch (error) {
      console.log('error is coming from get all teams with media:>> ', error);
      next(error);
    }
  },

  getAllTeams: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const paylpad = {
        ...req.query,
        page: Number(req.query.page) || 1,
        pageSize: Number(req.query.pageSize) || 10,
      };
      getAllTeamsValidator.assert(paylpad);
      const { code, data }: TGenResObj =
        await TeamProvider.getAllTeams(paylpad);
      res.status(code).json(data);
      return;
    } catch (error) {
      console.log('error is coming from get all teams:>> ', error);
      next(error);
    }
  },

  createTeamWithMedia: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const files = req.files as any;

      const payload = {
        userId: req.userData?.userId,
        ...req.body,
        profileImage: files?.profileImage || [],
        coverImage: files?.coverImage || [],
        teamPhotos: files?.teamPhotos || [],
        teamVideos: files?.teamVideos || [],
      };

      if (payload.teamGoals) {
        if (typeof payload.teamGoals === 'string') {
          payload.teamGoals = [payload.teamGoals];
        } else {
          payload.teamGoals = payload.teamGoals;
        }
      }

      createTeamValidator.assert(payload);

      const { code, data }: TGenResObj =
        await TeamProvider.createTeamWithMedia(payload);

      res.status(code).json(data);

      return;
    } catch (error) {
      console.log('error is comming from create team:>> ', error);
      next(error);
    }
  },

  createTeam: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as any;

      const payload = {
        userId: req.userData?.userId,
        ...req.body,
        profileImage: files?.profileImage || [],
        coverImage: files?.coverImage || [],
      };

      if (payload.teamGoals) {
        if (typeof payload.teamGoals === 'string') {
          payload.teamGoals = [payload.teamGoals];
        } else {
          payload.teamGoals = payload.teamGoals;
        }
      }

      createTeamValidator.assert(payload);

      const { code, data }: TGenResObj = await TeamProvider.createTeam(payload);

      res.status(code).json(data);

      return;
    } catch (error) {
      console.log('error is comming from create team:>> ', error);
      next(error);
    }
  },

  uploadTeamMedia: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as any;

      const payload = {
        ...req.body,
        teamPhotos: files?.teamPhotos || [],
        teamVideos: files?.teamVideos || [],
      };

      uploadTeamMediaValidator.assert(payload);

      const { code, data }: TGenResObj =
        await TeamProvider.uploadTeamMedia(payload);

      res.status(code).json(data);

      return;
    } catch (error) {
      console.log('error is coming from upload team media:>> ', error);
      next(error);
    }
  },

  updateTeamMedia: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as any;

      const payload = {
        ...req.body,
        teamMedia: files?.teamMedia || [],
      };

      updateTeamMediaValidator.assert(payload);

      const { code, data }: TGenResObj =
        await TeamProvider.updateTeamMedia(payload);

      res.status(code).json(data);

      return;
    } catch (error) {
      console.log('error is coming from update team media:>> ', error);
      next(error);
    }
  },

  deleteTeamMedia: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = {
        teamMediaId: req.query.teamMediaId as string,
      };
      deleteTeamMediaValidator.assert(payload);
      const { code, data }: TGenResObj =
        await TeamProvider.deleteTeamMedia(payload);

      res.status(code).json(data);

      return;
    } catch (error) {
      console.log('error is coming from delete team media:>> ', error);
      next(error);
    }
  },

  getTeamMedia: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const paylpad = {
        ...req.query,
        teamId: req.query.teamId as string,
        page: Number(req.query.page) || 1,
        pageSize: Number(req.query.pageSize) || 10,
      };
      getTeamMediaValidator.assert(paylpad);
      const { code, data }: TGenResObj =
        await TeamProvider.getTeamMedia(paylpad);
      res.status(code).json(data);
      return;
    } catch (error) {
      console.log(' error is coming from get team media:>> ', error);
      next(error);
    }
  },
};
