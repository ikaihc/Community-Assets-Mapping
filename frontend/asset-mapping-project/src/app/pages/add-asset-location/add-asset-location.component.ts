// src/app/pages/add-asset-location/add-asset-location.component.ts

import { Component, AfterViewInit, NgZone, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AssetCreationService } from '../../services/asset-creation.service';

declare const google: any;

// 声明全局 callback
declare global {
  interface Window { initMap: () => void; }
}

@Component({
  selector: 'app-add-asset-location',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './add-asset-location.component.html',
  styleUrls: ['./add-asset-location.component.scss']
})

export class AddAssetLocationComponent implements AfterViewInit, OnInit {
  map!: google.maps.Map;
  marker!: google.maps.Marker;

  // Form fields
  streetAddress = '';
  city = '';
  postcode = '';
  transportationOptions = '';
  isEditMode = false;

  // 默认中心坐标（可以改成从表单读）
  defaultCenter = { lat: 45.385, lng: -75.690 };

  constructor(
    private zone: NgZone,
    private router: Router,
    private assetService: AssetCreationService
  ) {}

  ngOnInit(): void {
    this.isEditMode = this.assetService.isEditMode();

    // Load existing data
    const data = this.assetService.getData();
    console.log('Location component - full asset data:', data);

    if (data.address) {
      console.log('Location component - address data:', data.address);
      this.streetAddress = data.address.address_line_1 || '';
      this.city = data.address.city || '';
      this.postcode = data.address.postal_code || '';
    }
    // Note: transportation options might come from a different field
    this.transportationOptions = data.phone || ''; // Temporarily using phone field

    console.log('Location component loaded with data:', {
      streetAddress: this.streetAddress,
      city: this.city,
      postcode: this.postcode,
      transportationOptions: this.transportationOptions
    });
  }


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

    // 在地图上创建一个可拖拽的、使用 red-pin.svg 的标记
    this.marker = new google.maps.Marker({
      position: this.defaultCenter,
      map: this.map,
      draggable: true,
      title: 'Drag me to adjust location',
      icon: {
        url: 'assets/icons/red-pin.svg',
        scaledSize: new google.maps.Size(36, 36)
      }
    });

    // 拖拽结束后，你可以把位置写回表单：
    this.marker.addListener('dragend', () => {
      const pos = this.marker.getPosition();
      if (pos) {
        console.log('New position:', pos.lat(), pos.lng());
        // TODO: 把 pos.lat()/pos.lng() 写回 input 或组件变量
      }
    });
  }


  goPrevious() {
    // Save current data before navigating
    this.saveLocationData();
    this.router.navigate(['/add-asset/basic']);
  }

  goNext() {
    // Save location data and proceed
    this.saveLocationData();
    this.router.navigate(['/add-asset/contact']);
  }

  private saveLocationData() {
    this.assetService.updateData({
      address: {
        address_line_1: this.streetAddress,
        city: this.city,
        postal_code: this.postcode,
        province: 'Ontario', // Default to Ontario for now
        country: 'Canada'
      },
      phone: this.transportationOptions // Temporarily storing transportation in phone field
    });

    console.log('Saved location data:', {
      streetAddress: this.streetAddress,
      city: this.city,
      postcode: this.postcode,
      transportationOptions: this.transportationOptions
    });
  }

}
