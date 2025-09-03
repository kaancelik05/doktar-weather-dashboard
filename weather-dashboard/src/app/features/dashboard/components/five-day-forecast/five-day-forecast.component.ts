import { Component, ChangeDetectionStrategy, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { WeatherSettings } from '../../../../core/models/weather.model';

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

@Component({
  selector: 'app-five-day-forecast',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm transition-colors duration-300 dark:ring-1 dark:ring-gray-700/50 min-h-[400px] flex flex-col">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Next 5 Days</h3>
      </div>
      
      <!-- 5-Day Forecast -->
      <div class="flex-1 space-y-0 divide-y divide-gray-100 dark:divide-gray-700">
        <div *ngFor="let day of dailyForecast; let i = index; let last = last" 
             class="py-4 first:pt-0"
             [class.last:pb-0]="!showTomorrowCard()">
          <div class="flex items-center justify-between">
            <!-- Left side: Icon + Temperature Range -->
            <div class="flex items-center space-x-4 flex-1">
              <!-- Weather Icon -->
              <div class="w-11 h-11 flex items-center justify-center">
                <div [innerHTML]="getWeatherSVG(day.icon)"></div>
              </div>
              
              <!-- Temperature Display -->
              <div class="flex items-center space-x-2 flex-1">
                <span class="text-lg font-bold text-blue-600 dark:text-blue-400 w-11">
                  +{{ Math.round(getMaxTemp(day)) }}°
                </span>
                <span class="text-base text-blue-400 dark:text-blue-300">
                  /+{{ Math.round(getMinTemp(day)) }}
                </span>
              </div>
            </div>

            <!-- Right side: Date + Day -->
            <div class="text-right min-w-[100px]">
              <div class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {{ getFormattedDate(day.date, i) }}
              </div>
              <div class="text-sm font-medium" [class]="getDayNameColor(i)">
                {{ getDayName(i) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Tomorrow Special Card (if has data) -->
        <div *ngIf="showTomorrowCard()" class="pt-4 mt-4 border-t-2 border-blue-100 dark:border-blue-800">
          <div class="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center space-x-3">
                <div class="w-9 h-9 flex items-center justify-center">
                  <div [innerHTML]="getWeatherSVG(dailyForecast[1].icon)"></div>
                </div>
                <div>
                  <div class="text-sm font-bold text-blue-900 dark:text-blue-100">Tomorrow</div>
                  <div class="text-sm text-blue-700 dark:text-blue-200 capitalize">
                    {{ dailyForecast[1].description }}
                  </div>
                </div>
              </div>
              
              <!-- Mini Temperature Chart -->
              <div class="flex items-center space-x-1">
                <svg width="55" height="18" class="text-blue-600">
                  <defs>
                    <linearGradient id="tempGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
                      <stop offset="100%" style="stop-color:#60A5FA;stop-opacity:1" />
                    </linearGradient>
                  </defs>
                  <polyline
                    fill="none"
                    stroke="url(#tempGradient)"
                    stroke-width="2"
                    points="0,14 13,7 27,11 41,5 55,9"
                  />
                  <circle cx="41" cy="5" r="1.8" fill="#3B82F6" />
                </svg>
              </div>
            </div>
            
            <div class="text-2xl font-bold text-blue-800 dark:text-blue-200">
              {{ Math.round(getMaxTemp(dailyForecast[1])) }}°
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class FiveDayForecastComponent {
  @Input() dailyForecast: DailyForecast[] = [];
  @Input() settings: WeatherSettings = { unit: 'metric', defaultCity: 'Istanbul' };

  private sanitizer = inject(DomSanitizer);
  Math = Math;

  getDayName(index: number): string {
    if (index === 0) return 'Today';
    if (index === 1) return 'Tomorrow';
    
    const date = new Date();
    date.setDate(date.getDate() + index);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }

  getFormattedDate(dateString: string, index: number): string {
    const date = new Date();
    date.setDate(date.getDate() + index);
    
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' }).toLowerCase();
    
    return `${day} ${month}`;
  }

  getMaxTemp(day: DailyForecast): number {
    // Use the tempMax property if available (calculated in weather state service)
    if (day.tempMax !== undefined) {
      return day.tempMax;
    }
    
    // Fallback to temp + estimation
    return day.temp ? day.temp + 3 : 20;
  }

  getMinTemp(day: DailyForecast): number {
    // Use the tempMin property if available (calculated in weather state service)
    if (day.tempMin !== undefined) {
      return day.tempMin;
    }
    
    // Fallback to temp - estimation
    return day.temp ? day.temp - 5 : 15;
  }

  getDayNameColor(index: number): string {
    switch (index) {
      case 0: return 'text-blue-600 dark:text-blue-400'; // Today
      case 1: return 'text-green-600 dark:text-green-400'; // Tomorrow
      default: return 'text-gray-500 dark:text-gray-400'; // Other days
    }
  }

  getWeatherSVG(iconCode: string): SafeHtml {
    const baseSize = 'width="40" height="40"';
    const strokeWidth = '2';
    let svgContent = '';
    
    // If no icon code, show default
    if (!iconCode) {
      iconCode = '01d'; // Default to clear sky
    }
    
    // Map weather icon codes to SVG elements
    if (iconCode.includes('01')) { // Clear sky
      const isNight = iconCode.includes('n');
      if (isNight) {
        svgContent = `
          <svg ${baseSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="#E5E7EB" stroke="#9CA3AF" stroke-width="${strokeWidth}"/>
            <circle cx="19" cy="5" r="1" fill="#FDE047"/>
            <circle cx="17" cy="7" r="0.5" fill="#FDE047"/>
            <circle cx="20" cy="8" r="0.5" fill="#FDE047"/>
          </svg>
        `;
      } else {
        svgContent = `
          <svg ${baseSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="4" fill="#FCD34D" stroke="#F59E0B" stroke-width="${strokeWidth}"/>
            <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="#F59E0B" stroke-width="${strokeWidth}" stroke-linecap="round"/>
          </svg>
        `;
      }
    } else if (iconCode.includes('02')) { // Few clouds
      svgContent = `
        <svg ${baseSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="9" cy="9" r="2.5" fill="#FCD34D" stroke="#F59E0B" stroke-width="${strokeWidth}"/>
          <path d="M5 16h12a3 3 0 0 0 0-6 4 4 0 0 0-7-3.5" fill="#E5E7EB" stroke="#9CA3AF" stroke-width="${strokeWidth}"/>
        </svg>
      `;
    } else if (iconCode.includes('03') || iconCode.includes('04')) { // Scattered/broken clouds
      svgContent = `
        <svg ${baseSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 15h-2a4 4 0 0 0-8 0H6a3 3 0 0 0 0 6h12a3 3 0 0 0 0-6Z" fill="#D1D5DB" stroke="#9CA3AF" stroke-width="${strokeWidth}"/>
          <path d="M8 13a4 4 0 0 1 8 0" fill="#E5E7EB" stroke="#9CA3AF" stroke-width="${strokeWidth}"/>
        </svg>
      `;
    } else if (iconCode.includes('09') || iconCode.includes('10')) { // Rain
      svgContent = `
        <svg ${baseSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 15h-2a4 4 0 0 0-8 0H6a3 3 0 0 0 0 6h12a3 3 0 0 0 0-6Z" fill="#93C5FD" stroke="#3B82F6" stroke-width="${strokeWidth}"/>
          <path d="M9 19v2M15 19v2M12 21v2" stroke="#3B82F6" stroke-width="${strokeWidth}" stroke-linecap="round"/>
        </svg>
      `;
    } else if (iconCode.includes('11')) { // Thunderstorm
      svgContent = `
        <svg ${baseSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 15h-2a4 4 0 0 0-8 0H6a3 3 0 0 0 0 6h12a3 3 0 0 0 0-6Z" fill="#6B7280" stroke="#374151" stroke-width="${strokeWidth}"/>
          <path d="M13 17l-3 4 2-3-2-1 3-4-2 3 2 1Z" fill="#FDE047" stroke="#EAB308" stroke-width="1.5"/>
        </svg>
      `;
    } else if (iconCode.includes('13')) { // Snow
      svgContent = `
        <svg ${baseSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 15h-2a4 4 0 0 0-8 0H6a3 3 0 0 0 0 6h12a3 3 0 0 0 0-6Z" fill="#F3F4F6" stroke="#D1D5DB" stroke-width="${strokeWidth}"/>
          <circle cx="9" cy="19" r="1.5" fill="#FFFFFF"/>
          <circle cx="15" cy="19" r="1.5" fill="#FFFFFF"/>
          <circle cx="12" cy="21" r="1.5" fill="#FFFFFF"/>
          <circle cx="7" cy="21" r="1" fill="#FFFFFF"/>
          <circle cx="17" cy="21" r="1" fill="#FFFFFF"/>
        </svg>
      `;
    } else if (iconCode.includes('50')) { // Mist/fog
      svgContent = `
        <svg ${baseSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 15h18M3 9h16M3 12h14M3 18h12M5 21h14" stroke="#9CA3AF" stroke-width="${strokeWidth}" stroke-linecap="round"/>
        </svg>
      `;
    } else { // Default - sunny day
      svgContent = `
        <svg ${baseSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="4" fill="#FCD34D" stroke="#F59E0B" stroke-width="${strokeWidth}"/>
          <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="#F59E0B" stroke-width="${strokeWidth}" stroke-linecap="round"/>
        </svg>
      `;
    }
    
    return this.sanitizer.bypassSecurityTrustHtml(svgContent);
  }

  showTomorrowCard(): boolean {
    return this.dailyForecast.length > 1;
  }
}
