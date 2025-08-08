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

  setAssetStatusFilter(value: string) {
    this.assetStatusFilter = value;
    this.assetPage = 1; // Reset to first page when filtering
    this.loadAssets();
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
  assetStatusFilter: string = ''; // Empty string means show all assets

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

    // Subscribe to authentication state changes
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      console.log('DashboardComponent: User state changed:', user);
      this.currentUser = user;

      // Update view based on authentication state
      if (!user) {
        console.log('DashboardComponent: No current user - guest access, showing assets');
        this.activeView = 'assets'; // Force assets view for guests
      } else {
        if (user.role === 'navigator') {
          console.log('DashboardComponent: Navigator user - defaulting to assets view');
          this.setActiveView('assets');
        } else if (user.role === 'admin') {
          console.log('DashboardComponent: Admin user - defaulting to users view');
          this.setActiveView('users');
        } else {
          console.log('DashboardComponent: Other user - defaulting to assets view');
          this.setActiveView('assets');
        }
      }

      // Reload data when authentication state changes
      this.loadUsers();
      this.loadAssets();
    });

    // Handle query parameters
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['view'] === 'add-asset') {
        console.log('DashboardComponent: Setting view to add-asset from query params');
        this.setActiveView('add-asset');
        this.router.navigate([], { relativeTo: this.route, queryParams: {} });
      }
    });
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

    const statusFilter = this.assetStatusFilter || undefined;
    this.assetService.getAssets(this.assetPage, this.assetLimit, statusFilter, this.assetSortField, this.assetSortDirection)
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
    console.log('DashboardComponent: Setting active view to:', view);
    this.activeView = view;

    // Clear selected user when changing views
    if (view !== 'edit-user') {
      this.selectedUser = null;
    }

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

    // Clear any cached user data to force a fresh reload
    this.filteredUsersCache = null;
    this.users = []; // Clear existing users to show loading state

    // Switch to users view which will trigger loadUsers()
    this.setActiveView('users');

    // Force an additional reload to ensure the new user appears
    this.loadUsers();
  }

  onAddNewAsset(): void {
    console.log('DashboardComponent: Add new asset clicked');

    if (!this.currentUser) {
      // Guests should use the multi-step process
      this.router.navigate(['/add-asset/start']);
    } else {
      // Logged-in users can use either method
      // For now, use the embedded form for quick access
      this.setActiveView('add-asset');

      // Alternatively, could redirect to multi-step:
      // this.router.navigate(['/add-asset/start']);
    }
  }

  navigateToMultiStepAssetCreation(): void {
    console.log('DashboardComponent: Navigate to multi-step asset creation');
    this.router.navigate(['/add-asset/start']);
  }

  onViewAsset(asset: Asset): void {
    console.log('DashboardComponent: View asset clicked:', asset.id);

    if (this.currentUser && (this.currentUser.role === 'admin' || this.currentUser.role === 'navigator')) {
      // Admin/Navigator view with editing capabilities
      this.router.navigate(['/view-asset-admin', asset.id]);
    } else {
      // Guest view (read-only)
      this.router.navigate(['/view-asset'], { queryParams: { id: asset.id } });
    }
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
    if (!asset.id) {
      this.notificationService.error('Invalid asset ID', 'Error');
      return;
    }

    const newStatus = asset.status === 'approved' ? 'pending' : 'approved';

    // Show confirmation message
    const action = newStatus === 'approved' ? 'approve' : 'set to pending';
    if (!confirm(`Are you sure you want to ${action} the asset "${asset.name}"?`)) {
      return;
    }

    // Call appropriate API method based on new status
    const apiCall = newStatus === 'approved'
      ? this.assetService.approveAsset(asset.id)
      : this.assetService.updateAsset(asset.id, { status: 'pending' });

    this.loadingService.setLoading(true);

    apiCall.pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.notificationService.success(`Asset ${action}d successfully`, 'Success');
            // Update the asset status locally
            asset.status = newStatus as 'pending' | 'approved' | 'rejected';
            // Optionally reload assets to get fresh data
            this.loadAssets();
          } else {
            this.notificationService.error(response.message || `Failed to ${action} asset`, 'Error');
          }
          this.loadingService.setLoading(false);
        },
        error: (error) => {
          console.error(`Error ${action} asset:`, error);
          this.notificationService.error(`Failed to ${action} asset: ${error.message}`, 'Error');
          this.loadingService.setLoading(false);
        }
      });
  }

  rejectAsset(asset: Asset): void {
    if (!asset.id) {
      this.notificationService.error('Invalid asset ID', 'Error');
      return;
    }

    // Show confirmation message
    if (!confirm(`Are you sure you want to reject the asset "${asset.name}"?`)) {
      return;
    }

    this.loadingService.setLoading(true);

    this.assetService.rejectAsset(asset.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.notificationService.success('Asset rejected successfully', 'Success');
            // Update the asset status locally
            asset.status = 'rejected';
            // Optionally reload assets to get fresh data
            this.loadAssets();
          } else {
            this.notificationService.error(response.message || 'Failed to reject asset', 'Error');
          }
          this.loadingService.setLoading(false);
        },
        error: (error) => {
          console.error('Error rejecting asset:', error);
          this.notificationService.error(`Failed to reject asset: ${error.message}`, 'Error');
          this.loadingService.setLoading(false);
        }
      });
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

  isGuestUser(): boolean {
    return !this.currentUser || !this.authService.isLoggedIn();
  }

  isAuthenticatedUser(): boolean {
    return !!this.currentUser && this.authService.isLoggedIn();
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

  // Pagination methods for assets
  nextAssetPage(): void {
    if (this.assetPage * this.assetLimit < this.assetTotal) {
      this.assetPage++;
      this.loadAssets();
    }
  }

  prevAssetPage(): void {
    if (this.assetPage > 1) {
      this.assetPage--;
      this.loadAssets();
    }
  }

  goToAssetPage(page: number): void {
    if (page >= 1 && page <= this.getTotalAssetPages()) {
      this.assetPage = page;
      this.loadAssets();
    }
  }

  getTotalAssetPages(): number {
    return Math.ceil(this.assetTotal / this.assetLimit);
  }

  getAssetPaginationPages(): number[] {
    const totalPages = this.getTotalAssetPages();
    const currentPage = this.assetPage;
    const pages: number[] = [];

    // Show up to 5 page numbers around current page
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);

    // Adjust start if we're near the end
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  getAssetStartIndex(): number {
    return (this.assetPage - 1) * this.assetLimit + 1;
  }

  getAssetEndIndex(): number {
    return Math.min(this.assetPage * this.assetLimit, this.assetTotal);
  }

  // Helper methods for asset display
  getCreatorName(asset: Asset): string {
    if (asset.creator) {
      return `${asset.creator.first_name} ${asset.creator.last_name}`;
    }
    return 'Unknown';
  }

  getModifierName(asset: Asset): string {
    // For now, return same as creator since we don't have modifier info
    if (asset.creator) {
      return `${asset.creator.first_name} ${asset.creator.last_name}`;
    }
    return 'Unknown';
  }

  onEditAsset(asset: Asset): void {
    console.log('DashboardComponent: Edit asset clicked:', asset);
    // Navigate to the add-asset workflow for editing
    this.router.navigate(['/add-asset/start'], { queryParams: { id: asset.id, mode: 'edit' } });
  }
}
