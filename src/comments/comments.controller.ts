import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  ParseIntPipe,
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
import { CommentsService } from './comments.service';
import { PaginatedResult } from '../common/pagination';

@ApiTags('Комментарии')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('profile/:profileId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Оставить комментарий на профиле' })
  @ApiParam({ name: 'profileId', description: 'ID профиля' })
  @ApiBody({
    schema: { type: 'object', properties: { content: { type: 'string' } } },
  })
  @ApiResponse({ status: 201, description: 'Комментарий создан' })
  createComment(
    @Req() req: any,
    @Param('profileId', ParseIntPipe) profileId: number,
    @Body() body: { content: string },
  ) {
    return this.commentsService.createComment(
      req.user.userId,
      profileId,
      body.content,
    );
  }

  @Get('profile/:profileId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить комментарии профиля' })
  @ApiParam({ name: 'profileId', description: 'ID профиля' })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
    description: 'Номер страницы',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 50,
    description: 'Количество элементов на странице',
  })
  @ApiResponse({ status: 200, description: 'Список комментариев с пагинацией' })
  getProfileComments(
    @Param('profileId', ParseIntPipe) profileId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedResult<any>> {
    const options = {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    };
    return this.commentsService.getProfileComments(profileId, options);
  }

  @Put(':commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Редактировать комментарий' })
  @ApiParam({ name: 'commentId', description: 'ID комментария' })
  @ApiBody({
    schema: { type: 'object', properties: { content: { type: 'string' } } },
  })
  @ApiResponse({ status: 200, description: 'Комментарий обновлен' })
  updateComment(
    @Req() req: any,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() body: { content: string },
  ) {
    return this.commentsService.updateComment(
      req.user.userId,
      commentId,
      body.content,
    );
  }

  @Delete(':commentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить комментарий' })
  @ApiParam({ name: 'commentId', description: 'ID комментария' })
  @ApiResponse({ status: 200, description: 'Комментарий удален' })
  deleteComment(
    @Req() req: any,
    @Param('commentId', ParseIntPipe) commentId: number,
  ) {
    return this.commentsService.deleteComment(req.user.userId, commentId);
  }
}
