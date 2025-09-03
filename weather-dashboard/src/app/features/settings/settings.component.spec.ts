import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { SettingsComponent } from './settings.component';
import { WeatherStateService } from '../../core/services/weather-state.service';
import { ToastService } from '../../core/services/toast.service';
import { WeatherUnit, WeatherSettings } from '../../core/models';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let mockWeatherStateService: any;
  let mockToastService: jasmine.SpyObj<ToastService>;

  const mockSettings: WeatherSettings = {
    unit: 'metric',
    defaultCity: 'Istanbul'
  };

  beforeEach(async () => {
    // Mock WeatherStateService
    mockWeatherStateService = {
      settings: signal(mockSettings),
      setUnit: jasmine.createSpy('setUnit'),
      setDefaultCity: jasmine.createSpy('setDefaultCity'),
      loadWeatherData: jasmine.createSpy('loadWeatherData').and.returnValue(Promise.resolve()),
      resetAllData: jasmine.createSpy('resetAllData')
    };

    // Mock ToastService
    mockToastService = jasmine.createSpyObj('ToastService', ['success', 'warning']);

    // Note: window.location.reload is called in performResetSettings but we can't easily mock it in tests

    await TestBed.configureTestingModule({
      imports: [SettingsComponent, HttpClientTestingModule],
      providers: [
        { provide: WeatherStateService, useValue: mockWeatherStateService },
        { provide: ToastService, useValue: mockToastService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have initial dialog state', () => {
    expect(component.isConfirmDialogOpen()).toBe(false);
    expect(component.confirmDialogData()).toEqual({
      title: '',
      message: '',
      type: 'info'
    });
  });

  it('should return correct unit label classes for selected unit', () => {
    const classes = component.getUnitLabelClasses('metric');
    expect(classes).toContain('border-primary-600');
    expect(classes).toContain('bg-primary-50');
  });

  it('should return correct unit label classes for unselected unit', () => {
    const classes = component.getUnitLabelClasses('imperial');
    expect(classes).toContain('border-secondary-300');
    expect(classes).not.toContain('border-primary-600');
  });

  it('should call setUnit when unit changes', () => {
    component.onUnitChange('imperial');
    expect(mockWeatherStateService.setUnit).toHaveBeenCalledWith('imperial');
  });

  it('should handle default city selection successfully', async () => {
    await component.onDefaultCitySelected('London');

    expect(mockWeatherStateService.setDefaultCity).toHaveBeenCalledWith('London');
    expect(mockWeatherStateService.loadWeatherData).toHaveBeenCalledWith('London');
    expect(mockToastService.success).toHaveBeenCalledWith(
      'Default City Updated',
      'Default city set to London and weather data loaded!'
    );
  });

  it('should handle default city selection with load error', async () => {
    mockWeatherStateService.loadWeatherData.and.returnValue(Promise.reject('Network error'));
    spyOn(console, 'error');

    await component.onDefaultCitySelected('InvalidCity');

    expect(mockWeatherStateService.setDefaultCity).toHaveBeenCalledWith('InvalidCity');
    expect(console.error).toHaveBeenCalledWith('Error loading weather for new default city:', 'Network error');
    expect(mockToastService.warning).toHaveBeenCalledWith(
      'Default City Updated',
      'Default city set to InvalidCity, but failed to load weather data.'
    );
  });

  it('should not process empty city name', async () => {
    await component.onDefaultCitySelected('  ');

    expect(mockWeatherStateService.setDefaultCity).not.toHaveBeenCalled();
    expect(mockWeatherStateService.loadWeatherData).not.toHaveBeenCalled();
  });

  it('should open clear cache confirmation dialog', () => {
    component.clearCache();

    expect(component.isConfirmDialogOpen()).toBe(true);
    expect(component.confirmDialogData().title).toBe('Clear Cache');
    expect(component.confirmDialogData().type).toBe('warning');
  });

  it('should open reset settings confirmation dialog', () => {
    component.resetSettings();

    expect(component.isConfirmDialogOpen()).toBe(true);
    expect(component.confirmDialogData().title).toBe('Reset All Settings');
    expect(component.confirmDialogData().type).toBe('danger');
  });

  it('should close confirm dialog', () => {
    component.isConfirmDialogOpen.set(true);
    
    component.closeConfirmDialog();

    expect(component.isConfirmDialogOpen()).toBe(false);
  });

  it('should perform clear cache when confirmed', () => {
    spyOn(localStorage, 'removeItem');
    spyOn(console, 'log');
    
    component.clearCache();
    component.onDialogConfirmed();

    expect(localStorage.removeItem).toHaveBeenCalledWith('weather-cache');
    expect(console.log).toHaveBeenCalledWith('Cache cleared');
    expect(mockToastService.success).toHaveBeenCalledWith(
      'Cache Cleared',
      'All cached weather data has been successfully removed.'
    );
    expect(component.isConfirmDialogOpen()).toBe(false);
  });

  it('should perform reset settings when confirmed', () => {
    spyOn(component as any, 'performResetSettings').and.callFake(() => {
      mockWeatherStateService.resetAllData();
      // Don't call window.location.reload in tests
    });
    
    component.resetSettings();
    component.onDialogConfirmed();

    expect((component as any).performResetSettings).toHaveBeenCalled();
    expect(component.isConfirmDialogOpen()).toBe(false);
  });

  it('should format current date correctly', () => {
    const result = component.getCurrentDate();
    
    // Check that it returns a date string in the expected format
    expect(result).toMatch(/\w+ \d{1,2}, \d{4}/);
  });

  it('should handle dialog confirmation for different actions', () => {
    spyOn(component as any, 'performClearCache');
    spyOn(component as any, 'performResetSettings');

    // Test clear cache
    component.clearCache();
    component.onDialogConfirmed();
    expect((component as any).performClearCache).toHaveBeenCalled();

    // Test reset settings
    component.resetSettings();
    component.onDialogConfirmed();
    expect((component as any).performResetSettings).toHaveBeenCalled();
  });

  it('should handle metric unit selection', () => {
    component.onUnitChange('metric' as WeatherUnit);
    expect(mockWeatherStateService.setUnit).toHaveBeenCalledWith('metric');
  });

  it('should handle imperial unit selection', () => {
    component.onUnitChange('imperial' as WeatherUnit);
    expect(mockWeatherStateService.setUnit).toHaveBeenCalledWith('imperial');
  });

  it('should initialize with correct pending action state', () => {
    expect((component as any).pendingAction).toBeNull();
  });
});
