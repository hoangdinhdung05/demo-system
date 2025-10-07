import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth.service';
import { LoginRequest } from 'src/app/core/models/request/login-request';
import { ToastrService } from 'ngx-toastr';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.toastr.error('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    const request: LoginRequest = this.loginForm.value;
    this.authService.login(request).subscribe({
      next: (response) => {
        const access_token = response.data.accessToken;
        const refresh_token = response.data.refreshToken;

        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);

        this.toastr.success('Đăng nhập thành công!');

        // decode token để lấy role
        const decoded: any = jwtDecode(access_token);
        const role = decoded.roles; // hoặc path đúng với payload của bạn

        console.log("ROLE:" + role);

        if (role === 'ROLE_ADMIN') {
          this.router.navigate(['/admin']);
        } else if (role === 'ROLE_USER') {
          this.router.navigate(['/']); // client home
        } else {
          this.router.navigate(['/auth/login']);
        }
      },
      error: () => {
        this.toastr.error('Tên đăng nhập hoặc mật khẩu không đúng!');
      }
    });
  }

}
