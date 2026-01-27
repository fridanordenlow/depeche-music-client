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
  private _publicRecommendations = signal<UserRecommendation[]>([]);
  public publicRecommendations = this._publicRecommendations.asReadonly();

  // Signal to hold current user's recommendations
  private _userRecommendations = signal<UserRecommendation[]>([]);
  public userRecommendations = this._userRecommendations.asReadonly();

  getPublicRecommendations() {
    return this.http.get<UserRecommendation[]>(`${this.apiUrl}/all`).pipe(
      tap((recommendations) => {
        this._publicRecommendations.set(recommendations);
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

  createRecommendation(payload: {
    spotifyId: string;
    type: 'album' | 'artist' | 'track';
    review: string;
  }) {
    return this.http.post<UserRecommendation>(`${this.apiUrl}/add`, payload).pipe(
      tap((created) => {
        // Optionally cache it locally for UX; keep minimal for now
        this._userRecommendations.set([...this._userRecommendations(), created]);
      }),
      catchError((error) => {
        console.error('Failed to create recommendation:', error);
        throw error;
      })
    );
  }
}
