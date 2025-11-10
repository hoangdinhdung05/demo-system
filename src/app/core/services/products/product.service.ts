import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { BaseResponse } from '../../models/response/base-response';
import { PageResponse } from '../../models/response/page-response';
import { ProductResponse } from '../../models/response/Product/ProductResponse';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProductRequest } from '../../models/request/Product/ProductRequest';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) { }

  getAllProducts(pageNumber: number, pageSize: number): Observable<BaseResponse<PageResponse<ProductResponse>>> {
    const params = new HttpParams()
      .set('pageNumber', String(pageNumber))
      .set('pageSize', String(pageSize));
    return this.http.get<BaseResponse<PageResponse<ProductResponse>>>(this.apiUrl, { params });
  }

  getProductDetails(id: number): Observable<BaseResponse<ProductResponse>> {
    return this.http.get<BaseResponse<ProductResponse>>(`${this.apiUrl}/${id}`);
  }

  deleteProduct(id: number): Observable<BaseResponse<any>> {
    return this.http.delete<BaseResponse<any>>(`${this.apiUrl}/${id}`);
  }

  countProducts(): Observable<number> {
    return this.http.get<BaseResponse<number>>(`${this.apiUrl}/count`)
      .pipe(map(res => res.data));
  }

  /**
   * Create product. Accepts either a ProductRequest object or a FormData instance.
   * Backend expects multipart/form-data with @ModelAttribute, so when a ProductRequest
   * is provided we convert it to FormData; if a FormData is provided we send it directly.
   */
  createProduct(request: ProductRequest | FormData): Observable<BaseResponse<any>> {
    let formData: FormData;

    if (request instanceof FormData) {
      formData = request;
    } else {
      formData = new FormData();
      // Append các field từ ProductRequest
      formData.append('name', request.name);
      formData.append('price', request.price.toString());
      formData.append('description', request.description || '');
      formData.append('quantity', (request.quantity ?? 0).toString());
      formData.append('categoryId', request.categoryId.toString());

      // Nếu có file ảnh
      if ((request as any).imageFile) {
        formData.append('imageFile', (request as any).imageFile as File);
      }
    }

    return this.http.post<BaseResponse<any>>(`${this.apiUrl}/create`, formData);
  }

  updateProduct(id: number, request: ProductRequest): Observable<BaseResponse<any>> {
    return this.http.patch<BaseResponse<any>>(`${this.apiUrl}/${id}`, request);
  }

  exportProductReport(): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/reports/products`, {
      responseType: 'blob'
    });
  }

  uploadImage(id: number, file: File): Observable<BaseResponse<any>> {
    const form = new FormData();
    form.append('file', file);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`
    });

    return this.http.post<BaseResponse<any>>(`${this.apiUrl}/${id}/image`, form, { headers });
  }

  searchByName(name: String): Observable<BaseResponse<ProductResponse[]>> {
    const params = new HttpParams().set('name', name.toString());
    return this.http.post<BaseResponse<ProductResponse[]>>(`${this.apiUrl}/search`, null, { params });
  }
}
