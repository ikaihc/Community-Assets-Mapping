// src/app/pages/view-asset/view-asset.component.ts

import { Component, AfterViewInit, NgZone, OnInit } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AssetService, Asset } from '../../services/asset.service';

declare const google: any;


@Component({
  selector: 'app-view-asset',
  standalone: true,
  imports: [CommonModule, NgFor, RouterModule,  FormsModule,],
  templateUrl: './view-asset.component.html',
  styleUrls: ['./view-asset.component.scss']
})

export class ViewAssetComponent implements OnInit, AfterViewInit {
  map!: google.maps.Map;
  asset: Asset | null = null;
  isLoading = true;
  assetId: number | null = null;

  // Fallback dummy data structure for reference
  private dummyAsset = {

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


  constructor(
    private zone: NgZone,
    private route: ActivatedRoute,
    private router: Router,
    private assetService: AssetService
  ) {}

  ngOnInit(): void {
    console.log('ViewAssetComponent: ngOnInit called');
    // Get asset ID from query parameters
    this.route.queryParams.subscribe(params => {
      console.log('ViewAssetComponent: Query params:', params);
      if (params['id']) {
        this.assetId = parseInt(params['id']);
        console.log('ViewAssetComponent: Asset ID parsed:', this.assetId);
        this.loadAssetData();
      } else {
        console.error('ViewAssetComponent: No asset ID provided');
        this.router.navigate(['/home']);
      }
    });
  }

  loadAssetData(): void {
    console.log('ViewAssetComponent: loadAssetData called for ID:', this.assetId);
    if (this.assetId) {
      this.assetService.getAssetById(this.assetId).subscribe({
        next: (response) => {
          console.log('ViewAssetComponent: Asset data response:', response);
          if (response.success && (response.asset || response.data)) {
            // Handle both response.asset and response.data formats
            this.asset = response.asset || response.data || null;
            console.log('ViewAssetComponent: Asset loaded successfully:', this.asset);
            this.isLoading = false;
            // Initialize map after asset data is loaded with a small delay to ensure DOM is ready
            setTimeout(() => {
              this.initializeMapWithAssetData();
            }, 100);
          } else {
            console.error('ViewAssetComponent: Asset not found in response');
            this.router.navigate(['/home']);
          }
        },
        error: (error) => {
          console.error('ViewAssetComponent: Error loading asset:', error);
          this.isLoading = false;
          this.router.navigate(['/home']);
        }
      });
    }
  }

  initializeMapWithAssetData(): void {
    console.log('ViewAssetComponent: Attempting to initialize map with asset:', this.asset);

    // Default coordinates (Ottawa) if no asset coordinates
    let lat = 45.4215;
    let lng = -75.6972;
    let hasAssetCoords = false;

    if (this.asset && this.asset.address?.latitude && this.asset.address?.longitude) {
      // Convert string/decimal to number if needed
      lat = parseFloat(this.asset.address.latitude.toString());
      lng = parseFloat(this.asset.address.longitude.toString());
      hasAssetCoords = true;
      console.log('ViewAssetComponent: Using asset coordinates lat:', lat, 'lng:', lng);
    } else {
      console.log('ViewAssetComponent: Using default Ottawa coordinates, missing asset coords:', {
        asset: !!this.asset,
        address: !!this.asset?.address,
        lat: this.asset?.address?.latitude,
        lng: this.asset?.address?.longitude,
        fullAddress: this.asset?.address
      });

      // Try to geocode the address if we have it
      if (this.asset?.address && (this.asset.address.address_line_1 || this.asset.address.city)) {
        this.geocodeAddress();
      }
    }

    // Wait for Google Maps to be available
    const initializeMap = () => {
      console.log('ViewAssetComponent: Initializing Google Map');
      this.zone.run(() => {
        const mapEl = document.getElementById('view-map') as HTMLElement;
        console.log('ViewAssetComponent: Map element found:', !!mapEl);
        if (mapEl) {
          try {
            this.map = new google.maps.Map(mapEl, {
              center: { lat, lng },
              zoom: hasAssetCoords ? 15 : 12
            });
            console.log('ViewAssetComponent: Google Map created successfully');

            // Add asset marker only if we have asset coordinates
            if (hasAssetCoords) {
              new google.maps.Marker({
                position: { lat, lng },
                map: this.map,
                title: this.asset?.name || 'Asset',
                icon: {
                  url: 'assets/icons/red-pin.svg',
                  scaledSize: new google.maps.Size(36, 36)
                }
              });
              console.log('ViewAssetComponent: Asset marker added');
            }

            // Add user location if available
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(pos => {
                const userCoords = {
                  lat: pos.coords.latitude,
                  lng: pos.coords.longitude
                };
                new google.maps.Marker({
                  position: userCoords,
                  map: this.map,
                  title: 'My location',
                  icon: {
                    url: 'assets/icons/blue-pin.svg',
                    scaledSize: new google.maps.Size(36, 36)
                  }
                });
              });
            }
          } catch (error) {
            console.error('ViewAssetComponent: Error creating Google Map:', error);
          }
        } else {
          console.error('ViewAssetComponent: Map element not found');
        }
      });
    };

    // Check if Google Maps is already loaded
    if (typeof google !== 'undefined' && google.maps) {
      console.log('ViewAssetComponent: Google Maps already loaded');
      initializeMap();
    } else {
      console.log('ViewAssetComponent: Waiting for Google Maps to load');
      // Wait for Google Maps to load
      const checkGoogleMaps = setInterval(() => {
        if (typeof google !== 'undefined' && google.maps) {
          console.log('ViewAssetComponent: Google Maps loaded, initializing map');
          clearInterval(checkGoogleMaps);
          initializeMap();
        }
      }, 100);

      // Clear interval after 10 seconds to prevent infinite loop
      setTimeout(() => {
        clearInterval(checkGoogleMaps);
        console.error('ViewAssetComponent: Timeout waiting for Google Maps to load');
      }, 10000);
    }
  }

