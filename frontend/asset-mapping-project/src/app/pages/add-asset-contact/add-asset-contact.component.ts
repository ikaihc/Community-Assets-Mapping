// src/app/pages/add-asset-contact/add-asset-contact.component.ts
import { Component, OnInit }     from '@angular/core';
import { Router }                from '@angular/router';
import { CommonModule }          from '@angular/common';
import { RouterModule }          from '@angular/router';
import { FormsModule }           from '@angular/forms';
import { AssetCreationService }  from '../../services/asset-creation.service';

@Component({
  selector: 'app-add-asset-contact',
  standalone: true,
  imports: [ CommonModule, RouterModule, FormsModule ],
  templateUrl: './add-asset-contact.component.html',
  styleUrls: ['./add-asset-contact.component.scss']
})
export class AddAssetContactComponent implements OnInit {
  // Form fields
  contactName = '';
  contactPhone = '';
  contactEmail = '';
  isEditMode = false;

  constructor(
    private router: Router,
    private assetService: AssetCreationService
  ) {}

  ngOnInit(): void {
    this.isEditMode = this.assetService.isEditMode();

    // Load existing data
    const data = this.assetService.getData();
    console.log('Contact component - full asset data:', data);

    if (data.contact) {
      console.log('Contact component - contact data:', data.contact);
      this.contactName = data.contact.contact_name || '';
      this.contactPhone = data.contact.contact_phone || '';
      this.contactEmail = data.contact.contact_email || '';
    }

    console.log('Contact component loaded with data:', {
      contactName: this.contactName,
      contactPhone: this.contactPhone,
      contactEmail: this.contactEmail
    });
  }

  goNext() {
    // Save contact data before proceeding
    this.saveContactData();
    this.router.navigate(['/add-asset/registration']);
  }

  goPrevious() {
    // Save contact data before navigating
    this.saveContactData();

    // 根据 hasPhysicalLocation 决定跳转上一页
    if (this.assetService.hasPhysicalLocation) {
      this.router.navigate(['/add-asset/location']);
    } else {
      this.router.navigate(['/add-asset/basic']);
    }
  }

  private saveContactData() {
    this.assetService.updateData({
      contact: {
        contact_name: this.contactName,
        contact_phone: this.contactPhone,
        contact_email: this.contactEmail,
        contact_title: '' // Can be extended later if needed
      }
    });
  }
}
