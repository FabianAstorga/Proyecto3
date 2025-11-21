// src/app/services/auth.guard.ts
import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    return this.checkAccess(route, state);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    return this.checkAccess(childRoute, state);
  }

  private checkAccess(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    // 1) Debe estar logueado
    if (!this.authService.isLoggedIn()) {
      // ❗ Importante: redirigimos a '/', NO a '/login'
      return this.router.createUrlTree(['/'], {
        queryParams: { returnUrl: state.url },
      });
    }

    // 2) Si la ruta NO define roles, dejamos pasar
    const allowedRoles = route.data?.['roles'] as string[] | undefined;
    if (!allowedRoles || allowedRoles.length === 0) {
      return true;
    }

    // 3) Validar rol del usuario (del token)
    const userRole = this.authService.getUserRole()?.toLowerCase();
    if (userRole && allowedRoles.map((r) => r.toLowerCase()).includes(userRole)) {
      return true;
    }

    // 4) No autorizado → lo mando al "home" según su rol
    const fallback = this.authService.getHomeRouteForRole() || '/';
    return this.router.parseUrl(fallback);
  }
}

