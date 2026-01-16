import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SpotifyService } from '../../services/spotify';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  of,
  switchMap,
  tap,
  timeout,
} from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { SearchResponse } from '../../models/music';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiErrorResponse } from '../../models/error';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-search',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class Search {
  private spotifyService = inject(SpotifyService);

  searchControl = new FormControl('');
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  private getEmptySearchResponse(): SearchResponse {
    return {
      artists: { items: [], pagination: { total: 0, limit: 0, offset: 0 } },
      albums: { items: [], pagination: { total: 0, limit: 0, offset: 0 } },
      tracks: { items: [], pagination: { total: 0, limit: 0, offset: 0 } },
    };
  }

  // Observable pipeline for search - streamed to a signal
  private search$ = this.searchControl.valueChanges.pipe(
    filter((query): query is string => !!query && query.length > 2),
    debounceTime(500),
    distinctUntilChanged(),
    tap(() => {
      this.isLoading.set(true);
      this.errorMessage.set(null);
    }),
    switchMap((query) =>
      this.spotifyService.search(query).pipe(
        timeout(60000),
        catchError((response: HttpErrorResponse) => {
          const apiError = response.error as ApiErrorResponse;
          const message = apiError?.details || 'An unknown error occurred.';
          this.errorMessage.set(message);
          this.isLoading.set(false);
          console.error(`[Search API] ${apiError?.error || 'Unknown Error'}:`, apiError?.details);
          return of(this.getEmptySearchResponse());
        })
      )
    ),
    tap(() => this.isLoading.set(false))
  );

  searchResults = toSignal(this.search$);
}
