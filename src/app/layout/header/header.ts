import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { debounceTime, distinctUntilChanged, filter, take } from 'rxjs';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-header',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatDivider,
    MatFormField,
    MatIconModule,
    MatInputModule,
    MatLabel,
    MatMenuModule,
    MatToolbarModule,
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  private readonly router = inject(Router);
  // private destroyRef = inject(DestroyRef);
  public auth = inject(AuthService);

  searchControl = new FormControl('');

  constructor() {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        filter((query): query is string => !!query && query.length > 2),
        takeUntilDestroyed()
      )
      .subscribe((query) => {
        this.router.navigate(['/search'], { queryParams: { q: query } });
      });

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe(() => {
        this.searchControl.setValue('', { emitEvent: false });
      });
  }

  onLogin() {
    this.router.navigate(['/auth']);
    // Todo: Add redirect to current page after login
  }

  onLogout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
