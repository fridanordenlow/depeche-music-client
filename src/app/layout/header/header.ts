import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-header',
  imports: [RouterLink, MatButtonModule, MatDivider, MatIconModule, MatMenuModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  private readonly router = inject(Router);
  public auth = inject(AuthService);

  onLogin() {
    this.router.navigate(['/auth'], { queryParams: { returnUrl: this.router.url } });
  }

  onLogout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
