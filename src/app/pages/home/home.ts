import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NewReleases } from '../../components/new-releases/new-releases';
import { UserReleasesRecommendations } from '../../components/user-releases-recommendations/user-releases-recommendations';

@Component({
  selector: 'app-home',
  imports: [NewReleases, UserReleasesRecommendations],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {}
