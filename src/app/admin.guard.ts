import { inject } from '@angular/core';
import { Router, type CanActivateFn, type UrlTree } from '@angular/router';
import { UserProfileService } from './services/user-profile.service';

function isStaffRole(role: string | undefined): boolean {
  return role === 'admin' || role === 'super_admin';
}

export const adminGuard: CanActivateFn = async (_route, state): Promise<boolean | UrlTree> => {
  const auth = inject(UserProfileService);
  const router = inject(Router);

  if (!isStaffRole(auth.profile()?.role)) {
    // The session may still be restoring after a cold start; resolve it before deciding.
    await auth.restore().catch(() => undefined);
  }

  if (isStaffRole(auth.profile()?.role)) return true;

  if (auth.profile()) {
    return router.createUrlTree(['/tabs/tab1']);
  }
  return router.createUrlTree(['/signin'], { queryParams: { returnTo: state.url } });
};
