import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserService } from './user.service';
import { AssetService } from './asset.service';

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalAssets: number;
  pendingAssets: number;
  approvedAssets: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(
    private userService: UserService,
    private assetService: AssetService
  ) { }

  getDashboardStats(): Observable<DashboardStats> {
    return forkJoin({
      users: this.userService.getUsers(1, 1000), // Get all users for stats
      assets: this.assetService.getAssets(1, 1000) // Get all assets for stats
    }).pipe(
      map(({ users, assets }) => {
        const userList = users.users || [];
        const assetList = assets.assets || [];

        return {
          totalUsers: userList.length,
          activeUsers: userList.filter(user => user.is_active).length,
          totalAssets: assetList.length,
          pendingAssets: assetList.filter(asset => asset.status === 'pending').length,
          approvedAssets: assetList.filter(asset => asset.status === 'approved').length
        };
      })
    );
  }

  getRecentActivity(): Observable<any[]> {
    // This could return recent user registrations, asset submissions, etc.
    // For now, return empty array - can be enhanced later
    return new Observable(observer => {
      observer.next([]);
      observer.complete();
    });
  }
}
