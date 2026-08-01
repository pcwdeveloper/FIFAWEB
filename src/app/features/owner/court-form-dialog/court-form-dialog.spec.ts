import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

import { CourtFormDialog } from './court-form-dialog';

describe('CourtFormDialog', () => {
  let component: CourtFormDialog;
  let fixture: ComponentFixture<CourtFormDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        { provide: DialogRef, useValue: { close: () => {} } },
        { provide: DIALOG_DATA, useValue: { court: null, sport: { id: 1, name: 'Badminton' } } },
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
