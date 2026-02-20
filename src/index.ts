import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { DbInstance } from './config/db.config';
import { ErrorHandlerType, TTokenUser } from './utils/Enums.utils';
import router from './services/routes';
import webhook from './services/webhook/webhook.route';
import { logger } from './logger';
import { redis } from './redis/connection.redis';
import http from 'http';
import { Server as socketServer } from 'socket.io';
import path from 'path';
import {
  errorHandler,
  notFoundHandler,
} from './middleware/errorHandler.middleware';
import { apiLimiter } from './middleware/rateLimiter.middleware';
import { initSocket } from './socket/socket.connection';

const app = express();
const httpServer = http.createServer(app);
const port = process.env.PORT || 5000;

const corsOptions = {
  origin: [
    process.env.FRONTEND_BASE_URL as string,
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
  ],
  credentials: true,
  exposedHeaders: ['X-Access-Token'],
};
export const io = new socketServer(httpServer, {
  cors: corsOptions,
});

app.use('/api/v1', webhook);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, './public')));
app.use(apiLimiter);

app.use(
  cors({
    ...corsOptions,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.get('/health', async (req, res) => {
  const redisStatus = await redis
    .ping()
    .then(() => 'ok')
    .catch(() => 'down');
  res.send(`Zinda hu bhai 😢 😎 || redis status : ${redisStatus}`);
});

// Initialize Socket.IO
initSocket(io);

app.use('/api/v1', router);
app.use(notFoundHandler);
app.use(errorHandler as ErrorHandlerType);

DbInstance.then(async () => {
  logger.info('Database Connected 🦊');

  httpServer.listen(port, async () => {
    logger.info(`🚀 Server is running on port 🚀: ${port}`);
  });
}).catch((err: any) => {
  logger.error(`Can't Connect Server!`, err);
  process.exit(1);
});

declare global {
  namespace Express {
    interface Request {
      userData: TTokenUser;
    }
  }
}
