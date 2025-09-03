import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherStateService } from '../../core/services/weather-state.service';
import { WeatherSkeletonComponent } from '../../shared/components';
import { 
  PageHeaderComponent, 
  MainWeatherCardComponent, 
  WeatherStatsComponent, 
  FiveDayForecastComponent,
  SunriseSunsetCardComponent
} from './components';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    WeatherSkeletonComponent,
    PageHeaderComponent,
    MainWeatherCardComponent,
    WeatherStatsComponent,
    FiveDayForecastComponent,
    SunriseSunsetCardComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <!-- Dashboard Content -->
      <div class="p-4 md:p-6">
        <!-- Page Header Component -->
        <app-page-header
          [loading]="weatherState.loading()"
          [loadingLocation]="loadingLocation"
          [isCurrentCityFavorite]="weatherState.isFavorite()"
          (searchCity)="searchCity($event)"
          (getCurrentLocation)="getCurrentLocation()"
          (toggleFavorite)="toggleFavorite()"
        ></app-page-header>
        <!-- Loading State with Skeleton -->
        <app-weather-skeleton *ngIf="weatherState.loading()"></app-weather-skeleton>
        
        <!-- Main Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6" *ngIf="!weatherState.loading() && weatherState.currentWeather()">
          <!-- Left Column: Main Weather Card + Weather Stats (2/3 width = 8 columns) -->
          <div class="lg:col-span-8 space-y-6">
            <!-- Main Weather Card Component -->
            <app-main-weather-card
              [currentWeather]="weatherState.currentWeather()"
              [weatherIcon]="weatherState.weatherIcon()"
              [weatherCondition]="weatherState.weatherCondition()"
              [dailyTemperatures]="weatherState.dailyTemperatures()"
              [settings]="weatherState.settings()"
            ></app-main-weather-card>

            <!-- Weather Stats Component -->
            <app-weather-stats
              [currentWeather]="weatherState.currentWeather()"
              [settings]="weatherState.settings()"
            ></app-weather-stats>
          </div>

          <!-- Right Column: Five Day Forecast (1/3 width = 4 columns) -->
          <div class="lg:col-span-4 space-y-6">
            <!-- Five Day Forecast Component -->
            <app-five-day-forecast
              [dailyForecast]="weatherState.dailyForecast()"
              [settings]="weatherState.settings()"
            ></app-five-day-forecast>
          </div>
        </div>
        
        <!-- Sunrise Sunset Card Component (Full Width Below Grid) -->
        <app-sunrise-sunset-card
          [currentWeather]="weatherState.currentWeather()"
        ></app-sunrise-sunset-card>

        <!-- Welcome State -->
        <div *ngIf="!weatherState.currentWeather() && !weatherState.loading() && !weatherState.error()" 
             class="text-center py-20">
          <svg class="h-24 w-24 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Welcome to Weather Dashboard</h2>
          <p class="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Search for a city or use your current location to get started with weather information.
          </p>
          
          <!-- Quick Access Cities -->
          <div class="flex flex-wrap justify-center gap-2">
            <button
              *ngFor="let city of quickAccessCities"
              (click)="searchCity(city)"
              class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
            >
              {{ city }}
            </button>
          </div>
        </div>

        <!-- Error State -->
        <div *ngIf="weatherState.error() && !weatherState.loading()" class="text-center py-20">
          <div class="max-w-md mx-auto">
            <div class="bg-red-50 dark:bg-red-900/20 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg class="h-8 w-8 text-red-400 dark:text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Unable to Load Weather Data</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">{{ weatherState.error() }}</p>
            <div class="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                (click)="getCurrentLocation()"
                [disabled]="loadingLocation"
                class="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Use My Location
              </button>
              <button 
                (click)="searchCity('Istanbul'); weatherState.clearError()"
                class="inline-flex items-center px-4 py-2 bg-gray-500 dark:bg-gray-600 text-white rounded-lg hover:bg-gray-600 dark:hover:bg-gray-700 transition-colors"
              >
                <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </button>
            </div>
            
            <!-- Quick Access Cities for Error State -->
            <div class="mt-6">
              <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">Or try one of these cities:</p>
              <div class="flex flex-wrap justify-center gap-2">
                <button
                  *ngFor="let city of quickAccessCities"
                  (click)="searchCity(city); weatherState.clearError()"
                  class="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {{ city }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  weatherState = inject(WeatherStateService);
  loadingLocation = false;

  readonly quickAccessCities = ['Istanbul', 'London', 'New York', 'Tokyo', 'Paris'];

  ngOnInit(): void {
    // Try to initialize with user's location first, fall back to default city if needed
    this.initializeWeatherData();
  }

  /**
   * Initialize weather data with user location or default city
   */
  private async initializeWeatherData(): Promise<void> {
    // Don't load if we already have weather data
    if (this.weatherState.currentWeather()) {
      return;
    }

    try {
      // Try to load weather data using user's location
      await this.weatherState.initializeWithUserLocation();
    } catch (error) {
      console.warn('Could not initialize with user location:', error);
      
      // Fallback to default city if location fails
      const defaultCity = this.weatherState.settings().defaultCity;
      if (defaultCity) {
        await this.searchCity(defaultCity);
      }
    }
  }

  async searchCity(cityName: string): Promise<void> {
    const trimmedName = cityName.trim();
    if (!trimmedName) return;

    await this.weatherState.loadWeatherData(trimmedName);
  }

  async getCurrentLocation(): Promise<void> {
    this.loadingLocation = true;
    
    try {
      // Use the new geolocation service method
      await this.weatherState.loadWeatherByUserLocation();
    } catch (error) {
      console.error('Location error:', error);
    } finally {
      this.loadingLocation = false;
    }
  }

  toggleFavorite(): void {
    const currentWeather = this.weatherState.currentWeather();
    if (!currentWeather) return;

    const isCurrentlyFavorite = this.weatherState.isFavorite();
    
    if (isCurrentlyFavorite) {
      this.weatherState.removeFromFavorites(currentWeather.name);
    } else {
      this.weatherState.addToFavorites(currentWeather);
    }
  }
}
