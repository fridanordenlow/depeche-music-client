import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RecommendationService } from '../../services/recommendation';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Loading } from '../../shared/loading/loading';
import { filter, startWith, switchMap } from 'rxjs';
import { Location, DatePipe } from '@angular/common';

@Component({
  selector: 'app-recommendation-detail',
  imports: [RouterLink, MatIconModule, Loading, DatePipe],
  templateUrl: './recommendation-detail.html',
  styleUrl: './recommendation-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecommendationDetail {
  private readonly service = inject(RecommendationService);
  private readonly location = inject(Location);

  // Route input from /recommendations/:id
  id = input.required<string>();

  private params = computed(() => {
    const recId = this.id();
    return recId ? { id: recId } : null;
  });

  recommendation = toSignal(
    toObservable(this.params).pipe(
      filter((p) => p !== null),
      switchMap(({ id }) => this.service.getRecommendationById(id)),
      startWith(null)
    )
  );

  goBack() {
    this.location.back();
  }
  isLoading = computed(() => !this.recommendation());
}
