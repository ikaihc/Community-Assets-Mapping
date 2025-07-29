import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements AfterViewInit {
  map!: google.maps.Map;

  ngAfterViewInit(): void {
    const mapOptions: google.maps.MapOptions = {
      center: { lat: 45.4215, lng: -75.6972 }, // Ottawa
      zoom: 12,
    };

    this.map = new google.maps.Map(
      document.getElementById('map') as HTMLElement,
      mapOptions
    );

    // Example: Add a marker
    new google.maps.Marker({
      position: { lat: 45.4215, lng: -75.6972 },
      map: this.map,
      title: 'Ottawa',
    });
  }
}
