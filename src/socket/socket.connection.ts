import { decodeToken } from '../helper/decodeToken';
import { logger } from '../logger';
import { Server } from 'socket.io';
const onlineUsers = new Map();

const initSocket = (io: Server) => {

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

    const userId = socket.data.user.userId;
    onlineUsers.set(userId, socket.id);
    

    socket.on('message', (message) => {
      console.log(
        '-------------------------->>>> socket storage',
        socket.data.user
      );
      console.log('message |||', message);
      console.log('online----Users 🟢', onlineUsers);
      io.emit('message', message);
    });

    socket.on('disconnect', () => {
      logger.info(`🔴 Socket disconnected: ${socket.id}`);
    });
  });
};

export { initSocket, onlineUsers };
