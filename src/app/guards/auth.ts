import { inject } from '@angular/core';
import { AuthService } from '../services/auth';
import { Router } from '@angular/router';

export const authGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  console.log('Access denied - Redirecting to login');

  return router.createUrlTree(['/auth'], {
    queryParams: { reason: 'denied' },
  });
};
