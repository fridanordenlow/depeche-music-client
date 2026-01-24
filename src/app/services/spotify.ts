import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Album, AlbumListResponse, Artist, SearchResponse, Track } from '../models/music';
import { catchError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SpotifyService {
  private http = inject(HttpClient);
  private baseUrl = 'https://depeche-music-api.onrender.com/api/spotify';

  getNewReleases() {
    return this.http.get<AlbumListResponse>(`${this.baseUrl}/new-releases`).pipe(
      catchError((error) => {
        console.error('Failed to fetch new releases:', error);
        throw error;
      })
    );
  }

  getArtist(id: string) {
    return this.http.get<Artist>(`${this.baseUrl}/artists/${id}`).pipe(
      catchError((error) => {
        console.error('Failed to fetch artist:', error);
        throw error;
      })
    );
  }

  getAlbum(id: string) {
    return this.http.get<Album>(`${this.baseUrl}/albums/${id}`).pipe(
      catchError((error) => {
        console.error('Failed to fetch album:', error);
        throw error;
      })
    );
  }

  getTrack(id: string) {
    return this.http.get<Track>(`${this.baseUrl}/tracks/${id}`).pipe(
      catchError((error) => {
        console.error('Failed to fetch track:', error);
        throw error;
      })
    );
  }

  getArtistAlbums(id: string) {
    return this.http.get<Album[]>(`${this.baseUrl}/artists/${id}/albums`).pipe(
      catchError((error) => {
        console.error('Failed to fetch artist albums:', error);
        throw error;
      })
    );
  }

  search(query: string, limit: number = 20, offset: number = 0) {
    return this.http
      .get<SearchResponse>(`${this.baseUrl}/search`, {
        params: {
          q: query,
          limit: limit.toString(),
          offset: offset.toString(),
        },
      })
      .pipe(
        catchError((error) => {
          console.error('Failed to search:', error);
          throw error;
        })
      );
  }
}
