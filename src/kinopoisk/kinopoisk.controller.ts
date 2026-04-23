import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { KinopoiskService } from './kinopoisk.service';
import { KinopoiskSearchResultDto } from './dto/kinopoisk-search-result.dto';
import { KinopoiskSeasonsDto } from './dto/kinopoisk-seasons.dto';

@ApiTags('Кинопоиск')
@Controller('kinopoisk')
export class KinopoiskController {
  constructor(private kinopoiskService: KinopoiskService) {}

  @Get('search')
  @ApiOperation({ summary: 'Поиск фильма по названию' })
  @ApiResponse({
    status: 200,
    type: [KinopoiskSearchResultDto],
    description: 'Список найденных фильмов',
  })
  async search(@Query('keyword') keyword: string) {
    return this.kinopoiskService.search(keyword);
  }

  @Get(':id/seasons')
  @ApiOperation({ summary: 'Получить сезоны и эпизоды' })
  @ApiResponse({
    status: 200,
    type: KinopoiskSeasonsDto,
    description: 'Сезоны и эпизоды',
  })
  async getSeasons(@Param('id') id: string) {
    return this.kinopoiskService.getSeasons(+id);
  }
}