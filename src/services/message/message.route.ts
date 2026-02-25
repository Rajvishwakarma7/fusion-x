import { Router } from 'express';
import { messageController as MessageController } from './message.controller';
import { authCheck } from '../../middleware/jwt-token.middleware';
import { UserRoles } from '../../utils/Enums.utils';

const router = Router();
router.use(
  authCheck([UserRoles.ORGANIZATION, UserRoles.USER, UserRoles.ADMIN])
);

// for single/group chat creation
router
  .route('/create-chattranscript')
  .post(MessageController.createChatTranscript);

// manage group members (add/remove/promote/demote)
router.route('/join-group').post(MessageController.joinGroup);

router.route('/send-message').post(MessageController.sendMessage)

export default router;
