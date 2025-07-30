import { Component, HostListener } from '@angular/core';
import { CommonModule }                 from '@angular/common';    // <-- 对应 ngIf/ngFor
import { RouterModule, Router }         from '@angular/router'; 
import { AssetCreationService } from '../../services/asset-creation.service';

@Component({
  selector: 'app-add-asset-basic',
  standalone: true,           
  imports: [
    CommonModule,            
    RouterModule       
  ],
  templateUrl: './add-asset-basic.component.html',
  styleUrls:   ['./add-asset-basic.component.scss']
})
export class AddAssetBasicComponent {
  availableCategories = [
    'Transportation',
    'Food Bank',
    'Employment',
    'Libraries'
  ];
  selectedCategories: string[] = [];
  dropdownOpen = false;

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
