import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SpotifyService } from '../../services/spotify';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
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
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-search-results',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './search-results.html',
  styleUrl: './search-results.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchResults {
  private spotifyService = inject(SpotifyService);
  private route = inject(ActivatedRoute);

  currentQuery = signal<string | null>(null);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  private getEmptySearchResponse(): SearchResponse {
    return {
      artists: { items: [], pagination: { total: 0, limit: 0, offset: 0 } },
      albums: { items: [], pagination: { total: 0, limit: 0, offset: 0 } },
      tracks: { items: [], pagination: { total: 0, limit: 0, offset: 0 } },
    };
  }

  private search$ = this.route.queryParams.pipe(
    map((params) => params['q'] as string),
    filter((query): query is string => !!query && query.length > 2),
    debounceTime(500),
    distinctUntilChanged(),
    tap((query) => {
      this.isLoading.set(true);
      this.errorMessage.set(null);
      this.currentQuery.set(query);
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
