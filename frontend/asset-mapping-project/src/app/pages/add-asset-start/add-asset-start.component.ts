import { Component } from '@angular/core';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {}

  proceed() {
    if (this.hasPhysicalLocation === true) {
      this.router.navigate(['/add-asset/basic']);
    } else {
      alert('You need a physical address.');
    }
  }
}
