import ChatParticipants from '../../models/chatParticipants.model';
import MessageMedia from '../../models/messageMedia.model';
import UserBlock from '../../models/userBlock.model';
import { upload } from '../../utils/cloudinary.util';

export const uploadMessageMediaHelper = async (media: any) => {
  try {
    return await Promise.all(
      media.map(async (mediaItems: any) => {
        let url = await upload(mediaItems.path);
        return await MessageMedia.create({
          fileName: mediaItems.originalname,
          url: url.uploadedImageUrl,
          mimeType: mediaItems.mimetype,
          size: mediaItems.size,
        });
      })
    );
  } catch (error) {
    console.log('error in uploadMessageMediaHelper :>> ', error);
    throw error;
  }
};

export const checkBlockStatus = async (
  senderId: string,
  chatTranscriptId: string
) => {
  try {
    const receiver = await ChatParticipants.findOne({
      chatTranscriptId,
      userId: { $ne: senderId },
      status: 'active',
      chatType: 'ONE_TO_ONE',
      isDeleted: false,
    });
    if (!receiver) {
      return { status: false, message: 'Chat participants not found' };
    }
    const isBlocked = await UserBlock.findOne({
      $or: [
        { blockedBy: senderId, blockedUser: receiver?.userId, isActive: true },
        { blockedBy: receiver?.userId, blockedUser: senderId, isActive: true },
      ],
    });

    if (isBlocked) {
      if (isBlocked.blockedBy.toString() === senderId.toString()) {
        return { status: true, message: 'failed to send message, you blocked this user' };
      } else {
        return { status: true, message: 'failed to send message, this user blocked you' };
      }
    }
    return { status: false, message: '' };
  } catch (error) {
    console.log('error is coming from check block status:>> ', error);
    throw error;
  }
};
