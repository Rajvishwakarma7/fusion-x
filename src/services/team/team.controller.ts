import { NextFunction, Request, Response } from 'express';
import { TGenResObj } from '../../utils/commonInterface.utils';
import * as TeamProvider from './team.provider';
import { createTeamValidator } from './team.validate';

export const teamController = {
  createTeam: async (req: Request, res: Response, next: NextFunction) => {
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

      if(payload.teamGoals){
        if(typeof payload.teamGoals === 'string'){
          payload.teamGoals = [payload.teamGoals]
        }else{
          payload.teamGoals = payload.teamGoals
        }
      }

      createTeamValidator.assert(payload);

      const { code, data }: TGenResObj = await TeamProvider.createTeam(payload);

      res.status(code).json(data);

      return;
    } catch (error) {
      console.log('error is coming from stripe list plans:>> ', error);
      next(error);
    }
  },
};
