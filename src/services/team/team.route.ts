import { Router } from 'express';
import { teamController as TeamController } from './team.controller';
import { authCheck } from '../../middleware/jwt-token.middleware';
import { UserRoles } from '../../utils/Enums.utils';
import { upload } from '../../middleware/multerConfig.middleware';

const router = Router();

router
  .route('/get-all-teams-with-media')
  .get(TeamController.getAllTeamsWithMedia);
router.route('/get-all-teams').get(TeamController.getAllTeams);

router.route('/create-team-with-media').post(
  authCheck([UserRoles.ORGANIZATION]),
  upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
    { name: 'teamPhotos', maxCount: 5 },
    { name: 'teamVideos', maxCount: 5 },
  ]),
  TeamController.createTeamWithMedia
);

router.route('/create-team').post(
  authCheck([UserRoles.ORGANIZATION]),
  upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
  ]),
  TeamController.createTeam
);



// team-media handle
router.route('/upload-team-media').post(
  upload.fields([
    { name: 'teamPhotos', maxCount: 5 },
    { name: 'teamVideos', maxCount: 5 },
  ]),
  TeamController.uploadTeamMedia
);

router
  .route('/update-team-media')
  .put(
    upload.fields([{ name: 'teamMedia', maxCount: 1 }]),
    TeamController.updateTeamMedia
  );

router.route('/delete-team-media').delete(TeamController.deleteTeamMedia);
router.route('/get-team-media').get(TeamController.getTeamMedia);

export default router;
