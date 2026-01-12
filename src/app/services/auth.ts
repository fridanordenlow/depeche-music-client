import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';
import { AuthCredentials } from '../models/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://depeche-music-api.onrender.com/api/users';

  public currentUserToken = signal<string | null>(localStorage.getItem('access_token'));

  public login(credentials: AuthCredentials) {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        this.currentUserToken.set(response.token);
        localStorage.setItem('access_token', response.token);
      })
    );
  }
}
