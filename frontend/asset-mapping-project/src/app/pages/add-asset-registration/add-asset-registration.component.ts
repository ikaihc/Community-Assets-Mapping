import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-asset-registration',
  templateUrl: './add-asset-registration.component.html',
  styleUrls: ['./add-asset-registration.component.scss']
})
export class AddAssetRegistrationComponent {
  constructor(private router: Router) {}

  goPrevious() {
    this.router.navigate(['/add-asset/contact']);
  }

  onSubmit() {
    // TODO: 添加提交逻辑
    alert('Asset submitted!');
  }
}
