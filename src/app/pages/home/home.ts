import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { SpotifyService } from '../../services/spotify';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Album } from '../../models/music';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
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
