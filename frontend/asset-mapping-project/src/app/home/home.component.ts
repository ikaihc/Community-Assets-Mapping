import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

declare const google: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  map!: google.maps.Map;
  userLocationMarker!: google.maps.Marker;
  postalCode: string = '';
  radiusKm: number = 5;

  categories: string[] = ['Food Bank', 'Shelter', 'Health', 'Transportation'];

  assets = [
    { name: 'Good Food on the Move', type: 'Food Bank', lat: 45.385, lng: -75.690 },
    { name: 'Ottawa Food Centre', type: 'Food Bank', lat: 45.398, lng: -75.700 },
    { name: 'Parkdale Food Centre', type: 'Food Bank', lat: 45.408, lng: -75.715 },
    { name: 'St. Joe’s Supper Table', type: 'Shelter', lat: 45.412, lng: -75.683 },
    { name: 'Mission Shelter', type: 'Shelter', lat: 45.420, lng: -75.690 },
    { name: 'Carlington Health Centre', type: 'Health', lat: 45.398, lng: -75.740 },
    { name: 'Rideauwood Addiction Centre', type: 'Health', lat: 45.400, lng: -75.690 },
    { name: 'Somerset West CHC', type: 'Health', lat: 45.411, lng: -75.710 },
    { name: 'Housing Help', type: 'Shelter', lat: 45.419, lng: -75.695 },
    { name: 'Heron Emergency Food Centre', type: 'Food Bank', lat: 45.375, lng: -75.670 },
    { name: 'Kanata Food Cupboard', type: 'Food Bank', lat: 45.305, lng: -75.900 },
    { name: 'Ottawa Mission Health Services', type: 'Health', lat: 45.421, lng: -75.690 },
    { name: 'Ottawa Innercity Ministries', type: 'Shelter', lat: 45.415, lng: -75.685 },
    { name: 'Centre 507', type: 'Shelter', lat: 45.415, lng: -75.690 },
    { name: 'Routhier Community Centre', type: 'Health', lat: 45.430, lng: -75.695 },
    { name: 'Youville Centre', type: 'Health', lat: 45.433, lng: -75.678 },
    { name: 'Odawa Native Friendship Centre', type: 'Shelter', lat: 45.410, lng: -75.730 },
    { name: 'Hintonburg Community Centre', type: 'Food Bank', lat: 45.400, lng: -75.720 },
    { name: 'Debra Dynes Family House', type: 'Shelter', lat: 45.380, lng: -75.710 },
    { name: 'Cityview Drop-In Centre', type: 'Shelter', lat: 45.377, lng: -75.690 }
  ];

  visibleAssets = [...this.assets];
  markers: google.maps.Marker[] = [];

  ngOnInit(): void {
    this.initMap();
    this.renderMarkers();
  }

  initMap(): void {
    this.map = new google.maps.Map(
      document.getElementById('map') as HTMLElement,
      {
        center: { lat: 45.385, lng: -75.690 },
        zoom: 12
      }
    );
  }

  detectMyLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          this.map.setCenter(coords);
          this.map.setZoom(13);

          this.userLocationMarker = new google.maps.Marker({
            map: this.map,
            position: coords,
            icon: {
              url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
            },
            title: 'You are here'
          });

          this.filterNearbyAssets(coords);
        },
        error => {
          alert('Location access denied or unavailable.');
        }
      );
    } else {
      alert('Geolocation not supported by your browser.');
    }
  }

  filterNearbyAssets(center: { lat: number; lng: number }, radiusKm: number = this.radiusKm): void {
    this.visibleAssets = this.assets.filter(asset => {
      const distance = this.getDistanceInKm(center.lat, center.lng, asset.lat, asset.lng);
      return distance <= radiusKm;
    });

    this.renderMarkers();
  }

  renderMarkers(): void {
    this.markers.forEach(m => m.setMap(null)); // Clear existing markers
    this.markers = [];

    this.visibleAssets.forEach(asset => {
      const marker = new google.maps.Marker({
        position: { lat: asset.lat, lng: asset.lng },
        map: this.map,
        title: asset.name
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `<strong>${asset.name}</strong><br>${asset.type}`
      });

      marker.addListener('click', () => {
        infoWindow.open(this.map, marker);
      });

      this.markers.push(marker);
    });
  }

  getDistanceInKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.toRad(lat1)) *
      Math.cos(this.toRad(lat2)) *
      Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
