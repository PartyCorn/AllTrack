import { ApiProperty } from '@nestjs/swagger';
import { Status, TitleType } from '@prisma/client';

export class TitleDto {
  @ApiProperty({ description: 'ID tайтла', example: 1 })
  id: number;

  @ApiProperty({ description: 'Тип тайтла', enum: TitleType })
  type: TitleType;

  @ApiProperty({ description: 'Название тайтла', example: 'Attack on Titan' })
  title: string;

  @ApiProperty({ description: 'Описание тайтла', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Ссылка на обложку', nullable: true })
  coverUrl?: string;

  @ApiProperty({ description: 'Ссылка на внешний ресурс', nullable: true })
  externalUrl?: string;

  @ApiProperty({ description: 'Всего единиц (эпизоды, главы, уровни)', nullable: true })
  totalUnits?: number;

  @ApiProperty({ description: 'Текущий прогресс', nullable: true })
  currentUnit?: number;

  @ApiProperty({ description: 'Статус прогресса', enum: Status })
  status: Status;

  @ApiProperty({ description: 'Оценка пользователя', nullable: true })
  rating?: number;

  @ApiProperty({ description: 'Заметка пользователя', nullable: true })
  note?: string;

  @ApiProperty({ description: 'Франшиза', nullable: true })
  franchise?: { id: number; name: string } | null;

  @ApiProperty({ description: 'Дата создания' })
  createdAt: Date;

  @ApiProperty({ description: 'Дата последнего обновления' })
  updatedAt: Date;

  @ApiProperty({ description: 'Процент прогресса', example: 75 })
  progressPercent: number
}