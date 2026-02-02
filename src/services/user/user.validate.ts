import { type } from "arktype";

export const signUpValidator = type({
  fullName: "string",
  email: "string",
  password: "string",
});

export type signUpType = typeof signUpValidator.infer;

export const signInValidator = type({
  email: "string",
  password: "string",
});

export type signInType = typeof signInValidator.infer;


  export const getMeValidator = type({
    userId: "string",
    role: "string",
  });

  export type getMeType = typeof getMeValidator.infer;

