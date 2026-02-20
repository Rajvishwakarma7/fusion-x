import { type } from "arktype";


export const chatTranscriptValidator = type({
  type: "string",
  from: "string",
  to: "string",
  lastMessage: "string",
})

export type createChatTranscriptType = typeof chatTranscriptValidator.infer

export const messageValidator = type({
  chatTranscriptId: "string",
  senderId: "string",
  text: "string",
})

export type createMessageType = typeof messageValidator.infer