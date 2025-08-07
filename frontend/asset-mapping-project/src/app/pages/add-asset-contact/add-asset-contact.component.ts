// src/app/pages/add-asset-contact/add-asset-contact.component.ts
import { Component }             from '@angular/core';
import { Router }                from '@angular/router';
import { CommonModule }          from '@angular/common';
import { RouterModule }          from '@angular/router';
import { AssetCreationService }  from '../../services/asset-creation.service';

@Component({
  selector: 'app-add-asset-contact',
  standalone: true,
  imports: [ CommonModule, RouterModule ],
  templateUrl: './add-asset-contact.component.html',
  styleUrls: ['./add-asset-contact.component.scss']
})
export class AddAssetContactComponent {
  constructor(
    private router: Router,
    private assetService: AssetCreationService
  ) {}

  goNext() {
    this.router.navigate(['/add-asset/registration']);
  }

  goPrevious() {
    // 根据 hasPhysicalLocation 决定跳转上一页
    if (this.assetService.hasPhysicalLocation) {
      this.router.navigate(['/add-asset/location']);
    } else {
      this.router.navigate(['/add-asset/basic']);
    }
  }
}
