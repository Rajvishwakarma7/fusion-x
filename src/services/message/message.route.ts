import { Router } from 'express';
import { messageController as MessageController } from './message.controller';
import { authCheck } from '../../middleware/jwt-token.middleware';
import { UserRoles } from '../../utils/Enums.utils';
import { upload } from '../../middleware/multerConfig.middleware';

const router = Router();
router.use(
  authCheck([UserRoles.ORGANIZATION, UserRoles.USER, UserRoles.ADMIN])
);

// handle-messaging 
router
  .route('/upload-message-media')
  .post(
    upload.fields([{ name: 'messageMedia', maxCount: 5 }]),
    MessageController.uploadMessageMedia
  );
router.route('/create-chattranscript').post(MessageController.createChatTranscript);
router.route('/join-group').post(MessageController.joinGroup);
router.route('/send-message').post(MessageController.sendMessage);

// manage chats list

router.route('/chat-list/one-to-one').get(MessageController.getOneToOneChatsList);
router.route('/chat-list/my-groups').get(MessageController.getMyGroupChatsList);
router.route('/chat-list/others-groups').get(MessageController.getOtherGroupChatsList);

// message 
router.route('/header-info/:chatTranscriptId').get( MessageController.getHeaderInfo);
router.route('/history').get(MessageController.getChatHistory);

// block & unblock
router.route('/user-block').post(MessageController.blockUser);

export default router;
