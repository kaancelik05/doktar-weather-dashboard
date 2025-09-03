import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrentWeather, WeatherSettings } from '../../../../core/models/weather.model';
import { WeatherInfoCardComponent, WeatherInfoCardData } from '../../../../shared/components';

@Component({
  selector: 'app-weather-stats',
  standalone: true,
  imports: [CommonModule, WeatherInfoCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Bottom Info Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-4 gap-4 mt-6">
      <!-- Humidity Card -->
      <app-weather-info-card 
        [data]="getHumidityCardData()">
      </app-weather-info-card>

      <!-- Wind Card -->
      <app-weather-info-card 
        [data]="getWindCardData()">
      </app-weather-info-card>

      <!-- Precipitation Card -->
      <app-weather-info-card 
        [data]="getPrecipitationCardData()">
      </app-weather-info-card>

      <!-- UV Index Card -->
      <app-weather-info-card 
        [data]="getUVIndexCardData()">
      </app-weather-info-card>
    </div>
  `
})
export class WeatherStatsComponent {
  @Input() currentWeather: CurrentWeather | null = null;
  @Input() settings: WeatherSettings = { unit: 'metric', defaultCity: 'Istanbul' };

  getHumidityCardData(): WeatherInfoCardData {
    const humidity = this.getHumidity();
    return {
      title: 'Humidity',
      value: humidity,
      unit: '%',
      icon: 'fas fa-tint',
      progressValue: humidity,
      progressMax: 100,
      progressColor: 'blue',
      quality: humidity > 70 ? 'bad' : humidity > 50 ? 'normal' : 'good',
      showLinearProgress: true,
      description: humidity > 70 ? 'High' : humidity > 50 ? 'Normal' : 'Low'
    };
  }

  getWindCardData(): WeatherInfoCardData {
    const windSpeed = this.currentWeather?.wind.speed || 0;
    const maxWind = 40;
    
    return {
      title: 'Wind',
      value: Math.round(windSpeed),
      unit: this.settings.unit === 'metric' ? 'km/h' : 'mph',
      icon: 'fas fa-wind',
      progressValue: windSpeed,
      progressMax: maxWind,
      progressColor: windSpeed > 25 ? 'red' : windSpeed > 10 ? 'yellow' : 'green',
      quality: windSpeed > 25 ? 'bad' : windSpeed > 10 ? 'normal' : 'good',
      showLinearProgress: true,
      description: windSpeed > 25 ? 'Strong' : windSpeed > 10 ? 'Moderate' : 'Light'
    };
  }

  getPrecipitationCardData(): WeatherInfoCardData {
    const precipitation = this.currentWeather?.rain?.['1h'] || this.currentWeather?.snow?.['1h'] || 0;
    
    return {
      title: 'Precipitation',
      value: precipitation.toFixed(1),
      unit: 'cm',
      icon: 'fas fa-cloud-rain',
      progressValue: precipitation,
      progressMax: 9,
      progressColor: precipitation > 5 ? 'red' : precipitation > 1 ? 'yellow' : 'blue',
      quality: precipitation > 5 ? 'bad' : precipitation > 1 ? 'normal' : 'good',
      showLinearProgress: true,
      description: precipitation > 5 ? 'Heavy' : precipitation > 1 ? 'Moderate' : 'Light'
    };
  }

  getUVIndexCardData(): WeatherInfoCardData {
    const uvIndex = this.getUVIndex();
    return {
      title: 'UV Index',
      value: uvIndex,
      icon: 'fas fa-sun',
      progressValue: uvIndex,
      progressMax: 11,
      progressColor: uvIndex > 7 ? 'red' : uvIndex > 5 ? 'yellow' : 'green',
      quality: uvIndex > 7 ? 'bad' : uvIndex > 5 ? 'normal' : 'good',
      showLinearProgress: true,
      description: uvIndex > 7 ? 'Very High' : uvIndex > 5 ? 'High' : uvIndex > 2 ? 'Moderate' : 'Low'
    };
  }



  private getHumidity(): number {
    return this.currentWeather?.main.humidity || 0;
  }



  private getUVIndex(): number {
    // Simple estimation - in real app would come from UV API
    return 2;
  }
}
