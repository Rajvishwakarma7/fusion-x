import ChatTranscript from '../../models/chatTranscript.model.js';
import users from '../../models/user.model.js';
import { HttpStatusCodes as Code } from '../../utils/Enums.utils.js';
import { GenResObj } from '../../utils/responseFormatter.utils.js';
import { createChatTranscriptType } from './message.validate.js';

export const createChatTranscript = async (
  payload: createChatTranscriptType
) => {
  try {
    const { type, from, to, lastMessage } = payload;

    const checFrom = await users.findById(from);
    const checkTo = await users.findById(to);

    if (!checFrom || !checkTo) {
      return GenResObj(Code.BAD_REQUEST, false, 'Invalid user IDs provided');
    }

    const existingChatTranscript = await ChatTranscript.findOne({
      type,
      participants: { $all: [from, to] },
    });

    if (existingChatTranscript) {
      return GenResObj(Code.OK, true, 'Chat transcript already exists', {
        chatTranscriptId: existingChatTranscript._id,
      });
    }

    const newChatTranscript = await ChatTranscript.create({
      type,
      participants: [from, to],
      lastMessage,
    });

    return GenResObj(
      Code.OK,
      true,
      'Chat transcript created successfully',
      newChatTranscript
    );
  } catch (error) {
    console.log('error in createChatTranscript :>> ', error);
    throw error;
  }
};
