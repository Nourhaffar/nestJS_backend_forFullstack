import { BadRequestException, Injectable, Req } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { CreateUploadDto } from './dto/create-upload.dto';
import { UpdateUploadDto } from './dto/update-upload.dto';
import { buffer } from 'stream/consumers';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { createWriteStream, promises as fs } from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
@Injectable()
export class UploadService {
  async create(req: FastifyRequest) {
    await fs.mkdir('uploadsTesting', { recursive: true });
    const row: Record<string, string> = {};
    const images: Array<{
      index: number;
      fieldname: string;
      filename: string;
      mimetype: string;
      sizeInBytes: number;
    }> = [];
    const videos: Array<{
      index: number;
      fieldname: string;
      filename: string;
      mimetype: string;
      sizeInBytes: number;
    }> = [];

    for await (const part of req.parts()) {
      if (part.type === 'field') {
        row[part.fieldname] = String(part.value) ?? '';
        continue;
      }
      if (part.type === 'file') {
        const isImage = part.fieldname.match(/^images\[(\d+)]$/);
        const isVideo = part.fieldname.match(/^videos\[(\d+)]$/);
        if (!isImage && !isVideo) {
          throw new BadRequestException(
            `Unexpected file field: ${part.fieldname}`,
          );
        }
        // const buffer = await part.toBuffer();

        if (isImage) {
          await fs.mkdir(`uploads/images`, { recursive: true });
          const targetPath = path.join('uploads/images', part.filename);
          await pipeline(part.file, createWriteStream(targetPath));
          images.push({
            index: +isImage[1],
            fieldname: part.fieldname,
            filename: part.filename,
            mimetype: part.mimetype,
            sizeInBytes: part.file.bytesRead,
          });
        }
        if (isVideo) {
          await fs.mkdir(`uploads/videos`, { recursive: true });
          const targetPath = path.join('uploads/videos', part.filename);
          await pipeline(part.file, createWriteStream(targetPath));
          videos.push({
            index: Number(isVideo[1]),
            fieldname: part.fieldname,
            filename: part.filename,
            mimetype: part.mimetype,
            sizeInBytes: part.file.bytesRead,
          });
        }
      }
    }

    const dto = plainToInstance(CreateUploadDto, row, {
      enableImplicitConversion: false,
    });
    const errors = await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    if (errors.length > 0) {
      throw new BadRequestException(
        errors.map((error) => ({
          field: error.property,
          errors: error.constraints,
        })),
      );
    }

    if (dto.uploadType === 'images') {
      if (images.length === 0) {
        throw new BadRequestException('At least one image!');
      }
      if (videos.length > 0) {
        throw new BadRequestException(
          'Videos are not allowed when uploadType is images',
        );
      }
    }
    if (dto.uploadType === 'videos') {
      if (videos.length === 0) {
        throw new BadRequestException('At least one video is required');
      }

      if (images.length > 0) {
        throw new BadRequestException(
          'Images are not allowed when uploadType is videos',
        );
      }
    }
    //todo : check how
    return {
      message: 'Form uploaded successfully',
      data: {
        form: dto,
        images,
        videos,
      },
    };
  }

  findAll() {
    return `This action returns all upload`;
  }

  findOne(id: number) {
    return `This action returns a #${id} upload`;
  }

  update(id: number, updateUploadDto: UpdateUploadDto) {
    return `This action updates a #${id} upload`;
  }

  remove(id: number) {
    return `This action removes a #${id} upload`;
  }
}
