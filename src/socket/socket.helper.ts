import { io } from '..';
import ChatParticipants from '../models/chatParticipants.model';
import ChatTranscript from '../models/chatTranscript.model';
import users from '../models/user.model';
import { SocketEvents } from '../utils/Enums.utils';

export const sendMessage = () => {
  io.emit('message', 'Hello');
};

export async function handleConversationUpdate(
  chatTranscriptId: string,
  userId: string
) {
  try {
    const chatTranscripts = await ChatTranscript.findOne({
      _id: chatTranscriptId,
    }).lean();

    if (!chatTranscripts) {
      return;
    }

    let chatType = chatTranscripts.chatType;

    const participants = await ChatParticipants.find({
      chatTranscriptId,
      joinStatus: 'joined',
      status: 'active',
      isDeleted: false,
    });

    if (chatType === 'ONE_TO_ONE') {
      participants.forEach(async (p) => {
        if (p.userId.toString() === userId) {
          return;
        }
        const senderInfo = await users
          .findById(p.userId)
          .select('fullName email profileImage')
          .lean();
        const conversationObj = {
          ...chatTranscripts,
          unreadCount: p.unreadCount,
          senderInfo,
        };

        io.to(p.userId.toString()).emit(
          SocketEvents.DIRECT_CONVERSATION_UPDATE,
          conversationObj
        );
      });
    } else if (chatType === 'GROUP') {
      participants.forEach((p) => {
        if (p.userId.toString() === userId) {
          return;
        }
        const conversationObj = {
          ...chatTranscripts,
          unreadCount: p.unreadCount,
        };

        io.to(p.userId.toString()).emit(
          SocketEvents.GROUP_CONVERSATION_UPDATE,
          conversationObj
        );
      });
    }
  } catch (error) {
    console.log('error is coming from handle conversation update:>> ', error);
    throw error;
  }
}

export const updateMessageLastSeen = async (
  chatTranscriptId: string,
  userId: string
) => {
  try {
    await ChatParticipants.findOneAndUpdate(
      { chatTranscriptId, userId },
      {
        $set: {
          unreadCount: 0,
          lastReadAt: new Date(),
        },
      }
    );
  } catch (error) {
    console.log('error is coming from update message last seen:>> ', error);
    throw error;
  }
};

