import { Controller, Get, Post, Put, Delete, Param, Req, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt/jwt.guard';
import { FriendsService } from './friends.service';
import { FriendDto } from './dto/friend.dto';

@ApiTags('Друзья')
@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Post('request/:nickname')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Отправить заявку в друзья' })
  @ApiParam({ name: 'nickname', description: 'Никнейм пользователя' })
  @ApiResponse({ status: 201, description: 'Заявка отправлена' })
  @ApiResponse({ status: 400, description: 'Неверный запрос' })
  sendFriendRequest(@Req() req: any, @Param('nickname') nickname: string) {
    return this.friendsService.sendFriendRequest(req.user.userId, nickname);
  }

  @Put('accept/:friendId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Принять заявку в друзья' })
  @ApiParam({ name: 'friendId', description: 'ID друга' })
  @ApiResponse({ status: 200, description: 'Заявка принята' })
  acceptFriendRequest(@Req() req: any, @Param('friendId', ParseIntPipe) friendId: number) {
    return this.friendsService.acceptFriendRequest(req.user.userId, friendId);
  }

  @Delete(':friendId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить из друзей или отклонить заявку' })
  @ApiParam({ name: 'friendId', description: 'ID друга' })
  @ApiResponse({ status: 200, description: 'Удалено' })
  removeFriend(@Req() req: any, @Param('friendId', ParseIntPipe) friendId: number) {
    return this.friendsService.removeFriend(req.user.userId, friendId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить список друзей' })
  @ApiResponse({ status: 200, description: 'Список друзей', type: [FriendDto] })
  getFriends(@Req() req: any) {
    return this.friendsService.getFriends(req.user.userId);
  }

  @Get('requests')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить входящие заявки в друзья' })
  @ApiResponse({ status: 200, description: 'Список заявок', type: [FriendDto] })
  getFriendRequests(@Req() req: any) {
    return this.friendsService.getFriendRequests(req.user.userId);
  }
}