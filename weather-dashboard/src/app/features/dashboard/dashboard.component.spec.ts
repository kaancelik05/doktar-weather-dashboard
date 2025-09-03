import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { DashboardComponent } from './dashboard.component';
import { WeatherStateService } from '../../core/services/weather-state.service';
import { CurrentWeather, WeatherSettings } from '../../core/models';

// Basit Mock WeatherStateService
class MockWeatherStateService {
  loading = signal(false);
  currentWeather = signal<CurrentWeather | null>(null);
  error = signal<string | null>(null);
  settings = signal<WeatherSettings>({ unit: 'metric', defaultCity: 'Istanbul' });
  isFavorite = signal(false);
  weatherIcon = signal('01d');
  weatherCondition = signal('Clear');
  dailyTemperatures = signal([20, 22, 25, 23, 21]);
  dailyForecast = signal([]);

  // Method spy'ları
  initializeWithUserLocation = jasmine.createSpy('initializeWithUserLocation').and.returnValue(Promise.resolve());
  loadWeatherData = jasmine.createSpy('loadWeatherData').and.returnValue(Promise.resolve());
  loadWeatherByUserLocation = jasmine.createSpy('loadWeatherByUserLocation').and.returnValue(Promise.resolve());
  addToFavorites = jasmine.createSpy('addToFavorites');
  removeFromFavorites = jasmine.createSpy('removeFromFavorites');
  clearError = jasmine.createSpy('clearError');
}

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockWeatherService: MockWeatherStateService;

  beforeEach(async () => {
    mockWeatherService = new MockWeatherStateService();

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, HttpClientTestingModule],
      providers: [
        { provide: WeatherStateService, useValue: mockWeatherService }
      ],
      schemas: [NO_ERRORS_SCHEMA] // Alt componentleri ignore eder
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  // ✅ Temel Component Testleri
  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should have correct initial values', () => {
    expect(component.loadingLocation).toBe(false);
    expect(component.quickAccessCities).toEqual(['Istanbul', 'London', 'New York', 'Tokyo', 'Paris']);
  });

  // ✅ Loading State Testi
  it('should show skeleton when loading', () => {
    mockWeatherService.loading.set(true);
    fixture.detectChanges();

    const skeleton = fixture.debugElement.query(By.css('app-weather-skeleton'));
    expect(skeleton).toBeTruthy();
  });

  // ✅ Welcome State Testi
  it('should show welcome message when no data', () => {
    mockWeatherService.loading.set(false);
    mockWeatherService.currentWeather.set(null);
    mockWeatherService.error.set(null);
    fixture.detectChanges();

    const welcomeText = fixture.debugElement.query(By.css('h2'));
    expect(welcomeText?.nativeElement.textContent).toContain('Welcome to Weather Dashboard');
  });

  // ✅ Error State Testi
  it('should show error message when error exists', () => {
    mockWeatherService.loading.set(false);
    mockWeatherService.currentWeather.set(null);
    mockWeatherService.error.set('Test error');
    fixture.detectChanges();

    // Error durumunda h3 elementi var mı kontrol et
    const errorElements = fixture.debugElement.queryAll(By.css('h3'));
    const errorFound = errorElements.some(el => 
      el.nativeElement.textContent.includes('Unable to Load Weather Data')
    );
    expect(errorFound).toBe(true);
  });

  // ✅ Şehir Arama Testi
  it('should call loadWeatherData when searching city', async () => {
    await component.searchCity('London');
    
    expect(mockWeatherService.loadWeatherData).toHaveBeenCalledWith('London');
  });

  it('should not search empty city name', async () => {
    await component.searchCity('  ');
    
    expect(mockWeatherService.loadWeatherData).not.toHaveBeenCalled();
  });

  // ✅ Konum Testi
  it('should call loadWeatherByUserLocation', async () => {
    await component.getCurrentLocation();
    
    expect(mockWeatherService.loadWeatherByUserLocation).toHaveBeenCalled();
    expect(component.loadingLocation).toBe(false);
  });

  // ✅ Favori Testi
  it('should add to favorites when not favorite', () => {
    const mockWeather: CurrentWeather = {
      coord: { lat: 41, lon: 29 },
      weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
      base: 'stations',
      main: { temp: 25, feels_like: 27, temp_min: 18, temp_max: 28, pressure: 1013, humidity: 60 },
      visibility: 10000,
      wind: { speed: 5, deg: 180 },
      clouds: { all: 0 },
      dt: Date.now(),
      sys: { country: 'TR', sunrise: Date.now(), sunset: Date.now() },
      timezone: 10800,
      id: 745044,
      name: 'Istanbul',
      cod: 200
    };

    mockWeatherService.currentWeather.set(mockWeather);
    mockWeatherService.isFavorite.set(false);
    
    component.toggleFavorite();
    
    expect(mockWeatherService.addToFavorites).toHaveBeenCalledWith(mockWeather);
  });
});
