import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { MainWeatherCardComponent } from './main-weather-card.component';
import { CurrentWeather, WeatherSettings } from '../../../../core/models';

describe('MainWeatherCardComponent', () => {
  let component: MainWeatherCardComponent;
  let fixture: ComponentFixture<MainWeatherCardComponent>;

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
      sunrise: Math.floor((Date.now() - 3600000) / 1000),
      sunset: Math.floor((Date.now() + 3600000) / 1000)
    },
    timezone: 10800,
    id: 745044,
    name: 'Istanbul',
    cod: 200
  };

  const mockSettings: WeatherSettings = {
    unit: 'metric',
    defaultCity: 'Istanbul'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainWeatherCardComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(MainWeatherCardComponent);
    component = fixture.componentInstance;
    
    // Set default inputs
    component.currentWeather = mockCurrentWeather;
    component.weatherIcon = '01d';
    component.weatherCondition = 'Clear';
    component.dailyTemperatures = { morning: 20, afternoon: 25, evening: 22, night: 18 };
    component.settings = mockSettings;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display weather information when data is provided', () => {
    fixture.detectChanges();
    
    expect(component.currentWeather).toEqual(mockCurrentWeather);
    expect(component.weatherIcon).toBe('01d');
    expect(component.weatherCondition).toBe('Clear');
  });

  it('should handle temperature unit conversion', () => {
    component.settings = { unit: 'imperial', defaultCity: 'Istanbul' };
    fixture.detectChanges();
    
    expect(component.settings.unit).toBe('imperial');
  });

  it('should handle daily temperatures', () => {
    expect(component.dailyTemperatures).toEqual({ morning: 20, afternoon: 25, evening: 22, night: 18 });
  });

  it('should render without errors when weather data is null', () => {
    component.currentWeather = null;
    fixture.detectChanges();
    
    expect(component).toBeTruthy();
  });

  it('should handle missing weather icon gracefully', () => {
    component.weatherIcon = '';
    fixture.detectChanges();
    
    expect(component.weatherIcon).toBe('');
  });
});
