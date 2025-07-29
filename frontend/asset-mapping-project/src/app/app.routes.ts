// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ViewAssetComponent } from './pages/view-asset/view-asset.component';
import { ViewAssetAdminComponent } from './pages/view-asset-admin/view-asset-admin.component';
import { AddAssetStartComponent } from './pages/add-asset-start/add-asset-start.component';
import { AddAssetBasicComponent } from './pages/add-asset-basic/add-asset-basic.component';
import { AddAssetLocationComponent } from './pages/add-asset-location/add-asset-location.component';
import { AddAssetContactComponent } from './pages/add-asset-contact/add-asset-contact.component';
import { AddAssetRegistrationComponent } from './pages/add-asset-registration/add-asset-registration.component';

export const routes: Routes = [
  // 主页
  { path: '', component: HomeComponent },

  // Dashboard
  { path: 'dashboard', component: DashboardComponent },

  // 访客查看资产
  { path: 'view-asset', component: ViewAssetComponent },

  // 管理/编辑资产，带上 id 参数
  { path: 'view-asset-admin/:id', component: ViewAssetAdminComponent },

  // 多步新增资产流程
  { path: 'add-asset/start',        component: AddAssetStartComponent },
  { path: 'add-asset/basic',        component: AddAssetBasicComponent },
  { path: 'add-asset/location',     component: AddAssetLocationComponent },
  { path: 'add-asset/contact',      component: AddAssetContactComponent },
  { path: 'add-asset/registration', component: AddAssetRegistrationComponent },

  // 兜底：未匹配到的路径跳回 ViewAsset
  { path: '**', redirectTo: '' }
];
