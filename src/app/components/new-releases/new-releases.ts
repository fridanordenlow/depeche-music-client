import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SpotifyService } from '../../services/spotify';
import { toSignal } from '@angular/core/rxjs-interop';
import { computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Album } from '../../models/music';

@Component({
  selector: 'app-new-releases',
  imports: [RouterLink],
  templateUrl: './new-releases.html',
  styleUrl: './new-releases.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewReleases {
  private spotifyService = inject(SpotifyService);

  private allNewReleases = toSignal(this.spotifyService.getNewReleases());

  featuredNewReleases = computed(() => {
    const data = this.allNewReleases();
    if (!data) return [];

    return data.items.filter((item) => item.type === 'album').slice(0, 10);
  });

  getArtistNames(album: Album): string {
    return album.artists.map((a) => a.name).join(', ');
  }
}
