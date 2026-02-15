import Organization from '../../models/organization.model.js';
import Team from '../../models/team.model.js';
import TeamMedia from '../../models/teamMedia.model.js';
import {
  removeImageFromCloudinary,
  upload,
} from '../../utils/cloudinary.util.js';
import { deleteLocalFile } from '../../utils/common.util.js';
import { HttpStatusCodes as Code } from '../../utils/Enums.utils.js';
import { GenResObj } from '../../utils/responseFormatter.utils.js';
import { uploadMedia } from './team.helper.js';
import {
  createTeamType,
  deleteTeamMediaType,
  getAllTeamsType,
  getTeamMediaType,
  updateTeamMediaType,
  updateTeamType,
  uploadTeamMediaType,
} from './team.validate.js';

export const getAllTeamsWithMedia = async (payload: getAllTeamsType) => {
  try {
    const { page, pageSize, search } = payload;

    const skip = (page - 1) * pageSize;

    const trimmedSearch = search?.trim() ?? null;

    const teamData = await Team.aggregate([
      {
        $lookup: {
          from: 'organizations',
          localField: 'organizationId',
          foreignField: '_id',
          as: 'organization',
          pipeline: [
            {
              $match: {
                isDeleted: false,
                isActive: true,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$organization',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup: {
          from: 'team_medias',
          localField: '_id',
          foreignField: 'teamId',
          as: 'teamPhotos',
          pipeline: [
            {
              $match: {
                type: 'image',
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'team_medias',
          localField: '_id',
          foreignField: 'teamId',
          as: 'teamVideos',
          pipeline: [
            {
              $match: {
                type: 'video',
              },
            },
          ],
        },
      },
      ...(trimmedSearch
        ? [
            {
              $match: {
                $or: [
                  { teamName: { $regex: trimmedSearch, $options: 'i' } },
                  {
                    'organization.organizationName': {
                      $regex: trimmedSearch,
                      $options: 'i',
                    },
                  },
                ],
              },
            },
          ]
        : []),

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

    const teams = teamData[0]?.data;
    const totalRecords = teamData[0]?.totalRecords[0]?.count || 0;
    const totalPages = Math.ceil(totalRecords / pageSize);
    const hasNextPage = page < totalPages;

    const resObj = {
      teams,
      totalRecords,
      pageSize,
      currentPage: page,
      totalPages,
      hasNextPage,
    };

    return GenResObj(Code.OK, true, 'Team created successfully', resObj);
  } catch (error) {
    console.log('error in createTeam :>> ', error);
    throw error;
  }
};

export const getAllTeams = async (payload: getAllTeamsType) => {
  try {
    const { page, pageSize, search } = payload;

    const skip = (page - 1) * pageSize;

    const trimmedSearch = search?.trim() ?? null;

    const teamData = await Team.aggregate([
      {
        $lookup: {
          from: 'organizations',
          localField: 'organizationId',
          foreignField: '_id',
          as: 'organization',
          pipeline: [
            {
              $match: {
                isDeleted: false,
                isActive: true,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$organization',
          preserveNullAndEmptyArrays: false,
        },
      },

      ...(trimmedSearch
        ? [
            {
              $match: {
                $or: [
                  { teamName: { $regex: trimmedSearch, $options: 'i' } },
                  {
                    'organization.organizationName': {
                      $regex: trimmedSearch,
                      $options: 'i',
                    },
                  },
                ],
              },
            },
          ]
        : []),

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

    const teams = teamData[0]?.data;
    const totalRecords = teamData[0]?.totalRecords[0]?.count || 0;
    const totalPages = Math.ceil(totalRecords / pageSize);
    const hasNextPage = page < totalPages;

    const resObj = {
      teams,
      totalRecords,
      pageSize,
      currentPage: page,
      totalPages,
      hasNextPage,
    };

    return GenResObj(Code.OK, true, 'Team created successfully', resObj);
  } catch (error) {
    console.log('error in createTeam :>> ', error);
    throw error;
  }
};

export const createTeamWithMedia = async (payload: createTeamType) => {
  try {
    const {
      userId,
      teamName,
      ourStory,
      teamGoals,
      achievement,
      profileImage,
      coverImage,
      teamPhotos,
      teamVideos,
    } = payload;

    const org = await Organization.findOne({ userId }).lean();
    if (!org || org.isDeleted) {
      return GenResObj(
        Code.NOT_FOUND,
        false,
        'Organization not found or deleted'
      );
    }

    const teamPayload: any = {
      userId,
      organizationId: org._id,
      teamName,
      ourStory,
      teamGoals,
      achievement,
    };

    if (profileImage.length > 0) {
      const profileImageUrl = await upload(profileImage[0].path);
      teamPayload.profileImage = profileImageUrl.uploadedImageUrl;
    }
    if (coverImage.length > 0) {
      const coverImageUrl = await upload(coverImage[0].path);
      teamPayload.coverImage = coverImageUrl.uploadedImageUrl;
    }

    const team = new Team(teamPayload);
    await team.save();

    if (teamPhotos.length > 0) {
      await uploadMedia(teamPhotos, team._id.toString());
    }
    if (teamVideos.length > 0) {
      await uploadMedia(teamVideos, team._id.toString());
    }

    return GenResObj(Code.OK, true, 'Team created successfully', team);
  } catch (error) {
    console.log('error in createTeam :>> ', error);
    throw error;
  }
};

export const createTeam = async (payload: createTeamType) => {
  try {
    const {
      userId,
      teamName,
      ourStory,
      teamGoals,
      achievement,
      profileImage,
      coverImage,
    } = payload;

    const org = await Organization.findOne({ userId }).lean();
    if (!org || org.isDeleted) {
      return GenResObj(
        Code.NOT_FOUND,
        false,
        'Organization not found or deleted'
      );
    }

    const teamPayload: any = {
      userId,
      organizationId: org._id,
      teamName,
      ourStory,
      teamGoals,
      achievement,
    };

    if (profileImage.length > 0) {
      const profileImageUrl = await upload(profileImage[0].path);
      teamPayload.profileImage = profileImageUrl.uploadedImageUrl;
    }
    if (coverImage.length > 0) {
      const coverImageUrl = await upload(coverImage[0].path);
      teamPayload.coverImage = coverImageUrl.uploadedImageUrl;
    }

    const team = await Team.create(teamPayload);

    return GenResObj(Code.OK, true, 'Team created successfully', team);
  } catch (error) {
    console.log('error in createTeam :>> ', error);
    throw error;
  }
};

export const updateTeam = async (payload: updateTeamType) => {
  try {
    const {
      userId,
      teamId,
      teamName,
      ourStory,
      teamGoals,
      achievement,
      profileImage,
      coverImage,
    } = payload;

    const team = await Team.findById(teamId);
    if (!team) {
      if (profileImage) {
        deleteLocalFile(profileImage[0].path as string);
      }
      if (coverImage) {
        deleteLocalFile(coverImage[0].path as string);
      }

      return GenResObj(Code.NOT_FOUND, false, 'Team not found');
    }

    const teamPayload: any = {
      teamName,
      ourStory,
      teamGoals,
      achievement,
    };

    if (profileImage && profileImage.length > 0) {
      const profileImageUrl = await upload(profileImage[0].path);
      teamPayload.profileImage = profileImageUrl.uploadedImageUrl;
    }
    if (coverImage && coverImage.length > 0) {
      const coverImageUrl = await upload(coverImage[0].path);
      teamPayload.coverImage = coverImageUrl.uploadedImageUrl;
    }

    const teamUpdte = await Team.findByIdAndUpdate(
      teamId,
      {
        $set: teamPayload,
      },
      { new: true }
    );

    return GenResObj(Code.OK, true, 'Team updated successfully', teamUpdte);
  } catch (error) {
    console.log('error in updateTeam :>> ', error);
    throw error;
  }
};

export const uploadTeamMedia = async (payload: uploadTeamMediaType) => {
  try {
    const { teamId, teamPhotos, teamVideos } = payload;

    let team = await Team.findById(teamId).lean();
    if (!team) {
      return GenResObj(Code.NOT_FOUND, false, 'Team not found');
    }

    const tasks: Promise<void>[] = [];

    if (teamPhotos.length > 0) {
      tasks.push(uploadMedia(teamPhotos, teamId));
    }

    if (teamVideos.length > 0) {
      tasks.push(uploadMedia(teamVideos, teamId));
    }

    await Promise.all(tasks);

    return GenResObj(Code.OK, true, 'Team media uploaded successfully');
  } catch (error) {
    console.log(' error in uploadTeamMedia :>> ', error);
    throw error;
  }
};

export const updateTeamMedia = async (payload: updateTeamMediaType) => {
  try {
    const { teamMediaId, teamMedia } = payload;

    const teamMediaData = await TeamMedia.findById(teamMediaId);
    if (!teamMediaData) {
      if (teamMedia.length > 0) {
        deleteLocalFile(teamMedia[0]?.path as string);
      }
      return GenResObj(Code.NOT_FOUND, false, 'Team media not found');
    }

    if (teamMedia.length > 0) {
      removeImageFromCloudinary(teamMediaData.url);
      const teamMediaUrl = await upload(teamMedia[0].path);
      teamMediaData.url = teamMediaUrl.uploadedImageUrl;
      teamMediaData.size = teamMedia[0].size;
      teamMediaData.mimeType = teamMedia[0].mimetype;
      teamMediaData.type = teamMedia[0].mimetype.includes('image')
        ? 'image'
        : 'video';

      await teamMediaData.save();
    }

    return GenResObj(Code.OK, true, 'Team media uploaded successfully');
  } catch (error) {
    console.log(' error in uploadTeamMedia :>> ', error);
    throw error;
  }
};

export const deleteTeamMedia = async (payload: deleteTeamMediaType) => {
  try {
    const { teamMediaId } = payload;

    const teamMedia = await TeamMedia.findByIdAndDelete(teamMediaId);
    if (!teamMedia) {
      return GenResObj(Code.NOT_FOUND, false, 'Team media not found');
    }

    await removeImageFromCloudinary(teamMedia.url);

    return GenResObj(Code.OK, true, 'Team media deleted successfully');
  } catch (error) {
    console.log('error in deleteTeamMedia :>> ', error);
    throw error;
  }
};

export const getTeamMedia = async (paylod: getTeamMediaType) => {
  try {
    const { teamId, page, pageSize } = paylod;

    const skip = (page - 1) * pageSize;

    const team = await Team.findById(teamId).lean();
    if (!team) {
      return GenResObj(Code.NOT_FOUND, false, 'Team not found');
    }

    const teamMedia = await TeamMedia.find({ teamId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean();

    const totalRecords = await TeamMedia.countDocuments({ teamId });
    const totalPages = Math.ceil(totalRecords / pageSize);
    const hasNextPage = page < totalPages;

    const resObj = {
      teamMedia,
      totalRecords,
      pageSize,
      currentPage: page,
      totalPages,
      hasNextPage,
    };

    return GenResObj(Code.OK, true, 'Team media fetched successfully', resObj);
  } catch (error) {
    console.log('error in getTeamMedia :>> ', error);
    throw error;
  }
};
