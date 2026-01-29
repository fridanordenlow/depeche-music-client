import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
  linkedSignal,
  resource,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RecommendationService } from '../../services/recommendation';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { SpotifyService } from '../../services/spotify';
import { Album, Artist, Track } from '../../models/music';
import { firstValueFrom } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ErrorStateMatcher } from '@angular/material/core';

@Component({
  selector: 'app-recommendation-form',
  imports: [MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSnackBarModule],
  templateUrl: './recommendation-form.html',
  styleUrl: './recommendation-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecommendationForm {
  private readonly recService = inject(RecommendationService);
  private readonly spotifyService = inject(SpotifyService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  type = input.required<'album' | 'artist' | 'track'>();
  id = input.required<string>();

  detailsResource = resource({
    loader: async () => {
      const type = this.type();
      const id = this.id();
      if (type === 'album') return firstValueFrom(this.spotifyService.getAlbum(id));
      if (type === 'artist') return firstValueFrom(this.spotifyService.getArtist(id));
      return firstValueFrom(this.spotifyService.getTrack(id));
    },
  });

  userRecommendations = resource({
    loader: async () => {
      return firstValueFrom(this.recService.getUserRecommendations());
    },
  });

  hasAlreadyRecommended = computed(() => {
    const recs = this.userRecommendations.value();
    const currentId = this.id();
    return recs?.some((rec) => rec.spotifyId === currentId) ?? false;
  });

  review = linkedSignal({
    source: this.id,
    computation: () => '',
  });

  isSubmitting = signal(false);
  isValid = computed(() => this.review().trim().length >= 10);

  // Not working as expected yet
  readonly errorStateMatcher: ErrorStateMatcher = {
    isErrorState: () => {
      return this.review().length > 0 && !this.isValid();
    },
  };

  // Could be moved to utility function later
  albumDetails = computed(() => {
    const val = this.detailsResource.value();
    return this.type() === 'album' ? (val as Album) : null;
  });
  artistDetails = computed(() => {
    const val = this.detailsResource.value();
    return this.type() === 'artist' ? (val as Artist) : null;
  });
  trackDetails = computed(() => {
    const val = this.detailsResource.value();
    return this.type() === 'track' ? (val as Track) : null;
  });

  itemTypeLabel = computed(() => {
    const type = this.type();
    return type.charAt(0).toUpperCase() + type.slice(1);
  });

  async submit() {
    if (!this.isValid() || this.isSubmitting()) return;

    if (this.hasAlreadyRecommended()) {
      this.snackBar.open('You have already recommended this item.', 'Close', { duration: 3000 });
      return;
    }

    this.isSubmitting.set(true);

    try {
      await firstValueFrom(
        this.recService.createRecommendation({
          type: this.type(),
          spotifyId: this.id(),
          review: this.review(),
        })
      );

      this.snackBar.open('Recommendation submitted!', 'Close', { duration: 2500 });
      this.review.set('');
      this.router.navigate(['/details', this.type(), this.id()]);
    } catch (error: any) {
      let message = 'Failed to submit recommendation.';
      if (error?.status === 401 || error?.status === 403) {
        message = 'You must be logged in to submit recommendations.';
      } else if (error?.status === 400) {
        message = error.error?.message || 'Invalid recommendation. Please check your review.';
      } else if (error?.status === 409) {
        message = 'You have already recommended this item.';
      }
      this.snackBar.open(message, 'Close', { duration: 3000 });
    } finally {
      this.isSubmitting.set(false);
    }
  }

  cancel() {
    this.router.navigate(['/details', this.type(), this.id()]);
  }
}
