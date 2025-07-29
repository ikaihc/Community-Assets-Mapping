import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAssetLocationComponent } from './add-asset-location.component';

describe('AddAssetLocationComponent', () => {
  let component: AddAssetLocationComponent;
  let fixture: ComponentFixture<AddAssetLocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddAssetLocationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddAssetLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
