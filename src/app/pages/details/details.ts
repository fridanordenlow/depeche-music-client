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
import { MatIcon } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { DurationPipe } from '../../shared/pipes/duration';
import { Loading } from '../../shared/loading/loading';
import { toDebouncedLoading } from '../../shared/utils/delayed-loading';

@Component({
  selector: 'app-details',
  imports: [
    RouterLink,
    MatIcon,
    MatTooltipModule,
    MatDialogModule,
    MatPaginatorModule,
    DurationPipe,
    Loading,
  ],
  templateUrl: './details.html',
  styleUrl: './details.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Details {
  private spotifyService = inject(SpotifyService);
  private libraryService = inject(LibraryService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  // Input from the router
  // For the route path: 'details/:type/:id'
  type = input<'artist' | 'album' | 'track'>();
  id = input<string>('');

  private routeParams = computed(() => {
    const currentType = this.type();
    const currentId = this.id();
    if (!currentType || !currentId) return null;
    return { type: currentType, id: currentId };
  });

  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);
  private lastArtistId: string | null = null;

  private isLoading = computed(
    () => !this.albumDetails() && !this.artistDetails() && !this.trackDetails()
  );
  showDelayedLoading = toDebouncedLoading(this.isLoading, 1500);

  constructor() {
    effect(() => {
      const params = this.routeParams();
      if (params?.type === 'artist' && params.id !== this.lastArtistId) {
        this.lastArtistId = params.id;
        this.pageIndex.set(0);
      }
    });
  }

  existingItem = computed(() => {
    const library = this.libraryService.userLibrary();
    const currentId = this.id();
    const match = library.find((item) => item.spotifyItemId === currentId);

    console.log('Library size:', library.length);
    console.log('Searching for ID:', currentId);
    console.log('Match found:', match);

    return match;
  });
  details = toSignal(
    toObservable(this.routeParams).pipe(
      filter((params) => params !== null),
      switchMap(({ type, id }) => {
        if (type === 'artist') return this.spotifyService.getArtist(id);
        if (type === 'album') return this.spotifyService.getAlbum(id);
        console.log(type, id);
        return this.spotifyService.getTrack(id);
      }),
      startWith(null)
    )
  );

  private artistAlbumsParams = computed(() => {
    const params = this.routeParams();
    if (!params || params.type !== 'artist') return null;
    return {
      id: params.id,
      limit: this.pageSize(),
      offset: this.pageIndex() * this.pageSize(),
    };
  });

  artistAlbumsResponse = toSignal(
    toObservable(this.artistAlbumsParams).pipe(
      filter((params) => params !== null),
      switchMap(({ id, limit, offset }) => this.spotifyService.getArtistAlbums(id, limit, offset)),
      startWith(null)
    ),
    { initialValue: null }
  );

  artistAlbums = computed(() => this.artistAlbumsResponse()?.items ?? []);
  artistAlbumsTotal = computed(() => this.artistAlbumsResponse()?.pagination.total ?? 0);

  // Help signals for types
  albumDetails = computed(() => (this.type() === 'album' ? (this.details() as Album) : null));
  artistDetails = computed(() => (this.type() === 'artist' ? (this.details() as Artist) : null));
  trackDetails = computed(() => (this.type() === 'track' ? (this.details() as Track) : null));

  detailsIsLoading = computed(() => !this.details());

  onAlbumsPage(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  addToLibrary(
    spotifyItemId: string,
    itemType: 'artist' | 'album' | 'track',
    status: 'love' | 'explore' | 'listened'
  ) {
    const existing = this.existingItem();

    if (existing && existing.status === status) {
      const dialogRef = this.dialog.open(ConfirmDialog, {
        width: '300px',
        data: {
          title: 'Item already in library',
          message: `This item is already in your library. Do you want to remove it?`,
          confirmText: 'Remove',
          cancelText: 'Cancel',
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result === true) {
          this.libraryService.removeItem(existing._id).subscribe({
            next: () => this.snackBar.open('Removed from library', 'Close', { duration: 3000 }),
            error: (err) => {
              let message = 'Could not remove item';
              if (err.status === 401 || err.status === 403) {
                message = 'Authentication required. Please log in again';
              } else if (err.status === 404) {
                message = 'Item not found in your library';
              } else if (err.error?.message) {
                message = err.error.message;
              }
              this.snackBar.open(message, 'OK', { duration: 3000 });
              console.error('Removal error:', err);
            },
          });
        }
      });
      return;
    }

    const handleSuccess = (message: string) => {
      this.snackBar.open(message, 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      });
    };

    const handleError = (err: any) => {
      let message = 'Could not update library';
      if (err.status === 401 || err.status === 403) {
        message = 'Authentication required. Please log in';
      } else if (err.status === 400) {
        message = err.error?.message || 'Invalid data provided';
      } else if (err.status === 409) {
        message = 'Item already exists in your library';
      } else if (err.error?.message) {
        message = err.error.message;
      }
      this.snackBar.open(message, 'OK', { duration: 3000 });
      console.error('Library error:', err);
    };

    if (existing) {
      this.libraryService.updateItemStatus(existing._id, status).subscribe({
        next: () => handleSuccess('Status updated!'),
        error: handleError,
      });
    } else {
      this.libraryService.addToUserLibrary(spotifyItemId, itemType, status).subscribe({
        next: () => handleSuccess('Added to library!'),
        error: handleError,
      });
    }
  }
}
