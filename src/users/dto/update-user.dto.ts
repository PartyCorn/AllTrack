import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ example: 'andreyy', description: 'Никнейм пользователя' })
  @IsOptional()
  @IsString()
  @MaxLength(16)
  nickname?: string;

  @ApiProperty({ example: 'Hello, I am a new user!', description: 'Биография пользователя' })
  @IsOptional()
  @IsString()
  @MaxLength(48)
  bio?: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', description: 'Ссылка на аватар' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiProperty({ example: false, description: 'Приватность профиля' })
  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;
}