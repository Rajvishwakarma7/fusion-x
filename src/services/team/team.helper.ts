import TeamMedia from '../../models/teamMedia.model';
import { upload } from '../../utils/cloudinary.util';

export const uploadMedia = async (fileItem: any[], teamId: string) => {
  try {
    const uploadPromises = fileItem.map(async (file: any) => {
      const url = await upload(file.path);

      return TeamMedia.create({
        teamId,
        url: url.uploadedImageUrl,
        size: file.size,
        mimeType: file.mimetype,
        type: file.mimetype.includes('image') ? 'image' : 'video',
      });
    });

    await Promise.all(uploadPromises);
  } catch (error) {
    console.log('error in uploadMedia :>> ', error);
    throw error;
  }
};

