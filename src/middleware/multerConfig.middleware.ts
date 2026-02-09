import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

    const ext = path.extname(file.originalname); // ✅ KEEP EXTENSION

    cb(null, unique + ext);
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = [
    // Image types
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    // eslint-disable-next-line spellcheck/spell-checker
    'image/svg+xml',
    // Audio types
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/webm',
    'audio/aac',
    'audio/flac',

    // video types
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime',
    
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'));
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
  fileFilter,
});
