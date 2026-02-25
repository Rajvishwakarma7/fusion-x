import { type } from 'arktype';
import { multerFile } from '../../utils/commonInterface.utils';


export const uploadMessageMediaValidator = type({
  messageMedia: multerFile.array()
});

export type UploadMessageMediaType = typeof uploadMessageMediaValidator.infer;

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
  media: 'string[]',
});

export type createMessageType = typeof messageValidator.infer;
