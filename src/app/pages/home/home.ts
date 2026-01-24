import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NewReleases } from '../../components/new-releases/new-releases';

@Component({
  selector: 'app-home',
  imports: [NewReleases],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {}
