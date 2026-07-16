import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsInt,
  Min,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export type UploadType = 'images' | 'videos';

export class CreateUploadDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  age: number;

  @IsString()
  @IsNotEmpty()
  section: string;

  @IsIn(['images', 'videos'], {
    message: 'uploadType must be either "images" or "videos"',
  })
  uploadType: UploadType;
}
