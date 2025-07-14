import { Routes } from '@angular/router';
import { ViewAssetComponent } from './pages/view-asset/view-asset.component';
import { ViewAssetAdminComponent } from './pages/view-asset-admin/view-asset-admin.component';

export const routes: Routes = [
  { path: 'view-asset', component: ViewAssetComponent },
  { path: 'view-asset-admin', component: ViewAssetAdminComponent },
  { path: '**', redirectTo: 'view-asset' }
];
