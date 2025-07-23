import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Asset {
  id: number;
  name: string;
  type: string;
  lat: number;
  lng: number;
  volunteer: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AssetService {
  private apiUrl = 'https://your-api-url.com/api/assets'; // Replace with your backend URL

  constructor(private http: HttpClient) {}

  getAssets(): Observable<Asset[]> {
    return this.http.get<Asset[]>(this.apiUrl);
  }
}
