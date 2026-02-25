import { type } from 'arktype';

export const chatTranscriptValidator = type({
  chatType: '"ONE_TO_ONE" | "GROUP"',
  from: 'string?',
  to: 'string?',
  lastMessage: 'string?',
  groupName: 'string?',
  groupAdmin: 'string?',
});

export type CreateChatTranscriptType = typeof chatTranscriptValidator.infer;

export const joinGroupValidator = type({
  userId: 'string',
  chatTranscriptId: 'string',
});
export type JoinGroupType = typeof joinGroupValidator.infer;

export const messageValidator = type({
  chatTranscriptId: 'string',
  senderId: 'string',
  text: 'string',
});

export type createMessageType = typeof messageValidator.infer;
