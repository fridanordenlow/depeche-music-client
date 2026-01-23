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

@Component({
  selector: 'app-details',
  imports: [RouterLink, MatIcon, MatTooltipModule],
  templateUrl: './details.html',
  styleUrl: './details.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Details {
  private spotifyService = inject(SpotifyService);
  private libraryService = inject(LibraryService);
  private snackBar = inject(MatSnackBar);

  // Input from the router
  // For the route path: 'details/:type/:id'
  type = input<'artist' | 'album' | 'track'>();
  id = input<string>('');

  // private routeParams = computed(() => {
  //   const currentType = this.type();
  //   const currentId = this.id();
  //   if (!currentType || !currentId) return null;
  //   return { type: currentType, id: currentId };
  // });

  private routeParams = computed(() => {
    const currentType = this.type();
    const currentId = this.id();
    return currentType && currentId ? { type: currentType, id: currentId } : null;
  });

  // existingItem = computed(() =>
  //   this.libraryService.userLibrary().find((item) => item.spotifyItemId === this.id())
  // );

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
      this.snackBar.open(`Already marked as ${status}`, 'OK', { duration: 2000 });
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
      this.snackBar.open('Could not add item to library. Try again later.', 'OK');
      console.log('Status code:', err.status);
      console.log('Error Body:', err.error);
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
