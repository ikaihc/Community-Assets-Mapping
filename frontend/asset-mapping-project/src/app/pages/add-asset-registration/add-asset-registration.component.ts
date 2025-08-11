// src/app/pages/add-asset-registration/add-asset-registration.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, FormsModule } from '@angular/forms';
import { AssetCreationService } from '../../services/asset-creation.service';
import { AssetService } from '../../services/asset.service';
import { AuthService } from '../../services/auth.service';

// Angular Material 模块
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule }       from '@angular/material/input';
import { MatNativeDateModule }  from '@angular/material/core';
import { MatButtonModule }      from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-add-asset-registration',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    // Material
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    MatButtonModule,
    MatSelectModule,
  ],
  templateUrl: './add-asset-registration.component.html',
  styleUrls: ['./add-asset-registration.component.scss']

  
})
export class AddAssetRegistrationComponent implements OnInit {
  scheduleType: 'one-time' | 'recurring' | 'manual' | '' = '';
  showCalendar = false;
  isEditMode = false;
  isProcessing = false;

  // Form fields
  scheduleInfo = '';
  registrationInfo = '';
  hasAccessibleFeatures = false;
  languages: string[] = [];
  availableLanguages = ['English', 'French', 'Spanish', 'Arabic', 'Mandarin', 'Other'];

  // 为 One‑time schedule 准备 Reactive Form 的 date-range
  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end:   new FormControl<Date | null>(null),
  });

  constructor(
    private router: Router,
    private assetCreationService: AssetCreationService,
    private assetService: AssetService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isEditMode = this.assetCreationService.isEditMode();

    // Load existing data if in edit mode
    const data = this.assetCreationService.getData();
    // Pre-populate form fields here if needed
    console.log('Registration component loaded with data:', data);
  }

  submitForm() {
    // 提交逻辑（如表单验证等）
    this.router.navigate(['/']); // 跳转到主页
  }

  goPrevious() {
    this.router.navigate(['/add-asset/contact']);
  }

  onScheduleChange(value: string) {
    this.scheduleType = value as any;
    // 重置已有日期
    this.range.reset();
  }

  toggleLanguage(language: string) {
    const index = this.languages.indexOf(language);
    if (index === -1) {
      this.languages.push(language);
    } else {
      this.languages.splice(index, 1);
    }
  }

  approveAsset() {
    if (this.isProcessing) return;

    this.isProcessing = true;

    if (this.isEditMode) {
      // Update existing asset with approved status
      const assetId = this.assetCreationService.getAssetId();
      if (assetId) {
        this.assetService.updateAsset(assetId, { status: 'approved' }).subscribe({
          next: (response) => {
            console.log('Asset approved successfully:', response);
            alert('Asset has been approved and is now visible to all users!');
            this.router.navigate(['/dashboard']);
          },
          error: (error) => {
            console.error('Error approving asset:', error);
            alert('Error approving asset. Please try again.');
            this.isProcessing = false;
          }
        });
      }
    } else {
      // Create new asset with approved status
      this.createAssetWithStatus('approved');
    }
  }

  rejectAsset() {
    if (this.isProcessing) return;

    this.isProcessing = true;

    if (this.isEditMode) {
      // Update existing asset with rejected status
      const assetId = this.assetCreationService.getAssetId();
      if (assetId) {
        this.assetService.updateAsset(assetId, { status: 'rejected' }).subscribe({
          next: (response) => {
            console.log('Asset rejected successfully:', response);
            alert('Asset has been rejected and will not be visible to guest users.');
            this.router.navigate(['/dashboard']);
          },
          error: (error) => {
            console.error('Error rejecting asset:', error);
            alert('Error rejecting asset. Please try again.');
            this.isProcessing = false;
          }
        });
      }
    } else {
      // Create new asset with rejected status
      this.createAssetWithStatus('rejected');
    }
  }

  private createAssetWithStatus(status: 'approved' | 'rejected') {
    // Get all form data from the service
    const assetData = this.assetCreationService.getData();

    // Prepare the request data with proper validation
    const createData = {
      name: assetData.name || '',
      description: assetData.description || '',
      service_type: assetData.service_type || '',
      website: assetData.website || '',
      has_volunteer_opportunities: assetData.has_volunteer_opportunities || false,
      status: status,
      address: assetData.address ? {
        address_line_1: assetData.address.address_line_1 || '',
        city: assetData.address.city || '',
        postal_code: assetData.address.postal_code || '',
        province: assetData.address.province || 'Ontario',
        country: assetData.address.country || 'Canada'
      } : undefined,
      contact: assetData.contact ? {
        contact_name: assetData.contact.contact_name || '',
        contact_email: assetData.contact.contact_email || '',
        contact_phone: assetData.contact.contact_phone || ''
      } : undefined
    };

    this.assetService.createAsset(createData as any).subscribe({
      next: (response) => {
        console.log('Asset created with status:', status, response);
        const message = status === 'approved'
          ? 'Asset has been approved and is now visible to all users!'
          : 'Asset has been rejected and will not be visible to guest users.';
        alert(message);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Error creating asset:', error);
        alert('Error saving asset. Please try again.');
        this.isProcessing = false;
      }
    });
  }

  onSubmit() {
    alert('Asset submitted!');
  }

  
}
