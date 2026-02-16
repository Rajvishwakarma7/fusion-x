import { format } from 'winston';

const { combine, timestamp, printf, colorize, errors } = format;

export const devFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: sTimestamp, stack }) => stack
    ? `[${sTimestamp}] ${level}: ${stack}`
    : `[${sTimestamp}] ${level}: ${message}`,
  ),
);

export const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  format.json(),
);
