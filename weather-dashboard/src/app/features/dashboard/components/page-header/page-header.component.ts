import { Component, ChangeDetectionStrategy, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SmartSearchInputComponent } from '../../../../shared/components';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, SmartSearchInputComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mb-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p class="text-gray-500 text-sm">{{ getCurrentDate() }} · Today</p>
        </div>
        <div class="flex items-center space-x-3 w-full sm:w-auto">
          <!-- Smart Search Input -->
          <div class="flex-1 sm:flex-none">
            <app-smart-search-input
              placeholder="Search city..."
              inputClasses="w-full sm:w-64 pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              [disabled]="loading"
              (citySelected)="onSearchCity($event)"
            ></app-smart-search-input>
          </div>
          <!-- Location Button -->
          <button 
            (click)="onGetCurrentLocation()"
            [disabled]="loading || loadingLocation"
            class="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 shadow-sm"
            title="Konumumu kullan"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          
          <!-- Like Button -->
          <button 
            (click)="onToggleFavorite()"
            [disabled]="loading"
            class="p-2 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
            [class]="isCurrentCityFavorite ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'"
            [title]="isCurrentCityFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" stroke="currentColor" [attr.fill]="isCurrentCityFavorite ? 'currentColor' : 'none'">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  `
})
export class PageHeaderComponent {
  @Input() loading = false;
  @Input() loadingLocation = false;
  @Input() isCurrentCityFavorite = false;
  
  @Output() searchCity = new EventEmitter<string>();
  @Output() getCurrentLocation = new EventEmitter<void>();
  @Output() toggleFavorite = new EventEmitter<void>();

  onSearchCity(cityName: string): void {
    this.searchCity.emit(cityName);
  }

  onGetCurrentLocation(): void {
    this.getCurrentLocation.emit();
  }

  onToggleFavorite(): void {
    this.toggleFavorite.emit();
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }
}
