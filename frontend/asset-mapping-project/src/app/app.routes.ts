// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { ViewAssetComponent } from './pages/view-asset/view-asset.component';
import { ViewAssetAdminComponent } from './pages/view-asset-admin/view-asset-admin.component';
import { AddAssetStartComponent } from './pages/add-asset-start/add-asset-start.component';
import { AddAssetBasicComponent } from './pages/add-asset-basic/add-asset-basic.component';
import { AddAssetLocationComponent } from './pages/add-asset-location/add-asset-location.component';
import { AddAssetContactComponent } from './pages/add-asset-contact/add-asset-contact.component';
import { AddAssetRegistrationComponent } from './pages/add-asset-registration/add-asset-registration.component';

export const routes: Routes = [
  { path: '', redirectTo: 'view-asset', pathMatch: 'full' },
  { path: 'view-asset', component: ViewAssetComponent },
  { path: 'view-asset-admin', component: ViewAssetAdminComponent },
  { path: 'add-asset/start', component: AddAssetStartComponent },
  { path: 'add-asset/basic', component: AddAssetBasicComponent },
  { path: 'add-asset/location', component: AddAssetLocationComponent },
  { path: 'add-asset/contact', component: AddAssetContactComponent },
  { path: 'add-asset/registration', component: AddAssetRegistrationComponent },
  { path: '**', redirectTo: 'view-asset' }
];
