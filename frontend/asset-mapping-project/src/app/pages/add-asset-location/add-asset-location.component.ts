// src/app/pages/add-asset-location/add-asset-location.component.ts
import { Component, AfterViewInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

declare const google: any;

// 声明全局 callback
declare global {
  interface Window { initMap: () => void; }
}

@Component({
  selector: 'app-add-asset-location',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './add-asset-location.component.html',
  styleUrls: ['./add-asset-location.component.scss']
})
export class AddAssetLocationComponent implements AfterViewInit {
  map!: google.maps.Map;
  marker!: google.maps.Marker;

  // 默认中心坐标（可以改成从表单读）
  defaultCenter = { lat: 45.385, lng: -75.690 };

  constructor(private zone: NgZone) {}

  ngAfterViewInit(): void {
    // 1) 把 window.initMap 指向我们的初始化函数
    window.initMap = () => {
      this.zone.run(() => this.initializeMap());
    };

    // 2) 如果脚本已提前加载完毕，手动调用一次
    if (window.google && google.maps) {
      window.initMap();
    }
  }

  private initializeMap() {
    const el = document.getElementById('location-map') as HTMLElement;
    this.map = new google.maps.Map(el, {
      center: this.defaultCenter,
      zoom: 12
    });

    // 在地图上创建一个可拖拽的标记
    this.marker = new google.maps.Marker({
      position: this.defaultCenter,
      map: this.map,
      draggable: true,
      title: 'Drag me to adjust location'
    });

    // 拖拽结束后，你可以把位置写回表单：
    this.marker.addListener('dragend', () => {
      const pos = this.marker.getPosition();
      if (pos) {
        // 例如：
        console.log('New position:', pos.lat(), pos.lng());
        // TODO: 把 pos.lat()/pos.lng() 写回 input 或组件变量
      }
    });
  }
}
