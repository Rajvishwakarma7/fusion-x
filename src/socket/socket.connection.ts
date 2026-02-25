import { decodeToken } from '../helper/decodeToken';
import { logger } from '../logger';
import { Server, Socket } from 'socket.io';
import { sendMessage } from '../services/message/message.provider';
import ChatTranscript from '../models/chatTranscript.model';
import GroupMember from '../models/groupMember.model';
import mongoose, { Types } from 'mongoose';
const onlineUsers = new Map();

const initSocket = (io: Server) => {
  try {
    // socket authentication middleware ------------
    io.use(async (socket, next) => {
      const token = socket.handshake.headers.auth as string;
      const validToken = await decodeToken(token);

      if (validToken) {
        socket.data.user = validToken;
        next();
      } else {
        logger.error('Invalid Token');
        socket.disconnect(true);
      }
    });

    // socket connection event  ---------------
    io.on('connection', async (socket:Socket) => {
      const userId = socket.data.user.userId.toString();

      logger.info(`🟢 Connected: ${userId} | socket: ${socket.id}`);

      onlineUsers.set(userId, socket.id);

      const userObjectId = new mongoose.Types.ObjectId(userId);

      const chatTranscipts = await ChatTranscript.find({
        chatType: 'ONE_TO_ONE',
        participants: { $in: [userObjectId] },
      }).select('_id');


      const groupMem = await GroupMember.find({
        userId: userObjectId,
        status: 'active',
        joinStatus: 'joined',
      }).select('groupId');

      // join all rooms one/group belongs to ----------------
      chatTranscipts.forEach((chatTranscript) => {
        socket.join(chatTranscript._id.toString());
      });
      groupMem.forEach((group) => {
        socket.join(group.groupId.toString());
      });

      // handle socket receive events ---------------
      handleSocketReceiveEvents(socket);

      // socket disconnect event ----------------
      socket.on('disconnect', () => {
        logger.info(`🔴 Disconnected: ${userId} | socket: ${socket.id}`);
        onlineUsers.delete(userId);
      });

    });
  } catch (error) {
    console.error('Error initializing socket:', error);
    throw error;
  }
};

// socket receive events ----------------
function handleSocketReceiveEvents (socket: Socket) {
  try {
    
  } catch (error) {
    console.error('Error handling socket receive events:', error);
    throw error;
  }
}

export { initSocket, onlineUsers };
