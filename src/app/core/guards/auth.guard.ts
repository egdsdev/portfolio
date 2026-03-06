import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';

export const authGuard: CanActivateFn = async () => {
  const firebase = inject(FirebaseService);
  const router = inject(Router);
  const loggedIn = await firebase.isLoggedIn();
  if (!loggedIn) {
    router.navigate(['/admin/login']);
    return false;
  }
  return true;
};
