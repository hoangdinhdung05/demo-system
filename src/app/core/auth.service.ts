import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { LoginRequest } from './models/request/login-request';
import { BaseResponse } from './models/response/base-response';
import { AuthResponse } from './models/response/auth-response';
import { RegisterRequest } from './models/request/register-request';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  login(request: LoginRequest): Observable<BaseResponse<AuthResponse>> {
    return this.http.post<BaseResponse<AuthResponse>>(`${this.apiUrl}/login`, request);
  }

  register(request: RegisterRequest): Observable<BaseResponse<any>> {
    return this.http.post<BaseResponse<any>>(`${this.apiUrl}/register`, request);
  }

  active(request: { email: string; otp: string }) {
    return this.http.post<any>(`${this.apiUrl}/active`, request);
  }

  // Lấy token từ localStorage
  getToken(): string | null {
    return localStorage.getItem('access_token'); // ✅ phải trùng key lúc lưu
  }

  // Lấy role từ token
  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const decoded: any = jwtDecode(token);
      return decoded.roles || null; // hoặc decoded.role nếu payload là 'role'
    } catch (error) {
      console.error('Invalid token', error);
      return null;
    }
  }

  // Lưu token
  saveToken(token: string) {
    localStorage.setItem('access_token', token); // ✅ đồng bộ key
  }

  // Xóa token khi logout
  clearToken() {
    localStorage.removeItem('access_token'); // ✅ đồng bộ key
  }
}
