import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface AssetContact {
  id?: number;
  contact_name: string;
  contact_email?: string;
  contact_phone?: string;
  contact_title?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AssetContactResponse {
  success: boolean;
  message?: string;
  contact?: AssetContact;
  contacts?: AssetContact[];
}

export interface CreateAssetContactRequest {
  contact_name: string;
  contact_email?: string;
  contact_phone?: string;
  contact_title?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AssetContactService {
  private apiUrl = 'http://localhost:3000';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Get all asset contacts (admin only)
  getAssetContacts(): Observable<AssetContactResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<AssetContactResponse>(`${this.apiUrl}/asset-contacts`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Get asset contact by ID
  getAssetContactById(id: number): Observable<AssetContactResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<AssetContactResponse>(`${this.apiUrl}/asset-contacts/${id}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Create new asset contact
  createAssetContact(contactData: CreateAssetContactRequest): Observable<AssetContactResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post<AssetContactResponse>(`${this.apiUrl}/asset-contacts`, contactData, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Update asset contact
  updateAssetContact(id: number, contactData: Partial<CreateAssetContactRequest>): Observable<AssetContactResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.put<AssetContactResponse>(`${this.apiUrl}/asset-contacts/${id}`, contactData, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Delete asset contact
  deleteAssetContact(id: number): Observable<AssetContactResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.delete<AssetContactResponse>(`${this.apiUrl}/asset-contacts/${id}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Validate email format
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate phone number format (North American)
  validatePhoneNumber(phone: string): boolean {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');

    // Check for valid North American phone number
    // Must be 10 digits (area code + number) or 11 digits (with country code 1)
    return (cleaned.length === 10) || (cleaned.length === 11 && cleaned.startsWith('1'));
  }

  // Format phone number for display
  formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');

    if (cleaned.length === 10) {
      // Format as (123) 456-7890
      return `(${cleaned.substr(0, 3)}) ${cleaned.substr(3, 3)}-${cleaned.substr(6, 4)}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      // Format as +1 (123) 456-7890
      return `+1 (${cleaned.substr(1, 3)}) ${cleaned.substr(4, 3)}-${cleaned.substr(7, 4)}`;
    }

    return phone; // Return original if format not recognized
  }

  // Extract phone number for storage (digits only)
  extractPhoneDigits(phone: string): string {
    return phone.replace(/\D/g, '');
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
