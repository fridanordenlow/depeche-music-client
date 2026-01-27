import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RecommendationService } from '../../services/recommendation';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { SpotifyService } from '../../services/spotify';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { filter, startWith, switchMap } from 'rxjs';
import { Album, Artist, Track } from '../../models/music';

@Component({
  selector: 'app-recommendation-form',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    RouterLink,
  ],
  templateUrl: './recommendation-form.html',
  styleUrl: './recommendation-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecommendationForm {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(RecommendationService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  private readonly spotify = inject(SpotifyService);

  // Route-bound inputs
  type = input<'album' | 'artist' | 'track'>();
  id = input<string>('');

  private params = computed(() => {
    const t = this.type();
    const i = this.id();
    if (!t || !i) return null;
    return { type: t, id: i };
  });

  // Fetch item details to show metadata and image
  details = toSignal(
    toObservable(this.params).pipe(
      filter((p) => p !== null),
      switchMap(({ type, id }) => {
        if (type === 'album') return this.spotify.getAlbum(id);
        if (type === 'artist') return this.spotify.getArtist(id);
        return this.spotify.getTrack(id);
      }),
      startWith(null)
    )
  );

  // Helpers to cast
  albumDetails = computed(() => (this.type() === 'album' ? (this.details() as Album) : null));
  artistDetails = computed(() => (this.type() === 'artist' ? (this.details() as Artist) : null));
  trackDetails = computed(() => (this.type() === 'track' ? (this.details() as Track) : null));

  readonly form = this.fb.group({
    review: this.fb.control('', { validators: [Validators.required, Validators.minLength(10)] }),
  });

  submitting = false;

  submit() {
    if (this.form.invalid || this.submitting) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting = true;
    const { review } = this.form.getRawValue();
    const type = this.type();
    const spotifyId = this.id();
    if (!type || !spotifyId) {
      this.snackBar.open('Missing item info. Use the details page link.', 'Close', {
        duration: 3000,
      });
      this.submitting = false;
      return;
    }
    this.service.createRecommendation({ type, spotifyId, review: review! }).subscribe({
      next: () => {
        this.snackBar.open('Recommendation submitted!', 'Close', { duration: 2500 });
        this.form.reset({ review: '' });
        this.submitting = false;
        // Navigate to library of user recommendations or go back to details page?
        // this.router.navigate(['/library']);
      },
      error: () => {
        this.snackBar.open('Failed to submit recommendation', 'Close', { duration: 3000 });
        this.submitting = false;
      },
    });
  }
}
