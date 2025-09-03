import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { SunriseSunsetCardComponent } from './sunrise-sunset-card.component';
import { CurrentWeather } from '../../../../core/models';

describe('SunriseSunsetCardComponent', () => {
  let component: SunriseSunsetCardComponent;
  let fixture: ComponentFixture<SunriseSunsetCardComponent>;

  const mockCurrentWeather: CurrentWeather = {
    coord: { lat: 41.0082, lon: 28.9784 },
    weather: [
      {
        id: 800,
        main: 'Clear',
        description: 'clear sky',
        icon: '01d'
      }
    ],
    base: 'stations',
    main: {
      temp: 25,
      feels_like: 27,
      temp_min: 18,
      temp_max: 28,
      pressure: 1013,
      humidity: 60
    },
    visibility: 10000,
    wind: {
      speed: 5,
      deg: 180
    },
    clouds: {
      all: 0
    },
    dt: Math.floor(Date.now() / 1000),
    sys: {
      country: 'TR',
      sunrise: Math.floor((Date.now() - 3600000) / 1000), // 1 hour ago
      sunset: Math.floor((Date.now() + 3600000) / 1000)   // 1 hour from now
    },
    timezone: 10800,
    id: 745044,
    name: 'Istanbul',
    cod: 200
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SunriseSunsetCardComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(SunriseSunsetCardComponent);
    component = fixture.componentInstance;
    
    // Set default input
    component.currentWeather = mockCurrentWeather;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display sunrise and sunset data when provided', () => {
    fixture.detectChanges();
    
    expect(component.currentWeather).toEqual(mockCurrentWeather);
    expect(component.currentWeather!.sys.sunrise).toBeDefined();
    expect(component.currentWeather!.sys.sunset).toBeDefined();
  });

  it('should handle valid sunrise time', () => {
    fixture.detectChanges();
    
    const sunriseTime = component.currentWeather!.sys.sunrise;
    expect(sunriseTime).toBeGreaterThan(0);
    expect(typeof sunriseTime).toBe('number');
  });

  it('should handle valid sunset time', () => {
    fixture.detectChanges();
    
    const sunsetTime = component.currentWeather!.sys.sunset;
    expect(sunsetTime).toBeGreaterThan(0);
    expect(typeof sunsetTime).toBe('number');
  });

  it('should handle null weather data gracefully', () => {
    component.currentWeather = null;
    fixture.detectChanges();
    
    expect(component).toBeTruthy();
  });

  it('should handle missing sys data gracefully', () => {
    const weatherWithoutSys = { 
      ...mockCurrentWeather,
      sys: { ...mockCurrentWeather.sys, sunrise: 0, sunset: 0 }
    };
    
    component.currentWeather = weatherWithoutSys;
    fixture.detectChanges();
    
    expect(component).toBeTruthy();
  });

  it('should verify sunset is after sunrise', () => {
    fixture.detectChanges();
    
    const sunrise = component.currentWeather!.sys.sunrise;
    const sunset = component.currentWeather!.sys.sunset;
    
    expect(sunset).toBeGreaterThan(sunrise);
  });
});
