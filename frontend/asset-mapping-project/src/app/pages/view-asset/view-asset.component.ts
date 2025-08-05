// src/app/pages/view-asset/view-asset.component.ts
import { Component, AfterViewInit, NgZone } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule }           from '@angular/forms';

declare const google: any;

// 把 initMap 挂到 window 上
declare global {
  interface Window { initMap: () => void; }
}

@Component({
  selector: 'app-view-asset',
  standalone: true,
  imports: [CommonModule, NgFor, RouterModule,  FormsModule,],
  templateUrl: './view-asset.component.html',
  styleUrls: ['./view-asset.component.scss']
})
export class ViewAssetComponent implements AfterViewInit {
  map!: google.maps.Map;

  asset = {
    name: 'Food On the Move',
    lat: 45.385,
    lng: -75.690,
    categories: ['Food Bank', 'Basic Needs'],
    description: 'Our mission is to make fruits and vegetables more accessible and affordable...',
    hasVolunteer: false,
    location: {
      address: '900 Merivale Road',
      city: 'Ottawa',
      postcode: 'K1Z 5Z8',
      transportation: 'bus 80/88/112 Algonquin/Baseline station; u-train Algonquin station'
    },
    schedule: {
      info: 'Manual Schedule',
      details: [
        '01/JUL/2025 – 11/JUL/2025 (daily) 10:00AM – 05:00PM;',
        '06/AUG/2025 – 11/AUG/2025 (daily) 10:00AM – 05:00PM;'
      ]
    },
    registration: 'To register, please contact by email',
    accessibleFeatures: false,
    languages: ['English','French'],
    formats: ['On-site','Individual']
  };

  allLanguages = ['English','French','Arabic','Sign','Others'];
  allFormats   = ['Online','On-site','Group','Individual','Drop-in','Scheduled','Self-paced'];

  constructor(private zone: NgZone) {}

  ngAfterViewInit(): void {
    // 1) 在全局注册 initMap 回调
    window.initMap = () => {
      // 确保回到 Angular zone 里运行
      this.zone.run(() => {
        const mapEl = document.getElementById('view-map') as HTMLElement;
        this.map = new google.maps.Map(mapEl, {
          center: { lat: this.asset.lat, lng: this.asset.lng },
          zoom: 13
        });
        new google.maps.Marker({
        position: { lat: this.asset.lat, lng: this.asset.lng },
        map: this.map,
        title: this.asset.name,
        icon: {
          url: 'assets/icons/red-pin.svg',
          // 根据 svg 尺寸酌情改 scaledSize
          scaledSize: new google.maps.Size(36, 36)
          }
        });
      });

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          };
          new google.maps.Marker({
            position: coords,
            map: this.map,
            title: 'My location',
            icon: {
              url: 'assets/icons/blue-pin.svg',
              scaledSize: new google.maps.Size(36, 36)
            }
          });
        });
      }

    };

    // 2) 如果脚本已经加载完（URL 加了 callback，但可能在组件 afterViewInit 之前就加载了），手动调用一次
    if (window.google && google.maps) {
      window.initMap();
    }
  }

  toggleLanguage(lang: string) {
    const idx = this.asset.languages.indexOf(lang);
    if (idx >= 0) this.asset.languages.splice(idx, 1);
    else this.asset.languages.push(lang);
  }

  toggleFormat(fmt: string) {
    const idx = this.asset.formats.indexOf(fmt);
    if (idx >= 0) this.asset.formats.splice(idx, 1);
    else this.asset.formats.push(fmt);
  }
}
