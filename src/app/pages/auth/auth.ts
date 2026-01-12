import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthCredentials } from '../../models/auth';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';

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
})
export class Auth {
  public isLoginMode = signal(true);
  public isPasswordHidden = true;

  public authService = inject(AuthService);
  public router = inject(Router);

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

    const credentials = this.authForm.getRawValue() as AuthCredentials;

    try {
      if (this.isLoginMode()) {
        const response = await lastValueFrom(this.authService.login(credentials));
        console.log('Successful login:', response);
      } else {
        const response = await lastValueFrom(this.authService.register(credentials));
        console.log('Successful registration:', response);
      }
      this.router.navigate(['/library']);
    } catch (error) {
      console.error('Login failed:', error);
    }
  }
}