  geocodeAddress(): void {
    if (!this.asset?.address || !this.map) return;

    const geocoder = new google.maps.Geocoder();
    const address = this.getAssetAddress();

    console.log('ViewAssetComponent: Geocoding address:', address);

    geocoder.geocode({ address }, (results: any, status: string) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();

        console.log('ViewAssetComponent: Geocoding successful, new coordinates:', lat, lng);

        // Update map center and add marker
        this.map.setCenter({ lat, lng });
        this.map.setZoom(15);

        new google.maps.Marker({
          position: { lat, lng },
          map: this.map,
          title: this.asset?.name || 'Asset',
          icon: {
            url: 'assets/icons/red-pin.svg',
            scaledSize: new google.maps.Size(36, 36)
          }
        });
      } else {
        console.error('ViewAssetComponent: Geocoding failed:', status);
      }
    });
  }

  ngAfterViewInit(): void {
    // Always initialize the map after view init, even without asset data
    // This ensures the map shows even if there are issues with asset loading
    setTimeout(() => {
      if (!this.map) {
        console.log('ViewAssetComponent: Force initializing map in ngAfterViewInit');
        this.initializeMapWithAssetData();
      }
    }, 500);
  }

  // Helper methods for getting asset display data
  getAssetCategories(): string[] {
    return this.asset?.categories?.map(cat => cat.name) || [];
  }

  getAssetAddress(): string {
    if (!this.asset?.address) return 'No address provided';
    const addr = this.asset.address;

    // Build address string using actual database field names (with fallbacks)
    let addressParts = [];

    // Add street address if available (try both field names)
    const streetAddress = addr.street_address || addr.address_line_1;
    if (streetAddress) {
      addressParts.push(streetAddress);
    }

    // Add address line 2 if available (old field name)
    if (addr.address_line_2) {
      addressParts.push(addr.address_line_2);
    }

    // Add city if available
    if (addr.city) {
      addressParts.push(addr.city);
    }

    // Add province/city_code if available (try both field names)
    const province = addr.city_code || addr.province;
    if (province) {
      addressParts.push(province);
    }

    // Add postal code if available (try both field names)
    const postalCode = addr.post_code || addr.postal_code;
    if (postalCode) {
      addressParts.push(postalCode);
    }

    return addressParts.length > 0 ? addressParts.join(', ') : 'Address details not available';
  }

  getAssetContactInfo(): { name?: string; email?: string; phone?: string; title?: string } {
    return {
      name: this.asset?.contact?.contact_name,
      email: this.asset?.contact?.contact_email,
      phone: this.asset?.contact?.contact_phone,
      title: this.asset?.contact?.contact_title
    };
  }

  // Note: The languages and formats functionality would need to be added to the Asset model
  // For now, we'll comment out these methods until the backend supports them

  /*
  toggleLanguage(lang: string) {
    if (!this.asset || !this.asset.languages) return;

    const idx = this.asset.languages.indexOf(lang);
    if (idx >= 0) this.asset.languages.splice(idx, 1);
    else this.asset.languages.push(lang);
  }

  toggleFormat(fmt: string) {

    if (!this.asset || !this.asset.formats) return;

    const idx = this.asset.formats.indexOf(fmt);
    if (idx >= 0) this.asset.formats.splice(idx, 1);
    else this.asset.formats.push(fmt);
  }

  */

}
