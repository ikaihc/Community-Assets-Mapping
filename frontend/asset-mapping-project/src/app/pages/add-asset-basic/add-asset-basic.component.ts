
import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule }                 from '@angular/common';    // <-- 对应 ngIf/ngFor
import { RouterModule, Router }         from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AssetCreationService } from '../../services/asset-creation.service';

@Component({
  selector: 'app-add-asset-basic',

  standalone: true,           
  imports: [
    CommonModule,            
    RouterModule       

  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule

  ],
  templateUrl: './add-asset-basic.component.html',
  styleUrls:   ['./add-asset-basic.component.scss']
})

export class AddAssetBasicComponent implements OnInit {

  availableCategories = [
    'Transportation',
    'Food Bank',
    'Employment',
    'Libraries'
  ];
  selectedCategories: string[] = [];
  dropdownOpen = false;


  // Form fields
  assetName = '';
  description = '';
  website = '';
  hasVolunteerOpportunities = false;
  isEditMode = false;

  constructor(
    private router: Router,
    private assetService: AssetCreationService
  ) {}

  ngOnInit(): void {
    this.isEditMode = this.assetService.isEditMode();

    // Load existing data
    const data = this.assetService.getData();
    this.assetName = data.name || '';
    this.description = data.description || '';
    this.website = data.website || '';
    this.hasVolunteerOpportunities = data.has_volunteer_opportunities || false;

    // Parse categories from service_type if available
    if (data.service_type) {
      this.selectedCategories = data.service_type.split(',').map(cat => cat.trim());
    }
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectCategory(cat: string) {
    if (!this.selectedCategories.includes(cat)) {
      this.selectedCategories.push(cat);
    }
  }

  removeCategory(cat: string, event: MouseEvent) {
    event.stopPropagation();
    this.selectedCategories = this.selectedCategories.filter(c => c !== cat);
  }

  goPrevious() {
    // 回到 Start 步骤
    this.router.navigate(['/add-asset/start']);
  }

  goNext() {
    // Save form data to service
    this.assetService.updateData({
      name: this.assetName,
      description: this.description,
      website: this.website,
      has_volunteer_opportunities: this.hasVolunteerOpportunities,
      service_type: this.selectedCategories.join(', ')
    });

    // 根据 hasPhysicalLocation 决定跳 Location 还是 Contact
    if (this.assetService.hasPhysicalLocation) {
      this.router.navigate(['/add-asset/location']);
    } else {
      this.router.navigate(['/add-asset/contact']);
    }
  }

  @HostListener('document:click', ['$event.target'])
  onClickOutside(target: HTMLElement) {
    if (!target.closest('.categories-dropdown')) {
      this.dropdownOpen = false;
    }
  }



  constructor(
    private router: Router,
    private assetService: AssetCreationService
  ) {}

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectCategory(cat: string) {
    if (!this.selectedCategories.includes(cat)) {
      this.selectedCategories.push(cat);
    }
  }

  removeCategory(cat: string, event: MouseEvent) {
    event.stopPropagation();
    this.selectedCategories = this.selectedCategories.filter(c => c !== cat);
  }

  goPrevious() {
    // 回到 Start 步骤
    this.router.navigate(['/add-asset/start']);
  }

  goNext() {
    // 根据 hasPhysicalLocation 决定跳 Location 还是 Contact
    if (this.assetService.hasPhysicalLocation) {
      this.router.navigate(['/add-asset/location']);
    } else {
      this.router.navigate(['/add-asset/contact']);
    }
  }

  @HostListener('document:click', ['$event.target'])
  onClickOutside(target: HTMLElement) {
    if (!target.closest('.categories-dropdown')) {
      this.dropdownOpen = false;
    }
  }

  
}
