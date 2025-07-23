import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-view-asset-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-asset-admin.component.html',
  styleUrls: ['./view-asset-admin.component.scss']
})
export class ViewAssetAdminComponent {
  asset = {
    name: 'Food On the Move',
    categories: ['Food Bank'],
    description: 'Our mission is to make fruits and vegetables more accessible and affordable...',
    hasVolunteer: false,
    location: {
      address: '900 Merivale Road',
      city: 'Ottawa'
    }
  };
}
