import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { OwnerBookings } from './owner-bookings';

describe('OwnerBookings', () => {
  let component: OwnerBookings;
  let fixture: ComponentFixture<OwnerBookings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
      imports: [OwnerBookings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OwnerBookings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
