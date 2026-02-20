import { decodeToken } from '../helper/decodeToken';
import { logger } from '../logger';
import { Server } from 'socket.io';
import { sendMessage } from '../services/message/message.provider';
const onlineUsers = new Map();

const initSocket = (io: Server) => {
  try {
    // socket authentication middleware
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

    // socket connection event
    io.on('connection', (socket) => {
      logger.info(`🟢 Socket connected: ${socket.id}`);
      console.log('socket-id 🟢', socket.id, '😎', socket.data.user);

      const userId = socket.data.user.userId.toString();
      onlineUsers.set(userId, socket.id);

      socket.on('message', (message) => {
        console.log(
          '-------------------------->>>> socket storage',
          socket.data.user
        );
        console.log('message |||', message);
        console.log('online----Users 🟢', onlineUsers);
        const recipientSocketId = onlineUsers.get(message?.to.toString());
        console.log('recipientSocketId 🟢', recipientSocketId);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('message', message?.text);
        }
        sendMessage({
          senderId: userId,
          chatTranscriptId: message?.chatTranscriptId,
          text: message?.text,
        })
          .then(() => {
            console.log('message sent successfully');
          })
          .catch((err) => {
            console.log('error in sending message :>> ', err);
          });
      });

      socket.on('disconnect', () => {
        logger.info(`🔴 Socket disconnected: ${socket.id}`);
        onlineUsers.delete(userId);
      });
    });
  } catch (error) {
    console.error('Error initializing socket:', error);
    throw error;
  }
};

export { initSocket, onlineUsers };
