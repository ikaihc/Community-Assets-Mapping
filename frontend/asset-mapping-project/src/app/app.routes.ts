import { Routes } from '@angular/router';
import { ViewAssetComponent } from './pages/view-asset/view-asset.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'view-asset', component: ViewAssetComponent }
];

