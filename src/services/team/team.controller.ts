import { NextFunction, Request, Response } from 'express';
import { TGenResObj } from '../../utils/commonInterface.utils';
import * as TeamProvider from './team.provider';


export const teamController = {
  createTeam: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code, data }:TGenResObj = await TeamProvider.createTeam();

      res.status(code).json(data);

      return;
    } catch (error) {
      console.log('error is coming from stripe list plans:>> ', error);
      next(error);
    }
  },


};
