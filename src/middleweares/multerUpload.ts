// eslint-disable-next-line @typescript-eslint/no-var-requires
import { Request } from 'express';
import multer from 'multer';

const storage = multer.memoryStorage();
export const upload = multer(
  {
    storage,
    limits: {
      fileSize: 2000000, // 2mb
    },
    fileFilter(req: Request, file,
      callback) {
      if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
        callback(new Error('Please upload an image.'));
      }
      callback(null, true);
    },
  },
);
