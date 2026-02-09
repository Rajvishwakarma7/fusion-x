import { NextFunction, Request, Response } from 'express';
import { TGenResObj } from '../../utils/commonInterface.utils';
import * as OrganizationProvider from './organization.provider';
import { createOrganizationValidator } from './organization.validate';

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
        profileImage: req.file?.path,
      };
      createOrganizationValidator.assert(payload);
      const { code, data } = await OrganizationProvider.createOrganization(payload);
      res.status(code).json(data);
      return;
    } catch (error) {
      console.log('error is coming from stripe list plans:>> ', error);
      next(error);
    }
  },
};
