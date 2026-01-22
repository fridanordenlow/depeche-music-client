import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { SpotifyService } from '../../services/spotify';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { filter, of, startWith, switchMap } from 'rxjs';
import { Album, Artist, Track } from '../../models/music';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-details',
  imports: [RouterLink],
  templateUrl: './details.html',
  styleUrl: './details.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Details {
  private spotifyService = inject(SpotifyService);

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
}
