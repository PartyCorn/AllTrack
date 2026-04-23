import { ApiProperty } from '@nestjs/swagger';

export class KinopoiskSearchResultDto {
  @ApiProperty({ description: 'ID фильма на Кинопоиске' })
  kinopoiskId: number;

  @ApiProperty({ description: 'ID фильма на IMDB', required: false })
  imdbId?: string;

  @ApiProperty({ description: 'Название на русском', required: false })
  nameRu?: string;

  @ApiProperty({ description: 'Название на английском', required: false })
  nameEn?: string;

  @ApiProperty({ description: 'Оригинальное название', required: false })
  nameOriginal?: string;

  @ApiProperty({ description: 'Страны' })
  countries: { country: string }[];

  @ApiProperty({ description: 'Жанры' })
  genres: { genre: string }[];

  @ApiProperty({ description: 'Рейтинг Кинопоиска', required: false })
  ratingKinopoisk?: number;

  @ApiProperty({ description: 'Рейтинг IMDB', required: false })
  ratingImdb?: number;

  @ApiProperty({ description: 'Год выхода', required: false })
  year?: number;

  @ApiProperty({ description: 'Тип' })
  type: string;

  @ApiProperty({ description: 'URL постера' })
  posterUrl: string;

  @ApiProperty({ description: 'URL превью постера' })
  posterUrlPreview: string;
}