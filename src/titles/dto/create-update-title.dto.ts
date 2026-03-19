import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { TitleType, Status } from '@prisma/client';

export class CreateUpdateTitleDto {
  @ApiProperty({ enum: TitleType, description: 'Тип тайтла' })
  @IsEnum(TitleType)
  type: TitleType;

  @ApiProperty({ description: 'Название тайтла' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ description: 'Описание тайтла' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ description: 'Ссылка на обложку' })
  @IsOptional()
  @IsString()
  coverUrl?: string;

  @ApiPropertyOptional({ description: 'Ссылка на внешний ресурс' })
  @IsOptional()
  @IsString()
  externalUrl?: string;

  @ApiPropertyOptional({
    example: 12,
    description: 'Всего единиц (эпизоды, главы, уровни)',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  totalUnits?: number;

  @ApiPropertyOptional({ example: 3, description: 'Текущий прогресс' })
  @IsOptional()
  @IsInt()
  @Min(0)
  currentUnit?: number;

  @ApiPropertyOptional({ enum: Status, description: 'Статус прогресса' })
  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @ApiPropertyOptional({
    example: 8,
    description: 'Оценка пользователя (0-10)',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  rating?: number;

  @ApiPropertyOptional({ description: 'Заметка пользователя' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @ApiPropertyOptional({ description: 'ID франшизы' })
  @IsOptional()
  @IsInt()
  franchiseId?: number;
}
