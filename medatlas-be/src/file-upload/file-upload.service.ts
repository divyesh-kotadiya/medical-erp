import { Injectable } from '@nestjs/common';
import { diskStorage, Options } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { Request } from 'express';
import { ALLOWED_FILE_TYPES } from '../modules/Documents/types/document.constants';

@Injectable()
export class FileUploadService {
  handleFileUpload(file: Express.Multer.File, folder: string) {
    return {
      path: `/uploads/${folder}/${file.filename}`,
      filename: file.filename,
    };
  }

  getMulterOptions(folder: string): Options {
    const uploadPath = `./uploads/${folder}`;
    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
    }

    return {
      storage: diskStorage({
        destination: uploadPath,
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req: Request, file: Express.Multer.File, cb) => {
        const fileExt = file.originalname.split('.').pop()?.toLowerCase() || '';
        if (!ALLOWED_FILE_TYPES.includes(fileExt as any)) {
          return cb(new Error(`Invalid file type: ${fileExt}`) as any, false);
        }
        cb(null, true);
      },
      limits: { fileSize: 50 * 1024 * 1024 },
    };
  }
}
