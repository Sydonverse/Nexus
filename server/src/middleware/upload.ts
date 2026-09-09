import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { MAX_FILE_SIZE_BYTES, sanitizeFilename } from '../utils/fileValidator';

const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const sanitizedOriginal = sanitizeFilename(file.originalname);
    cb(null, `${uniqueSuffix}-${sanitizedOriginal}`);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES, // 25MB efficiency limit
  },
});
