import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: Record<string, unknown> | null = null;

  async loadConfig(): Promise<void> {
    if (environment.production) {
      try {
        // Production'da staticwebapp.config.json'dan config yükle
        const response = await fetch('/api/config');
        if (response.ok) {
          this.config = await response.json();
        } else {
          // Fallback: environment variable'ları doğrudan kullan
          this.config = {
            openWeatherMapApiKey: (window as unknown as Record<string, Record<string, string>>)?.['ENV']?.['OPENWEATHER_API_KEY'] || '',
            geodb: {
              apiKey: (window as unknown as Record<string, Record<string, string>>)?.['ENV']?.['GEODB_API_KEY'] || '',
              baseUrl: environment.geodb.baseUrl,
              host: environment.geodb.host
            }
          };
        }
      } catch (error) {
        console.warn('Config yüklenemedi, fallback değerler kullanılıyor:', error);
        this.config = environment;
      }
    } else {
      // Development'da environment dosyasını kullan
      this.config = environment;
    }
  }

  get openWeatherMapApiKey(): string {
    return (this.config?.['openWeatherMapApiKey'] as string) || environment.openWeatherMapApiKey;
  }

  get geoDbConfig() {
    return (this.config?.['geodb'] as typeof environment.geodb) || environment.geodb;
  }
}
