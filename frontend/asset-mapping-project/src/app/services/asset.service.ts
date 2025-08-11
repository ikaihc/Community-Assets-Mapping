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
  service_hrs?: string;  // JSON string containing schedule data
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

  // Computed properties for frontend use
  schedule?: Schedule;   // Parsed schedule object

  // Relations
  address?: Address;
  contact?: AssetContact;
  creator?: User;
  categories?: Category[];
}

export interface ScheduleEntry {
  id?: string;
  startDate?: string;    // ISO date string for specific dates
  endDate?: string;      // ISO date string for date ranges
  days?: string[];       // ['monday', 'tuesday', ...] for recurring
  startTime: string;     // HH:mm format
  endTime: string;       // HH:mm format
  isRecurring: boolean;  // true for weekly recurring, false for specific dates
  notes?: string;        // Additional info like "daily", "weekends only"
}

export interface Schedule {
  type: 'manual' | 'recurring' | 'specific_dates';
  entries: ScheduleEntry[];
  timezone?: string;
  lastUpdated?: string;
}

export interface Address {
  id?: number;
  street_address?: string;  // Database field name
  city?: string;
  city_code?: string;       // Database field name (like province/state)
  post_code?: string;       // Database field name
  latitude?: number;
  longitude?: number;
  google_maps_url?: string;

  // Keep the old field names for backward compatibility
  address_line_1?: string;
  address_line_2?: string;
  province?: string;
  postal_code?: string;
  country?: string;
}export interface AssetContact {
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
  data?: Asset;  // For single asset responses like getAssetById
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

  // Get asset by ID (requires auth for full details)
  getAssetById(id: number): Observable<AssetResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<AssetResponse>(`${this.apiUrl}/assets/${id}`, { headers }).pipe(
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
      status: 'approved'
    }, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Reject asset (requires navigator/admin role)
  rejectAsset(id: number): Observable<AssetResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.put<AssetResponse>(`${this.apiUrl}/assets/${id}`, {
      status: 'rejected'
    }, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Helper methods for schedule management
  parseScheduleFromAsset(asset: Asset): Schedule | null {
    if (!asset.service_hrs) return null;

    try {
      // First check if it's already JSON
      const schedule = JSON.parse(asset.service_hrs) as Schedule;
      return schedule;
    } catch (error) {
      // If not JSON, try to convert legacy text schedule
      return this.convertLegacySchedule(asset.service_hrs);
    }
  }

  private convertLegacySchedule(legacySchedule: string): Schedule | null {
    // Convert old text schedules to new JSON format
    // This is a simple converter - you can enhance it based on your data
    if (!legacySchedule || legacySchedule.trim() === '') return null;

    return {
      type: 'manual',
      entries: [{
        id: 'legacy-1',
        startTime: '09:00',
        endTime: '17:00',
        isRecurring: false,
        notes: legacySchedule // Store original text as notes
      }],
      lastUpdated: new Date().toISOString()
    };
  }

  formatScheduleForDatabase(schedule: Schedule): string {
    return JSON.stringify(schedule);
  }

  // Generate human-readable schedule display
  getScheduleDisplayText(schedule: Schedule): string[] {
    if (!schedule || !schedule.entries.length) {
      return ['No schedule information available'];
    }

    return schedule.entries.map(entry => {
      let text = '';

      if (entry.isRecurring && entry.days && entry.days.length > 0) {
        // Recurring schedule
        const dayNames = entry.days.map(day =>
          day.charAt(0).toUpperCase() + day.slice(1)
        ).join(', ');
        text = `${dayNames}: ${entry.startTime} - ${entry.endTime}`;
      } else if (entry.startDate && entry.endDate) {
        // Date range
        const start = new Date(entry.startDate).toLocaleDateString();
        const end = new Date(entry.endDate).toLocaleDateString();
        text = `${start} - ${end}: ${entry.startTime} - ${entry.endTime}`;
      } else if (entry.startDate) {
        // Single date
        const date = new Date(entry.startDate).toLocaleDateString();
        text = `${date}: ${entry.startTime} - ${entry.endTime}`;
      } else {
        // Default format
        text = `${entry.startTime} - ${entry.endTime}`;
      }

      if (entry.notes) {
        text += ` (${entry.notes})`;
      }

      return text;
    });
  }

  // Check if asset is currently open (basic implementation)
  isAssetCurrentlyOpen(schedule: Schedule): boolean {
    if (!schedule || !schedule.entries.length) return false;

    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const currentTime = now.toTimeString().slice(0, 5); // HH:mm format

    return schedule.entries.some(entry => {
      if (entry.isRecurring && entry.days?.includes(currentDay)) {
        return currentTime >= entry.startTime && currentTime <= entry.endTime;
      }
      // Add date-specific logic here if needed
      return false;
    });
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
