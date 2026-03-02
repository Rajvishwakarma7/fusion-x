import { ArkErrors } from 'arktype';
import mongoose from 'mongoose';

export enum HttpStatusCodes {
  ACCEPTED = 202,
  FORBIDDEN = 403,
  CHECK_PAYMENT = 298,
  BAD_REQUEST = 400,
  CONFLICT = 409,
  CREATED = 201,
  STRIPE_CONNECT_VERIFIED = 255,
  NOT_VERIFIED = 600,
  RESTRICTED = 601,
  INTERNAL_SERVER = 500,
  NOT_FOUND = 404,
  NO_CONTENT = 204,
  OK = 200,
  SERVICE_ERROR = 503,
  UNAUTHORIZED = 401,
  UNPROCESSABLE = 422,
  MANY_REQUESTS = 429,
  ACCESS_TOKEN_EXPIRED = 440,
}

export type TTokenUser = {
  userId: string;
  role?: string;
};

export const getEnumValues = (data: Record<string, string>) =>
  Object.values(data);

export type ErrorHandlerType = (
  error: ArkErrors | mongoose.Error | Error
) => void;

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum UserRoles {
  USER = 'user',
  ORGANIZATION = 'organization',
  ADMIN = 'admin',
}

export enum SocketEvents {
  // Presence
  USER_ONLINE = 'user:online',
  USER_OFFLINE = 'user:offline',
  USER_TYPING = 'user:typing',
  USER_STOP_TYPING = 'user:stop_typing',

  // Direct messages
  DIRECT_SEND = 'chat:direct:send',
  DIRECT_RECEIVE = 'chat:direct:receive',
  DIRECT_DELIVERED = 'chat:direct:delivered',
  DIRECT_READ = 'chat:direct:read',
  DIRECT_CONVERSATION_UPDATE = 'chat:direct:conversation_update',

  // Group messages
  GROUP_SEND = 'chat:group:send',
  GROUP_RECEIVE = 'chat:group:receive',
  GROUP_DELIVERED = 'chat:group:delivered',
  GROUP_READ = 'chat:group:read',
  GROUP_CONVERSATION_UPDATE = 'chat:group:conversation_update',
}
