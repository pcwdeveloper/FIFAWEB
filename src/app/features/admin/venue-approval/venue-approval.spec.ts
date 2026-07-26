import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { VenueApproval } from './venue-approval';

describe('VenueApproval', () => {
  let component: VenueApproval;
  let fixture: ComponentFixture<VenueApproval>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
      imports: [VenueApproval]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VenueApproval);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
