import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { FavoritesComponent } from './favorites.component';
import { WeatherStateService } from '../../core/services/weather-state.service';
import { FavoriteCity, CurrentWeather } from '../../core/models';

describe('FavoritesComponent', () => {
  let component: FavoritesComponent;
  let fixture: ComponentFixture<FavoritesComponent>;
  let mockWeatherStateService: Partial<WeatherStateService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockFavoriteCity: FavoriteCity = {
    id: '1',
    name: 'Istanbul',
    country: 'TR',
    coord: { lat: 41.0082, lon: 28.9784 },
    addedAt: new Date()
  };

  const mockCurrentWeather: CurrentWeather = {
    coord: { lat: 41.0082, lon: 28.9784 },
    weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
    base: 'stations',
    main: { temp: 25, feels_like: 27, temp_min: 18, temp_max: 28, pressure: 1013, humidity: 60 },
    visibility: 10000,
    wind: { speed: 5, deg: 180 },
    clouds: { all: 0 },
    dt: Math.floor(Date.now() / 1000),
    sys: { country: 'TR', sunrise: Math.floor(Date.now() / 1000), sunset: Math.floor(Date.now() / 1000) },
    timezone: 10800,
    id: 745044,
    name: 'Istanbul',
    cod: 200
  };

  beforeEach(async () => {
    // Mock WeatherStateService
    mockWeatherStateService = {
      loading: signal(false),
      error: signal(null),
      favorites: signal([mockFavoriteCity]),
      currentWeather: signal(mockCurrentWeather),
      selectedCity: signal('Istanbul'),
      settings: signal({ unit: 'metric', defaultCity: 'Istanbul' }),
      clearError: jasmine.createSpy('clearError'),
      loadWeatherData: jasmine.createSpy('loadWeatherData').and.returnValue(Promise.resolve()),
      addToFavorites: jasmine.createSpy('addToFavorites'),
      removeFromFavorites: jasmine.createSpy('removeFromFavorites')
    };

    // Mock Router
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockRouter.navigate.and.returnValue(Promise.resolve(true));

    await TestBed.configureTestingModule({
      imports: [FavoritesComponent, HttpClientTestingModule],
      providers: [
        { provide: WeatherStateService, useValue: mockWeatherStateService },
        { provide: Router, useValue: mockRouter }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(FavoritesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // Removed spyOn(window, 'confirm') from here
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have popular cities list', () => {
    expect(component.popularCities).toEqual(['Istanbul', 'London', 'New York', 'Tokyo', 'Paris', 'Berlin']);
  });

  it('should track city by id', () => {
    const result = component.trackByCity(0, mockFavoriteCity);
    expect(result).toBe('1');
  });

  it('should set selected city name', () => {
    component.onCitySelected('London');
    expect(component.selectedCityName).toBe('London');
  });

  it('should add selected city to favorites', async () => {
    component.selectedCityName = 'London';
    spyOn(component, 'addCityToFavorites').and.returnValue(Promise.resolve());

    await component.addSelectedCityToFavorites();

    expect(component.addCityToFavorites).toHaveBeenCalledWith('London');
    expect(component.selectedCityName).toBe('');
  });

  it('should not add empty city to favorites', async () => {
    component.selectedCityName = '';
    spyOn(component, 'addCityToFavorites');

    await component.addSelectedCityToFavorites();

    expect(component.addCityToFavorites).not.toHaveBeenCalled();
  });

  it('should add city to favorites successfully', async () => {
    await component.addCityToFavorites('London');

    expect(mockWeatherStateService.clearError).toHaveBeenCalled();
    expect(mockWeatherStateService.loadWeatherData).toHaveBeenCalledWith('London');
    expect(mockWeatherStateService.addToFavorites).toHaveBeenCalledWith(mockCurrentWeather);
  });

  it('should handle error when adding city to favorites', async () => {
    (mockWeatherStateService.loadWeatherData as jasmine.Spy).and.returnValue(Promise.reject('City not found'));
    spyOn(console, 'error');

    await component.addCityToFavorites('InvalidCity');

    expect(console.error).toHaveBeenCalledWith('Error adding city:', 'City not found');
  });

  it('should select city and navigate to dashboard', async () => {
    const mockCity = { ...mockFavoriteCity, name: 'London' };

    await component.selectCity(mockCity);

    expect(mockWeatherStateService.loadWeatherData).toHaveBeenCalledWith('London');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should navigate to dashboard if city is already current', async () => {
    const currentCity = mockFavoriteCity; // Same as selectedCity signal

    await component.selectCity(currentCity);

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should not remove city if confirmation is cancelled', () => {
    spyOn(window, 'confirm').and.returnValue(false);

    component.removeFromFavorites(mockFavoriteCity);

    expect(mockWeatherStateService.removeFromFavorites).not.toHaveBeenCalled();
  });

  it('should check if city is current city', () => {
    const result = component.isCurrentCity(mockFavoriteCity);
    expect(result).toBe(true);

    const differentCity = { ...mockFavoriteCity, name: 'London' };
    const result2 = component.isCurrentCity(differentCity);
    expect(result2).toBe(false);
  });

  it('should format date correctly', () => {
    const testDate = new Date('2023-12-25');
    const result = component.formatDate(testDate);
    
    expect(result).toMatch(/Dec 25, 2023/);
  });

  it('should handle empty selectedCityName in addSelectedCityToFavorites', async () => {
    component.selectedCityName = ''; // Empty string
    spyOn(component, 'addCityToFavorites');

    await component.addSelectedCityToFavorites();

    expect(component.addCityToFavorites).not.toHaveBeenCalled();
  });

  it('should handle empty city name in addCityToFavorites', async () => {
    await component.addCityToFavorites('  '); // Only whitespace

    expect(mockWeatherStateService.loadWeatherData).not.toHaveBeenCalled();
  });
});
