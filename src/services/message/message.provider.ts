import ChatTranscript from '../../models/chatTranscript.model.js';
import Message from '../../models/message.model.js';
import users from '../../models/user.model.js';
import { HttpStatusCodes as Code } from '../../utils/Enums.utils.js';
import { GenResObj } from '../../utils/responseFormatter.utils.js';
import {
  createChatTranscriptType,
  createMessageType,
} from './message.validate.js';

export const createChatTranscript = async (
  payload: createChatTranscriptType
) => {
  try {
    const { type, from, to, lastMessage } = payload;

    if(from.toString() === to.toString()){
      return GenResObj(Code.BAD_REQUEST, false, 'user IDs cannot be the same');
    }

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

export const sendMessage = async (payload: createMessageType) => {
  try {
    const { chatTranscriptId, senderId, text } = payload;
    const chatTranscript = await ChatTranscript.findOne({
      _id: chatTranscriptId,
      participants: senderId,
    });

    if (!chatTranscript) {
      return GenResObj(
        Code.BAD_REQUEST,
        false,
        'Chat transcript not found please create chat transcript first'
      );
    }

    const newMessage = await Message.create({
      chatTranscriptId,
      senderId,
      text,
    });

    return GenResObj(Code.OK, true, 'Message sent successfully', newMessage);
  } catch (error) {
    console.log('error in sendMessage :>> ', error);
    throw error;
  }
};
