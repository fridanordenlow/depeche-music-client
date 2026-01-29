import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading',
  imports: [MatProgressSpinner],
  templateUrl: './loading.html',
  styleUrl: './loading.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Loading {
  diameter = input(50);
  text = input('Loading...');
}
