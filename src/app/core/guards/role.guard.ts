import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs';

export const roleGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const expectedRoles: string[] = route.data['roles'];

    return authService.currentUserProfile$.pipe(
        take(1),
        map(profile => {
            if (!profile) {
                router.navigate(['/login']);
                return false;
            }

            if (expectedRoles.includes(profile.role)) {
                return true;
            }

            // If user doesn't have permission, redirect to dashboard
            router.navigate(['/dashboard']);
            return false;
        })
    );
};
