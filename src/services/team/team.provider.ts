import Organization from '../../models/organization.model.js';
import Team from '../../models/team.model.js';
import { upload } from '../../utils/cloudinary.util.js';
import { HttpStatusCodes as Code } from '../../utils/Enums.utils.js';
import { GenResObj } from '../../utils/responseFormatter.utils.js';
import { uploadMedia } from './team.helper.js';
import { createTeamType } from './team.validate.js';

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

    return GenResObj(Code.OK, true, 'Team created successfully',team);
  } catch (error) {
    console.log('error in createTeam :>> ', error);
    throw error;
  }
};
