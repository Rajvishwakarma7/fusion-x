import fs from 'fs';
import path from 'path';
import winston from 'winston';

import { devFormat, prodFormat } from './formats';
import {
  combinedFileTransport,
  consoleTransport,
  errorFileTransport,
} from './transports';

const isProd = process.env.NODE_ENV === 'production';

// Define log folder
const logDir = path.join(process.cwd(), 'logs');

// Create logs folder if it doesn't exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

export const logger = winston.createLogger({
  level: isProd ? 'info' : 'debug',
  format: isProd ? prodFormat : devFormat,
  transports: [
    consoleTransport,
    errorFileTransport,
    combinedFileTransport,
  ],
  exitOnError: false,
});
