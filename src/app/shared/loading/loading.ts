import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading',
  imports: [MatProgressSpinner],
  template: `
    <div class="loading-container">
      <mat-spinner [diameter]="diameter()"></mat-spinner>
    </div>
  `,
  styles: `
    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 4rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Loading {
  diameter = input(50);
}
