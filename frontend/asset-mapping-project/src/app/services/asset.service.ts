import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface Asset {
  id?: number;
  name: string;
  description?: string;
  service_type?: string;
  status: 'pending' | 'approved' | 'rejected';
  has_volunteer_opportunities?: boolean;
  website?: string;
  phone?: string;
  email?: string;
  created_by?: number;
  last_Update_By?: number;
  approved_by?: number;
  address_id?: number;
  contact_Info_Id?: number;
  created_at?: string;
  updated_at?: string;
  // Relations
  address?: Address;
  contact?: AssetContact;
  creator?: User;
  categories?: Category[];
}

export interface Address {
  id?: number;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  province: string;
  postal_code: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export interface AssetContact {
  id?: number;
  contact_name: string;
  contact_email?: string;
  contact_phone?: string;
  contact_title?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'navigator' | 'admin';
}

export interface CreateAssetRequest {
  name: string;
  description?: string;
  service_type?: string;
  has_volunteer_opportunities?: boolean;
  website?: string;
  phone?: string;
  email?: string;
  address: Omit<Address, 'id'>;
  contact: Omit<AssetContact, 'id'>;
  category_ids?: number[];
}

export interface AssetResponse {
  success: boolean;
  message?: string;
  asset?: Asset;
  assets?: Asset[];
  total?: number;
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AssetService {
  private apiUrl = 'http://localhost:3000'; // Backend API URL

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Get all assets (includes authentication for admin/navigator access)
  getAssets(page = 1, limit = 10, status?: string, sortBy?: string, sortOrder?: string): Observable<AssetResponse> {
    let url = `${this.apiUrl}/assets?page=${page}&limit=${limit}`;
    if (status) {
      url += `&status=${status}`;
    }
    if (sortBy) {
      url += `&sortBy=${sortBy}`;
    }
    if (sortOrder) {
      url += `&sortOrder=${sortOrder}`;
    }

    // Include auth headers so admin/navigator can see all assets
    const headers = this.authService.getAuthHeaders();
    return this.http.get<AssetResponse>(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Get asset by ID (public endpoint)
  getAssetById(id: number): Observable<AssetResponse> {
    return this.http.get<AssetResponse>(`${this.apiUrl}/assets/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Create new asset (public endpoint for guest users)
  createAsset(assetData: CreateAssetRequest): Observable<AssetResponse> {
    return this.http.post<AssetResponse>(`${this.apiUrl}/assets`, assetData).pipe(
      catchError(this.handleError)
    );
  }

  // Get user's own assets (requires authentication)
  getMyAssets(): Observable<AssetResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<AssetResponse>(`${this.apiUrl}/assets/my`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Update asset (requires authentication)
  updateAsset(id: number, assetData: Partial<CreateAssetRequest & {status: string}>): Observable<AssetResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.put<AssetResponse>(`${this.apiUrl}/assets/${id}`, assetData, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Delete asset (requires authentication)
  deleteAsset(id: number): Observable<AssetResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.delete<AssetResponse>(`${this.apiUrl}/assets/${id}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Get pending assets (requires navigator/admin role)
  getPendingAssets(): Observable<AssetResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<AssetResponse>(`${this.apiUrl}/assets/pending`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Get asset statistics (requires navigator/admin role)
  getAssetStats(): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<any>(`${this.apiUrl}/assets/stats`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Get assets by status (requires navigator/admin role)
  getAssetsByStatus(status: string): Observable<AssetResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<AssetResponse>(`${this.apiUrl}/assets/status/${status}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Approve asset (requires navigator/admin role)
  approveAsset(id: number): Observable<AssetResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.put<AssetResponse>(`${this.apiUrl}/assets/${id}`, {
      asset_status: 'approved'
    }, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Reject asset (requires navigator/admin role)
  rejectAsset(id: number): Observable<AssetResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.put<AssetResponse>(`${this.apiUrl}/assets/${id}`, {
      asset_status: 'rejected'
    }, { headers }).pipe(
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
