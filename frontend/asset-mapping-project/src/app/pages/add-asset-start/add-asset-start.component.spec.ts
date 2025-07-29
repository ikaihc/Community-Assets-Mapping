import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAssetStartComponent } from './add-asset-start.component';

describe('AddAssetStartComponent', () => {
  let component: AddAssetStartComponent;
  let fixture: ComponentFixture<AddAssetStartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddAssetStartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddAssetStartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
