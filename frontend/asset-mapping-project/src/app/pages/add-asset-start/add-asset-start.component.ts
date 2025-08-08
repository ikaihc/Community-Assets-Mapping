import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router }    from '@angular/router';
import { AssetCreationService } from '../../services/asset-creation.service';

@Component({
  selector: 'app-add-asset-start',
  templateUrl: './add-asset-start.component.html',
  styleUrls: ['./add-asset-start.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class AddAssetStartComponent {
  multiplePrograms: boolean | null = null;
  hasPhysicalLocation: boolean | null = null;

  constructor(
    private router: Router,
    private assetService: AssetCreationService
  ) {
    // Load existing data if returning to this step
    const existingData = this.assetService.getData();
    this.multiplePrograms = existingData.multiplePrograms ?? null;
    this.hasPhysicalLocation = existingData.hasPhysicalLocation ?? null;
  }

  proceed() {
    if (this.multiplePrograms === null || this.hasPhysicalLocation === null) {
      return; // Not yet selected
    }

    // Save to service
    this.assetService.updateData({
      multiplePrograms: this.multiplePrograms,
      hasPhysicalLocation: this.hasPhysicalLocation
    });

    // Navigate to next step
    this.assetService.nextStep();
    this.router.navigate(['/add-asset/basic']);
  }

  goBack() {
    // Clear data and go back to dashboard or home
    this.assetService.clearData();
    this.router.navigate(['/dashboard']);
  }
}
