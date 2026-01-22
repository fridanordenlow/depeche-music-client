import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, of, tap } from 'rxjs';
import { AuthCredentials, LoginResponse, User } from '../models/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://depeche-music-api.onrender.com/api/users';

  private _token = signal<string | null>(localStorage.getItem('access_token'));
  private _user = signal<User | null>(JSON.parse(localStorage.getItem('user') || 'null'));

  public token = this._token.asReadonly();
  public user = this._user.asReadonly();

  public isAuthenticated = computed(() => !!this._token());

  constructor() {
    if (this._token()) {
      this.fetchUserProfile().subscribe();
    }
  }

  // Helper method to update user signal and localStorage
  private _updateUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
    this._user.set(user);
  }

  private saveSession(response: LoginResponse): void {
    localStorage.setItem('access_token', response.token);
    this._token.set(response.token);
    this._updateUser(response.user);
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
    localStorage.removeItem('user');
    this._token.set(null);
    this._user.set(null);
  }

  public fetchUserProfile() {
    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      tap((user) => this._updateUser(user)),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401 || err.status === 403) {
          this.logout();
        }
        return of(null);
      })
    );
  }
}
