import { type } from "arktype";

export const createOrganizationValidator = type({
  userId: "string",
  organizationName: "string",
  profileImage: "string",
  address: "string",
  zipCode: "string",
  phone: "string",
  location: "string",
  
})

export type createOrganizationType = typeof createOrganizationValidator.infer

export const updateOrganizationValidator = type({
  organizationId: "string",
  organizationName: "string",
  "profileImage?": "string",
  address: "string",
  zipCode: "string",
  phone: "string",
  location: "string",
  
})

export type updateOrganizationType = typeof updateOrganizationValidator.infer

