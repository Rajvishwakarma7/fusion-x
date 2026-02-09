import { stripe } from '../../config/stripe.config.js';
import Organization from '../../models/organization.model.js';
import users from '../../models/user.model.js';
import { upload } from '../../utils/cloudinary.util.js';
import { deleteLocalFile } from '../../utils/common.util.js';
import { HttpStatusCodes as Code } from '../../utils/Enums.utils.js';
import { GenResObj } from '../../utils/responseFormatter.utils.js';
import { createOrganizationType } from './organization.validate.js';

export const createOrganization = async (payload: createOrganizationType) => {
  try {
    const {
      userId,
      profileImage,
      organizationName,
      address,
      zipCode,
      phone,
      location,
    } = payload;

    const checkAvlUser = await users.findById(userId);

    if (!checkAvlUser || checkAvlUser.profileCompleted) {
      if (profileImage) {
        deleteLocalFile(profileImage);
      }
      return GenResObj(Code.NOT_FOUND, false, 'User not found or profile already completed');
    }

    let profileImageUrl = '';

    if (profileImage) {
      const { uploadedImageUrl, publicId } = await upload(profileImage);
      profileImageUrl = uploadedImageUrl;
    }

    const org = await Organization.create({
      userId,
      organizationName,
      profileImage: profileImageUrl,
      address,
      zipCode,
      phone,
      location,
    });

    checkAvlUser.profileCompleted = true
    await checkAvlUser.save()

    return GenResObj(Code.CREATED, true, 'Organization created successfully', org);
  } catch (error) {
    console.log('error in createOrganization :>> ', error);
    throw error;
  }
};
