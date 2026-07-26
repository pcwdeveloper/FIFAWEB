import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { VenueCourts } from './venue-courts';

describe('VenueCourts', () => {
  let component: VenueCourts;
  let fixture: ComponentFixture<VenueCourts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
      imports: [VenueCourts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VenueCourts);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
