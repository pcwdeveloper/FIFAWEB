import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { SlotFormDialog } from './slot-form-dialog';

describe('SlotFormDialog', () => {
  let component: SlotFormDialog;
  let fixture: ComponentFixture<SlotFormDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        { provide: MatDialogRef, useValue: { close: () => {} } },
        { provide: MAT_DIALOG_DATA, useValue: null },
      ],
      imports: [SlotFormDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SlotFormDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
