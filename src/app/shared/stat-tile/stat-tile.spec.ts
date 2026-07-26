import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatTile } from './stat-tile';

describe('StatTile', () => {
  let component: StatTile;
  let fixture: ComponentFixture<StatTile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatTile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatTile);
    component = fixture.componentInstance;
    component.label = 'Total venues';
    component.value = '12';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
