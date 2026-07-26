import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { CourtSlotsBrowse } from './court-slots-browse';

describe('CourtSlotsBrowse', () => {
  let component: CourtSlotsBrowse;
  let fixture: ComponentFixture<CourtSlotsBrowse>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
      imports: [CourtSlotsBrowse]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourtSlotsBrowse);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
