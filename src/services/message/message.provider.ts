import ChatTranscript from '../../models/chatTranscript.model.js';
import GroupMember from '../../models/chatParticipants.model.js';
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
  OneToOneValidatorType,
  UploadMessageMediaType,
} from './message.validate.js';

import mongoose from 'mongoose';
import ChatParticipants from '../../models/chatParticipants.model.js';
import { lstat } from 'fs';

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
    const { chatType, from, to, lastMessage, groupName } = payload;

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

      const chatTranscriptParticipantsAvl = await ChatParticipants.aggregate([
        {
          $match: {
            chatType: 'ONE_TO_ONE',
            userId: { $in: [fromId, toId] },
            isDeleted: false,
          },
        },
        {
          $group: {
            _id: '$chatTranscriptId',
            participants: { $addToSet: '$userId' },
          },
        },
        {
          $match: {
            $expr: {
              $eq: [{ $size: '$participants' }, 2],
            },
          },
        },
      ]);

      if (chatTranscriptParticipantsAvl.length > 0) {
        const chatTranscriptId = chatTranscriptParticipantsAvl[0]._id;
        return GenResObj(Code.OK, true, 'Chat transcript already exists', {
          chatTranscriptId,
        });
      }

      const newChatTranscript = await ChatTranscript.create({
        chatType,
        lastMessage,
      });

      await Promise.all([
        ChatParticipants.create({
          chatTranscriptId: newChatTranscript._id,
          chatType,
          userId: fromId,
          joinStatus: 'joined',
        }),
        ChatParticipants.create({
          chatTranscriptId: newChatTranscript._id,
          chatType,
          userId: toId,
          joinStatus: 'joined',
        }),
      ]);

      return GenResObj(
        Code.OK,
        true,
        'Chat transcript created successfully',
        newChatTranscript
      );
    } else if (chatType === 'GROUP') {
      if (!from) {
        return GenResObj(
          Code.BAD_REQUEST,
          false,
          '"groupAdmin" user ID is required for GROUP chat'
        );
      }
      const fromId = new mongoose.Types.ObjectId(from);

      const checkFrom = await users.findById(fromId);

      if (!checkFrom) {
        return GenResObj(
          Code.BAD_REQUEST,
          false,
          'Invalid "groupAdmin" user ID provided'
        );
      }

      const createGroup = await ChatTranscript.create({
        chatType,
        groupName: groupName || 'Unnamed Group',
        groupAdmin: fromId,
        lastMessage,
      });

      // Automatically add the group creator as a member of the group
      await GroupMember.create({
        chatTranscriptId: createGroup._id,
        userId: fromId,
        joinStatus: 'joined',
        chatType,
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

    const isAlreadyParticipant = await ChatParticipants.findOne({
      chatTranscriptId,
      userId,
      chatType: 'GROUP',
    });
    if (isAlreadyParticipant) {
      return GenResObj(
        Code.BAD_REQUEST,
        false,
        `User is already a member of this group with status: ${isAlreadyParticipant.joinStatus}`
      );
    }

    await ChatParticipants.create({
      chatTranscriptId,
      userId,
      joinStatus: 'joined',
      chatType: 'GROUP',
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

    if (media && media.length > 0) {
      await MessageMedia.updateMany(
        { _id: { $in: media } },
        { $set: { messageId: newMessage._id } }
      );
    }
    const msgMedia =
      media && media.length > 0
        ? await MessageMedia.find({ messageId: newMessage._id })
        : [];

    let resObj = {
      media: msgMedia,
      ...newMessage.toObject(),
    };

    await ChatTranscript.updateOne(
      {
        _id: chatTranscriptId,
      },
      {
        lastMessage: text ? text : 'media',
        lastMessageAt: new Date(),
      }
    );

    await ChatParticipants.updateOne(
      {
        chatTranscriptId,
        userId: { $ne: senderId },
      },
      {
        $inc: {
          unreadCount: 1,
        },
      }
    );

    return GenResObj(Code.OK, true, 'Message sent successfully', resObj);
  } catch (error) {
    console.log('error in sendMessage :>> ', error);
    throw error;
  }
};

export const getOneToOneChats = async (payload: OneToOneValidatorType) => {
  try {
    const { userId, page, pageSize, search } = payload;

    const skip = (page - 1) * pageSize;

    const chatOneToOneData = await ChatParticipants.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          status: 'active',
          joinStatus: 'joined',
          chatType: 'ONE_TO_ONE',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'myUser',
          pipeline: [
            {
              $project: {
                _id: 1,
                fullName: 1,
                profileImage: 1,
                email: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$myUser',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'chat_participants',
          localField: 'chatTranscriptId',
          foreignField: 'chatTranscriptId',
          as: 'otherParticipants',
          pipeline: [
            {
              $match: {
                userId: { $ne: new mongoose.Types.ObjectId(userId) },
                status: 'active',
                joinStatus: 'joined',
                chatType: 'ONE_TO_ONE',
              },
            },
            {
              $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'otherUser',
                pipeline: [
                  {
                    $project: {
                      _id: 1,
                      fullName: 1,
                      profileImage: 1,
                      email: 1,
                    },
                  },
                ],
              },
            },
            {
              $unwind: {
                path: '$otherUser',
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$otherParticipants',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'chat_transcripts',
          localField: 'otherParticipants.chatTranscriptId',
          foreignField: '_id',
          as: 'chatTranscript',
          pipeline: [
            {
              $match: {
                isDeleted: false,
                isActive: true,
              },
            },
            {
              $project: { lastMessageAt: 1, lastMessage: 1, chatType: 1 },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$chatTranscript',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          lastMessage: '$chatTranscript.lastMessage',
          lastMessageAt: '$chatTranscript.lastMessageAt',
          chatTranscriptId: '$_id',
          userDetais: '$otherParticipants.otherUser',
          chatType: 1,
          unreadCount: 1,
        },
      },
      {
        $facet: {
          data: [
            { $sort: { lastMessageAt: -1 } },
            { $skip: skip },
            { $limit: pageSize },
          ],
          totalRecords: [{ $count: 'count' }],
        },
      },
    ]);
    const chatOnetoOne = chatOneToOneData[0]?.data ?? [];
    const totalRecords = chatOneToOneData[0]?.totalRecords[0]?.count || 0;
    const totalPages = Math.ceil(totalRecords / pageSize);
    const hasNextPage = page < totalPages;

    const resObj = {
      chatList: chatOnetoOne,
      totalRecords,
      pageSize,
      currentPage: page,
      totalPages,
      hasNextPage,
    };

    return GenResObj(
      Code.OK,
      true,
      'One to one chats-list fetched successfully',
      resObj
    );
  } catch (error) {
    console.log('error in getOneToOneChats :>> ', error);
    throw error;
  }
};
