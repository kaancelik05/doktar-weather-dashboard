import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppComponent } from './app.component';
import { WeatherStateService } from './core/services/weather-state.service';
import { ThemeService } from './core/services/theme.service';
import { signal } from '@angular/core';

describe('AppComponent', () => {
  let mockWeatherStateService: Partial<WeatherStateService>;
  let mockThemeService: Partial<ThemeService>;

  beforeEach(async () => {
    mockWeatherStateService = {
      settings: signal({ unit: 'metric', defaultCity: 'Istanbul' }),
      loading: signal(false),
      error: signal(null),
      setUnit: jasmine.createSpy('setUnit'),
      clearError: jasmine.createSpy('clearError'),
    };

    mockThemeService = {
      isDarkMode: jasmine.createSpy('isDarkMode').and.returnValue(false),
      toggleTheme: jasmine.createSpy('toggleTheme'),
    };

    await TestBed.configureTestingModule({
      imports: [AppComponent, HttpClientTestingModule],
      providers: [
        { provide: WeatherStateService, useValue: mockWeatherStateService },
        { provide: ThemeService, useValue: mockThemeService },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'weather-dashboard' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('weather-dashboard');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Weather Dashboard');
  });
});
