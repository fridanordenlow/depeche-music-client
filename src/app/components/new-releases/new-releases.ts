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

  private allNewReleases = toSignal(this.spotifyService.getNewReleases(), { initialValue: null });

  isLoading = computed(() => !this.allNewReleases());

  featuredNewReleases = computed(() => {
    const data = this.allNewReleases();
    if (!data || data.items.length === 0) return [];

    // Shuffle all items and return 10 random ones
    const shuffled = [...data.items].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 10);
  });

  getArtistNames(album: Album): string {
    return album.artists.map((a) => a.name).join(', ');
  }
}
