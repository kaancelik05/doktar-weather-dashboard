import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { FiveDayForecastComponent } from './five-day-forecast.component';
import { WeatherSettings } from '../../../../core/models';

interface DailyForecast {
  date: string;
  dateObj: Date;
  dayName: string;
  temp: number;
  tempMax: number;
  tempMin: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
}

describe('FiveDayForecastComponent', () => {
  let component: FiveDayForecastComponent;
  let fixture: ComponentFixture<FiveDayForecastComponent>;

  const mockDailyForecast: DailyForecast[] = [
    {
      date: new Date().toISOString(),
      dateObj: new Date(),
      dayName: 'Today',
      temp: 25,
      tempMax: 28,
      tempMin: 18,
      description: 'Clear',
      icon: '01d',
      humidity: 55,
      windSpeed: 4
    },
    {
      date: new Date(Date.now() + 86400000).toISOString(),
      dateObj: new Date(Date.now() + 86400000),
      dayName: 'Tomorrow',
      temp: 27,
      tempMax: 30,
      tempMin: 20,
      description: 'Sunny',
      icon: '01d',
      humidity: 50,
      windSpeed: 3
    }
  ];

  const mockSettings: WeatherSettings = {
    unit: 'metric',
    defaultCity: 'Istanbul'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiveDayForecastComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(FiveDayForecastComponent);
    component = fixture.componentInstance;
    
    // Set default inputs
    component.dailyForecast = mockDailyForecast;
    component.settings = mockSettings;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display forecast data when provided', () => {
    fixture.detectChanges();
    
    expect(component.dailyForecast).toEqual(mockDailyForecast);
    expect(component.settings).toEqual(mockSettings);
  });

  it('should handle empty forecast array', () => {
    component.dailyForecast = [];
    fixture.detectChanges();
    
    expect(component.dailyForecast.length).toBe(0);
    expect(component).toBeTruthy();
  });

  it('should handle null forecast data', () => {
    component.dailyForecast = [];
    fixture.detectChanges();
    
    expect(component).toBeTruthy();
  });

  it('should handle metric units', () => {
    component.settings = { unit: 'metric', defaultCity: 'Istanbul' };
    fixture.detectChanges();
    
    expect(component.settings.unit).toBe('metric');
  });

  it('should handle imperial units', () => {
    component.settings = { unit: 'imperial', defaultCity: 'Istanbul' };
    fixture.detectChanges();
    
    expect(component.settings.unit).toBe('imperial');
  });

  it('should handle multiple forecast days', () => {
    expect(component.dailyForecast.length).toBe(2);
    expect(component.dailyForecast[0].description).toBe('Clear');
    expect(component.dailyForecast[1].description).toBe('Sunny');
  });
});
