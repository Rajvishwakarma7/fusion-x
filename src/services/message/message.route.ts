import { Router } from 'express';
import { messageController as MessageController } from './message.controller';
import { authCheck } from '../../middleware/jwt-token.middleware';
import { UserRoles } from '../../utils/Enums.utils';
import { upload } from '../../middleware/multerConfig.middleware';

const router = Router();
router.use(
  authCheck([UserRoles.ORGANIZATION, UserRoles.USER, UserRoles.ADMIN])
);

// handle msg media
router
  .route('/upload-message-media')
  .post(
    upload.fields([{ name: 'messageMedia', maxCount: 5 }]),
    MessageController.uploadMessageMedia
  );

// for single/group chat creation
router
  .route('/create-chattranscript')
  .post(MessageController.createChatTranscript);

router.route('/join-group').post(MessageController.joinGroup);

router.route('/send-message').post(MessageController.sendMessage);

export default router;
