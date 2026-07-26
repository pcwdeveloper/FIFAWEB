import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { OwnerDashboard } from './owner-dashboard';

describe('OwnerDashboard', () => {
  let component: OwnerDashboard;
  let fixture: ComponentFixture<OwnerDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
      imports: [OwnerDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OwnerDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
