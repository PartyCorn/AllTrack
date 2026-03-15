import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsEnum,
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
  MaxLength,
} from 'class-validator'
import { TitleType, Status } from '@prisma/client'

export class CreateUpdateTitleDto {
  @ApiProperty({ enum: TitleType })
  @IsEnum(TitleType)
  type: TitleType

  @ApiProperty()
  @IsString()
  @MaxLength(200)
  title: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  coverUrl?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  externalUrl?: string

  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @IsInt()
  @Min(1)
  totalUnits?: number

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsInt()
  @Min(0)
  currentUnit?: number

  @ApiPropertyOptional({ enum: Status })
  @IsOptional()
  @IsEnum(Status)
  status?: Status

  @ApiPropertyOptional({ example: 8 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  rating?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  franchiseId?: number
}