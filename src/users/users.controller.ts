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
  @ApiOperation({ summary: 'Получить профиль текущего аутентифицированного пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Возвращает профиль текущего пользователя',
    type: UserDto,
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  getMe(@Req() req: any): Promise<UserDto> {
    return this.usersService.getById(req.user.userId);
  }

  /**
   * Редактирование профиля текущего пользователя
   */
  @Put('me/edit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Редактировать профиль текущего пользователя (никнейм, био, аватар, приватность)' })
  @ApiBody({
    type: UpdateUserDto,
    description: 'Поля, которые можно обновить',
  })
  @ApiResponse({
    status: 200,
    description: 'Обновленный профиль пользователя',
    type: UserDto,
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  updateMe(@Req() req: any, @Body() dto: UpdateUserDto): Promise<UserDto> {
    return this.usersService.updateUser(req.user.userId, dto);
  }

  /**
   * Получение публичного профиля пользователя по никнейму
   */
  @Get(':nickname')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить публичный профиль пользователя по никнейму' })
  @ApiParam({
    name: 'nickname',
    description: 'Уникальный никнейм пользователя',
    example: 'andreyy',
  })
  @ApiResponse({
    status: 200,
    description: 'Возвращает публичный профиль',
    type: UserDto,
  })
  @ApiResponse({ status: 403, description: 'Профиль приватный' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  getPublicProfile(@Param('nickname') nickname: string, @Req() req: any): Promise<UserDto> {
    const requesterId = req?.user?.userId;
    return this.usersService.getPublicProfile(nickname, requesterId);
  }
}