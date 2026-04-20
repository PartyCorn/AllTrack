import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsInt,
  Matches,
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

  @ApiPropertyOptional({ description: 'Избранный тайтл' })
  @IsOptional()
  @IsBoolean()
  favorite?: boolean;

  @ApiPropertyOptional({
    description: 'Дата начала просмотра/прохождения/чтения в формате DD.MM.YYYY',
    example: '20.04.2026',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}\.\d{2}\.\d{4}$/)
  dateStarted?: string;

  @ApiPropertyOptional({
    description: 'Дата окончания просмотра/прохождения/чтения в формате DD.MM.YYYY',
    example: '20.05.2026',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}\.\d{2}\.\d{4}$/)
  dateFinished?: string;

  @ApiPropertyOptional({ description: 'Тайтл отмечен как повторный просмотр/прохождение/чтение' })
  @IsOptional()
  @IsBoolean()
  isRevisit?: boolean;

  @ApiPropertyOptional({
    example: 1,
    description: 'Количество пересмотров/повторных прохождений',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  revisitCount?: number;

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

  @ApiPropertyOptional({ description: 'ID франшизы', example: null })
  @IsOptional()
  @IsInt()
  franchiseId?: number;
}
