import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WeatherStateService } from '../../core/services/weather-state.service';
import { CardComponent, ButtonComponent, LoaderComponent, SmartSearchInputComponent } from '../../shared/components';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { FavoriteCity } from '../../core/models';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, ButtonComponent, LoaderComponent, SmartSearchInputComponent, ConfirmDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-card [title]="'Favorite Cities'" [subtitle]="'Manage your saved cities'">
      <!-- Smart Search Input with Add Button -->
      <div class="mb-6">
        <app-smart-search-input
          #searchInput
          placeholder="Search and add cities..."
          [disabled]="weatherState.loading()"
          [showActionButton]="true"
          (citySelected)="onCitySelected($event)"
        >
          <app-button
            slot="action-button"
            size="sm"
            variant="primary"
            (click)="addSelectedCityToFavorites()"
            [disabled]="weatherState.loading() || !selectedCityName"
          >
            Add
          </app-button>
        </app-smart-search-input>
        <p class="text-xs text-secondary-500 dark:text-gray-400 mt-1">
          Search for cities and click Add to save them to your favorites.
        </p>
      </div>

      <!-- Loading State -->
      <div *ngIf="weatherState.loading()" class="flex justify-center py-8">
        <app-loader 
          size="lg" 
          message="Adding city..."
          [centered]="true"
        ></app-loader>
      </div>

      <!-- Error State -->
      <div *ngIf="weatherState.error()" class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
        <div class="flex items-center space-x-2">
          <svg class="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p class="text-sm text-red-700 dark:text-red-300">{{ weatherState.error() }}</p>
        </div>
      </div>

      <!-- Favorites List -->
      <div *ngIf="weatherState.favorites().length > 0; else noFavorites" class="space-y-3">
        <div 
          *ngFor="let city of weatherState.favorites(); trackBy: trackByCity"
          class="group flex items-center justify-between p-4 bg-secondary-50 dark:bg-gray-700/30 rounded-lg hover:bg-secondary-100 dark:hover:bg-gray-600/40 transition-all duration-200 border border-transparent hover:border-secondary-200 dark:hover:border-gray-600"
        >
          <div 
            class="flex-1 cursor-pointer"
            (click)="selectCity(city)"
            (keydown.enter)="selectCity(city)"
            (keydown.space)="selectCity(city)"
            tabindex="0"
            role="button"
            [attr.aria-label]="'Select city: ' + city.name"
          >
            <div class="flex items-center space-x-3">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-secondary-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {{ city.name }}
                </p>
                <p class="text-xs text-secondary-500 dark:text-gray-400">
                  {{ city.country }} • {{ formatDate(city.addedAt) }}
                </p>
              </div>

              <!-- Current city indicator -->
              <div 
                *ngIf="isCurrentCity(city)" 
                class="flex-shrink-0"
              >
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300">
                  Active
                </span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center space-x-2 ml-4">
            <app-button
              size="sm"
              variant="ghost"
              (click)="selectCity(city)"
              [disabled]="isCurrentCity(city)"
              aria-label="Select city"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </app-button>
            
            <button
              class="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 text-red-600 hover:text-red-700 hover:bg-red-50 focus:ring-red-500"
              (click)="removeFromFavorites(city)"
              aria-label="Remove from favorites"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- No Favorites State -->
      <ng-template #noFavorites>
        <div class="text-center py-12">
          <svg class="h-16 w-16 mx-auto mb-4 text-secondary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <h3 class="text-lg font-medium text-secondary-900 mb-2">No favorite cities yet</h3>
          <p class="text-secondary-500 mb-6">
            Add your favorite cities for quick access to their weather information.
          </p>
          
          <!-- Quick Add Suggestions -->
          <div class="space-y-2">
            <p class="text-sm font-medium text-secondary-700">Popular cities:</p>
            <div class="flex flex-wrap justify-center gap-2">
              <app-button
                *ngFor="let city of popularCities.slice(0, 6)"
                size="sm"
                variant="outline"
                (click)="addCityToFavorites(city)"
              >
                {{ city }}
              </app-button>
            </div>
          </div>
        </div>
      </ng-template>

      <!-- Info Box -->
      <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div class="flex items-start space-x-2">
          <svg class="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div class="text-sm text-blue-700">
            <p class="font-medium mb-1">Tip</p>
            <p>Click on any city in your favorites list to quickly switch to its weather information. Data will be loaded automatically.</p>
          </div>
        </div>
      </div>

      <!-- Confirm Dialog Component -->
      <app-confirm-dialog
        [isOpen]="isConfirmDialogOpen()"
        [data]="confirmDialogData()"
        (confirmed)="onRemoveConfirmed()"
        (cancelled)="onDialogClosed()"
        (closed)="onDialogClosed()"
      ></app-confirm-dialog>
    </app-card>
  `
})
export class FavoritesComponent {
  weatherState = inject(WeatherStateService);
  private router = inject(Router);

  readonly popularCities = ['Istanbul', 'London', 'New York', 'Tokyo', 'Paris', 'Berlin'];
  selectedCityName = '';
  isConfirmDialogOpen = signal<boolean>(false);
  confirmDialogData = signal<ConfirmDialogData>({
    title: '',
    message: '',
    confirmText: 'Remove',
    cancelText: 'Cancel',
    type: 'danger'
  });
  cityToRemove = signal<FavoriteCity | null>(null);

  trackByCity(index: number, city: FavoriteCity): string {
    return city.id;
  }

  onCitySelected(cityName: string): void {
    this.selectedCityName = cityName;
  }

  async addSelectedCityToFavorites(): Promise<void> {
    if (!this.selectedCityName) return;

    await this.addCityToFavorites(this.selectedCityName);
    this.selectedCityName = '';
  }

  async addCityToFavorites(cityName: string): Promise<void> {
    const trimmedName = cityName.trim();
    if (!trimmedName) return;

    this.weatherState.clearError();

    try {
      // Load weather data for the city to validate it exists
      await this.weatherState.loadWeatherData(trimmedName);
      
      // If successful, the city will be automatically added to current weather
      // and user can then add it to favorites from the CurrentWeatherComponent
      const currentWeather = this.weatherState.currentWeather();
      if (currentWeather) {
        this.weatherState.addToFavorites(currentWeather);
      }
    } catch (error) {
      // Error will be displayed in the component
      console.error('Error adding city:', error);
    }
  }

  async selectCity(city: FavoriteCity): Promise<void> {
    if (this.isCurrentCity(city)) {
      // If already current city, just navigate to dashboard
      this.router.navigate(['/dashboard']).then(() => {
        window.scrollTo(0, 0);
      });
      return;
    }
    
    await this.weatherState.loadWeatherData(city.name);
    // Navigate to dashboard after loading weather data
    this.router.navigate(['/dashboard']).then(() => {
      window.scrollTo(0, 0);
    });
  }

  removeFromFavorites(city: FavoriteCity): void {
    this.cityToRemove.set(city);
    this.confirmDialogData.set({
      title: `Remove ${city.name} from favorites?`,
      message: `Are you sure you want to remove ${city.name} from your favorites? This action cannot be undone.`,
      confirmText: 'Remove',
      cancelText: 'Cancel',
      type: 'danger'
    });
    this.isConfirmDialogOpen.set(true);
  }

  onRemoveConfirmed(): void {
    if (this.cityToRemove()) {
      this.weatherState.removeFromFavorites(this.cityToRemove()!.name);
    }
    this.cityToRemove.set(null);
    this.isConfirmDialogOpen.set(false);
  }

  onDialogClosed(): void {
    this.cityToRemove.set(null);
    this.isConfirmDialogOpen.set(false);
  }

  isCurrentCity(city: FavoriteCity): boolean {
    const selectedCity = this.weatherState.selectedCity();
    return selectedCity.toLowerCase() === city.name.toLowerCase();
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
}
