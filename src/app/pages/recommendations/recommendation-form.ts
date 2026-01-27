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
import { RouterLink } from '@angular/router';
import { SpotifyService } from '../../services/spotify';
import { Album, Artist, Track } from '../../models/music';
import { firstValueFrom } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ErrorStateMatcher } from '@angular/material/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-recommendation-form',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSnackBarModule,
    RouterLink,
  ],
  templateUrl: './recommendation-form.html',
  styleUrl: './recommendation-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecommendationForm {
  private readonly recService = inject(RecommendationService);
  private readonly spotifyService = inject(SpotifyService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly location = inject(Location);

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

  async submit() {
    if (!this.isValid() || this.isSubmitting()) return;

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
      this.location.back();
    } catch (error) {
      this.snackBar.open('Failed to submit', 'Close', { duration: 3000 });
    } finally {
      this.isSubmitting.set(false);
    }
  }

  cancel() {
    this.location.back();
  }
}
