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


export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}


export enum UserRoles {
  USER = "user",
  SELLER = "seller",
  ADMIN = "admin",
}

// transaction
export enum TransactionStatus {
  SUCCEED = "succeed",
  FAILED = "failed",
  IN_COMPLETED = "inCompleted",
}

export enum TransactionType {
  SUBSCRIPTION_CREATION = "subscriptionCreation",
  SUBSCRIPTION_UPDATE = "subscriptionUpdate",
}

export type TTokenUser = {
  userId?: string;
  role?: string;
};

export const getEnumValues = (data: Record<string, string>) =>
  Object.values(data);
