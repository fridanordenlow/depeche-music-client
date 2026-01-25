import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { SpotifyService } from '../../services/spotify';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { filter, of, startWith, switchMap } from 'rxjs';
import { Album, Artist, Track } from '../../models/music';
import { RouterLink } from '@angular/router';
import { LibraryService } from '../../services/library';
import { MatIcon } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { DurationPipe } from '../../shared/pipes/duration';
import { LoadingComponent } from '../../shared/loading/loading';

@Component({
  selector: 'app-details',
  imports: [RouterLink, MatIcon, MatTooltipModule, MatDialogModule, DurationPipe, LoadingComponent],
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

  artistAlbums = toSignal(
    toObservable(this.routeParams).pipe(
      filter((params) => params !== null),
      switchMap((params) => {
        if (params.type === 'artist') {
          console.log(params);
          return this.spotifyService.getArtistAlbums(params.id);
        }
        return of([]);
      }),
      startWith([])
    ),
    { initialValue: [] as Album[] }
  );

  // Help signals for types
  albumDetails = computed(() => (this.type() === 'album' ? (this.details() as Album) : null));
  artistDetails = computed(() => (this.type() === 'artist' ? (this.details() as Artist) : null));
  trackDetails = computed(() => (this.type() === 'track' ? (this.details() as Track) : null));

  detailsIsLoading = computed(() => !this.details());

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
          title: 'Remove from library?',
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
              this.snackBar.open('Could not remove item. Try again later.', 'OK', {
                duration: 3000,
              });
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

    const handleError = (err: unknown) => {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      this.snackBar.open('Could not add item to library. Are you logged in?', 'OK');
      console.log('Library error:', errorMessage);
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
