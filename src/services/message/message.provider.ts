import ChatTranscript from '../../models/chatTranscript.model.js';
import Message from '../../models/message.model.js';
import MessageMedia from '../../models/messageMedia.model.js';
import users from '../../models/user.model.js';
import { HttpStatusCodes as Code } from '../../utils/Enums.utils.js';
import { GenResObj } from '../../utils/responseFormatter.utils.js';
import {
  checkBlockStatus,
  uploadMessageMediaHelper,
} from './message.helper.js';

import {
  blockUserValidatorType,
  chatHistoryValidatorType,
  CreateChatTranscriptType,
  createMessageType,
  GroupChatValidatorType,
  GroupListValidatorType,
  JoinGroupType,
  OneToOneListValidatorType,
  UploadMessageMediaType,
} from './message.validate.js';

import mongoose from 'mongoose';
import ChatParticipants from '../../models/chatParticipants.model.js';
import UserBlock from '../../models/userBlock.model.js';

export const uploadMessageMedia = async (payload: UploadMessageMediaType) => {
  try {
    const { messageMedia } = payload;
    if (messageMedia.length === 0) {
      return GenResObj(Code.BAD_REQUEST, false, 'Media is required');
    }
    const mediaFiles = await uploadMessageMediaHelper(messageMedia);
    return GenResObj(Code.OK, true, 'Media uploaded successfully', mediaFiles);
  } catch (error) {
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
          joinedAt: new Date(),
        }),
        ChatParticipants.create({
          chatTranscriptId: newChatTranscript._id,
          chatType,
          userId: toId,
          joinStatus: 'joined',
          joinedAt: new Date(),
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
      await ChatParticipants.create({
        chatTranscriptId: createGroup._id,
        userId: fromId,
        joinStatus: 'joined',
        chatType,
        joinedAt: new Date(),
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
      joinedAt: new Date(),
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
    }).lean();

    if (!chatTranscript) {
      return GenResObj(
        Code.BAD_REQUEST,
        false,
        'Chat transcript not found please create chat transcript first'
      );
    }

    // check user join status
    const userJoinStatus = await ChatParticipants.findOne({
      chatTranscriptId,
      userId: senderId,
      status: 'active',
      isDeleted: false,
      joinStatus: 'joined',
    });

    if (!userJoinStatus) {
      return GenResObj(
        Code.BAD_REQUEST,
        false,
        'User is not a member of this chat transcript or inactive or deleted'
      );
    }

    const chatType = chatTranscript.chatType;

    // check block status
    if (chatType === 'ONE_TO_ONE') {
      const isBlocked = await checkBlockStatus(senderId, chatTranscriptId);
      if(isBlocked.status){
        return GenResObj(Code.BAD_REQUEST, false, isBlocked.message);
      }
    }

    const newMessage = await Message.create({
      chatTranscriptId,
      senderId,
      text,
    });

    const senderInfo = await users
      .findById(senderId)
      .select('name email profileImage')
      .lean();

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

    let resObj: any = {
      media: msgMedia,
      ...newMessage.toObject(),
    };

    if (chatType === 'ONE_TO_ONE') {
      resObj.senderInfo = senderInfo;
    }

    await ChatTranscript.updateOne(
      {
        _id: chatTranscriptId,
      },
      {
        lastMessage: text ? text : 'media',
        lastMessageAt: new Date(),
        lastMessageSendBy: senderId,
      }
    );

    await ChatParticipants.updateMany(
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

export const getOneToOneChatsList = async (
  payload: OneToOneListValidatorType
) => {
  try {
    const { userId, page, pageSize, search } = payload;
    const trimmedSearch = search?.trim() ?? null;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const skip = (page - 1) * pageSize;

    const chatOneToOneData = await ChatParticipants.aggregate([
      {
        $match: {
          userId: userObjectId,
          status: 'active',
          joinStatus: 'joined',
          chatType: 'ONE_TO_ONE',
        },
      },
      // other participants
      {
        $lookup: {
          from: 'chat_participants',
          localField: 'chatTranscriptId',
          foreignField: 'chatTranscriptId',
          as: 'otherParticipants',
          pipeline: [
            {
              $match: {
                userId: { $ne: userObjectId },
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

      // chat transcript
      {
        $lookup: {
          from: 'chat_transcripts',
          localField: 'chatTranscriptId',
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
              $project: { lastMessageAt: 1, lastMessage: 1 },
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
          chatTranscriptId: '$chatTranscriptId',
          senderInfo: '$otherParticipants.otherUser',
          chatType: 1,
          unreadCount: 1,
        },
      },
      ...(trimmedSearch
        ? [
            {
              $match: {
                'senderInfo.fullName': { $regex: trimmedSearch, $options: 'i' },
              },
            },
          ]
        : []),
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

export const getMyGroupChatsList = async (payload: GroupListValidatorType) => {
  try {
    const { userId, page, pageSize, search } = payload;
    const trimmedSearch = search?.trim() ?? null;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const skip = (page - 1) * pageSize;

    const chatGroupData = await ChatTranscript.aggregate([
      {
        $match: {
          isDeleted: false,
          isActive: true,
          chatType: 'GROUP',
        },
      },
      {
        $lookup: {
          from: 'chat_participants',
          localField: '_id',
          foreignField: 'chatTranscriptId',
          as: 'participants',
          pipeline: [
            {
              $match: {
                userId: userObjectId,
                status: 'active',
                joinStatus: 'joined',
                chatType: 'GROUP',
              },
            },
          ],
        },
      },

      {
        $unwind: {
          path: '$participants',
          preserveNullAndEmptyArrays: false,
        },
      },
      ...(trimmedSearch
        ? [
            {
              $match: {
                groupName: { $regex: trimmedSearch, $options: 'i' },
              },
            },
          ]
        : []),
      {
        $facet: {
          data: [
            { $sort: { lastMessageAt: -1 } },
            { $skip: skip },
            { $limit: pageSize },
            {
              $project: {
                _id: 1,
                chatTranscriptId: '$_id',
                groupName: 1,
                groupProfileImage: 1,
                lastMessage: 1,
                lastMessageAt: 1,
                unreadCount: '$participants.unreadCount',
                chatType: 1,
              },
            },
          ],
          totalRecords: [{ $count: 'count' }],
        },
      },
    ]);

    const chatOnetoOne = chatGroupData[0]?.data ?? [];
    const totalRecords = chatGroupData[0]?.totalRecords[0]?.count || 0;
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

    return GenResObj(Code.OK, true, 'Group-list fetched successfully', resObj);
  } catch (error) {
    console.log('error in getMyGroupChats :>> ', error);
    throw error;
  }
};

export const getOtherGroupChatsList = async (
  payload: GroupListValidatorType
) => {
  try {
    const { userId, page, pageSize, search } = payload;
    const trimmedSearch = search?.trim() ?? null;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const skip = (page - 1) * pageSize;

    const chatGroupData = await ChatTranscript.aggregate([
      {
        $match: {
          isDeleted: false,
          isActive: true,
          chatType: 'GROUP',
        },
      },
      {
        $lookup: {
          from: 'chat_participants',
          localField: '_id',
          foreignField: 'chatTranscriptId',
          as: 'userJoined',
          pipeline: [
            {
              $match: {
                userId: userObjectId,
                chatType: 'GROUP',
                status: 'active',
                joinStatus: 'joined',
                isDeleted: false,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          isJoined: {
            $cond: [{ $gt: [{ $size: '$userJoined' }, 0] }, true, false],
          },
        },
      },
      {
        $match: {
          isJoined: false,
        },
      },
      {
        $lookup: {
          from: 'chat_participants',
          localField: '_id',
          foreignField: 'chatTranscriptId',
          as: 'participants',
          pipeline: [
            {
              $match: {
                status: 'active',
                joinStatus: 'joined',
                chatType: 'GROUP',
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'chat_participants',
          localField: '_id',
          foreignField: 'chatTranscriptId',
          as: 'lastThreeParticipants',
          pipeline: [
            {
              $match: {
                status: 'active',
                joinStatus: 'joined',
                chatType: 'GROUP',
              },
            },
            {
              $sort: {
                createdAt: -1,
              },
            },
            {
              $limit: 3,
            },
            {
              $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'user',
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
                path: '$user',
                preserveNullAndEmptyArrays: false,
              },
            },
            { $replaceRoot: { newRoot: '$user' } },
          ],
        },
      },
      ...(trimmedSearch
        ? [
            {
              $match: {
                groupName: { $regex: trimmedSearch, $options: 'i' },
              },
            },
          ]
        : []),
      {
        $facet: {
          data: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: pageSize },
            {
              $project: {
                _id: 1,
                groupName: 1,
                groupProfileImage: 1,
                memberCount: { $size: '$participants' },
                lastThreeParticipants: 1,
                chatTranscriptId: '$_id',
                chatType: 1,
              },
            },
          ],
          totalRecords: [{ $count: 'count' }],
        },
      },
    ]);

    const otherGroupList = chatGroupData[0]?.data ?? [];
    const totalRecords = chatGroupData[0]?.totalRecords[0]?.count || 0;
    const totalPages = Math.ceil(totalRecords / pageSize);
    const hasNextPage = page < totalPages;

    const resObj = {
      otherGroupList,
      totalRecords,
      pageSize,
      currentPage: page,
      totalPages,
      hasNextPage,
    };

    return GenResObj(
      Code.OK,
      true,
      'Other Group-list fetched successfully',
      resObj
    );
  } catch (error) {
    console.log('error in getOtherGroupChats :>> ', error);
    throw error;
  }
};

export const getHeaderInfo = async (payload: GroupChatValidatorType) => {
  try {
    const { userId, chatTranscriptId } = payload;

    const chatTranscript = await ChatTranscript.findOne({
      _id: chatTranscriptId,
      isDeleted: false,
    }).lean();

    if (!chatTranscript) {
      return GenResObj(Code.BAD_REQUEST, false, 'Chat transcript not found');
    }

    const chatType = chatTranscript?.chatType;

    if (chatType === 'ONE_TO_ONE') {
      const joinedUser = await ChatParticipants.findOne({
        chatTranscriptId,
        chatType: 'ONE_TO_ONE',
        userId: { $ne: userId },
        status: 'active',
        isDeleted: false,
        joinStatus: 'joined',
      })
        .populate('userId', 'fullName profileImage email')
        .lean();

      if (!joinedUser) {
        return GenResObj(Code.BAD_REQUEST, false, 'Chat transcript not found');
      }

      const isBlocked = await checkBlockStatus(userId, chatTranscriptId);

      const resObj = {
        chatTranscriptId,
        chatType,
        userInfo: joinedUser.userId,
        isBlocked,
      };

      return GenResObj(
        Code.OK,
        true,
        'Header info fetched successfully',
        resObj
      );
      
    } else if (chatType === 'GROUP') {
      const topThreeUsers = await ChatParticipants.find({
        chatTranscriptId,
        chatType: 'GROUP',
        isDeleted: false,
        joinStatus: 'joined',
      })
        .sort({ createdAt: -1 })
        .populate('userId', 'fullName profileImage email')
        .limit(3)
        .lean();
      const users = topThreeUsers?.map((p) => p?.userId);

      const totalUsers = await ChatParticipants.countDocuments({
        chatTranscriptId,
        chatType: 'GROUP',
        isDeleted: false,
        joinStatus: 'joined',
      });
      const resObj = {
        ...chatTranscript,
        users,
        totalUsers,
      };
      return GenResObj(
        Code.OK,
        true,
        'Header info fetched successfully',
        resObj
      );
    }
    return GenResObj(Code.BAD_REQUEST, false, 'Chat transcript not found');
  } catch (error) {
    console.log('error in getHeaderInfo :>> ', error);
    throw error;
  }
};

export const getChatHistory = async (payload: chatHistoryValidatorType) => {
  try {
    const { userId, chatTranscriptId, page, pageSize } = payload;

    const skip = (page - 1) * pageSize;

    const chatTranscript = await ChatTranscript.findOne({
      _id: chatTranscriptId,
      isDeleted: false,
    }).lean();

    if (!chatTranscript) {
      return GenResObj(Code.BAD_REQUEST, false, 'Chat transcript not found');
    }

    const messageData = await Message.aggregate([
      {
        $match: {
          chatTranscriptId: new mongoose.Types.ObjectId(chatTranscriptId),
        },
      },

      {
        $lookup: {
          from: 'messagemedias',
          localField: '_id',
          foreignField: 'messageId',
          as: 'messageMedia',
        },
      },

      {
        $lookup: {
          from: 'users',
          localField: 'senderId',
          foreignField: '_id',
          as: 'senderInfo',
          pipeline: [
            {
              $project: {
                _id: 1,
                fullName: 1,
                profileImage: 1,
              },
            },
          ],
        },
      },

      {
        $unwind: {
          path: '$senderInfo',
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $addFields: {
          isYou: {
            $eq: ['$senderId', new mongoose.Types.ObjectId(userId)],
          },
        },
      },

      {
        $facet: {
          data: [
            {
              $sort: {
                createdAt: -1,
              },
            },
            {
              $skip: skip,
            },
            {
              $limit: pageSize,
            },
          ],
          totalRecords: [
            {
              $count: 'count',
            },
          ],
        },
      },
    ]);

    const message = messageData[0]?.data ?? [];
    const totalRecords = messageData[0]?.totalRecords[0]?.count || 0;
    const totalPages = Math.ceil(totalRecords / pageSize);
    const hasNextPage = page < totalPages;

    const resObj = {
      message,
      totalRecords,
      pageSize,
      currentPage: page,
      totalPages,
      hasNextPage,
    };

    return GenResObj(
      Code.OK,
      true,
      'Chat history fetched successfully',
      resObj
    );
  } catch (error) {
    console.log('error in getChatHistory :>> ', error);
    throw error;
  }
};

export const blockUser = async (payload: blockUserValidatorType) => {
  try {
    const { userId, blockedUser, isBlock, blockReason } = payload;

    if (userId === blockedUser) {
      return GenResObj(Code.BAD_REQUEST, false, 'You can not block yourself');
    }

    const avlUser = await users.findOne({ _id: blockedUser });
    if (!avlUser) {
      return GenResObj(Code.BAD_REQUEST, false, 'User not found, not able to block');
    }

    if (isBlock) {
      const isAlreadyBlocked = await UserBlock.findOne({
        blockedBy: userId,
        blockedUser,
      });
      if (isAlreadyBlocked) {
        return GenResObj(
          Code.BAD_REQUEST,
          false,
          'User is already blocked by you'
        );
      }

      await UserBlock.create({
        blockedBy: userId,
        blockedUser,
        blockReason,
      });
      return GenResObj(Code.OK, true, 'User blocked successfully');
    } else {
      const isBlocked = await UserBlock.findOne({
        blockedBy: userId,
        blockedUser,
      });
      if (!isBlocked) {
        return GenResObj(
          Code.BAD_REQUEST,
          false,
          'User is already unblocked'
        );
      }

      await UserBlock.deleteOne({
        blockedBy: userId,
        blockedUser,
      });
      return GenResObj(Code.OK, true, 'User unblocked successfully');
    }
  } catch (error) {
    console.log('error in blockUser :>> ', error);
    throw error;
  }
};
