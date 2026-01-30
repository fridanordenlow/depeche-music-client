import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { SpotifyService } from '../../services/spotify';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { filter, startWith, switchMap } from 'rxjs';
import { Album, Artist, Track } from '../../models/music';
import { RouterLink } from '@angular/router';
import { LibraryService } from '../../services/library';
import { RecommendationService } from '../../services/recommendation';
import { MatIcon } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { DurationPipe } from '../../shared/pipes/duration';
import { Loading } from '../../shared/loading/loading';
import { toDebouncedLoading } from '../../shared/utils/delayed-loading';
import { AuthService } from '../../services/auth';
import { LibraryManager } from '../../services/library-manager';

@Component({
  selector: 'app-details',
  imports: [RouterLink, MatIcon, MatTooltipModule, MatPaginatorModule, DurationPipe, Loading],
  templateUrl: './details.html',
  styleUrl: './details.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Details {
  private spotifyService = inject(SpotifyService);
  private libraryService = inject(LibraryService);
  private recService = inject(RecommendationService);
  private authService = inject(AuthService);
  private libraryManager = inject(LibraryManager);

  // Input from the router
  // For the route path: 'details/:type/:id'
  type = input.required<'artist' | 'album' | 'track'>();
  id = input.required<string>();
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);

  details = toSignal(
    toObservable(computed(() => ({ type: this.type(), id: this.id() }))).pipe(
      switchMap(({ type, id }) => {
        if (type === 'artist') return this.spotifyService.getArtist(id);
        if (type === 'album') return this.spotifyService.getAlbum(id);
        return this.spotifyService.getTrack(id);
      }),
      startWith(null)
    )
  );

  // This watches id() and type(). When they change, switchMap is re-run.
  // We also reset pageIndex here in the flow.
  artistAlbumsResponse = toSignal(
    toObservable(
      computed(() => ({
        id: this.id(),
        type: this.type(),
        page: this.pageIndex(),
        size: this.pageSize(),
      }))
    ).pipe(
      filter(({ type }) => type === 'artist'),
      switchMap(({ id, page, size }) => this.spotifyService.getArtistAlbums(id, size, page * size)),
      startWith(null)
    )
  );

  artistAlbums = computed(() => this.artistAlbumsResponse()?.items ?? []);
  artistAlbumsTotal = computed(() => this.artistAlbumsResponse()?.pagination.total ?? 0);

  // Help signals for types
  albumDetails = computed(() => (this.type() === 'album' ? (this.details() as Album) : null));
  artistDetails = computed(() => (this.type() === 'artist' ? (this.details() as Artist) : null));
  trackDetails = computed(() => (this.type() === 'track' ? (this.details() as Track) : null));

  // Dynamic type label for album/single/compilation
  albumTypeLabel = computed(() => {
    const album = this.albumDetails();
    if (!album || !album.type) return null;
    return album.type.toUpperCase();
  });

  existingItem = computed(
    () => this.libraryService.userLibrary().find((item) => item.spotifyItemId === this.id()) ?? null
  );

  existingRec = computed(
    () => this.recService.userRecs().find((rec) => rec.spotifyId === this.id()) ?? null
  );

  detailsIsLoading = computed(() => !this.details());
  showDelayedLoading = toDebouncedLoading(this.detailsIsLoading, 1500);

  constructor() {
    effect(() => {
      if (this.authService.isAuthenticated() && this.recService.userRecs().length === 0) {
        this.recService.getUserRecs().subscribe();
      }
    });
  }

  onAlbumsPage(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  addToLibrary(status: 'love' | 'explore' | 'listened') {
    this.libraryManager.toggleItem(
      {
        id: this.id(),
        type: this.type(),
        status,
      },
      this.existingItem()
    );
  }
}
