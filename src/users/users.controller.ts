import {
  Controller,
  Get,
  Param,
  UseGuards,
  Req,
  Put,
  Body,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt/jwt.guard';
import { OptionalJwtAuthGuard } from '../common/guards/jwt/optional-jwt.guard';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { NotificationEventsService } from '../notification-events.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly notificationEvents: NotificationEventsService,
  ) {}

  /**
   * Получение профиля текущего пользователя
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiResponse({
    status: 200,
    description: 'Returns current user profile',
    type: UserDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getMe(@Req() req: any): Promise<UserDto> {
    return this.usersService.getById(req.user.userId);
  }

  /**
   * Редактирование профиля текущего пользователя
   */
  @Put('me/edit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Edit current user profile (nickname, bio, avatar, privacy)' })
  @ApiBody({
    type: UpdateUserDto,
    description: 'Fields that can be updated',
  })
  @ApiResponse({
    status: 200,
    description: 'Updated user profile',
    type: UserDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  updateMe(@Req() req: any, @Body() dto: UpdateUserDto): Promise<UserDto> {
    return this.usersService.updateUser(req.user.userId, dto);
  }

  /**
   * Получение публичного профиля пользователя по никнейму
   */
  @Get(':nickname')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get public user profile by nickname' })
  @ApiParam({
    name: 'nickname',
    description: 'Unique user nickname',
    example: 'andreyy',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns public profile',
    type: UserDto,
  })
  @ApiResponse({ status: 403, description: 'Profile is private' })
  @ApiResponse({ status: 404, description: 'User not found' })
  getPublicProfile(@Param('nickname') nickname: string, @Req() req: any): Promise<UserDto> {
    const requesterId = req?.user?.userId;
    return this.usersService.getPublicProfile(nickname, requesterId);
  }
}