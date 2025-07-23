import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAssetBasicComponent } from './add-asset-basic.component';

describe('AddAssetBasicComponent', () => {
  let component: AddAssetBasicComponent;
  let fixture: ComponentFixture<AddAssetBasicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddAssetBasicComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddAssetBasicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
