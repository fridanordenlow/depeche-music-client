import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AlbumListResponse } from '../models/music';

@Injectable({
  providedIn: 'root',
})
export class Spotify {
  private http = inject(HttpClient);
  private baseUrl = 'https://depeche-music-api.onrender.com/api/spotify';

  getNewReleases() {
    return this.http.get<AlbumListResponse>(`${this.baseUrl}/new-releases`);
  }
}
