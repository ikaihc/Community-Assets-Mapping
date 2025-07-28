import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAssetContactComponent } from './add-asset-contact.component';

describe('AddAssetContactComponent', () => {
  let component: AddAssetContactComponent;
  let fixture: ComponentFixture<AddAssetContactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddAssetContactComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddAssetContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
