import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

import { VenueFormDialog } from './venue-form-dialog';

describe('VenueFormDialog', () => {
  let component: VenueFormDialog;
  let fixture: ComponentFixture<VenueFormDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        { provide: DialogRef, useValue: { close: () => {} } },
        { provide: DIALOG_DATA, useValue: null },
      ],
      imports: [VenueFormDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VenueFormDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
