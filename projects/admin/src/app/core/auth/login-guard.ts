import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const loginGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // if (!auth.isReady()) {
  //   return true;
  // }

  if (!auth.isLoggedIn()) {
    return true;
  }

  const returnUrl = route.queryParamMap.get('returnUrl') || '/dashboard';
  return router.createUrlTree([returnUrl]);
};