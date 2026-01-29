import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RecommendationService } from '../../services/recommendation';
import { toSignal } from '@angular/core/rxjs-interop';
import { Loading } from '../../shared/loading/loading';

@Component({
  selector: 'app-user-releases-recommendations',
  imports: [CommonModule, RouterLink, Loading],
  templateUrl: './user-releases-recommendations.html',
  styleUrl: './user-releases-recommendations.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserReleasesRecommendations {
  private recommendationService = inject(RecommendationService);

  private allRecommendations = toSignal(this.recommendationService.getPublicRecommendations(), {
    initialValue: null,
  });

  isLoading = computed(() => !this.allRecommendations());

  albumRecommendations = computed(() => {
    const recs = this.allRecommendations();
    if (!recs) return [];

    const albumRecs = recs.filter((rec) => rec.type === 'album');

    // Shuffle first so the recommendations per spotifyId are randomized
    const shuffledAlbums = [...albumRecs].sort(() => Math.random() - 0.5);

    // Only show one recommendation per album (spotifyId)
    const uniqueAlbums = new Map<string, (typeof albumRecs)[0]>();

    for (const rec of shuffledAlbums) {
      if (!uniqueAlbums.has(rec.spotifyId)) {
        uniqueAlbums.set(rec.spotifyId, rec);
      }
    }

    // Take max 10
    return Array.from(uniqueAlbums.values()).slice(0, 10);
  });
}
