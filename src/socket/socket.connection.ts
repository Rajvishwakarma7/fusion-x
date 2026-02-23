import { decodeToken } from '../helper/decodeToken';
import { logger } from '../logger';
import { Server } from 'socket.io';
import { sendMessage } from '../services/message/message.provider';
import ChatTranscript from '../models/chatTranscript.model';
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
    io.on('connection', async(socket) => {
      const userId = socket.data.user.userId.toString();
      logger.info(`🟢 Connected: ${userId} | socket: ${socket.id}`);

      onlineUsers.set(userId, socket.id);

      const chatTranscipts = await ChatTranscript.find()


      console.log('chatTranscipts 🟢', chatTranscipts);

      
    });
  } catch (error) {
    console.error('Error initializing socket:', error);
    throw error;
  }
};

export { initSocket, onlineUsers };
