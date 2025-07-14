import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  map!: L.Map;

  categories: string[] = ['Food Bank', 'Shelter', 'Health', 'Transportation'];
  assets = [
    { name: 'Good Food on the Move', type: 'Food Bank', lat: 45.385, lng: -75.690 },
    { name: 'Ottawa Food Centre', type: 'Food Bank', lat: 45.398, lng: -75.700 }
  ];

  ngOnInit(): void {
    this.initMap();
    this.renderMarkers();
  }

  initMap(): void {
    this.map = L.map('map').setView([45.385, -75.690], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);
  }

  renderMarkers(): void {
    this.assets.forEach(asset => {
      L.marker([asset.lat, asset.lng])
        .addTo(this.map)
        .bindPopup(`<strong>${asset.name}</strong><br>${asset.type}`);
    });
  }
}
