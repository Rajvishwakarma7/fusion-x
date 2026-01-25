import { Schema } from "mongoose";

export type TResponse = {
  code: number;
  data: TGenResObj;
};

type TGenResObjData = {
  status: boolean;
  message: string;
  data: any;
};

export type TGenResObj = {
  code: number;
  data?: TGenResObjData;
};

export interface MailOptions {
  from: string;
  to: string;
  subject: string;
  text?: string;
  html: string;
}

export interface Credentials {
  client_id: string;
  client_secret: string;
}

export interface Token {
  refresh_token: string;
  access_token: string;
  expiry_date: number;
}

export type MongooseId = string | Schema.Types.ObjectId;
