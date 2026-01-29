import { ChangeDetectionStrategy, Component, computed, inject, viewChild } from '@angular/core';
import { NewReleases } from '../../components/new-releases/new-releases';
import { UserReleasesRecommendations } from '../../components/user-releases-recommendations/user-releases-recommendations';
import { Loading } from '../../shared/loading/loading';
import { toDebouncedLoading } from '../../shared/utils/delayed-loading';

@Component({
  selector: 'app-home',
  imports: [NewReleases, UserReleasesRecommendations, Loading],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private userRecsComponent = viewChild(UserReleasesRecommendations);
  private newReleasesComponent = viewChild(NewReleases);

  isLoading = computed(() => {
    const userRecs = this.userRecsComponent();
    const newReleases = this.newReleasesComponent();
    return userRecs?.isLoading() || newReleases?.isLoading() || false;
  });

  showDelayedLoading = toDebouncedLoading(this.isLoading, 800);
}
