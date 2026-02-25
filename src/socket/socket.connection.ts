import { decodeToken } from '../helper/decodeToken';
import { logger } from '../logger';
import { Server } from 'socket.io';
import { sendMessage } from '../services/message/message.provider';
import ChatTranscript from '../models/chatTranscript.model';
import GroupMember from '../models/groupMember.model';
import { Types } from 'mongoose';
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
    io.on('connection', async (socket) => {
      const userId = socket.data.user.userId.toString();
      logger.info(`🟢 Connected: ${userId} | socket: ${socket.id}`);

      let rooms = new Set<string>();
      onlineUsers.set(userId, socket.id);

      const chatTranscipts = await ChatTranscript.find({
        chatType: 'ONE_TO_ONE',
        participants: { $in: [userId] },
      }).select('_id');

      console.log('Chat Transcripts:', chatTranscipts);

      const groupMem = await GroupMember.find({
        userId: userId,
        status: 'active',
        joinStatus: 'joined',
      }).select('groupId');

      console.log('Group Memberships:', groupMem);

      chatTranscipts.forEach((chat_id) => {
        rooms.add(chat_id._id.toString());
      });
      groupMem.forEach((chat_id) => {
        rooms.add(chat_id._id.toString());
      });

      rooms.forEach((room: string) => {
        socket.join(room);
      });

      console.log('Rooms joined:', Array.from(rooms));
      console.log('Online Users:', Array.from(onlineUsers.entries()));
    });
  } catch (error) {
    console.error('Error initializing socket:', error);
    throw error;
  }
};

export { initSocket, onlineUsers };
