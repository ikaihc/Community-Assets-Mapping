import { Component } from '@angular/core';
import { Router }    from '@angular/router';
import { AssetCreationService } from '../../services/asset-creation.service';

@Component({
  selector: 'app-add-asset-start',
  templateUrl: './add-asset-start.component.html',
  styleUrls: ['./add-asset-start.component.scss'],
  standalone: true,
  imports: []
})
export class AddAssetStartComponent {
  multiplePrograms: boolean | null = null;
  hasPhysicalLocation: boolean | null = null;

  constructor(
    private router: Router,
    private assetService: AssetCreationService
  ) {}

  proceed() {
    if (this.multiplePrograms === null || this.hasPhysicalLocation === null) {
      return; // 还没选齐
    }
    // 保存到 Service
    this.assetService.multiplePrograms   = this.multiplePrograms;
    this.assetService.hasPhysicalLocation = this.hasPhysicalLocation;

    // 一律先进 Basic 页面
    this.router.navigate(['/add-asset/basic']);
  }
}
