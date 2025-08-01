import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AssetService, Asset, CreateAssetRequest } from '../services/asset.service';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-add-asset-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-asset-form.component.html',
  styleUrl: './add-asset-form.component.scss'
})
export class AddAssetFormComponent implements OnInit {
  @Output() backToAssets = new EventEmitter<void>();
  @Output() assetAdded = new EventEmitter<Asset>();

  addAssetForm: FormGroup;
  isLoading = false;
  isGuest = false;

  constructor(
    private fb: FormBuilder,
    private assetService: AssetService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    this.addAssetForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      service_type: [''],
      has_volunteer_opportunities: [false],
      website: [''],
      phone: [''],
      email: ['', [Validators.email]],

      address_line_1: ['', [Validators.required]],
      address_line_2: [''],
      city: ['', [Validators.required]],
      province: ['', [Validators.required]],
      postal_code: ['', [Validators.required]],
      country: ['Canada'],

      contact_name: ['', [Validators.required]],
      contact_email: ['', [Validators.email]],
      contact_phone: [''],
      contact_title: ['']
    });
  }

  ngOnInit() {
    const currentUser = this.authService.getCurrentUser();
    this.isGuest = !currentUser;

    if (currentUser) {
      console.log('AddAssetFormComponent: User is authenticated:', currentUser.role);
    } else {
      console.log('AddAssetFormComponent: User is guest (not authenticated)');
    }
  }

  onSubmit() {
    if (this.addAssetForm.valid) {
      this.isLoading = true;

      const formValue = this.addAssetForm.value;

      const assetData: CreateAssetRequest = {
        name: formValue.name,
        description: formValue.description || '',
        service_type: formValue.service_type || '',
        has_volunteer_opportunities: formValue.has_volunteer_opportunities || false,
        website: formValue.website || '',
        phone: formValue.phone || '',
        email: formValue.email || '',
        address: {
          address_line_1: formValue.address_line_1,
          address_line_2: formValue.address_line_2 || '',
          city: formValue.city,
          province: formValue.province,
          postal_code: formValue.postal_code,
          country: formValue.country || 'Canada'
        },
        contact: {
          contact_name: formValue.contact_name,
          contact_email: formValue.contact_email || '',
          contact_phone: formValue.contact_phone || '',
          contact_title: formValue.contact_title || ''
        }
      };

      this.resetForm();

      this.assetService.createAsset(assetData).subscribe({
        next: (response) => {
          if (response.success && response.asset) {
            this.assetAdded.emit(response.asset);
          } else {
            this.notificationService.error('Failed to create asset', 'Error');
            this.restoreFormData(formValue);
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error creating asset:', error);
          const errorMessage = error.error?.message || 'Failed to create asset';
          this.notificationService.error(errorMessage, 'Error');
          this.restoreFormData(formValue);
          this.isLoading = false;
        }
      });
    }
  }

  onBack() {
    this.backToAssets.emit();
    this.resetForm();
  }

  private resetForm() {
    this.addAssetForm.reset({
      name: '',
      description: '',
      service_type: '',
      has_volunteer_opportunities: false,
      website: '',
      phone: '',
      email: '',
      address_line_1: '',
      address_line_2: '',
      city: '',
      province: '',
      postal_code: '',
      country: 'Canada',
      contact_name: '',
      contact_email: '',
      contact_phone: '',
      contact_title: ''
    });
    this.addAssetForm.markAsUntouched();
    this.addAssetForm.markAsPristine();
    this.isLoading = false;
  }

  private restoreFormData(formValue: any) {
    this.addAssetForm.patchValue(formValue);
  }
}
