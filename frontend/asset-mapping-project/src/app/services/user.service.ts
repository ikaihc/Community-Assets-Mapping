import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  job_title?: string;
  role: 'guest' | 'navigator' | 'admin';
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserResponse {
  success: boolean;
  message?: string;
  user?: User;
  users?: User[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  job_title?: string;
  role?: 'guest' | 'navigator' | 'admin';
}

export interface UpdateUserRequest {
  email?: string;
  first_name?: string;
  last_name?: string;
  job_title?: string;
  role?: 'guest' | 'navigator' | 'admin';
  is_active?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Get all users (requires admin role)
  getUsers(page = 1, limit = 10): Observable<UserResponse> {
    console.log('UserService: Making API call to get users');
    console.log('UserService: URL:', `${this.apiUrl}/users?page=${page}&limit=${limit}`);

    const headers = this.authService.getAuthHeaders();
    console.log('UserService: Using headers:', headers);

    return this.http.get<UserResponse>(`${this.apiUrl}/users?page=${page}&limit=${limit}`, { headers }).pipe(
      tap((response: UserResponse) => console.log('UserService: API response:', response)),
      catchError(error => {
        console.error('UserService: API error:', error);
        return this.handleError(error);
      })
    );
  }

  // Get user by ID (requires admin role)
  getUserById(id: number): Observable<UserResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<UserResponse>(`${this.apiUrl}/users/${id}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Create user (requires admin role)
  createUser(userData: CreateUserRequest): Observable<UserResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post<UserResponse>(`${this.apiUrl}/users`, userData, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Update user (requires admin role)
  updateUser(id: number, userData: UpdateUserRequest): Observable<UserResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.put<UserResponse>(`${this.apiUrl}/users/${id}`, userData, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Delete user (requires admin role)
  deleteUser(id: number): Observable<UserResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.delete<UserResponse>(`${this.apiUrl}/users/${id}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Activate user (requires admin role)
  activateUser(id: number): Observable<UserResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.put<UserResponse>(`${this.apiUrl}/users/${id}`, { is_active: true }, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Deactivate user (requires admin role)
  deactivateUser(id: number): Observable<UserResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.put<UserResponse>(`${this.apiUrl}/users/${id}`, { is_active: false }, { headers }).pipe(
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
