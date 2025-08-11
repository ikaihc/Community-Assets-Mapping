
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AssetCreationService } from '../../services/asset-creation.service';
import { AssetService } from '../../services/asset.service';


@Component({
  selector: 'app-add-asset-start',
  templateUrl: './add-asset-start.component.html',
  styleUrls: ['./add-asset-start.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class AddAssetStartComponent implements OnInit {
  multiplePrograms: boolean | null = null;
  hasPhysicalLocation: boolean | null = null;
  isEditMode = false;
  assetId: number | null = null;

  constructor(
    private router: Router,

    private route: ActivatedRoute,
    private assetService: AssetCreationService,
    private assetApiService: AssetService
  ) {}

  ngOnInit(): void {
    // Check for edit mode parameters
    this.route.queryParams.subscribe(params => {
      if (params['id'] && params['mode'] === 'edit') {
        this.isEditMode = true;
        this.assetId = parseInt(params['id']);
        this.loadAssetForEdit();
      } else {
        // Clear any previous data to start fresh
        this.assetService.clearData();
        // Load existing data if returning to this step in add mode
        const existingData = this.assetService.getData();
        this.multiplePrograms = existingData.multiplePrograms ?? null;
        this.hasPhysicalLocation = existingData.hasPhysicalLocation ?? null;
      }
    });
  }

  loadAssetForEdit(): void {
    if (this.assetId) {
      this.assetApiService.getAssetById(this.assetId).subscribe({
        next: (response) => {
          console.log('Asset data from database:', response);
          this.assetService.loadAssetForEdit(response);
          const data = this.assetService.getData();
          this.multiplePrograms = data.multiplePrograms ?? null;
          this.hasPhysicalLocation = data.hasPhysicalLocation ?? null;
          console.log('Loaded for edit mode:', { multiplePrograms: this.multiplePrograms, hasPhysicalLocation: this.hasPhysicalLocation });
        },
        error: (error) => {
          console.error('Error loading asset for edit:', error);
          // Redirect back to dashboard on error
          this.router.navigate(['/dashboard']);
        }
      });
    }
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
