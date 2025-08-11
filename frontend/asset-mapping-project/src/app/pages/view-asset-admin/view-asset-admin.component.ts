import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AssetService, Asset } from '../../services/asset.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-view-asset-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-asset-admin.component.html',
  styleUrls: ['./view-asset-admin.component.scss']
})
export class ViewAssetAdminComponent implements OnInit, OnDestroy {
  asset: Asset | null = null;
  assetId: number | null = null;
  isLoading = false;
  currentStep: 'basic' | 'location' | 'contact' | 'review' = 'basic';
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private assetService: AssetService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Check if user has permission
    if (!this.authService.isAdmin() && !this.authService.isNavigator()) {
      this.notificationService.error('Access denied', 'Permission Required');
      this.router.navigate(['/dashboard']);
      return;
    }

    this.route.params.subscribe(params => {
      this.assetId = +params['id'];
      if (this.assetId) {
        this.loadAsset();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAsset(): void {
    if (!this.assetId) return;

    this.isLoading = true;
    this.assetService.getAssetById(this.assetId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.asset) {
            this.asset = response.asset;
          } else {
            this.notificationService.error('Asset not found', 'Error');
            this.router.navigate(['/dashboard']);
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading asset:', error);
          this.notificationService.error('Failed to load asset', 'Error');
          this.isLoading = false;
        }
      });
  }

  setStep(step: 'basic' | 'location' | 'contact' | 'review'): void {
    this.currentStep = step;
  }

  approveAsset(): void {
    if (!this.asset) return;

    const assetData = {
      ...this.asset,
      status: 'approved' as const
    };

    this.assetService.updateAsset(this.asset.id!, assetData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.notificationService.success('Asset approved successfully', 'Success');
            this.asset!.status = 'approved';
          } else {
            this.notificationService.error('Failed to approve asset', 'Error');
          }
        },
        error: (error) => {
          console.error('Error approving asset:', error);
          this.notificationService.error('Failed to approve asset', 'Error');
        }
      });
  }

  rejectAsset(): void {
    if (!this.asset) return;

    const assetData = {
      ...this.asset,
      status: 'rejected' as const
    };

    this.assetService.updateAsset(this.asset.id!, assetData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.notificationService.success('Asset rejected', 'Success');
            this.asset!.status = 'rejected';
          } else {
            this.notificationService.error('Failed to reject asset', 'Error');
          }
        },
        error: (error) => {
          console.error('Error rejecting asset:', error);
          this.notificationService.error('Failed to reject asset', 'Error');
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  getStepTitle(): string {
    switch (this.currentStep) {
      case 'basic':
        return 'Basic Information';
      case 'location':
        return 'Location Details';
      case 'contact':
        return 'Contact Information';
      case 'review':
        return 'Review & Decision';
      default:
        return 'Asset Review';
    }
  }
}
