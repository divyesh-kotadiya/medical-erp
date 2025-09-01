import { Injectable, BadRequestException } from '@nestjs/common';
import { diskStorage, Options } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { Request } from 'express';

@Injectable()
export class FileUploadService {
  getMulterOptions(folder: string): Options {
    const uploadPath = `./uploads/${folder}`;
    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
    }

    return {
      storage: diskStorage({
        destination: uploadPath,
        filename: (
          req: Request,
          file: { originalname: string; fieldname: string },
          cb: (error: Error | null, filename: string) => void,
        ) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (
        req: Request,
        file: { mimetype: string },
        cb: (error: any, acceptFile: boolean) => void,
      ) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return cb(
            new BadRequestException('Only image files are allowed!'),
            false,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    };
  }
}
