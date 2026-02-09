import { Router } from 'express';
import { organizationController as OrganizationController } from './organization.controller';
import { authCheck } from '../../middleware/jwt-token.middleware';
import { UserRoles } from '../../utils/Enums.utils';
import { upload } from '../../middleware/multerConfig.middleware';

const router = Router();

router.use(authCheck([UserRoles.ORGANIZATION]));

router
  .route('/create-organization')
  .post(upload.single('profileImage'),OrganizationController.createOrganization);

export default router;
