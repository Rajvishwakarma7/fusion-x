import { type } from "arktype";


export const createPlanValidator = type({
  userId: "string",
  priceId: "string",
})

export type createPlanType = typeof createPlanValidator.infer

export const cancelPlanValidator = type({
  userId: "string",
})

export type cancelPlanType = typeof cancelPlanValidator.infer

export  const  upgradeSubscriptionValidator = type({
  userId: "string",
  priceId: "string",
})

export type upgradeSubscriptionType = typeof upgradeSubscriptionValidator.infer

export const userTransactionsHistoryValidator = type({
  userId: "string",
  page: "number",
  pageSize: "number",
  status: "string?",
})

export type userTransactionsHistoryType = typeof userTransactionsHistoryValidator.infer

export const getUserMembershipValidator = type({
  userId: "string",
})

export type getUserMembershipType = typeof getUserMembershipValidator.infer

export const stripeConnectValidator = type({
  userId: "string",
});

export type stripeConnectValidatorType = typeof stripeConnectValidator.infer;



