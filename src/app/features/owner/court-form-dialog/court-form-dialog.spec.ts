import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { CourtFormDialog } from './court-form-dialog';

describe('CourtFormDialog', () => {
  let component: CourtFormDialog;
  let fixture: ComponentFixture<CourtFormDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        { provide: MatDialogRef, useValue: { close: () => {} } },
        { provide: MAT_DIALOG_DATA, useValue: { court: null, sports: [] } },
      ],
      imports: [CourtFormDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourtFormDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
