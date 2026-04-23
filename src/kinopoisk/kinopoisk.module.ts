import { Module } from '@nestjs/common';
import { KinopoiskController } from './kinopoisk.controller';
import { KinopoiskService } from './kinopoisk.service';

@Module({
  controllers: [KinopoiskController],
  providers: [KinopoiskService],
})
export class KinopoiskModule {}