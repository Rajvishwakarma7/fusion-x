import { NextFunction, Request, Response } from 'express';
import { TGenResObj } from '../../utils/commonInterface.utils';
import * as OrganizationProvider from './organization.provider';
import { createOrganizationValidator, updateOrganizationValidator } from './organization.validate';

export const organizationController = {
  createOrganization: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const payload = {
        userId: req.userData?.userId,
        ...req.body,
      };
      if(req.file){
        payload.profileImage = req.file?.path;
      }
      createOrganizationValidator.assert(payload);
      const { code, data }:TGenResObj = await OrganizationProvider.createOrganization(payload);
      res.status(code).json(data);
      return;
    } catch (error) {
      console.log('error is coming from stripe list plans:>> ', error);
      next(error);
    }
  },
  updateOrganization: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const payload = {
        userId: req.userData?.userId,
        ...req.body,
      };
      if(req.file){
        payload.profileImage = req.file?.path;
      }else{
        delete payload.profileImage
      }
      updateOrganizationValidator.assert(payload);
      const { code, data }:TGenResObj = await OrganizationProvider.updateOrganization(payload);
      res.status(code).json(data);
      return;
    } catch (error) {
      console.log('error is coming from stripe list plans:>> ', error);
      next(error);
    }
  },

};
