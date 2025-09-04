import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WeatherStateService } from '../../core/services/weather-state.service';
import { ToastService } from '../../core/services/toast.service';
import { CardComponent, ButtonComponent, ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components';
import { SmartSearchInputComponent } from '../../shared/components/smart-search-input/smart-search-input.component';
import { WeatherUnit } from '../../core/models';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, ButtonComponent, SmartSearchInputComponent, ConfirmDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-card [title]="'Settings'" [subtitle]="'Manage your application preferences'">
      <div class="space-y-6">
        <!-- Unit Selection -->
        <div class="space-y-3">
          <label for="temperature-unit" class="block text-sm font-medium text-secondary-700 dark:text-gray-300">
            Temperature Unit
          </label>
          <div class="grid grid-cols-2 gap-3">
            <label 
              [class]="getUnitLabelClasses('metric')"
            >
              <input
                id="temperature-unit"
                type="radio"
                value="metric"
                name="unit"
                class="sr-only"
                [checked]="weatherState.settings().unit === 'metric'"
                (change)="onUnitChange('metric')"
              />
              <div class="flex w-full items-center justify-between">
                <div class="flex items-center">
                  <div class="text-sm">
                    <div class="font-medium text-secondary-900 dark:text-white">Celsius (°C)</div>
                    <div class="text-secondary-500 dark:text-gray-400">Metric system</div>
                  </div>
                </div>
                <svg 
                  *ngIf="weatherState.settings().unit === 'metric'"
                  class="h-5 w-5 text-primary-600" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
            </label>

            <label 
              [class]="getUnitLabelClasses('imperial')"
            >
              <input
                type="radio"
                value="imperial"
                name="unit"
                class="sr-only"
                [checked]="weatherState.settings().unit === 'imperial'"
                (change)="onUnitChange('imperial')"
              />
              <div class="flex w-full items-center justify-between">
                <div class="flex items-center">
                  <div class="text-sm">
                    <div class="font-medium text-secondary-900 dark:text-white">Fahrenheit (°F)</div>
                    <div class="text-secondary-500 dark:text-gray-400">Imperial system</div>
                  </div>
                </div>
                <svg 
                  *ngIf="weatherState.settings().unit === 'imperial'"
                  class="h-5 w-5 text-primary-600" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
            </label>
          </div>
          <p class="text-xs text-secondary-500 dark:text-gray-400">
            Temperature unit changes will automatically update current data.
          </p>
        </div>

        <!-- Default City -->
        <div class="space-y-3">
          <h3 class="block text-sm font-medium text-secondary-700 dark:text-gray-300">
            Default City
          </h3>
          <app-smart-search-input
            placeholder="Search for a city..."
            (citySelected)="onDefaultCitySelected($event)"
            class="w-full"
          ></app-smart-search-input>
          <p class="text-xs text-secondary-500 dark:text-gray-400">
            The city to be displayed when the application starts.
          </p>
          <div *ngIf="weatherState.settings().defaultCity" class="text-sm text-secondary-600 dark:text-gray-300 bg-secondary-50 dark:bg-gray-700/30 p-2 rounded-md">
            <strong>Current default:</strong> {{ weatherState.settings().defaultCity }}
          </div>
        </div>

        <!-- Actions -->
        <div class="border-t border-secondary-200 dark:border-gray-700 pt-6">
          <div class="flex justify-center gap-1">
            <app-button 
              variant="outline" 
              (click)="clearCache()"
            >
              <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear Cache
            </app-button>
            
            <app-button 
              variant="ghost" 
              (click)="resetSettings()"
            >
              <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset Settings
            </app-button>
          </div>
          
          <div class="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
            <div class="flex items-start space-x-2">
              <svg class="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div class="text-sm text-yellow-700 dark:text-yellow-300">
                <p class="font-medium">Important Note</p>
                <p class="mt-1">Resetting settings will delete all your favorites and preferences. This action cannot be undone.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-card>

    <!-- Confirm Dialog -->
    <app-confirm-dialog
      [isOpen]="isConfirmDialogOpen()"
      [data]="confirmDialogData()"
      (confirmed)="onDialogConfirmed()"
      (cancelled)="closeConfirmDialog()"
      (closed)="closeConfirmDialog()"
    ></app-confirm-dialog>
  `
})
export class SettingsComponent {
  weatherState = inject(WeatherStateService);
  toastService = inject(ToastService);

  // Dialog state
  isConfirmDialogOpen = signal(false);
  confirmDialogData = signal<ConfirmDialogData>({
    title: '',
    message: '',
    type: 'info'
  });
  private pendingAction: 'clearCache' | 'resetSettings' | null = null;

  getUnitLabelClasses(unit: WeatherUnit): string {
    const baseClasses = 'relative flex cursor-pointer rounded-lg border p-4 focus:outline-none';
    const isSelected = this.weatherState.settings().unit === unit;
    
    if (isSelected) {
      return `${baseClasses} border-primary-600 bg-primary-50 dark:bg-primary-900/30`;
    } else {
      return `${baseClasses} border-secondary-300 dark:border-gray-600`;
    }
  }

  onUnitChange(unit: WeatherUnit): void {
    this.weatherState.setUnit(unit);
  }

  async onDefaultCitySelected(cityName: string): Promise<void> {
    if (cityName.trim()) {
      // Update default city in settings
      this.weatherState.setDefaultCity(cityName);
      
      // Immediately load weather data for the new default city
      try {
        await this.weatherState.loadWeatherData(cityName);
        
        // Show success message
        this.toastService.success(
          'Default City Updated',
          `Default city set to ${cityName} and weather data loaded!`
        );
      } catch (error) {
        console.error('Error loading weather for new default city:', error);
        this.toastService.warning(
          'Default City Updated',
          `Default city set to ${cityName}, but failed to load weather data.`
        );
      }
    }
  }

  clearCache(): void {
    this.pendingAction = 'clearCache';
    this.confirmDialogData.set({
      title: 'Clear Cache',
      message: 'Are you sure you want to clear the cache? This will remove all temporarily stored weather data.',
      confirmText: 'Clear Cache',
      cancelText: 'Cancel',
      type: 'warning'
    });
    this.isConfirmDialogOpen.set(true);
  }

  resetSettings(): void {
    this.pendingAction = 'resetSettings';
    this.confirmDialogData.set({
      title: 'Reset All Settings',
      message: 'Are you sure you want to reset all settings? This will delete your favorites, preferences, and current data. This action cannot be undone.',
      confirmText: 'Reset Settings',
      cancelText: 'Cancel',
      type: 'danger'
    });
    this.isConfirmDialogOpen.set(true);
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  onDialogConfirmed(): void {
    switch (this.pendingAction) {
      case 'clearCache':
        this.performClearCache();
        break;
      case 'resetSettings':
        this.performResetSettings();
        break;
    }
    this.closeConfirmDialog();
  }

  closeConfirmDialog(): void {
    this.isConfirmDialogOpen.set(false);
    this.pendingAction = null;
  }

  private performClearCache(): void {
    // Clear any cached data
    localStorage.removeItem('weather-cache');
    
    // Show success toast
    this.toastService.success(
      'Cache Cleared',
      'All cached weather data has been successfully removed.'
    );
  }

  private performResetSettings(): void {
    // Reset all data including current city
    this.weatherState.resetAllData();
    
    // Reload the page to apply changes
    window.location.reload();
  }
}
