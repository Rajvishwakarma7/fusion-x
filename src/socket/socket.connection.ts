import { decodeToken } from '../helper/decodeToken';
import { logger } from '../logger';
import { Server, Socket } from 'socket.io';
import { sendMessage } from '../services/message/message.provider';
import mongoose from 'mongoose';
import { TGenResObj } from '../utils/commonInterface.utils';
import { HttpStatusCodes as Code, SocketEvents } from '../utils/Enums.utils';
import ChatParticipants from '../models/chatParticipants.model';

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
    io.on('connection', async (socket: Socket) => {
      const userId = socket.data.user.userId.toString();

      logger.info(`🟢 Connected: ${userId} | socket: ${socket.id}`);

      onlineUsers.set(userId, socket.id);
      
      // join rooms  ----
      await joinUserRooms(socket, userId);

      // event handlers ----
      handleSocketEvents(socket, userId);

      // disconnection ----
      socket.on('disconnect', () => {
        logger.info(`🔴 Disconnected: ${userId} | socket: ${socket.id}`);
        delete socket.data.user.userId;
        onlineUsers.delete(userId);
      });
    });
  } catch (error) {
    console.error('Error initializing socket:', error);
    throw error;
  }
};

// join rooom
async function joinUserRooms(socket: Socket, userId: string) {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const allChats = await ChatParticipants.find({
    userId: userObjectId,
    status: 'active',
    isDeleted: false,
    joinStatus: 'joined',
  }).select('chatTranscriptId');

  allChats.forEach((c) => socket.join(c.chatTranscriptId.toString()));
}

// socket receive events ----------------
function handleSocketEvents(socket: Socket, userId: string) {
  try {
    // group messaging
    socket.on(SocketEvents.GROUP_SEND, async (payload) => {
      try {
        payload.senderId = userId;
        const { code, data }: TGenResObj = await sendMessage(payload);

        if (code === Code.OK) {
          socket
            .to(payload.chatTranscriptId)
            .emit(SocketEvents.GROUP_RECEIVE, data?.data);
        }
      } catch (error) {
        console.error('Error in chat:group:send event:', error);
      }
    });

    // direct messaging
    socket.on(SocketEvents.DIRECT_SEND, async (payload) => {
      try {
        payload.senderId = userId;
        const { code, data }: TGenResObj = await sendMessage(payload);
        
        if (code === Code.OK) {
          socket
            .to(payload.chatTranscriptId)
            .emit(SocketEvents.DIRECT_RECEIVE, data?.data);
        }
      } catch (error) {
        console.log('Error in chat:direct:send event:', error);
      }
    });
  } catch (error) {
    console.error('Error handling socket receive events:', error);
    throw error;
  }
}

export { initSocket, onlineUsers };



//  message acknowledgement for group and direct messages,
//  typing indicator for group and direct messages,
//  block and blocked users (notifications) api and socket events,
//  chatted-list thread updation for group and direct messages