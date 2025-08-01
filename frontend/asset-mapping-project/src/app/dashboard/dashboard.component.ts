import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddUserFormComponent } from '../add-user-form/add-user-form.component';
import { EditUserFormComponent } from '../edit-user-form/edit-user-form.component';
import { AddAssetFormComponent } from '../add-asset-form/add-asset-form.component';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
// Material imports
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';

// Import our services
import { AuthService, User as AuthUser } from '../services/auth.service';
import { AssetService, Asset } from '../services/asset.service';
import { UserService, User as UserInterface } from '../services/user.service';
import { LoadingService } from '../services/loading.service';
import { NotificationService } from '../services/notification.service';
import { DashboardService } from '../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, AddUserFormComponent, EditUserFormComponent, AddAssetFormComponent, MatSelectModule, MatFormFieldModule, MatOptionModule, MatInputModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  activeView: 'users' | 'assets' | 'add-user' | 'edit-user' | 'add-asset' = 'assets';
  selectedUser: UserInterface | null = null;

  currentUser: AuthUser | null = null;
  users: UserInterface[] = [];
  assets: Asset[] = [];

  isLoadingUsers = false;
  isLoadingAssets = false;

  userSearchType: string = 'name';
  userSearchTerm: string = '';
  assetSearchType: string = 'name';
  assetSearchTerm: string = '';

  setUserSearchType(value: string) {
    this.userSearchType = value;
    this.filteredUsersCache = null;
  }

  setUserSearchTerm(value: string) {
    this.userSearchTerm = value;
    this.filteredUsersCache = null;
  }

  setAssetSearchType(value: string) {
    this.assetSearchType = value;
    this.filteredAssetsCache = null;
  }

  setAssetSearchTerm(value: string) {
    this.assetSearchTerm = value;
    this.filteredAssetsCache = null;
  }

  private filteredUsersCache: UserInterface[] | null = null;
  private filteredAssetsCache: Asset[] | null = null;

  userSortField: 'id' | 'first_name' | 'last_name' | 'email' | 'role' | 'created_at' | 'updated_at' = 'id';
  userSortDirection: 'asc' | 'desc' = 'asc';
  assetSortField: 'id' | 'name' | 'status' | 'created_at' | 'updated_at' = 'id';
  assetSortDirection: 'asc' | 'desc' = 'asc';

  userPage = 1;
  userLimit = 10;
  userTotal = 0;
  assetPage = 1;
  assetLimit = 10;
  assetTotal = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private assetService: AssetService,
    private loadingService: LoadingService,
    private notificationService: NotificationService,
    private dashboardService: DashboardService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    console.log('DashboardComponent: Initializing');

    this.currentUser = this.authService.getCurrentUser();
    console.log('DashboardComponent: Current user:', this.currentUser);
    this.route.queryParams.subscribe(params => {
      if (params['view'] === 'add-asset') {
        console.log('DashboardComponent: Setting view to add-asset from query params');
        this.setActiveView('add-asset');
        this.router.navigate([], { relativeTo: this.route, queryParams: {} });
      } else if (!this.currentUser) {
        console.log('DashboardComponent: No current user - allowing guest access for asset creation');
        this.setActiveView('assets');
      } else {
        if (this.currentUser.role === 'navigator') {
          console.log('DashboardComponent: Navigator user - defaulting to assets view');
          this.setActiveView('assets');
        } else if (this.currentUser.role === 'admin') {
          console.log('DashboardComponent: Admin user - defaulting to users view');
          this.setActiveView('users');
        } else {
          console.log('DashboardComponent: Guest user - defaulting to assets view');
          this.setActiveView('assets');
        }
      }
    });

    this.loadUsers();
    this.loadAssets();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers(): void {
    if (!this.authService.isAdmin()) {
      console.log('DashboardComponent: User is not admin, cannot load users');
      return;
    }

    console.log('DashboardComponent: Loading users...');
    this.isLoadingUsers = true;

    this.userService.getUsers(this.userPage, this.userLimit)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('DashboardComponent: Users loaded successfully:', response);
          if (response.success && response.users) {
            this.users = response.users;
            this.userTotal = response.total || 0;
            this.filteredUsersCache = null;
            this.sortUsersArray();
          }
          this.isLoadingUsers = false;
        },
        error: (error) => {
          console.error('DashboardComponent: Error loading users:', error);
          this.notificationService.error('Failed to load users', 'Error');
          this.isLoadingUsers = false;
        }
      });
  }

  loadAssets(): void {
    console.log('DashboardComponent: Loading assets...');
    this.isLoadingAssets = true;

    this.assetService.getAssets(this.assetPage, this.assetLimit, undefined, this.assetSortField, this.assetSortDirection)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('DashboardComponent: Assets loaded successfully:', response);
          if (response.success && response.assets) {
            this.assets = response.assets;
            this.assetTotal = response.total || 0;
            this.filteredAssetsCache = null;
            this.sortAssetsArray();
          }
          this.isLoadingAssets = false;
        },
        error: (error) => {
          console.error('DashboardComponent: Error loading assets:', error);
          this.notificationService.error('Failed to load assets', 'Error');
          this.isLoadingAssets = false;
        }
      });
  }

  setActiveView(view: 'users' | 'assets' | 'add-user' | 'edit-user' | 'add-asset'): void {
    this.activeView = view;
    if (view === 'users') {
      this.loadUsers();
    } else if (view === 'assets') {
      this.loadAssets();
    }
  }

  onAddNewUser(): void {
    if (!this.authService.isAdmin()) {
      this.notificationService.error('You do not have permission to add users', 'Access Denied');
      return;
    }
    this.selectedUser = null;
    this.setActiveView('add-user');
  }

  onEditUser(user: UserInterface): void {
    this.selectedUser = user;
    this.setActiveView('edit-user');
  }

  onUserAdded(user: UserInterface): void {
    console.log('DashboardComponent: User added:', user);
    this.notificationService.success('User added successfully', 'Success');
    this.setActiveView('users');
    this.filteredUsersCache = null;
    this.loadUsers();
  }

  onUserUpdated(user: UserInterface): void {
    console.log('DashboardComponent: User updated:', user);
    this.notificationService.success('User updated successfully', 'Success');
    this.setActiveView('users');
    this.loadUsers();
  }

  onCancelUserForm(): void {
    this.selectedUser = null;
    this.setActiveView('users');
  }

  toggleUserActivation(user: UserInterface): void {
    if (!this.authService.isAdmin()) {
      this.notificationService.error('You do not have permission to perform this action', 'Access Denied');
      return;
    }

    const action = user.is_active ? 'deactivate' : 'activate';
    const method = user.is_active ?
      this.userService.deactivateUser(user.id) :
      this.userService.activateUser(user.id);

    method.pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.notificationService.success(`User ${action}d successfully`, 'Success');
            this.loadUsers();
          }
        },
        error: (error) => {
          console.error(`DashboardComponent: Error ${action}ing user:`, error);
          this.notificationService.error(`Failed to ${action} user`, 'Error');
        }
      });
  }

  deleteUser(user: UserInterface): void {
    if (!this.authService.isAdmin()) {
      this.notificationService.error('You do not have permission to perform this action', 'Access Denied');
      return;
    }

    if (confirm(`Are you sure you want to delete user ${user.first_name} ${user.last_name}?`)) {
      this.userService.deleteUser(user.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.notificationService.success('User deleted successfully', 'Success');
              this.loadUsers();
            }
          },
          error: (error) => {
            console.error('DashboardComponent: Error deleting user:', error);
            this.notificationService.error('Failed to delete user', 'Error');
          }
        });
    }
  }

  onAddNewAsset(): void {
    this.setActiveView('add-asset');
  }

  onAssetAdded(asset: Asset): void {
    console.log('DashboardComponent: Asset added:', asset);

    if (this.currentUser) {
      this.notificationService.success('Asset added successfully', 'Success');
      this.setActiveView('assets');
    } else {
      this.notificationService.success('Asset submitted successfully and is pending approval', 'Submitted');
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 2000);
      return;
    }

    this.filteredAssetsCache = null;
    this.loadAssets();
  }

  onCancelAssetForm(): void {
    if (this.currentUser) {
      this.setActiveView('assets');
    } else {
      this.router.navigate(['/']);
    }
  }

  toggleAssetStatus(asset: Asset): void {
    if (!this.authService.isAdmin()) {
      this.notificationService.error('You do not have permission to perform this action', 'Access Denied');
      return;
    }

    const newStatus = asset.status === 'approved' ? 'pending' : 'approved';
    this.notificationService.info(`Asset status would be changed to ${newStatus}`, 'Status Change');
  }

  sortUsers(field: 'id' | 'first_name' | 'last_name' | 'email' | 'role' | 'created_at' | 'updated_at'): void {
    if (this.userSortField === field) {
      this.userSortDirection = this.userSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.userSortField = field;
      this.userSortDirection = 'asc';
    }
    this.sortUsersArray();
  }

  sortAssets(field: 'id' | 'name' | 'status' | 'created_at' | 'updated_at'): void {
    if (this.assetSortField === field) {
      this.assetSortDirection = this.assetSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.assetSortField = field;
      this.assetSortDirection = 'asc';
    }
    // Reload assets with new sort configuration
    this.loadAssets();
  }

  private sortUsersArray(): void {
    this.users.sort((a, b) => {
      let aValue: any = a[this.userSortField];
      let bValue: any = b[this.userSortField];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return this.userSortDirection === 'asc' ? comparison : -comparison;
    });
  }

  private sortAssetsArray(): void {
    this.assets.sort((a, b) => {
      let aValue: any = a[this.assetSortField];
      let bValue: any = b[this.assetSortField];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return this.assetSortDirection === 'asc' ? comparison : -comparison;
    });
  }

  getCurrentUserInitials(): string {
    if (!this.currentUser) return 'U';
    const firstInitial = this.currentUser.first_name?.charAt(0) || '';
    const lastInitial = this.currentUser.last_name?.charAt(0) || '';
    return (firstInitial + lastInitial).toUpperCase() || 'U';
  }

  getUserDisplayName(user: UserInterface): string {
    return `${user.first_name} ${user.last_name}`.trim() || user.email;
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  get filteredUsers(): UserInterface[] {
    if (this.filteredUsersCache !== null) {
      return this.filteredUsersCache;
    }

    if (!this.userSearchTerm) {
      this.filteredUsersCache = this.users;
      return this.filteredUsersCache;
    }

    const searchTerm = this.userSearchTerm.toLowerCase();
    const filtered = this.users.filter(user => {
      switch (this.userSearchType) {
        case 'name':
          const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
          return fullName.includes(searchTerm);
        case 'email':
          return user.email.toLowerCase().includes(searchTerm);
        case 'role':
          return user.role.toLowerCase().includes(searchTerm);
        default:
          return true;
      }
    });

    this.filteredUsersCache = filtered;
    return this.filteredUsersCache;
  }

  get filteredAssets(): Asset[] {
    if (this.filteredAssetsCache !== null) {
      return this.filteredAssetsCache;
    }

    if (!this.assetSearchTerm) {
      this.filteredAssetsCache = this.assets;
      return this.filteredAssetsCache;
    }

    const searchTerm = this.assetSearchTerm.toLowerCase();
    const filtered = this.assets.filter(asset => {
      switch (this.assetSearchType) {
        case 'name':
          return asset.name.toLowerCase().includes(searchTerm);
        case 'status':
          return asset.status.toLowerCase().includes(searchTerm);
        default:
          return true;
      }
    });

    this.filteredAssetsCache = filtered;
    return this.filteredAssetsCache;
  }
}
