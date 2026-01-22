import { inject } from '@angular/core';
import { AuthService } from '../services/auth';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';

// route is needed as a placeholder for canActivate but is not used here
export const authGuard = (_route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  console.log('Access denied - Redirecting to login from:', state.url);

  return router.createUrlTree(['/auth'], {
    queryParams: { returnUrl: state.url, reason: 'denied' },
  });
};
