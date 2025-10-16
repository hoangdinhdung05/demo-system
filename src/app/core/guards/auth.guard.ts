import { Injectable } from '@angular/core';
import { CanMatch, Route, UrlSegment, Router, UrlTree } from '@angular/router';
import { AuthService } from '../auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanMatch {
  constructor(private auth: AuthService, private router: Router) {}

  canMatch(_route: Route, _segments: UrlSegment[]): boolean | UrlTree {
    return this.auth.isAuthenticated()
      ? true
      : this.router.createUrlTree(['/auth/login']);
  }
}
