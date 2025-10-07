import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-active',
  templateUrl: './active.component.html',
  styleUrls: ['./active.component.css']
})
export class ActiveComponent implements OnInit {

  activeForm!: FormGroup;
  email!: string;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    // Lấy email từ query param
    this.route.queryParams.subscribe(params => {
      this.email = params['email'];
    });

    // Form chỉ có trường OTP
    this.activeForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(4)]],
    });
  }

  onSubmit(): void {
    if (this.activeForm.invalid) {
      this.toast.error('Vui lòng nhập mã OTP!');
      return;
    }

    const payload = {
      email: this.email,
      otp: this.activeForm.value.otp
    };

    this.authService.active(payload).subscribe({
      next: (res) => {
        if (res.success) {
          this.toast.success('Kích hoạt tài khoản thành công! Bạn có thể đăng nhập.');
          this.router.navigate(['/auth/login']);
        } else {
          this.toast.error(res.message || 'Kích hoạt thất bại!');
        }
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Mã OTP không hợp lệ hoặc đã hết hạn!');
      }
    });
  }
}
