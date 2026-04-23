import { ApiProperty } from '@nestjs/swagger';

export class EpisodeDto {
  @ApiProperty({ description: 'Номер сезона' })
  seasonNumber: number;

  @ApiProperty({ description: 'Номер эпизода' })
  episodeNumber: number;

  @ApiProperty({ description: 'Название на русском', required: false })
  nameRu?: string;

  @ApiProperty({ description: 'Название на английском', required: false })
  nameEn?: string;

  @ApiProperty({ description: 'Синопсис', required: false })
  synopsis?: string;

  @ApiProperty({ description: 'Дата выхода', required: false })
  releaseDate?: string;
}

export class SeasonDto {
  @ApiProperty({ description: 'Номер сезона' })
  number: number;

  @ApiProperty({ description: 'Эпизоды' })
  episodes: EpisodeDto[];
}

export class KinopoiskSeasonsDto {
  @ApiProperty({ description: 'Количество сезонов' })
  total: number;

  @ApiProperty({ description: 'Сезоны', type: [SeasonDto] })
  items: SeasonDto[];
}