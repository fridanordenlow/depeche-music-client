import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Album, AlbumListResponse, Artist, Track } from '../models/music';

@Injectable({
  providedIn: 'root',
})
export class Spotify {
  private http = inject(HttpClient);
  private baseUrl = 'https://depeche-music-api.onrender.com/api/spotify';

  getNewReleases() {
    return this.http.get<AlbumListResponse>(`${this.baseUrl}/new-releases`);
  }

  getArtist(id: string) {
    return this.http.get<Artist>(`${this.baseUrl}/artists/${id}`);
  }

  getAlbum(id: string) {
    return this.http.get<Album>(`${this.baseUrl}/albums/${id}`);
  }

  getTrack(id: string) {
    return this.http.get<Track>(`${this.baseUrl}/tracks/${id}`);
  }

  getArtistAlbums(id: string) {
    return this.http.get<Album[]>(`${this.baseUrl}/artists/${id}/albums`);
  }
}
