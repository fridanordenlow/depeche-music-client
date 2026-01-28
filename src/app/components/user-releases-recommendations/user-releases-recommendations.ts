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
    return recs ? recs.filter((rec) => rec.type === 'album') : [];
  });
}
