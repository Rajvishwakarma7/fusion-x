import ChatTranscript from '../../models/chatTranscript.model.js';
import GroupMember from '../../models/groupMember.model.js';
import Message from '../../models/message.model.js';
import MessageMedia from '../../models/messageMedia.model.js';
import users from '../../models/user.model.js';
import { HttpStatusCodes as Code } from '../../utils/Enums.utils.js';
import { GenResObj } from '../../utils/responseFormatter.utils.js';
import { uploadMessageMediaHelper } from './message.helper.js';
import {
  CreateChatTranscriptType,
  createMessageType,
  JoinGroupType,
  UploadMessageMediaType,
} from './message.validate.js';

import mongoose from 'mongoose';

export const uploadMessageMedia = async (payload: UploadMessageMediaType) => {
  try {
    const { messageMedia } = payload;
    if (messageMedia.length === 0) {
      return GenResObj(Code.BAD_REQUEST, false, 'Media is required');
    }
    const mediaFiles = await uploadMessageMediaHelper(messageMedia);
    return GenResObj(Code.OK, true, 'Media uploaded successfully', mediaFiles);
  } catch (error) {
    sendMessage;
    console.log('error in uploadMessageMedia :>> ', error);
    throw error;
  }
};

export const createChatTranscript = async (
  payload: CreateChatTranscriptType
) => {
  try {
    const { chatType, from, to, lastMessage, groupName, groupAdmin } = payload;

    if (chatType === 'ONE_TO_ONE') {
      if (!from || !to) {
        return GenResObj(
          Code.BAD_REQUEST,
          false,
          'Both "from" and "to" user IDs are required for ONE_TO_ONE chat'
        );
      }

      const fromId = new mongoose.Types.ObjectId(from);
      const toId = new mongoose.Types.ObjectId(to);

      if (fromId.equals(toId)) {
        return GenResObj(
          Code.BAD_REQUEST,
          false,
          'User IDs cannot be the same'
        );
      }

      const [checkFrom, checkTo] = await Promise.all([
        users.findById(fromId),
        users.findById(toId),
      ]);

      if (!checkFrom || !checkTo) {
        return GenResObj(Code.BAD_REQUEST, false, 'Invalid user IDs provided');
      }

      // 🔒 Prevent duplicate ONE_TO_ONE chats
      const existingChatTranscript = await ChatTranscript.findOne({
        chatType: 'ONE_TO_ONE',
        participants: { $all: [fromId, toId] },
        isDeleted: false,
      });

      if (existingChatTranscript) {
        return GenResObj(Code.OK, true, 'Chat transcript already exists', {
          chatTranscriptId: existingChatTranscript._id,
        });
      }

      const newChatTranscript = await ChatTranscript.create({
        chatType,
        participants: [fromId, toId],
        lastMessage,
      });

      return GenResObj(
        Code.OK,
        true,
        'Chat transcript created successfully',
        newChatTranscript
      );
    } else if (chatType === 'GROUP') {
      if (!groupAdmin) {
        return GenResObj(
          Code.BAD_REQUEST,
          false,
          '"groupAdmin" user ID is required for GROUP chat'
        );
      }

      const createGroup = await ChatTranscript.create({
        chatType,
        participants: [],
        groupName: groupName || 'Unnamed Group',
        groupAdmin: new mongoose.Types.ObjectId(groupAdmin),
        lastMessage,
      });

      // Automatically add the group creator as a member of the group
      await GroupMember.create({
        groupId: createGroup._id,
        userId: new mongoose.Types.ObjectId(groupAdmin),
        status: 'active',
        joinStatus: 'joined',
      });

      return GenResObj(
        Code.OK,
        true,
        'Group chat transcript created successfully',
        createGroup
      );
    }
    return GenResObj(
      Code.BAD_REQUEST,
      false,
      'failed to create chat transcript'
    );
  } catch (error) {
    console.log('error in createChatTranscript :>> ', error);
    throw error;
  }
};

export const joinGroup = async (payload: JoinGroupType) => {
  try {
    const { chatTranscriptId, userId } = payload;

    const groupAvl = await ChatTranscript.findOne({
      _id: chatTranscriptId,
      chatType: 'GROUP',
      isDeleted: false,
      isActive: true,
    });

    if (!groupAvl) {
      return GenResObj(
        Code.BAD_REQUEST,
        false,
        'Group not found or inactive or deleted'
      );
    }

    const isAlreadyParticipant = await GroupMember.findOne({
      groupId: chatTranscriptId,
      userId,
      status: 'active',
    });
    if (isAlreadyParticipant) {
      return GenResObj(
        Code.BAD_REQUEST,
        false,
        `User is already a member of this group with status: ${isAlreadyParticipant.joinStatus}`
      );
    }

    await GroupMember.create({
      groupId: chatTranscriptId,
      userId,
      status: 'active',
      joinStatus: 'joined',
    });

    return GenResObj(Code.OK, true, 'Group joined successfully');
  } catch (error) {
    console.log('error in joinGroup :>> ', error);
    throw error;
  }
};

export const sendMessage = async (payload: createMessageType) => {
  try {
    const { chatTranscriptId, senderId, text, media } = payload;
    const chatTranscript = await ChatTranscript.findOne({
      _id: chatTranscriptId,
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

    if (media.length > 0) {
      await MessageMedia.updateMany(
        { _id: { $in: media } },
        { $set: { messageId: newMessage._id } }
      );
    }
    const msgMedia =
      media.length > 0
        ? await MessageMedia.find({ messageId: newMessage._id })
        : [];
        
    let resObj = {
      media: msgMedia,
      ...newMessage.toObject(),
    };

    return GenResObj(Code.OK, true, 'Message sent successfully', resObj);
  } catch (error) {
    console.log('error in sendMessage :>> ', error);
    throw error;
  }
};
