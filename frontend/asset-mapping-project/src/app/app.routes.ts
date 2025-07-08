import { Routes } from '@angular/router';
import { ViewAssetComponent } from './pages/view-asset/view-asset.component';

export const routes: Routes = [
  { path: 'view-asset', component: ViewAssetComponent },
  { path: '', redirectTo: 'view-asset', pathMatch: 'full' }, // 默认跳转
];
