import MessageMedia from '../../models/messageMedia.model';
import { upload } from '../../utils/cloudinary.util';

export const uploadMessageMediaHelper = async (media: any) => {
  try {
    return await Promise.all(
      media.map(async (mediaItems: any) => {
        let url = await upload(mediaItems.path);
        return await MessageMedia.create({
          fileName: mediaItems.originalname,
          url: url.uploadedImageUrl,
          mimeType: mediaItems.mimetype,
          size: mediaItems.size,
        });
      })
    );
  } catch (error) {
    console.log('error in uploadMessageMediaHelper :>> ', error);
    throw error;
  }
};
