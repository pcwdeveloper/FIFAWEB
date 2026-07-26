import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { SportManagement } from './sport-management';

describe('SportManagement', () => {
  let component: SportManagement;
  let fixture: ComponentFixture<SportManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
      imports: [SportManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SportManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
