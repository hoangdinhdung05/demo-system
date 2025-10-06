import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'angular';
  showLayout = true;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        // kiểm tra nếu route chứa '/auth' ở bất kỳ vị trí nào (đăng nhập, đăng ký,...)
        const isAuthRoute = /^\/auth(\/.*)?$/.test(event.urlAfterRedirects);
        this.showLayout = !isAuthRoute;
      });
  }
}
