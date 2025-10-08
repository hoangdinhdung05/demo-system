import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseResponse } from '../../models/response/base-response';
import { PageResponse } from '../../models/response/page-response';
import { UserResponse } from '../../models/response/user-response';
import { AdminCreateUserRequest } from '../../models/request/Users/AdminCreateUserRequest';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;
  
  constructor(private http: HttpClient) { }

  getAllUsers(pageNumber: number, pageSize: number): Observable<BaseResponse<PageResponse<UserResponse>>> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);
    
    return this.http.get<BaseResponse<PageResponse<UserResponse>>>(this.apiUrl, { params });
  }

  adminCreateUser(request: AdminCreateUserRequest): Observable<BaseResponse<any>> {
    return this.http.post<BaseResponse<any>>(`${this.apiUrl}`, request);
  }  

  exportUserReport(): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/reports/users`, {
      responseType: 'blob'
    });
  }
}
