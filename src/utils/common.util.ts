import fs from "fs";
import path from "path";

/**
 * Deletes a file from local storage
 * @param pathname - Relative or absolute path to the file (e.g., "uploads/image.jpg")
 */
export const deleteLocalFile = (pathname: string): void => {
  try {
    const fullPath = path.resolve(pathname);

    fs.unlink(fullPath, (err) => {
      if (err) {
        console.error(`❌ Failed to delete file at ${fullPath}:`, err.message);
      } else {
        console.log(`✅ File deleted: ${fullPath}`);
      }
    });
  } catch (error) {
    console.warn(`Failed to delete local`, error);
    throw error;
  }
};
