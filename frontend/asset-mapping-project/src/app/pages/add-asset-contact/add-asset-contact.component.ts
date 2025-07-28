import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-asset-contact',
  templateUrl: './add-asset-contact.component.html',
  styleUrls: ['./add-asset-contact.component.scss']
})
export class AddAssetContactComponent {
  constructor(private router: Router) {}

 goNext() {
  this.router.navigate(['/add-asset/registration']);
}


  goPrevious() {
    this.router.navigate(['/add-asset/location']);
  }
}
