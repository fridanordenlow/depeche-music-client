import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, of, tap } from 'rxjs';
import { AuthCredentials, LoginResponse, UserProfile } from '../models/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://depeche-music-api.onrender.com/api/users';

  private _token = signal<string | null>(localStorage.getItem('access_token'));
  private _user = signal<UserProfile | null>(null);

  public token = this._token.asReadonly();
  public user = this._user.asReadonly();

  public isAuthenticated = computed(() => !!this._token());

  private saveSession(response: LoginResponse): void {
    localStorage.setItem('access_token', response.token);
    this._token.set(response.token);
  }

  public register(credentials: AuthCredentials) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/register`, credentials).pipe(
      tap((response) => {
        this.saveSession(response);
      })
    );
  }

  public login(credentials: AuthCredentials) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        this.saveSession(response);
      })
    );
  }

  public logout(): void {
    localStorage.removeItem('access_token');
    this._token.set(null);
    this._user.set(null);
  }

  public fetchUserProfile() {
    return this.http.get<UserProfile>(`${this.apiUrl}/me`).pipe(
      tap((user) => this._user.set(user)),
      catchError((err) => {
        if (err.status === 401 || err.status === 403) {
          this.logout();
        }
        return of(null);
      })
    );
  }
}
