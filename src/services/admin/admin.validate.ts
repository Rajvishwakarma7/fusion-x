import { type } from "arktype";


export const stripeConnectValidator = type({
  userId: "string",
});

export type stripeConnectValidatorType = typeof stripeConnectValidator.infer;



