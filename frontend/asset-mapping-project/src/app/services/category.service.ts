import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface Category {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryResponse {
  success: boolean;
  message?: string;
  category?: Category;
  categories?: Category[];
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = 'http://localhost:3000';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Get all categories (public endpoint)
  getCategories(): Observable<CategoryResponse> {
    return this.http.get<CategoryResponse>(`${this.apiUrl}/categories`).pipe(
      catchError(this.handleError)
    );
  }

  // Get category by ID (public endpoint)
  getCategoryById(id: number): Observable<CategoryResponse> {
    return this.http.get<CategoryResponse>(`${this.apiUrl}/categories/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Create category (requires admin role)
  createCategory(categoryData: CreateCategoryRequest): Observable<CategoryResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post<CategoryResponse>(`${this.apiUrl}/categories`, categoryData, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Update category (requires admin role)
  updateCategory(id: number, categoryData: Partial<CreateCategoryRequest>): Observable<CategoryResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.put<CategoryResponse>(`${this.apiUrl}/categories/${id}`, categoryData, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Delete category (requires admin role)
  deleteCategory(id: number): Observable<CategoryResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.delete<CategoryResponse>(`${this.apiUrl}/categories/${id}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Backend error
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.status === 0) {
        errorMessage = 'Unable to connect to server. Please check your internet connection.';
      } else {
        errorMessage = `Server error: ${error.status}`;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}
