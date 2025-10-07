import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { LoginRequest } from './models/request/login-request';
import { BaseResponse } from './models/response/base-response';
import { AuthResponse } from './models/response/auth-response';
import { RegisterRequest } from './models/request/register-request';
import { jwtDecode} from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  /** Đăng nhập */
  login(request: LoginRequest): Observable<BaseResponse<AuthResponse>> {
    return this.http.post<BaseResponse<AuthResponse>>(`${this.apiUrl}/login`, request);
  }

  /** Đăng ký */
  register(request: RegisterRequest): Observable<BaseResponse<any>> {
    return this.http.post<BaseResponse<any>>(`${this.apiUrl}/register`, request);
  }

  /** Kích hoạt tài khoản */
  active(request: { email: string; otp: string }) {
    return this.http.post<any>(`${this.apiUrl}/active`, request);
  }

  /** Refresh token */
  refreshToken(): Observable<BaseResponse<AuthResponse>> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token'));
    }
    return this.http.post<BaseResponse<AuthResponse>>(
      `${this.apiUrl}/refresh-token`,
      { refreshToken }
    );
  }

  /** Lấy access token từ localStorage */
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /** Lấy refresh token từ localStorage */
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  /** Lấy role của user từ access token */
  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const decoded: any = jwtDecode(token);
      return decoded.roles || null; // hoặc decoded.role nếu backend trả 'role'
    } catch (error) {
      console.error('Invalid token', error);
      return null;
    }
  }

  /** Lưu access token */
  saveToken(token: string) {
    localStorage.setItem('access_token', token);
  }

  /** Lưu refresh token */
  saveRefreshToken(token: string) {
    localStorage.setItem('refresh_token', token);
  }

  /** Xóa access token */
  clearToken() {
    localStorage.removeItem('access_token');
  }

  /** Xóa refresh token */
  clearRefreshToken() {
    localStorage.removeItem('refresh_token');
  }

  /** Logout: xóa tất cả token */
  logout() {
    this.clearToken();
    this.clearRefreshToken();
  }
}
