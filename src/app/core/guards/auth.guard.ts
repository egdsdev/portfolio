import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { lazyFirebase } from '../services/firebase.loader';

export const authGuard: CanActivateFn = async () => {
  const firebase = lazyFirebase();
  const router = inject(Router);
  const loggedIn = await (await firebase()).isLoggedIn();
  if (!loggedIn) {
    router.navigate(['/admin/login']);
    return false;
  }
  return true;
};
