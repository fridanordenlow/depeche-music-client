import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';
import { AuthCredentials, LoginResponse } from '../models/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://depeche-music-api.onrender.com/api/users';

  public currentUserToken = signal<string | null>(localStorage.getItem('access_token'));

  private saveSession(response: LoginResponse): void {
    localStorage.setItem('access_token', response.token);
    this.currentUserToken.set(response.token);
  }

  public login(credentials: AuthCredentials) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        this.saveSession(response);
      })
    );
  }

  public register(credentials: AuthCredentials) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/register`, credentials).pipe(
      tap((response) => {
        this.saveSession(response);
      })
    );
  }

  public logout(): void {
    localStorage.removeItem('access_token');
    this.currentUserToken.set(null);
  }
}
