import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-view-asset',
  standalone: true,
  templateUrl: './view-asset.component.html',
  styleUrls: ['./view-asset.component.scss']
})
export class ViewAssetComponent implements AfterViewInit {
  asset = {
    name: 'Food On the Move',
    categories: ['Food Bank'],
    description: 'Our mission is to make fruits and vegetables more accessible and affordable...',
    hasVolunteer: false,
    location: {
      address: '900 Merivale Road',
      city: 'Ottawa',
      // **务必替换成实际的经纬度，否则地图中心会跑到 0,0**
      lat: 45.3920,
      lng: -75.7088
    }
  };

  ngAfterViewInit(): void {
    // 初始化地图
    const map = L.map('map', {
      center: [this.asset.location.lat, this.asset.location.lng],
      zoom: 13
    });

    // OpenStreetMap 瓦片层
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // 在资产位置放一个标记
    L.marker([this.asset.location.lat, this.asset.location.lng])
      .addTo(map)
      .bindPopup(`<strong>${this.asset.name}</strong><br>${this.asset.location.address}`)
      .openPopup();
  }
}
