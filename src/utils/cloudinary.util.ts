import dotenv from 'dotenv';
import path from 'path';
dotenv.config();
import { v2 as cloudinary } from 'cloudinary';
import { deleteLocalFile } from './common.util.js';

let uploadedImageUrl;
let publicId;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});


export async function upload(filePath: any) {
  try {
    let ext = path.extname(filePath).toLowerCase();

    // console.log("ext :", ext);
    // console.log("filePath :", filePath);

    const isAudio = [
      '.mp3',
      '.webm',
      '.wav',
      '.aac',
      '.ogg',
      '.flac',
      '.m4a',
    ].includes(ext);

    const options = {
      use_filename: true,
      unique_filename: false,
      resource_type: isAudio ? ('raw' as const) : ('auto' as const),
    };

    const uploadToCloudinary = await cloudinary.uploader.upload(
      filePath,
      options
    );
    // console.log("uploadToCloudinary :", uploadToCloudinary);

    uploadedImageUrl = uploadToCloudinary.secure_url;
    publicId = uploadToCloudinary.public_id;
    deleteLocalFile(filePath);
    return { uploadedImageUrl, publicId };
  } catch (err) {
    console.log('Getting error in upload :', err);
    throw err;
  }
}

export async function removeImageFromCloudinary(url: any) {
  try {
    const publicIdOfThumbURL = extractPublicIdFromUrl(url);
    await cloudinary.uploader.destroy(publicIdOfThumbURL);
  } catch (err) {
    console.log('Getting error in removeImageFromCloudinary', err);
    throw err;
  }
}

export function extractPublicIdFromUrl(url: string): string {
  const pathSegments: string[] = new URL(url).pathname.split('/');
  const publicId = pathSegments[pathSegments.length - 1].split('.')[0];
  return decodeURIComponent(publicId);
}
