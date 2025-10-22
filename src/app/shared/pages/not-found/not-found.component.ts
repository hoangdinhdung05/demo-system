import { Component } from '@angular/core';

@Component({
  selector: 'app-not-found',
  template: `
    <div class="container py-5 text-center">
      <h1 class="mb-3">404 - Page not found</h1>
      <p>Trang bạn tìm không tồn tại hoặc đã bị di chuyển.</p>
      <a routerLink="/ng" class="btn btn-primary mt-3">Về trang chủ</a>
    </div>
  `
})
export class NotFoundComponent {}
