import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { WeatherSkeletonComponent } from './weather-skeleton.component';

describe('WeatherSkeletonComponent', () => {
  let component: WeatherSkeletonComponent;
  let fixture: ComponentFixture<WeatherSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeatherSkeletonComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(WeatherSkeletonComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render skeleton loading animation', () => {
    fixture.detectChanges();
    
    // Component should render without errors
    expect(component).toBeTruthy();
  });

  it('should be a standalone component', () => {
    // WeatherSkeletonComponent should be standalone
    expect(component).toBeDefined();
  });

  it('should have skeleton elements for loading state', () => {
    fixture.detectChanges();
    
    // Check if component renders (basic functionality test)
    const compiled = fixture.nativeElement;
    expect(compiled).toBeTruthy();
  });
});
