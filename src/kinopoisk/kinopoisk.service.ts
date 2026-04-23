import { Injectable } from '@nestjs/common';
import axios from 'axios';

export interface KinopoiskFilm {
  kinopoiskId: number;
  imdbId: string;
  nameRu: string | null;
  nameEn: string | null;
  nameOriginal: string | null;
  countries: { country: string }[];
  genres: { genre: string }[];
  ratingKinopoisk: number | null;
  ratingImdb: number | null;
  year: number | null;
  type: string;
  posterUrl: string;
  posterUrlPreview: string;
}

export interface KinopoiskSeason {
  number: number;
  episodes: {
    seasonNumber: number;
    episodeNumber: number;
    nameRu: string | null;
    nameEn: string | null;
    synopsis: string | null;
    releaseDate: string | null;
  }[];
}

@Injectable()
export class KinopoiskService {
  private readonly API_URL = 'https://kinopoiskapiunofficial.tech/api/v2.2/films';
  private readonly API_KEY = '070f7bd7-5923-4e41-94c9-624131c3a7c2';

  async search(keyword: string): Promise<KinopoiskFilm[]> {
    try {
      const res = await axios.get(this.API_URL, {
        params: { keyword },
        headers: {
          'X-API-KEY': this.API_KEY,
          'Content-Type': 'application/json',
        },
      });

      return res.data.items;
    } catch {
      return [];
    }
  }

  async getSeasons(filmId: number): Promise<{
    total: number;
    items: KinopoiskSeason[];
  }> {
    try {
      const res = await axios.get(`${this.API_URL}/${filmId}/seasons`, {
        headers: {
          'X-API-KEY': this.API_KEY,
          'Content-Type': 'application/json',
        },
      });

      return res.data;
    } catch {
      return { total: 0, items: [] };
    }
  }
}