import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRole = route.data['role'];
    const userRole = this.authService.getUserRole();

    if (!userRole) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    if (userRole !== expectedRole) {
      // Chuyển hướng nếu role không đúng
      this.router.navigate(['/']); // hoặc /user
      return false;
    }

    return true;
  }
}
