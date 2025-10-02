import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth.service';
import { RegisterRequest } from 'src/app/core/models/request/register-request';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  registerForm: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder, 
    private router: Router, 
    private authService: AuthService
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
      return;
    }

    const request: RegisterRequest = this.registerForm.value;

    this.authService.register(request).subscribe({
      next: (res) => {
        if (res.success) {
          this.router.navigate(['/active']);
        } else {
          if (res.error) {
            Object.keys(res.error).forEach(field => {
              const control = this.registerForm.get(field);
              if (control) {
                control.setErrors({ serverError: res.error?.[field] });
              }
            });
          } else {
            this.errorMessage = res.message; // fallback
          }
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Register fail';
      }
    });
  }
}
