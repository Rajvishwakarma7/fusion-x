import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { DbInstance } from './config/db.config';
import { TTokenUser } from './utils/Enums.utils';
import router from './services/routes';
import webhook from './services/webhook/webhook.route';
import { logger } from './logger';
import { redis } from './redis/connection.redis';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const port = process.env.PORT || 5000;

app.use('/api/v1', webhook);
app.use(
  cors({
    origin: [process.env.FRONTEND_BASE_URL as string, 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', async (req, res) => {
  const redisStatus = await redis
    .ping()
    .then(() => 'ok')
    .catch(() => 'down');
  res.send(`Zinda hu bhai 😢 😎 || redis status : ${redisStatus}`);
});

io.on('connection', (socket) => {
  console.log('User Connected');
  console.log('socket id ----->>>>', socket.id);
  socket.on('disconnect', () => {
    console.log('User Disconnected');
  });
});

app.use('/api/v1', router);

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
