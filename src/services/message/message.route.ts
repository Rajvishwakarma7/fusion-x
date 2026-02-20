import { Router } from 'express';
import { messageController as MessageController } from './message.controller';
import { authCheck } from '../../middleware/jwt-token.middleware';
import { UserRoles } from '../../utils/Enums.utils';

const router = Router();
router.use(
  authCheck([UserRoles.ORGANIZATION, UserRoles.USER, UserRoles.ADMIN])
);
router
  .route('/create-chattranscript')
  .post(MessageController.createChatTranscript);
router.route('/send-message').post(MessageController.sendMessage)

export default router;
