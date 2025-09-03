import { Component, ChangeDetectionStrategy, Input, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CurrentWeather } from '../../../../core/models/weather.model';

@Component({
  selector: 'app-sunrise-sunset-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white mt-4 dark:bg-gray-800 rounded-2xl p-6 shadow-sm transition-colors duration-300 dark:ring-1 dark:ring-gray-700/50">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Sun Times</h3>
        <div class="flex items-center space-x-2">
          <div class="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
          <span class="text-sm text-gray-500 dark:text-gray-400">Today</span>
        </div>
      </div>

      <div *ngIf="currentWeather" class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Sunrise Card -->
        <div class="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-xl p-4 border border-orange-100 dark:border-orange-800/50">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 flex items-center justify-center">
                <div [innerHTML]="getSunriseIcon()"></div>
              </div>
              <div>
                <div class="font-semibold text-orange-900 dark:text-orange-100">Sunrise</div>
                <div class="text-sm text-orange-700 dark:text-orange-200">
                  {{ getTimeUntilEvent(sunriseTime()) }}
                </div>
              </div>
            </div>
            <div class="text-2xl font-bold text-orange-800 dark:text-orange-200">
              {{ sunriseTime() }}
            </div>
          </div>
        </div>

        <!-- Sunset Card -->
        <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-100 dark:border-purple-800/50">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 flex items-center justify-center">
                <div [innerHTML]="getSunsetIcon()"></div>
              </div>
              <div>
                <div class="font-semibold text-purple-900 dark:text-purple-100">Sunset</div>
                <div class="text-sm text-purple-700 dark:text-purple-200">
                  {{ getTimeUntilEvent(sunsetTime()) }}
                </div>
              </div>
            </div>
            <div class="text-2xl font-bold text-purple-800 dark:text-purple-200">
              {{ sunsetTime() }}
            </div>
          </div>
        </div>

        <!-- Day Length Card -->
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800/50">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 flex items-center justify-center">
                <div [innerHTML]="getDayLengthIcon()"></div>
              </div>
              <div>
                <div class="font-semibold text-blue-900 dark:text-blue-100">Day Length</div>
                <div class="text-sm text-blue-700 dark:text-blue-200">Hours of daylight</div>
              </div>
            </div>
            <div class="text-2xl font-bold text-blue-800 dark:text-blue-200">
              {{ dayLength() }}
            </div>
          </div>
        </div>
      </div>

      <!-- No Data State -->
      <div *ngIf="!currentWeather" class="text-center py-8">
        <div class="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <div [innerHTML]="getNoDataIcon()"></div>
        </div>
        <p class="text-gray-500 dark:text-gray-400">Sun times not available</p>
      </div>
    </div>
  `
})
export class SunriseSunsetCardComponent {
  @Input() currentWeather: CurrentWeather | null = null;

  private sanitizer = inject(DomSanitizer);

  readonly sunriseTime = computed(() => {
    if (!this.currentWeather?.sys.sunrise) return '--:--';
    
    const sunrise = new Date(this.currentWeather.sys.sunrise * 1000);
    return sunrise.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  });

  readonly sunsetTime = computed(() => {
    if (!this.currentWeather?.sys.sunset) return '--:--';
    
    const sunset = new Date(this.currentWeather.sys.sunset * 1000);
    return sunset.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  });

  readonly dayLength = computed(() => {
    if (!this.currentWeather?.sys.sunrise || !this.currentWeather?.sys.sunset) return '--h --m';
    
    const sunrise = new Date(this.currentWeather.sys.sunrise * 1000);
    const sunset = new Date(this.currentWeather.sys.sunset * 1000);
    const diffMs = sunset.getTime() - sunrise.getTime();
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  });

  getTimeUntilEvent(eventTime: string): string {
    if (eventTime === '--:--' || !this.currentWeather) return '';
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    
    // Parse event time (HH:MM format)
    const [hours, minutes] = eventTime.split(':').map(Number);
    let eventDateTime = new Date(today.getTime() + hours * 60 * 60 * 1000 + minutes * 60 * 1000);
    
    // If event time has passed today, it's tomorrow's event
    if (eventDateTime.getTime() < now.getTime()) {
      eventDateTime = new Date(tomorrow.getTime() + hours * 60 * 60 * 1000 + minutes * 60 * 1000);
    }
    
    const diffMs = eventDateTime.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Passed';
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours === 0) {
      return `in ${diffMinutes}m`;
    } else if (diffHours < 24) {
      return `in ${diffHours}h ${diffMinutes}m`;
    } else {
      return 'Tomorrow';
    }
  }

  getSunriseIcon(): SafeHtml {
    const svgContent = `
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="4" fill="#FB923C" stroke="#EA580C" stroke-width="2"/>
        <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="#EA580C" stroke-width="2" stroke-linecap="round"/>
        <path d="M8 20h8" stroke="#FB923C" stroke-width="2" stroke-linecap="round"/>
        <path d="M6 22h12" stroke="#FB923C" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    `;
    return this.sanitizer.bypassSecurityTrustHtml(svgContent);
  }

  getSunsetIcon(): SafeHtml {
    const svgContent = `
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="4" fill="#A855F7" stroke="#7C3AED" stroke-width="2"/>
        <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="#7C3AED" stroke-width="2" stroke-linecap="round"/>
        <path d="M8 20h8" stroke="#A855F7" stroke-width="2" stroke-linecap="round"/>
        <path d="M6 22h12" stroke="#A855F7" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="#E879F9" opacity="0.3"/>
      </svg>
    `;
    return this.sanitizer.bypassSecurityTrustHtml(svgContent);
  }

  getDayLengthIcon(): SafeHtml {
    const svgContent = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="#3B82F6" stroke-width="2" fill="none"/>
        <path d="M12 6v6l4 2" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="12" cy="12" r="1" fill="#3B82F6"/>
      </svg>
    `;
    return this.sanitizer.bypassSecurityTrustHtml(svgContent);
  }

  getNoDataIcon(): SafeHtml {
    const svgContent = `
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="4" fill="#D1D5DB" stroke="#9CA3AF" stroke-width="2"/>
        <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round"/>
        <path d="M2 2l20 20" stroke="#EF4444" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `;
    return this.sanitizer.bypassSecurityTrustHtml(svgContent);
  }
}
