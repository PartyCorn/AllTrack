import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CoversService } from './covers.service';

@ApiTags('Covers')
@Controller('covers')
export class CoversController {
  constructor(private coversService: CoversService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search for cover images by title' })
  @ApiResponse({ status: 200, description: 'List of cover URLs' })
  async searchCovers(@Query('title') title: string, @Query('type') type?: string) {
    return this.coversService.searchCovers(title, type);
  }
}