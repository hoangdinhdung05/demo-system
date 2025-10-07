import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { LoginRequest } from './models/request/login-request';
import { RegisterRequest } from './models/request/register-request';
import { BaseResponse } from './models/response/base-response';
import { AuthResponse } from './models/response/auth-response';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  /** Đăng nhập */
  login(request: LoginRequest): Observable<BaseResponse<AuthResponse>> {
    return this.http.post<BaseResponse<AuthResponse>>(`${this.apiUrl}/login`, request)
      .pipe(
        tap(res => {
          if (res.data?.accessToken) this.saveToken(res.data.accessToken);
          if (res.data?.refreshToken) this.saveRefreshToken(res.data.refreshToken);
        })
      );
  }

  /** Đăng ký */
  register(request: RegisterRequest): Observable<BaseResponse<any>> {
    return this.http.post<BaseResponse<any>>(`${this.apiUrl}/register`, request);
  }

  /** Kích hoạt tài khoản */
  active(request: { email: string; otp: string }): Observable<BaseResponse<any>> {
    return this.http.post<BaseResponse<any>>(`${this.apiUrl}/active`, request);
  }

  /** Refresh token */
  refreshToken(): Observable<BaseResponse<AuthResponse>> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return throwError(() => new Error('No refresh token available'));

    return this.http.post<BaseResponse<AuthResponse>>(
      `${this.apiUrl}/refresh-token`,
      { refreshToken }
    ).pipe(
      tap(res => {
        if (res.data?.accessToken) this.saveToken(res.data.accessToken);
        if (res.data?.refreshToken) this.saveRefreshToken(res.data.refreshToken);
      })
    );
  }

  /** Lấy access token từ sessionStorage */
  getToken(): string | null {
    return sessionStorage.getItem('access_token');
  }

  /** Lấy refresh token từ localStorage */
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  /** Lưu access token vào sessionStorage */
  saveToken(token: string) {
    sessionStorage.setItem('access_token', token);
  }

  /** Lưu refresh token vào localStorage */
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

  /** Logout: gọi API rồi xóa tất cả token */
  logout(): void {
    this.logoutAPI().subscribe({
      next: () => this.clearAllTokens(),
      error: () => this.clearAllTokens()
    });
  }

  /** Gọi API logout */
  private logoutAPI(): Observable<any> {
    const accessToken = this.getToken();
    const refreshToken = this.getRefreshToken();

    if (!accessToken && !refreshToken) return of(null);

    return this.http.post(`${this.apiUrl}/logout`, { accessToken, refreshToken });
  }

  /** Xóa cả access + refresh token */
  private clearAllTokens() {
    this.clearToken();
    this.clearRefreshToken();
  }

  /** Lấy role user từ access token */
  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded: any = jwtDecode(token);
      const roles = decoded.roles || decoded.role || null;
      if (Array.isArray(roles)) return roles[0]; // Lấy role đầu tiên nếu là array
      return roles;
    } catch (error) {
      console.error('Invalid token:', error);
      this.clearToken();
      return null;
    }
  }
}
