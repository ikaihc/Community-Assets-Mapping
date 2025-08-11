import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { LoadingService } from './loading.service';
import { NotificationService } from './notification.service';

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  job_title?: string;
  role: 'navigator' | 'admin';
  is_active: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user: User;
  token: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  job_title?: string;
  role?: 'navigator' | 'admin';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000'; // Backend API URL
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);

  public currentUser$ = this.currentUserSubject.asObservable();
  public token$ = this.tokenSubject.asObservable();

  constructor(
    private http: HttpClient,
    private loadingService: LoadingService,
    private notificationService: NotificationService
  ) {
    // Check for existing token on service initialization
    this.loadStoredAuth();
  }

  private loadStoredAuth(): void {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('current_user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.tokenSubject.next(token);
        this.currentUserSubject.next(user);
      } catch (error) {
        // Clear invalid stored data
        this.clearStoredAuth();
      }
    }
  }

  private storeAuth(user: User, token: string): void {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('current_user', JSON.stringify(user));
  }

  private clearStoredAuth(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    this.loadingService.show();
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      map(response => {
        if (response.success && response.token && response.user) {
          this.storeAuth(response.user, response.token);
          this.tokenSubject.next(response.token);
          this.currentUserSubject.next(response.user);
          this.notificationService.success(
            `Welcome back, ${response.user.first_name}!`,
            'Login Successful'
          );
        }
        this.loadingService.hide();
        return response;
      }),
      catchError(error => {
        this.notificationService.error(
          error.message || 'Login failed',
          'Authentication Error'
        );
        return this.handleError(error);
      })
    );
  }

  register(userData: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/register`, userData)
      .pipe(
        map(response => {
          if (response.success && response.token && response.user) {
            this.storeAuth(response.user, response.token);
            this.tokenSubject.next(response.token);
            this.currentUserSubject.next(response.user);
          }
          return response;
        }),
        catchError(this.handleError)
      );
  }

  logout(): void {
    this.loadingService.show();
    this.clearStoredAuth();
    this.tokenSubject.next(null);
    this.currentUserSubject.next(null);
    this.notificationService.info('You have been logged out', 'Logout');
    this.loadingService.hide();
  }

  getProfile(): Observable<User> {
    const headers = this.getAuthHeaders();
    return this.http.get<{ success: boolean; user: User }>(`${this.apiUrl}/profile`, { headers })
      .pipe(
        map(response => {
          if (response.success && response.user) {
            this.currentUserSubject.next(response.user);
            this.storeAuth(response.user, this.tokenSubject.value || '');
          }
          return response.user;
        }),
        catchError(this.handleError)
      );
  }

  updateProfile(userData: Partial<User>): Observable<User> {
    const headers = this.getAuthHeaders();
    return this.http.put<{ success: boolean; user: User }>(`${this.apiUrl}/profile`, userData, { headers })
      .pipe(
        map(response => {
          if (response.success && response.user) {
            this.currentUserSubject.next(response.user);
            this.storeAuth(response.user, this.tokenSubject.value || '');
          }
          return response.user;
        }),
        catchError(this.handleError)
      );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/change-password`, {
      currentPassword,
      newPassword
    }, { headers }).pipe(catchError(this.handleError));
  }

  isLoggedIn(): boolean {
    return this.tokenSubject.value !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  // Get HTTP headers with authorization token
  getAuthHeaders(): { [key: string]: string } {
    const token = this.getToken();
    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('AuthService: Adding Authorization header with token');
    } else {
      console.log('AuthService: No token available for headers');
    }

    return headers;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }

  isNavigator(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'navigator';
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
