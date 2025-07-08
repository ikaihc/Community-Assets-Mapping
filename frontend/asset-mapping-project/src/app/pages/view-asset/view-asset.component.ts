import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-view-asset',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-asset.component.html',
  styleUrls: ['./view-asset.component.scss'],
})
export class ViewAssetComponent {
  asset = {
    name: 'Food On the Move',
    categories: ['Food Bank'],
    description: 'Our mission is to make fruits and vegetables more accessible and affordable...',
    hasVolunteer: false,
    location: {
      address: '900 Merivale Road',
      city: 'Ottawa',
    },
  };

  userRole = 'guest'; // 后续可用于 admin/guest 判断
}
