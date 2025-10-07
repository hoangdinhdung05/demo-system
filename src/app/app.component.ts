import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  showAdminLayout = false;
  showClientLayout = false;

  constructor(private router: Router, private authService: AuthService) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url = event.urlAfterRedirects;

        // ẩn layout cho auth route
        const isAuthRoute = /^\/auth(\/.*)?$/.test(url);

        if (isAuthRoute) {
          this.showAdminLayout = false;
          this.showClientLayout = false;
          return;
        }

        // kiểm tra role từ token
        const role = this.authService.getUserRole();
        if (role === 'ROLE_ADMIN') {
          this.showAdminLayout = true;
          this.showClientLayout = false;

          // nếu user cố tình vào /user hoặc / → redirect admin dashboard
          if (!url.startsWith('/admin')) {
            this.router.navigate(['/admin']);
          }
        } else if (role === 'ROLE_USER') {
          this.showAdminLayout = false;
          this.showClientLayout = true;

          // nếu user cố tình vào /admin → redirect home
          if (url.startsWith('/admin')) {
            this.router.navigate(['/']);
          }
        } else {
          // không login → redirect auth
          this.router.navigate(['/auth/login']);
        }
      });
  }
}
