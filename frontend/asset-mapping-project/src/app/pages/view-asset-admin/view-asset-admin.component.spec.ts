import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAssetAdminComponent } from './view-asset-admin.component';

describe('ViewAssetAdminComponent', () => {
  let component: ViewAssetAdminComponent;
  let fixture: ComponentFixture<ViewAssetAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewAssetAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewAssetAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
