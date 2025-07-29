import { Component } from '@angular/core';
import { Router }    from '@angular/router';
import { AssetCreationService } from '../../services/asset-creation.service';

@Component({
  selector: 'app-add-asset-basic',
  templateUrl: './add-asset-basic.component.html',
  styleUrls: ['./add-asset-basic.component.scss']
})
export class AddAssetBasicComponent {
  constructor(
    private router: Router,
    private assetService: AssetCreationService
  ) {}

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
}
