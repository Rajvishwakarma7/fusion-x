import { Router } from 'express';
import { teamController as TeamController } from './team.controller';
import { authCheck } from '../../middleware/jwt-token.middleware';
import { UserRoles } from '../../utils/Enums.utils';
import { upload } from '../../middleware/multerConfig.middleware';

const router = Router();

router.use(authCheck([UserRoles.ORGANIZATION]));

router.route('/create-team').post(
  upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
    { name: 'teamPhotos', maxCount: 5 },
    { name: 'teamVideos', maxCount: 5 },
  ]),
  TeamController.createTeam
);

export default router;
