import { Component, ChangeDetectionStrategy, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CurrentWeather, WeatherSettings } from '../../../../core/models/weather.model';
import { TemperatureChartComponent } from '../../../../shared/components';

interface DailyTemperatures {
  morning: number;
  afternoon: number;
  evening: number;
  night: number;
}

@Component({
  selector: 'app-main-weather-card',
  standalone: true,
  imports: [CommonModule, TemperatureChartComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rounded-2xl p-8 text-white relative overflow-hidden min-h-[400px] dark:ring-1 dark:ring-gray-700/50">
      <!-- Dynamic Background Image -->
      <div 
        class="absolute inset-0 bg-cover bg-center bg-no-repeat"
        [style.background]="getWeatherBackground()"
      ></div>
      <!-- Overlay for readability -->
      <div class="absolute inset-0 bg-gradient-to-br from-black/50 via-black/30 to-black/60"></div>
      <!-- Additional overlay for better text contrast -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"></div>
      
      <div class="relative z-10">
        <!-- Location, Date and Weather Stats - Aligned Layout -->
        <div class="mb-6">
          <!-- Mobile: Compact horizontal layout -->
          <div class="flex items-start justify-between gap-2 lg:gap-4">
            <!-- Left Side: Location and Date -->
            <div class="flex-shrink-0">
              <!-- Location -->
              <div class="flex items-center space-x-2 mb-1">
                <svg class="w-5 h-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span class="text-lg font-semibold">{{ currentWeather?.name }}</span>
              </div>
              
              <!-- Date - Always visible, under location -->
              <div class="pl-7">
                <span class="text-white/70 text-sm">{{ getCurrentTime() }}</span>
              </div>
            </div>
            
            <!-- Right Side: Weather Stats - Right Aligned Section -->
            <div class="flex-1 min-w-0 flex justify-end">
              <div class="flex flex-col items-start gap-1 sm:grid sm:grid-cols-3 sm:gap-2 lg:flex lg:flex-row lg:items-center lg:space-x-4 lg:gap-0">
                <div class="flex items-center space-x-1.5">
                  <div class="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span class="text-xs">👁</span>
                  </div>
                  <div class="text-left">
                    <div class="text-xs text-white/60 leading-tight">Visibility</div>
                    <div class="text-xs font-semibold leading-tight">{{ (currentWeather?.visibility || 0) / 1000 }}km</div>
                  </div>
                </div>
                
                <div class="flex items-center space-x-1.5">
                  <div class="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span class="text-xs">🌡️</span>
                  </div>
                  <div class="text-left">
                    <div class="text-xs text-white/60 leading-tight">Feels like</div>
                    <div class="text-xs font-semibold leading-tight">{{ getFeelsLike() }}</div>
                  </div>
                </div>
                
                <div class="flex items-center space-x-1.5">
                  <div class="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span class="text-xs">🌧️</span>
                  </div>
                  <div class="text-left">
                    <div class="text-xs text-white/60 leading-tight">Rain chance</div>
                    <div class="text-xs font-semibold leading-tight">{{ getRainChance() }}%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Weather Display -->
        <div class="flex items-center justify-between mb-8">
          <div class="flex-1">
            <div class="text-4xl sm:text-5xl md:text-6xl font-light mb-2">{{ getMainTemperature() }}</div>
            <div class="text-lg sm:text-xl text-white/80 capitalize">{{ weatherCondition }}</div>
          </div>
          <div class="flex-shrink-0 ml-4">
            <!-- Modern Weather Icon -->
            <div class="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-2xl">
              <div [innerHTML]="getWeatherSVG(weatherIcon, weatherCondition, 'large')"></div>
            </div>
          </div>
        </div>

        <!-- Temperature Chart -->
        <div class="mb-6">
          <div class="text-sm text-white/60 mb-3">
            <span>Temperature</span>
          </div>
          
          <!-- Chart.js Chart -->
          <div class="h-20 bg-white/10 rounded-lg p-3 mb-3">
            <app-temperature-chart
              *ngIf="dailyTemperatures"
              [data]="dailyTemperatures"
              [unit]="settings.unit"
            ></app-temperature-chart>
          </div>
          
          <!-- Temperature Labels Grid -->
          <div class="grid grid-cols-4 gap-1 text-center" *ngIf="dailyTemperatures">
            <!-- Morning -->
            <div>
              <div class="text-xs text-white/60 mb-1">Morning</div>
              <div class="text-xs sm:text-sm font-medium text-white">
                {{ formatTemperatureValue(dailyTemperatures.morning) }}
              </div>
            </div>
            
            <!-- Afternoon -->
            <div>
              <div class="text-xs text-white/60 mb-1">Afternoon</div>
              <div class="text-xs sm:text-sm font-medium text-white">
                {{ formatTemperatureValue(dailyTemperatures.afternoon) }}
              </div>
            </div>
            
            <!-- Evening -->
            <div>
              <div class="text-xs text-white/60 mb-1">Evening</div>
              <div class="text-xs sm:text-sm font-medium text-white">
                {{ formatTemperatureValue(dailyTemperatures.evening) }}
              </div>
            </div>
            
            <!-- Night -->
            <div>
              <div class="text-xs text-white/60 mb-1">Night</div>
              <div class="text-xs sm:text-sm font-medium text-white">
                {{ formatTemperatureValue(dailyTemperatures.night) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MainWeatherCardComponent {
  @Input() currentWeather: CurrentWeather | null = null;
  @Input() weatherIcon = '';
  @Input() weatherCondition = '';
  @Input() dailyTemperatures: DailyTemperatures | null = null;
  @Input() settings: WeatherSettings = { unit: 'metric', defaultCity: 'Istanbul' };

  private sanitizer = inject(DomSanitizer);

  getCurrentTime(): string {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  getMainTemperature(): string {
    if (!this.currentWeather) return '--';
    const temp = Math.round(this.currentWeather.main.temp);
    return `${temp}°`;
  }

  getFeelsLike(): string {
    if (!this.currentWeather) return '--';
    const feelsLike = Math.round(this.currentWeather.main.feels_like);
    const unit = this.settings.unit === 'metric' ? 'C' : 'F';
    return `${feelsLike}°${unit}`;
  }

  formatTemperatureValue(temp: number | undefined): string {
    if (!temp) return '--';
    return `${Math.round(temp)}°${this.settings.unit === 'metric' ? 'C' : 'F'}`;
  }

  getRainChance(): number {
    if (!this.currentWeather) return 0;
    
    const condition = this.currentWeather.weather[0]?.main.toLowerCase();
    const description = this.currentWeather.weather[0]?.description.toLowerCase();
    
    // Rain conditions
    if (condition.includes('rain') || description.includes('rain')) {
      if (description.includes('heavy')) return 95;
      if (description.includes('light')) return 65;
      return 85;
    }
    
    // Drizzle
    if (condition.includes('drizzle')) return 70;
    
    // Thunderstorm
    if (condition.includes('thunderstorm')) return 90;
    
    // Cloud conditions
    if (condition.includes('cloud')) {
      const cloudiness = this.currentWeather.clouds?.all || 0;
      if (cloudiness > 80) return 45;
      if (cloudiness > 50) return 25;
      if (cloudiness > 20) return 15;
      return 10;
    }
    
    // Clear conditions
    if (condition.includes('clear')) return 5;
    
    // Mist, fog conditions
    if (condition.includes('mist') || condition.includes('fog')) return 20;
    
    return 15;
  }

  getWeatherBackground(): string {
    const backgroundUrl = this.getWeatherBackgroundUrl();
    
    // Eğer gradient ise direkt döndür, URL ise url() ile sarmalı
    if (backgroundUrl.startsWith('linear-gradient') || backgroundUrl.startsWith('radial-gradient')) {
      return backgroundUrl;
    } else if (backgroundUrl) {
      return `url(${backgroundUrl}) center/cover no-repeat`;
    }
    
    return '';
  }

  getWeatherBackgroundUrl(): string {
    if (!this.currentWeather) return '';

    const condition = this.currentWeather.weather[0]?.main.toLowerCase();
    const description = this.currentWeather.weather[0]?.description.toLowerCase();
    const isNight = this.isNightTime();
    
    // Önce description-based kontroller (daha spesifik)
    const specificCloudUrl = this.getSpecificCloudBackground(description, isNight);
    if (specificCloudUrl) return specificCloudUrl;
    
    // Sonra condition-based kontroller
    return this.getConditionBasedBackground(condition, isNight);
  }

  private getSpecificCloudBackground(description: string, isNight: boolean): string | null {
    const cloudPatterns = this.getCloudPatterns();
    
    for (const pattern of cloudPatterns) {
      if (description.includes(pattern.key)) {
        return isNight ? pattern.night : pattern.day;
      }
    }
    
    return null;
  }

  private getConditionBasedBackground(condition: string, isNight: boolean): string {
    const backgrounds = this.getWeatherBackgrounds();
    
    switch (condition) {
      case 'clear':
        return backgrounds.clear[isNight ? 'night' : 'day'];
      
      case 'clouds':
        return this.getCloudBackgroundByIntensity(isNight);
      
      case 'rain':
      case 'drizzle':
        return backgrounds.rain[isNight ? 'night' : 'day'];
      
      case 'thunderstorm':
        return backgrounds.thunderstorm.default;
      
      case 'snow':
        return backgrounds.snow[isNight ? 'night' : 'day'];
      
      case 'mist':
      case 'fog':
      case 'haze':
        return backgrounds.mist.default;
      
      default:
        return backgrounds.default[isNight ? 'night' : 'day'];
    }
  }

  private getCloudBackgroundByIntensity(isNight: boolean): string {
    const cloudiness = this.currentWeather?.clouds?.all || 0;
    const backgrounds = this.getWeatherBackgrounds().clouds;
    
    if (cloudiness <= 25) return backgrounds.few[isNight ? 'night' : 'day'];
    if (cloudiness <= 50) return backgrounds.scattered[isNight ? 'night' : 'day'];
    if (cloudiness <= 75) return backgrounds.broken[isNight ? 'night' : 'day'];
    return backgrounds.overcast[isNight ? 'night' : 'day'];
  }

  private getCloudPatterns() {
    return [
      {
        key: 'scattered clouds',
        day: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
        night: 'https://images.unsplash.com/photo-1514477917009-389c76a86b68?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'
      },
      {
        key: 'few clouds',
        day: 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
        night: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'
      },
      {
        key: 'broken clouds',
        day: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
        night: 'https://images.unsplash.com/photo-1514477917009-389c76a86b68?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'
      },
      {
        key: 'overcast',
        day: 'https://images.unsplash.com/photo-1561553873-e8491a564fd0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
        night: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'
      }
    ];
  }

  private getWeatherBackgrounds() {
    return {
      clear: {
        day: 'https://images.unsplash.com/photo-1601297183305-6df142704ea2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
        night: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'
      },
      clouds: {
        few: {
          day: 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
          night: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'
        },
        scattered: {
          day: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
          night: 'https://images.unsplash.com/photo-1514477917009-389c76a86b68?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'
        },
        broken: {
          day: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
          night: 'https://images.unsplash.com/photo-1514477917009-389c76a86b68?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'
        },
        overcast: {
          day: 'https://images.unsplash.com/photo-1561553873-e8491a564fd0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
          night: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'
        }
      },
      rain: {
        day: 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
        night: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'
      },
      thunderstorm: {
        default: 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'
      },
      snow: {
        day: 'https://images.unsplash.com/photo-1517299321609-52687d1bc55a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
        night: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'
      },
      mist: {
        default: 'https://images.unsplash.com/photo-1487621167305-5d248087c724?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'
      },
      default: {
        day: 'https://images.unsplash.com/photo-1601297183305-6df142704ea2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
        night: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'
      }
    };
  }

  private isNightTime(): boolean {
    if (!this.currentWeather) return false;

    const currentTime = Math.floor(Date.now() / 1000);
    const sunrise = this.currentWeather.sys.sunrise;
    const sunset = this.currentWeather.sys.sunset;
    
    return currentTime < sunrise || currentTime > sunset;
  }

  getWeatherSVG(iconCode: string, description: string, size: 'small' | 'large' = 'small'): SafeHtml {
    const baseSize = size === 'large' ? 'width="64" height="64"' : 'width="32" height="32"';
    let svgContent = '';
    
    // If no icon code, show default
    if (!iconCode) {
      iconCode = '01d'; // Default to clear sky
    }
    
    // Modern gradient-based weather icons
    if (iconCode.includes('01')) { // Clear sky
      const isNight = iconCode.includes('n');
      if (isNight) {
        svgContent = `
          <svg ${baseSize} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="moonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#E5E7EB;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#9CA3AF;stop-opacity:1" />
              </linearGradient>
              <filter id="moonGlow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <circle cx="32" cy="26" r="16" fill="url(#moonGradient)" filter="url(#moonGlow)"/>
            <circle cx="38" cy="20" r="2" fill="#F9FAFB" opacity="0.8"/>
            <circle cx="28" cy="18" r="1.5" fill="#F9FAFB" opacity="0.6"/>
            <circle cx="40" cy="30" r="1" fill="#F9FAFB" opacity="0.4"/>
            <circle cx="25" cy="32" r="1.2" fill="#F9FAFB" opacity="0.5"/>
            <!-- Stars -->
            <circle cx="18" cy="12" r="1" fill="#FDE047" opacity="0.8"/>
            <circle cx="48" cy="15" r="0.8" fill="#FDE047" opacity="0.6"/>
            <circle cx="52" cy="28" r="1.2" fill="#FDE047" opacity="0.7"/>
            <circle cx="14" cy="35" r="0.6" fill="#FDE047" opacity="0.5"/>
          </svg>
        `;
      } else {
        svgContent = `
          <svg ${baseSize} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="sunGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" style="stop-color:#FEF3C7;stop-opacity:1" />
                <stop offset="70%" style="stop-color:#FCD34D;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#F59E0B;stop-opacity:1" />
              </radialGradient>
              <filter id="sunGlow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <circle cx="32" cy="32" r="12" fill="url(#sunGradient)" filter="url(#sunGlow)"/>
            <!-- Sun rays -->
            <g stroke="#F59E0B" stroke-width="3" stroke-linecap="round" opacity="0.8">
              <path d="M32 8v6M32 50v6M8 32h6M50 32h6"/>
              <path d="M13.86 13.86l4.24 4.24M45.9 45.9l4.24 4.24M13.86 50.14l4.24-4.24M45.9 18.1l4.24-4.24"/>
            </g>
          </svg>
        `;
      }
    } else if (iconCode.includes('02')) { // Few clouds
      svgContent = `
        <svg ${baseSize} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="cloudGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:0.9" />
              <stop offset="100%" style="stop-color:#E5E7EB;stop-opacity:0.8" />
            </linearGradient>
            <radialGradient id="partialSunGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" style="stop-color:#FEF3C7;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#FCD34D;stop-opacity:1" />
            </radialGradient>
          </defs>
          <!-- Sun behind cloud -->
          <circle cx="24" cy="24" r="8" fill="url(#partialSunGradient)" opacity="0.8"/>
          <g stroke="#F59E0B" stroke-width="2" stroke-linecap="round" opacity="0.6">
            <path d="M24 10v3M24 35v3M10 24h3M35 24h3"/>
          </g>
          <!-- Cloud -->
          <ellipse cx="38" cy="28" rx="12" ry="8" fill="url(#cloudGradient)"/>
          <ellipse cx="32" cy="32" rx="10" ry="6" fill="url(#cloudGradient)"/>
          <ellipse cx="44" cy="32" rx="8" ry="5" fill="url(#cloudGradient)"/>
        </svg>
      `;
    } else if (iconCode.includes('03') || iconCode.includes('04')) { // Scattered/broken clouds
      svgContent = `
        <svg ${baseSize} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="cloudyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#F9FAFB;stop-opacity:0.95" />
              <stop offset="50%" style="stop-color:#E5E7EB;stop-opacity:0.9" />
              <stop offset="100%" style="stop-color:#D1D5DB;stop-opacity:0.85" />
            </linearGradient>
          </defs>
          <!-- Multiple cloud layers -->
          <ellipse cx="32" cy="30" rx="16" ry="10" fill="url(#cloudyGradient)"/>
          <ellipse cx="24" cy="26" rx="12" ry="8" fill="url(#cloudyGradient)" opacity="0.8"/>
          <ellipse cx="40" cy="34" rx="10" ry="6" fill="url(#cloudyGradient)" opacity="0.9"/>
          <ellipse cx="28" cy="36" rx="8" ry="5" fill="url(#cloudyGradient)" opacity="0.7"/>
        </svg>
      `;
    } else if (iconCode.includes('09') || iconCode.includes('10')) { // Rain
      svgContent = `
        <svg ${baseSize} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="rainCloudGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#93C5FD;stop-opacity:0.9" />
              <stop offset="100%" style="stop-color:#3B82F6;stop-opacity:0.8" />
            </linearGradient>
          </defs>
          <!-- Rain cloud -->
          <ellipse cx="32" cy="24" rx="18" ry="12" fill="url(#rainCloudGradient)"/>
          <ellipse cx="24" cy="20" rx="12" ry="8" fill="url(#rainCloudGradient)" opacity="0.8"/>
          <ellipse cx="40" cy="28" rx="10" ry="6" fill="url(#rainCloudGradient)" opacity="0.9"/>
          <!-- Rain drops -->
          <g stroke="#3B82F6" stroke-width="2.5" stroke-linecap="round" opacity="0.8">
            <path d="M20 38v8M28 42v6M36 40v8M44 44v6M32 46v4M24 50v4"/>
          </g>
        </svg>
      `;
    } else if (iconCode.includes('11')) { // Thunderstorm
      svgContent = `
        <svg ${baseSize} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="stormCloudGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#6B7280;stop-opacity:0.95" />
              <stop offset="100%" style="stop-color:#374151;stop-opacity:0.9" />
            </linearGradient>
          </defs>
          <!-- Storm cloud -->
          <ellipse cx="32" cy="22" rx="20" ry="14" fill="url(#stormCloudGradient)"/>
          <ellipse cx="22" cy="18" rx="14" ry="10" fill="url(#stormCloudGradient)" opacity="0.8"/>
          <ellipse cx="42" cy="26" rx="12" ry="8" fill="url(#stormCloudGradient)" opacity="0.9"/>
          <!-- Lightning bolt -->
          <path d="M32 32l-6 8h4l-2 6 6-8h-4l2-6z" fill="#FDE047" stroke="#EAB308" stroke-width="1"/>
          <!-- Rain -->
          <g stroke="#60A5FA" stroke-width="2" stroke-linecap="round" opacity="0.6">
            <path d="M18 40v4M26 44v4M38 42v4M46 46v4"/>
          </g>
        </svg>
      `;
    } else if (iconCode.includes('13')) { // Snow
      svgContent = `
        <svg ${baseSize} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="snowCloudGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:0.95" />
              <stop offset="100%" style="stop-color:#E5E7EB;stop-opacity:0.85" />
            </linearGradient>
          </defs>
          <!-- Snow cloud -->
          <ellipse cx="32" cy="24" rx="18" ry="12" fill="url(#snowCloudGradient)"/>
          <ellipse cx="24" cy="20" rx="12" ry="8" fill="url(#snowCloudGradient)" opacity="0.8"/>
          <ellipse cx="40" cy="28" rx="10" ry="6" fill="url(#snowCloudGradient)" opacity="0.9"/>
          <!-- Snowflakes -->
          <g fill="#FFFFFF" opacity="0.9">
            <circle cx="20" cy="40" r="2"/>
            <circle cx="28" cy="44" r="1.5"/>
            <circle cx="36" cy="42" r="2"/>
            <circle cx="44" cy="46" r="1.5"/>
            <circle cx="32" cy="48" r="1"/>
            <circle cx="24" cy="52" r="1.2"/>
            <circle cx="40" cy="50" r="1"/>
          </g>
          <!-- Snowflake details -->
          <g stroke="#E5E7EB" stroke-width="1" opacity="0.7">
            <path d="M18 40h4M20 38v4M19 39l2 2M21 39l-2 2"/>
            <path d="M34 42h4M36 40v4M35 41l2 2M37 41l-2 2"/>
          </g>
        </svg>
      `;
    } else if (iconCode.includes('50')) { // Mist/fog
      svgContent = `
        <svg ${baseSize} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="mistGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style="stop-color:#D1D5DB;stop-opacity:0.3" />
              <stop offset="50%" style="stop-color:#9CA3AF;stop-opacity:0.7" />
              <stop offset="100%" style="stop-color:#D1D5DB;stop-opacity:0.3" />
            </linearGradient>
          </defs>
          <!-- Mist layers -->
          <g stroke="url(#mistGradient)" stroke-width="4" stroke-linecap="round">
            <path d="M8 20h48"/>
            <path d="M12 28h40"/>
            <path d="M6 36h52"/>
            <path d="M14 44h36"/>
            <path d="M10 52h44"/>
          </g>
          <g stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" opacity="0.4">
            <path d="M16 24h32"/>
            <path d="M18 32h28"/>
            <path d="M20 40h24"/>
            <path d="M22 48h20"/>
          </g>
        </svg>
      `;
    } else { // Default - sunny day
      svgContent = `
        <svg ${baseSize} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="defaultSunGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" style="stop-color:#FEF3C7;stop-opacity:1" />
              <stop offset="70%" style="stop-color:#FCD34D;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#F59E0B;stop-opacity:1" />
            </radialGradient>
          </defs>
          <circle cx="32" cy="32" r="12" fill="url(#defaultSunGradient)"/>
          <g stroke="#F59E0B" stroke-width="3" stroke-linecap="round" opacity="0.8">
            <path d="M32 8v6M32 50v6M8 32h6M50 32h6"/>
            <path d="M13.86 13.86l4.24 4.24M45.9 45.9l4.24 4.24M13.86 50.14l4.24-4.24M45.9 18.1l4.24-4.24"/>
          </g>
        </svg>
      `;
    }
    
    return this.sanitizer.bypassSecurityTrustHtml(svgContent);
  }
}
