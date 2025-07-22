import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAssetRegistrationComponent } from './add-asset-registration.component';

describe('AddAssetRegistrationComponent', () => {
  let component: AddAssetRegistrationComponent;
  let fixture: ComponentFixture<AddAssetRegistrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddAssetRegistrationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddAssetRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
