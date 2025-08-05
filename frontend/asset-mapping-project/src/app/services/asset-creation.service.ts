import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AssetCreationService {
  // Start 页面保存的两个字段
  multiplePrograms: boolean | null = null;
  hasPhysicalLocation: boolean | null = null;
}
