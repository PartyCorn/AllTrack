import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ example: 'andreyy' })
  @IsOptional()
  @IsString()
  @MaxLength(16)
  nickname?: string;

  @ApiProperty({ example: 'Hello, I am a new user!' })
  @IsOptional()
  @IsString()
  @MaxLength(48)
  bio?: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiProperty({ example: false })
  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;
}