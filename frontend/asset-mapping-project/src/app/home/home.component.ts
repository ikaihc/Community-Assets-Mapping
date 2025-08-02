import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  map!: google.maps.Map;
  userLocationMarker!: google.maps.Marker;
  postalCode: string = '';
  radiusKm: number = 5;

  // New dropdown controls
  dropdownOpen = false;
  hoveredGroup: string | null = null;
  selectedCategories: string[] = [];

  // Nested categories
  categoryGroups = [
    {
      name: 'Food Security',
      items: [
        'Bike repair',
        'Computer café',
        'Car-sharing and similar transportation sharing services',
        'Rentals (gear, tools)'
      ]
    },
    {
      name: 'Social Services',
      items: ['Shelter', 'Emergency Aid', 'Counseling']
    },
    {
      name: 'Private Services',
      items: ['Transportation', 'Tutoring']
    },
    {
      name: 'Health Services',
      items: ['Clinics', 'Mental Health Support']
    }
  ];

  // Data
  assets = [
    { id: 1, name: 'Good Food on the Move', type: 'Bike repair', lat: 45.385, lng: -75.690 },
    { id: 2, name: 'Ottawa Food Centre', type: 'Computer café', lat: 45.398, lng: -75.700 },
    { id: 3, name: 'Car-sharing Ottawa', type: 'Car-sharing and similar transportation sharing services', lat: 45.408, lng: -75.715 },
    { id: 4, name: 'Tool Library', type: 'Rentals (gear, tools)', lat: 45.412, lng: -75.683 },
    { id: 5, name: 'Mission Shelter', type: 'Shelter', lat: 45.420, lng: -75.690 },
    { id: 6, name: 'Carlington Health Centre', type: 'Clinics', lat: 45.398, lng: -75.740 },
    { id: 7, name: 'Rideauwood Addiction Centre', type: 'Counseling', lat: 45.400, lng: -75.690 },
    { id: 8, name: 'Tutoring Centre', type: 'Tutoring', lat: 45.411, lng: -75.710 },
    { id: 9, name: 'Community Transport Van', type: 'Transportation', lat: 45.419, lng: -75.695 }
  ];

  filteredAssets = [...this.assets];
  markers: google.maps.Marker[] = [];

  // Filters
  searchQuery = '';
  volunteerOnly = false;

  ngOnInit(): void {
    this.filteredAssets = [...this.assets];
    this.initMap();
    this.renderMarkers();
  
    // Close dropdown on outside click
    document.addEventListener('click', this.handleClickOutside.bind(this));
  }
  
  handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const dropdown = document.querySelector('.custom-dropdown');
    if (dropdown && !dropdown.contains(target)) {
      this.closeDropdown();
    }
  }

  initMap(): void {
    this.map = new google.maps.Map(document.getElementById('map') as HTMLElement, {
      center: { lat: 45.385, lng: -75.690 },
      zoom: 12
    });
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
              url: 'assets/icons/blue-pin.svg',
              scaledSize: new google.maps.Size(36, 36)
            },
            title: 'You are here'
          });

          this.filterNearbyAssets(coords);
        },
        () => {
          alert('Location access denied or unavailable.');
        }
      );
    } else {
      alert('Geolocation not supported by your browser.');
    }
  }

  filterNearbyAssets(center: { lat: number; lng: number }, radiusKm: number = this.radiusKm): void {
    this.filteredAssets = this.assets.filter(asset => {
      const distance = this.getDistanceInKm(center.lat, center.lng, asset.lat, asset.lng);
      return distance <= radiusKm;
    });

    this.renderMarkers();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredAssets = this.assets.filter(asset => {
      const matchesSearch = asset.name.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesCategory = this.selectedCategories.length
        ? this.selectedCategories.includes(asset.type)
        : true;

      const matchesVolunteer = this.volunteerOnly
        ? asset.name.toLowerCase().includes('volunteer') || asset.type.toLowerCase().includes('volunteer')
        : true;

      return matchesSearch && matchesCategory && matchesVolunteer;
    });

    this.renderMarkers();
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }
  
  closeDropdown(): void {
    this.dropdownOpen = false;
    
  }

  toggleCategory(category: string): void {
    const index = this.selectedCategories.indexOf(category);
    if (index > -1) {
      this.selectedCategories.splice(index, 1);
    } else {
      this.selectedCategories.push(category);
    }
    this.applyFilters();
  }

  removeCategory(category: string): void {
    this.selectedCategories = this.selectedCategories.filter(c => c !== category);
    this.applyFilters();
  }

  isSelected(category: string): boolean {
    return this.selectedCategories.includes(category);
  }

  renderMarkers(): void {
    this.markers.forEach(marker => marker.setMap(null));
    this.markers = [];

    this.filteredAssets.forEach(asset => {
      const marker = new google.maps.Marker({
        position: { lat: asset.lat, lng: asset.lng },
        map: this.map,
        title: asset.name,
        icon: {
          url: 'assets/icons/red-pin.svg',
          scaledSize: new google.maps.Size(36, 36)
        }
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
