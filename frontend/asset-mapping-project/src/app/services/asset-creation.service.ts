import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

export interface AssetCreationData {
  // From start page
  multiplePrograms?: boolean;
  hasPhysicalLocation?: boolean;

  // From basic page
  name?: string;
  description?: string;
  service_type?: string;
  has_volunteer_opportunities?: boolean;
  website?: string;
  phone?: string;
  email?: string;

  // From location page
  address?: {
    address_line_1?: string;
    address_line_2?: string;
    city?: string;
    province?: string;
    postal_code?: string;
    country?: string;
  };

  // From contact page
  contact?: {
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
    contact_title?: string;
  };

  // Edit mode properties
  id?: number;
  isEditMode?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AssetCreationService {
  private assetData: AssetCreationData = {};
  private currentStep = new BehaviorSubject<number>(1);
  private maxStep = new BehaviorSubject<number>(1);

  // Observable for current step
  currentStep$ = this.currentStep.asObservable();
  maxStep$ = this.maxStep.asObservable();

  // Navigation methods
  nextStep(): void {
    const current = this.currentStep.value;
    const next = Math.min(current + 1, 4);
    this.currentStep.next(next);
    this.maxStep.next(Math.max(this.maxStep.value, next));
  }

  previousStep(): void {
    const current = this.currentStep.value;
    const prev = Math.max(current - 1, 1);
    this.currentStep.next(prev);
  }

  goToStep(step: number): void {
    if (step <= this.maxStep.value && step >= 1) {
      this.currentStep.next(step);
    }
  }

  // Data management
  updateData(stepData: Partial<AssetCreationData>): void {
    this.assetData = { ...this.assetData, ...stepData };
    console.log('AssetCreationService: Updated data:', this.assetData);
  }

  getData(): AssetCreationData {
    return { ...this.assetData };
  }

  clearData(): void {
    this.assetData = {};
    this.currentStep.next(1);
    this.maxStep.next(1);
  }

  // Load existing asset data for edit mode
  loadAssetForEdit(assetResponse: any): void {
    // Backend returns asset in 'data' property, not 'asset'
    const asset = assetResponse.data || assetResponse.asset || assetResponse;

    console.log('Raw asset data from backend:', asset);

    this.assetData = {
      id: asset.id,
      isEditMode: true,
      multiplePrograms: asset.multiple_programs || false,
      hasPhysicalLocation: !!asset.address, // If address exists, it has physical location
      name: asset.name || '',
      description: asset.description || '',
      service_type: asset.service_type || '',
      has_volunteer_opportunities: asset.has_volunteer_opportunities || false,
      website: asset.website || '',
      phone: asset.phone || '',
      email: asset.email || '',
      address: asset.address ? {
        address_line_1: asset.address.street_address || '', // Database uses 'street_address'
        address_line_2: asset.address.address_line_2 || '',
        city: asset.address.city || '',
        province: asset.address.province || 'Ontario', // Default to Ontario if not set
        postal_code: asset.address.post_code || '', // Database uses 'post_code'
        country: asset.address.country || 'Canada'
      } : undefined,
      contact: asset.contact ? {
        contact_name: asset.contact.name || '', // Database uses 'name'
        contact_email: asset.contact.email || '', // Database uses 'email'
        contact_phone: asset.contact.phone_number || '', // Database uses 'phone_number'
        contact_title: asset.contact.contact_title || '' // May not exist in DB
      } : undefined
    };

    console.log('Processed asset data for editing:', this.assetData);
  }

  // Check if in edit mode
  isEditMode(): boolean {
    return this.assetData.isEditMode || false;
  }

  // Get asset ID for edit mode
  getAssetId(): number | undefined {
    return this.assetData.id;
  }

  // Validation helpers
  isStepComplete(step: number): boolean {
    switch (step) {
      case 1: // Start
        return this.assetData.multiplePrograms !== undefined &&
               this.assetData.hasPhysicalLocation !== undefined;
      case 2: // Basic
        return !!(this.assetData.name && this.assetData.description);
      case 3: // Location (only required if hasPhysicalLocation is true)
        return !this.assetData.hasPhysicalLocation ||
               !!(this.assetData.address?.address_line_1 &&
                  this.assetData.address?.city &&
                  this.assetData.address?.province &&
                  this.assetData.address?.postal_code);
      case 4: // Contact
        return !!(this.assetData.contact?.contact_name);
      default:
        return false;
    }
  }

  // Legacy compatibility - keeping the old properties
  get multiplePrograms(): boolean | null {
    return this.assetData.multiplePrograms ?? null;
  }

  set multiplePrograms(value: boolean | null) {
    if (value !== null) {
      this.updateData({ multiplePrograms: value });
    }
  }

  get hasPhysicalLocation(): boolean | null {
    return this.assetData.hasPhysicalLocation ?? null;
  }

  set hasPhysicalLocation(value: boolean | null) {
    if (value !== null) {
      this.updateData({ hasPhysicalLocation: value });
    }
  }

}
