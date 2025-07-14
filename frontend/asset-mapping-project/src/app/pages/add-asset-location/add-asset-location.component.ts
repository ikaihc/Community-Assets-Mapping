import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-add-asset-location',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './add-asset-location.component.html',
  styleUrls: ['./add-asset-location.component.scss']
})
export class AddAssetLocationComponent {}
