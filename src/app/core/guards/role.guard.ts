import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../auth.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRole = route.data['role'];
    const userRole = this.authService.getUserRole();

    // Chưa có role => chưa đăng nhập
    if (!userRole) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    // Đăng nhập rồi nhưng sai quyền
    if (userRole !== expectedRole) {
      this.toastr.warning('Bạn không có quyền truy cập vào trang này!');
      this.router.navigate(['/']); // quay về client/home
      return false;
    }

    return true;
  }
}
