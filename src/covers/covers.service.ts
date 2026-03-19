import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class CoversService {
  private TMDB_API = 'https://api.themoviedb.org/3';
  private TMDB_KEY = process.env.TMDB_API_KEY;

  private RAWG_KEY = process.env.RAWG_API_KEY;

  async searchCovers(title: string, type?: string): Promise<string[]> {
    switch (type) {
      case 'anime':
        return this.searchAnime(title);

      case 'movie':
      case 'series':
        return this.searchTMDB(title);

      case 'game':
        return this.searchRAWG(title);

      case 'book':
        return this.searchBooks(title);

      default:
        const results = await Promise.all([
          this.searchAnime(title),
          this.searchTMDB(title),
          this.searchRAWG(title),
          this.searchBooks(title),
        ]);

        return [...new Set(results.flat())].slice(0, 12);
    }
  }

  // ---------------- ANIME ----------------

  private async searchAnime(title: string): Promise<string[]> {
    const [shiki, anilist] = await Promise.all([
      this.searchShikimori(title),
      this.searchAniList(title),
    ]);

    return [...new Set([...shiki, ...anilist])].slice(0, 8);
  }

  private async searchShikimori(title: string): Promise<string[]> {
    try {
      const res = await axios.get('https://shikimori.io/api/animes', {
        params: { search: title, limit: 5 },
      });

      return res.data
        .map((a: any) => `https://shikimori.io${a.image.original}`)
        .filter(Boolean);
    } catch {
      return [];
    }
  }

  private async searchAniList(title: string): Promise<string[]> {
    try {
      const query = `
        query ($search: String) {
          Page(perPage: 5) {
            media(search: $search, type: ANIME) {
              coverImage {
                large
              }
            }
          }
        }`;

      const res = await axios.post('https://graphql.anilist.co', {
        query,
        variables: { search: title },
      });

      return res.data.data.Page.media
        .map((m: any) => m.coverImage?.large)
        .filter(Boolean);
    } catch {
      return [];
    }
  }

  // ---------------- MOVIES / SERIES ----------------

  private async searchTMDB(title: string): Promise<string[]> {
    try {
      const res = await axios.get(`${this.TMDB_API}/search/multi`, {
        params: {
          api_key: this.TMDB_KEY,
          query: title,
        },
      });

      return res.data.results
        .filter((r: any) => r.poster_path)
        .map((r: any) => `https://image.tmdb.org/t/p/w500${r.poster_path}`);
    } catch {
      return [];
    }
  }

  // ---------------- GAMES ----------------

  private async searchRAWG(title: string): Promise<string[]> {
    try {
      const res = await axios.get('https://api.rawg.io/api/games', {
        params: {
          key: this.RAWG_KEY,
          search: title,
          page_size: 5,
        },
      });

      return res.data.results
        .map((g: any) => g.background_image)
        .filter(Boolean);
    } catch {
      return [];
    }
  }

  // ---------------- BOOKS ----------------

  private async searchBooks(title: string): Promise<string[]> {
    try {
      const res = await axios.get('https://openlibrary.org/search.json', {
        params: { title, limit: 5 },
      });

      return res.data.docs
        .filter((b: any) => b.cover_i)
        .map(
          (b: any) => `https://covers.openlibrary.org/b/id/${b.cover_i}-L.jpg`,
        );
    } catch {
      return [];
    }
  }
}
