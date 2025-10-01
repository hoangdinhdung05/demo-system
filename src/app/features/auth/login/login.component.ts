import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth.service';
import { LoginRequest } from 'src/app/core/models/request/login-request';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder, 
    private authService: AuthService, 
    private router: Router) {

    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched(); 
      return;
    }

    const request: LoginRequest = this.loginForm.value;
    this.authService.login(request).subscribe({
      next: (response) => {
        // Lấy token trong response.data
        const access_token = response.data.accessToken;
        const refresh_token = response.data.refreshToken;

        console.log("Access_Token:", access_token);
        console.log("Refresh_Token:", refresh_token);

        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);

        this.router.navigate(['/']); // Trang home
      },
      error: (error) => {
        this.errorMessage = 'Username or password incorrect';
      }
    });
  }
}
