import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AssetService, Asset } from '../services/asset.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  map!: google.maps.Map;
  userLocationMarker!: google.maps.Marker;
  postalCode: string = '';
  radiusKm: number = 5;
  private destroy$ = new Subject<void>();

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
  assets: Asset[] = [];
  filteredAssets: Asset[] = [];
  markers: google.maps.Marker[] = [];
  isLoadingAssets = false;

  // Filters
  searchQuery = '';
  volunteerOnly = false;

  constructor(
    private assetService: AssetService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAssets();
    this.initMap();

    // Close dropdown on outside click
    document.addEventListener('click', this.handleClickOutside.bind(this));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAssets(): void {
    this.isLoadingAssets = true;

    // Load approved assets for public display - increased limit to see more assets
    this.assetService.getAssets(1, 500, 'approved')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('HomeComponent: Assets loaded:', response);
          console.log('HomeComponent: Total assets in response:', response.total);
          console.log('HomeComponent: Assets array length:', response.assets?.length);
          if (response.success && response.assets) {
            this.assets = response.assets;
            this.filteredAssets = [...this.assets];
            console.log('HomeComponent: Assets set to component:', this.assets.length, 'assets');
            this.renderMarkers();
          }
          this.isLoadingAssets = false;
        },
        error: (error) => {
          console.error('HomeComponent: Error loading assets:', error);
          this.isLoadingAssets = false;
        }
      });
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

          // Apply filters to show relevant assets
          this.applyFilters();
        },
        () => {
          alert('Location access denied or unavailable.');
        }
      );
    } else {
      alert('Geolocation not supported by your browser.');
    }
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredAssets = this.assets.filter(asset => {
      const matchesSearch = asset.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (asset.description && asset.description.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (asset.service_type && asset.service_type.toLowerCase().includes(this.searchQuery.toLowerCase()));

      const matchesCategory = this.selectedCategories.length
        ? this.selectedCategories.includes(asset.service_type || '')
        : true;

      const matchesVolunteer = this.volunteerOnly
        ? asset.has_volunteer_opportunities === true
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

  onAssetClick(asset: Asset): void {
    console.log('HomeComponent: Asset clicked:', asset);
    console.log('HomeComponent: Navigating to view-asset with ID:', asset.id);
    // Navigate to asset view page
    this.router.navigate(['/view-asset'], { queryParams: { id: asset.id } });
  }

  renderMarkers(): void {
    this.markers.forEach(marker => marker.setMap(null));
    this.markers = [];

    this.filteredAssets.forEach(asset => {
      // Only create marker if asset has address with coordinates
      if (asset.address?.latitude && asset.address?.longitude) {
        const marker = new google.maps.Marker({
          position: {
            lat: asset.address.latitude,
            lng: asset.address.longitude
          },
          map: this.map,
          title: asset.name,
          icon: {
            url: 'assets/icons/red-pin.svg',
            scaledSize: new google.maps.Size(36, 36)
          }
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `<strong>${asset.name}</strong><br>${asset.service_type || 'Community Asset'}`
        });

        marker.addListener('click', () => {
          infoWindow.open(this.map, marker);
        });

        this.markers.push(marker);
      }
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
