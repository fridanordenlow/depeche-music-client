import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { UserRecommendation } from '../models/recommendation';
import { catchError, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RecommendationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://depeche-music-api.onrender.com/api/recommendations';

  // Signal to hold public recommendations
  private _publicRecs = signal<UserRecommendation[]>([]);
  public publicRecs = this._publicRecs.asReadonly();

  // Signal to hold current user's recommendations
  private _userRecs = signal<UserRecommendation[]>([]);
  public userRecs = this._userRecs.asReadonly();

  getPublicRecommendations() {
    return this.http.get<UserRecommendation[]>(`${this.apiUrl}/all`).pipe(
      tap((recs) => {
        this._publicRecs.set(recs);
      }),
      catchError((error) => {
        console.error('Failed to fetch public recommendations:', error);
        throw error;
      })
    );
  }

  getRecommendationById(itemId: string) {
    return this.http.get<UserRecommendation>(`${this.apiUrl}/${itemId}`).pipe(
      catchError((error) => {
        console.error('Failed to fetch recommendation:', error);
        throw error;
      })
    );
  }

  getUserRecs() {
    return this.http.get<UserRecommendation[]>(`${this.apiUrl}/user`).pipe(
      tap((recs) => {
        this._userRecs.set(recs);
      }),
      catchError((error) => {
        console.error('Failed to fetch user recommendations:', error);
        throw error;
      })
    );
  }

  createRecommendation(payload: {
    spotifyId: string;
    type: 'album' | 'artist' | 'track';
    review: string;
  }) {
    return this.http.post<UserRecommendation>(`${this.apiUrl}/add`, payload).pipe(
      tap((created) => {
        this._userRecs.update((current) => [...current, created]);
      }),
      catchError((error) => {
        console.error('Failed to create recommendation:', error);
        throw error;
      })
    );
  }
}
