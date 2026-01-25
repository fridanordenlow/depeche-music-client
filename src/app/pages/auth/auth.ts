import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth';
import { AuthCredentials } from '../../models/auth';

@Component({
  selector: 'app-auth',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './auth.html',
  styleUrl: './auth.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Auth {
  public authService = inject(AuthService);
  public router = inject(Router);
  public isLoginMode = signal(true);
  public isPasswordHidden = true;
  public errorMessage = signal<string | null>(null);

  private route = inject(ActivatedRoute);

  public accessDenied = toSignal(
    this.route.queryParams.pipe(map((params) => params['reason'] === 'denied'))
  );

  public authForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    username: new FormControl('', []),
  });

  public toggleMode(): void {
    this.isLoginMode.update((val) => !val);

    const usernameControl = this.authForm.get('username');
    // If we are in register mode, add validators to username
    if (!this.isLoginMode()) {
      usernameControl?.setValidators([Validators.required, Validators.minLength(3)]);
    } else {
      // If we are in login mode, remove validators from username
      usernameControl?.clearValidators();
    }
    usernameControl?.updateValueAndValidity();
  }

  public async onSubmit(): Promise<void> {
    if (this.authForm.invalid) return;

    this.errorMessage.set(null);

    // const credentials = this.authForm.getRawValue() as AuthCredentials;

    const rawValues = this.authForm.getRawValue();
    const credentials: AuthCredentials = {
      ...rawValues,
      email: rawValues.email?.trim().toLowerCase() ?? '',
      password: rawValues.password ?? '',
      username: rawValues.username ?? undefined,
    };

    const request$ = this.isLoginMode()
      ? this.authService.login(credentials)
      : this.authService.register(credentials);

    request$.subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/library';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        if (err.status === 401) {
          this.errorMessage.set('Invalid email or password.');
        } else {
          this.errorMessage.set('An unexpected error occurred. Please try again later.');
        }
      },
    });
  }
}
