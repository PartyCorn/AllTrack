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
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt/jwt.guard';
import { OptionalJwtAuthGuard } from '../common/guards/jwt/optional-jwt.guard';
import { TitlesService } from './titles.service';
import { CreateUpdateTitleDto } from './dto/create-update-title.dto';
import { TitleDto } from './dto/title.dto';
import { PaginatedTitlesResponseDto } from './dto/paginated-titles-response.dto';

@ApiTags('Тайтлы')
@Controller('titles')
export class TitlesController {
  constructor(private readonly titlesService: TitlesService) {}

  @Get('search')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Поиск тайтлов с фильтрами' })
  @ApiQuery({ name: 'q', required: false, description: 'Поиск по названию' })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['MOVIE', 'SERIES', 'ANIME', 'GAME', 'BOOK', 'OTHER'],
    description: 'Фильтр по типу',
  })
  @ApiQuery({
    name: 'favorite',
    required: false,
    type: Boolean,
    description: 'Только избранные тайтлы',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'DROPPED'],
    description: 'Фильтр по статусу',
  })
  @ApiQuery({
    name: 'ratingMin',
    required: false,
    type: Number,
    description: 'Минимальный рейтинг',
  })
  @ApiQuery({
    name: 'ratingMax',
    required: false,
    type: Number,
    description: 'Максимальный рейтинг',
  })
  @ApiQuery({
    name: 'franchiseId',
    required: false,
    type: Number,
    description: 'ID франшизы',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: Number,
    description: 'ID пользователя (для публичных профилей)',
  })
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
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['createdAt', 'title', 'rating', 'status'],
    description: 'Сортировка по полю',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Порядок сортировки',
  })
  @ApiResponse({
    status: 200,
    type: PaginatedTitlesResponseDto,
    description: 'Результаты поиска',
  })
  searchTitles(
    @Query('q') q?: string,
    @Query('type') type?: string,
    @Query('favorite') favorite?: string,
    @Query('status') status?: string,
    @Query('ratingMin') ratingMin?: string,
    @Query('ratingMax') ratingMax?: string,
    @Query('franchiseId') franchiseId?: string,
    @Query('userId') userId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    const filters = {
      q,
      type,
      favorite:
        favorite === 'true' ? true : favorite === 'false' ? false : undefined,
      status,
      ratingMin: ratingMin ? parseInt(ratingMin) : undefined,
      ratingMax: ratingMax ? parseInt(ratingMax) : undefined,
      franchiseId: franchiseId ? parseInt(franchiseId) : undefined,
      userId: userId ? parseInt(userId) : undefined,
    };
    const options = {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      sortBy,
      sortOrder: sortOrder as 'asc' | 'desc',
    };
    return this.titlesService.searchTitles(filters, options);
  }

  @Get('user/:userId')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Получить все тайтлы пользователя по ID' })
  @ApiParam({ name: 'userId', example: 1, description: 'ID пользователя' })
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
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['MOVIE', 'SERIES', 'ANIME', 'GAME', 'BOOK', 'OTHER'],
    description: 'Тип тайтла',
  })
  @ApiQuery({
    name: 'favorite',
    required: false,
    type: Boolean,
    description: 'Только избранные тайтлы',
  })
  @ApiQuery({
    name: 'excludeFranchiseTitles',
    required: false,
    type: Boolean,
    example: true,
    description: 'Исключить тайтлы из франшиз',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['createdAt', 'title', 'rating', 'status'],
    description: 'Сортировка по полю',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Порядок сортировки',
  })
  @ApiResponse({
    status: 200,
    type: PaginatedTitlesResponseDto,
    description: 'Список тайтлов с пагинацией',
  })
  getUserTitles(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: string,
    @Query('favorite') favorite?: string,
    @Query('excludeFranchiseTitles') excludeFranchiseTitles?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    const options = {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      sortBy,
      sortOrder: sortOrder as 'asc' | 'desc',
    };
    const exclude = excludeFranchiseTitles === 'true';
    const favoriteFilter =
      favorite === 'true' ? true : favorite === 'false' ? false : undefined;
    return this.titlesService.getUserTitles(
      userId,
      options,
      type,
      exclude,
      favoriteFilter,
    );
  }

  @Get('user/:userId/favorites')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить только избранные тайтлы пользователя' })
  @ApiParam({ name: 'userId', example: 1, description: 'ID пользователя' })
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
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['MOVIE', 'SERIES', 'ANIME', 'GAME', 'BOOK', 'OTHER'],
    description: 'Тип тайтла',
  })
  @ApiQuery({
    name: 'excludeFranchiseTitles',
    required: false,
    type: Boolean,
    example: true,
    description: 'Исключить тайтлы из франшиз',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['createdAt', 'title', 'rating', 'status'],
    description: 'Сортировка по полю',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Порядок сортировки',
  })
  @ApiResponse({
    status: 200,
    type: PaginatedTitlesResponseDto,
    description: 'Список избранных тайтлов с пагинацией',
  })
  getUserFavoriteTitles(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: string,
    @Query('excludeFranchiseTitles') excludeFranchiseTitles?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    const options = {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      sortBy,
      sortOrder: sortOrder as 'asc' | 'desc',
    };
    const exclude = excludeFranchiseTitles === 'true';
    return this.titlesService.getUserTitles(
      userId,
      options,
      type,
      exclude,
      true,
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать тайтл для текущего пользователя' })
  @ApiBody({
    type: CreateUpdateTitleDto,
    description: 'Данные для создания тайтла',
  })
  @ApiResponse({ status: 201, type: TitleDto, description: 'Созданный тайтл' })
  addTitle(@Req() req: any, @Body() dto: CreateUpdateTitleDto) {
    return this.titlesService.createTitle(req.user.userId, dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить тайтл' })
  @ApiParam({ name: 'id', example: 1, description: 'ID тайтла' })
  @ApiBody({
    type: CreateUpdateTitleDto,
    description: 'Данные для обновления тайтла',
  })
  @ApiResponse({
    status: 200,
    type: TitleDto,
    description: 'Обновленный тайтл',
  })
  updateTitle(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateUpdateTitleDto,
  ) {
    return this.titlesService.updateTitle(req.user.userId, id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить тайтл' })
  @ApiParam({ name: 'id', example: 1, description: 'ID тайтла' })
  @ApiResponse({ status: 200, description: 'Тайтл удален' })
  deleteTitle(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.titlesService.deleteTitle(req.user.userId, id);
  }

  @Post(':id/collaborators/:friendId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Добавить коллаборатора к тайтлу' })
  @ApiParam({ name: 'id', example: 1, description: 'ID тайтла' })
  @ApiParam({ name: 'friendId', example: 2, description: 'ID друга для приглашения' })
  @ApiResponse({ status: 200, type: TitleDto, description: 'Обновленный тайтл' })
  addCollaborator(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Param('friendId', ParseIntPipe) friendId: number,
  ) {
    return this.titlesService.addCollaborator(req.user.userId, id, friendId);
  }

  @Delete(':id/collaborators/:collaboratorId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить коллаборатора из тайтла' })
  @ApiParam({ name: 'id', example: 1, description: 'ID тайтла' })
  @ApiParam({ name: 'collaboratorId', example: 2, description: 'ID коллаборатора' })
  @ApiResponse({ status: 200, type: TitleDto, description: 'Обновленный тайтл' })
  removeCollaborator(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Param('collaboratorId', ParseIntPipe) collaboratorId: number,
  ) {
    return this.titlesService.removeCollaborator(req.user.userId, id, collaboratorId);
  }
}
