import { Component, computed, inject } from '@angular/core';
import { Spotify } from '../../services/spotify';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Album } from '../../models/music';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private spotifyService = inject(Spotify);

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
