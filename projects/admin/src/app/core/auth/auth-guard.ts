import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Si aún no está resuelto, no bloqueamos aquí.
  // El initializer ya debe haber cargado el estado antes del router.
  // if (!auth.isReady()) {
  //   return true;
  // }

  if (auth.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};