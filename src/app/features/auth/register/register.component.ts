import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth.service';
import { RegisterRequest } from 'src/app/core/models/request/register-request';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private toast: ToastService
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.toast.error('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    const request: RegisterRequest = this.registerForm.value;

    this.authService.register(request).subscribe({
      next: (res) => {
        if (res.success) {
          this.toast.success('Đăng ký thành công! Vui lòng kích hoạt tài khoản.');
          this.router.navigate(['/active']);
        } else {
          this.toast.error(res.message || 'Đăng ký thất bại!');
        }
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Có lỗi xảy ra!');
      }
    });
  }
}
