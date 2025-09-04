import { Injectable, computed, signal, inject } from '@angular/core';
import { WeatherService } from './weather.service';
import { ToastService } from './toast.service';
import { GeolocationService } from './geolocation.service';
import { 
  CurrentWeather, 
  ForecastData, 
  FavoriteCity, 
  WeatherSettings, 
  WeatherUnit,
  WeatherState 
} from '../models/weather.model';

@Injectable({
  providedIn: 'root'
})
export class WeatherStateService {
  private readonly STORAGE_KEYS = {
    FAVORITES: 'weather-favorites',
    SETTINGS: 'weather-settings',
    USER_PREFERENCE: 'weather-user-preference'
  };

  // Private signals
  private _currentWeather = signal<CurrentWeather | null>(null);
  private _forecast = signal<ForecastData | null>(null);
  private _favorites = signal<FavoriteCity[]>(this.loadFavoritesFromStorage());
  private _settings = signal<WeatherSettings>(this.loadSettingsFromStorage());
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);
  private _selectedCity = signal<string>('');

  // Public computed signals
  readonly currentWeather = this._currentWeather.asReadonly();
  readonly forecast = this._forecast.asReadonly();
  readonly favorites = this._favorites.asReadonly();
  readonly settings = this._settings.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly selectedCity = this._selectedCity.asReadonly();

  // Computed properties
  readonly currentTemperature = computed(() => {
    const weather = this._currentWeather();
    if (!weather) return null;
    
    const unit = this._settings().unit;
    const temp = Math.round(weather.main.temp);
    return `${temp}°${unit === 'metric' ? 'C' : 'F'}`;
  });

  readonly weatherCondition = computed(() => {
    const weather = this._currentWeather();
    return weather?.weather[0]?.description || '';
  });

  readonly weatherIcon = computed(() => {
    const weather = this._currentWeather();
    return weather?.weather[0]?.icon || '';
  });

  readonly dailyForecast = computed(() => {
    const forecast = this._forecast();
    if (!forecast) return [];

    // Group forecast by day and calculate min/max temperatures
    const dailyData: {
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
    }[] = [];
    const processedDays = new Set<string>();

    forecast.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const dateKey = date.toDateString();
      
      if (!processedDays.has(dateKey) && dailyData.length < 5) {
        processedDays.add(dateKey);
        
        // Find all entries for this day to calculate min/max
        const dayEntries = forecast.list.filter(entry => {
          const entryDate = new Date(entry.dt * 1000);
          return entryDate.toDateString() === dateKey;
        });
        
        // const temps = dayEntries.map(entry => entry.main.temp);
        const tempMaxs = dayEntries.map(entry => entry.main.temp_max);
        const tempMins = dayEntries.map(entry => entry.main.temp_min);
        
        dailyData.push({
          date: dateKey,
          dateObj: date,
          dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
          temp: Math.round(item.main.temp),
          tempMax: Math.max(...tempMaxs),
          tempMin: Math.min(...tempMins),
          description: item.weather[0].description,
          icon: item.weather[0].icon,
          humidity: item.main.humidity,
          windSpeed: item.wind.speed
        });
      }
    });

    return dailyData;
  });

  readonly isFavorite = computed(() => {
    const city = this._selectedCity();
    return this._favorites().some(fav => 
      fav.name.toLowerCase() === city.toLowerCase()
    );
  });

  readonly dailyTemperatures = computed(() => {
    const forecast = this._forecast();
    if (!forecast) return null;

    // Group forecast by time of day
    const temperatures = {
      morning: 0,   // 06:00-12:00
      afternoon: 0, // 12:00-18:00
      evening: 0,   // 18:00-24:00
      night: 0      // 00:00-06:00
    };

    const counts = { morning: 0, afternoon: 0, evening: 0, night: 0 };

    // Get today's forecast data (first 8 entries = today, 3-hour intervals)
    const todayForecast = forecast.list.slice(0, 8);

    todayForecast.forEach(item => {
      const hour = new Date(item.dt * 1000).getHours();
      const temp = item.main.temp;

      if (hour >= 6 && hour < 12) {
        temperatures.morning += temp;
        counts.morning++;
      } else if (hour >= 12 && hour < 18) {
        temperatures.afternoon += temp;
        counts.afternoon++;
      } else if (hour >= 18 && hour < 24) {
        temperatures.evening += temp;
        counts.evening++;
      } else {
        temperatures.night += temp;
        counts.night++;
      }
    });

    // Calculate averages or use current temp as fallback
    const currentTemp = this._currentWeather()?.main.temp || 20;
    
    return {
      morning: counts.morning > 0 ? temperatures.morning / counts.morning : currentTemp - 2,
      afternoon: counts.afternoon > 0 ? temperatures.afternoon / counts.afternoon : currentTemp + 3,
      evening: counts.evening > 0 ? temperatures.evening / counts.evening : currentTemp,
      night: counts.night > 0 ? temperatures.night / counts.night : currentTemp - 5
    };
  });

  readonly state = computed<WeatherState>(() => ({
    currentWeather: this._currentWeather(),
    forecast: this._forecast(),
    favorites: this._favorites(),
    settings: this._settings(),
    loading: this._loading(),
    error: this._error(),
    selectedCity: this._selectedCity()
  }));

  private weatherService = inject(WeatherService);
  private toastService = inject(ToastService);
  private geolocationService = inject(GeolocationService);

  // Actions
  async loadWeatherData(city: string, isUserInitiated = true): Promise<void> {
    if (!city || !city.trim()) {
      this.toastService.error('Error', 'City name cannot be empty');
      return;
    }

    // Prevent multiple concurrent requests for the same city
    if (this._loading() && this._selectedCity() === city.trim()) {
      return;
    }

    this.setLoading(true);
    this.setError(null);
    this._selectedCity.set(city.trim());

    // If this is a user-initiated search, mark that user has manually selected a city
    if (isUserInitiated) {
      this.setUserPreference('manual_city_selected', true);
    }

    try {
      const [currentWeather, forecast] = await Promise.all([
        this.weatherService.getCurrentWeather(city, this._settings().unit).toPromise(),
        this.weatherService.getForecast(city, this._settings().unit).toPromise()
      ]);

      if (currentWeather && forecast) {
        this._currentWeather.set(currentWeather);
        this._forecast.set(forecast);
      } else {
        throw new Error('Unable to fetch weather data');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error occurred while loading weather data';
      this.setError(errorMessage);
      
      // Clear existing weather data on error to avoid showing stale data
      this._currentWeather.set(null);
      this._forecast.set(null);
      
      // Don't show toast for API errors since interceptor already handles them
      if (!errorMessage.includes('API') && !errorMessage.includes('City not found')) {
        this.toastService.error('Error', errorMessage);
      }
    } finally {
      this.setLoading(false);
    }
  }

  async loadWeatherByCoords(lat: number, lon: number): Promise<void> {
    if (typeof lat !== 'number' || typeof lon !== 'number' || isNaN(lat) || isNaN(lon)) {
      this.toastService.error('Error', 'Invalid coordinate information');
      return;
    }

    // Prevent multiple concurrent requests
    if (this._loading()) {
      return;
    }

    this.setLoading(true);
    this.setError(null);

    try {
      const [currentWeather, forecast] = await Promise.all([
        this.weatherService.getCurrentWeatherByCoords(lat, lon, this._settings().unit).toPromise(),
        this.weatherService.getForecastByCoords(lat, lon, this._settings().unit).toPromise()
      ]);

      if (currentWeather && forecast) {
        this._currentWeather.set(currentWeather);
        this._forecast.set(forecast);
        this._selectedCity.set(currentWeather.name);
      } else {
        throw new Error('Unable to fetch weather data for location');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error occurred while loading weather data for location';
      this.setError(errorMessage);
      
      // Clear existing weather data on error to avoid showing stale data
      this._currentWeather.set(null);
      this._forecast.set(null);
      
      // Don't show toast for API errors since interceptor already handles them
      if (!errorMessage.includes('API')) {
        this.toastService.error('Error', errorMessage);
      }
    } finally {
      this.setLoading(false);
    }
  }

  async refreshWeatherData(): Promise<void> {
    const city = this._selectedCity();
    if (city) {
      await this.loadWeatherData(city);
    }
  }

  setUnit(unit: WeatherUnit): void {
    const currentSettings = this._settings();
    const newSettings = { ...currentSettings, unit };
    this._settings.set(newSettings);
    this.saveSettingsToStorage(newSettings);
    
    // Refresh data with new unit if city is selected
    const city = this._selectedCity();
    if (city) {
      this.loadWeatherData(city);
    }
  }

  setDefaultCity(defaultCity: string): void {
    const currentSettings = this._settings();
    const newSettings = { ...currentSettings, defaultCity: defaultCity.trim() };
    this._settings.set(newSettings);
    this.saveSettingsToStorage(newSettings);
    
    // Mark that user has manually set a default city
    this.setUserPreference('manual_city_selected', true);
  }

  resetAllData(): void {
    // Reset all signals to initial state
    this._currentWeather.set(null);
    this._forecast.set(null);
    this._favorites.set([]);
    this._settings.set({
      unit: 'metric',
      defaultCity: 'Istanbul'
    });
    this._selectedCity.set('');
    this._error.set(null);
    this._loading.set(false);
    
    // Clear all localStorage
    localStorage.removeItem(this.STORAGE_KEYS.FAVORITES);
    localStorage.removeItem(this.STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(this.STORAGE_KEYS.USER_PREFERENCE);
    localStorage.removeItem('weather-cache');
  }

  addToFavorites(city: CurrentWeather): void {
    const favorites = this._favorites();
    const newFavorite: FavoriteCity = {
      id: `${city.id}-${Date.now()}`,
      name: city.name,
      country: city.sys.country,
      coord: city.coord,
      addedAt: new Date()
    };

    if (!favorites.some(fav => fav.name.toLowerCase() === city.name.toLowerCase())) {
      const updatedFavorites = [...favorites, newFavorite];
      this._favorites.set(updatedFavorites);
      this.saveFavoritesToStorage(updatedFavorites);
    }
  }

  removeFromFavorites(cityName: string): void {
    const favorites = this._favorites();
    const updatedFavorites = favorites.filter(
      fav => fav.name.toLowerCase() !== cityName.toLowerCase()
    );
    this._favorites.set(updatedFavorites);
    this.saveFavoritesToStorage(updatedFavorites);
  }

  setError(error: string | null): void {
    this._error.set(error);
  }

  clearError(): void {
    this._error.set(null);
  }

  private setLoading(loading: boolean): void {
    this._loading.set(loading);
  }

  // Storage methods
  private loadFavoritesFromStorage(): FavoriteCity[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.FAVORITES);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((fav: FavoriteCity & { addedAt: string }) => ({
          ...fav,
          addedAt: new Date(fav.addedAt)
        }));
      }
    } catch (error) {
      console.warn('Error loading favorites:', error);
    }
    return [];
  }

  private saveFavoritesToStorage(favorites: FavoriteCity[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    } catch (error) {
      console.warn('Error saving favorites:', error);
    }
  }

  private loadSettingsFromStorage(): WeatherSettings {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.SETTINGS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Error loading settings:', error);
    }
    return {
      unit: 'metric',
      defaultCity: 'Istanbul'
    };
  }

  /**
   * Kullanıcının mevcut konumunu alarak varsayılan şehri otomatik ayarlar
   */
  async initializeWithUserLocation(): Promise<void> {
    // Eğer daha önce bir şehir seçilmişse, geolocation kullanma
    if (this._selectedCity() || this._currentWeather()) {
      return;
    }

    // Eğer kullanıcı daha önce manuel olarak şehir seçmişse, geolocation kullanma
    if (this.hasUserManuallySelectedCity()) {
      const defaultCity = this._settings().defaultCity;
      if (defaultCity) {
        await this.loadWeatherData(defaultCity, false);
      }
      return;
    }

    // Geolocation desteklenmiyor veya güvenli bağlantı yoksa varsayılan şehri kullan
    if (!this.geolocationService.isGeolocationAvailable()) {
      console.warn('Geolocation not available, using default city');
      const defaultCity = this._settings().defaultCity;
      if (defaultCity) {
        await this.loadWeatherData(defaultCity, false);
      }
      return;
    }

    try {
      // Loading state'i ayarla (sadece konum için)
      
      // Kullanıcının konumunu al
      const result = await this.geolocationService.getCurrentLocation().toPromise();
      
      if (result?.cityName) {
        
        // Tespit edilen şehir ile hava durumu verilerini yükle (automatic, not user-initiated)
        await this.loadWeatherData(result.cityName, false);
        
        // Location based city'yi default olarak ayarlama, sadece hava durumu göster
        this.toastService.success(
          'Location Detected', 
          `Weather data loaded for ${result.cityName}`
        );
      } else {
        throw new Error('Could not determine city name from location');
      }
    } catch (error) {
      console.warn('Failed to get user location:', error);
      
      // Konum alınamazsa varsayılan şehri kullan
      const defaultCity = this._settings().defaultCity;
      if (defaultCity) {
        await this.loadWeatherData(defaultCity, false);
      }
    }
  }

  /**
   * Kullanıcının mevcut konumuna göre hava durumunu günceller
   */
  async loadWeatherByUserLocation(): Promise<void> {
    if (!this.geolocationService.isGeolocationAvailable()) {
      this.toastService.error(
        'Location Error', 
        'Geolocation is not available. Please enable location services and use HTTPS.'
      );
      return;
    }

    try {
      this.setLoading(true);
      this.setError(null);

      const result = await this.geolocationService.getCurrentLocation().toPromise();
      
      if (result?.position) {
        // Koordinatlar ile hava durumunu yükle
        await this.loadWeatherByCoords(result.position.latitude, result.position.longitude);
        
        if (result.cityName) {
          this.toastService.success(
            'Location Updated', 
            `Weather data updated for ${result.cityName}`
          );
        }
      } else {
        throw new Error('Could not get location coordinates');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get your location';
      this.setError(errorMessage);
      this.toastService.error('Location Error', errorMessage);
    } finally {
      this.setLoading(false);
    }
  }

  private saveSettingsToStorage(settings: WeatherSettings): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.warn('Error saving settings:', error);
    }
  }

  // User preference management
  private setUserPreference(key: string, value: unknown): void {
    try {
      const preferences = this.getUserPreferences();
      preferences[key] = value;
      localStorage.setItem(this.STORAGE_KEYS.USER_PREFERENCE, JSON.stringify(preferences));
    } catch (error) {
      console.warn('Error saving user preference:', error);
    }
  }

  private getUserPreference(key: string, defaultValue: unknown = null): unknown {
    try {
      const preferences = this.getUserPreferences();
      return preferences[key] !== undefined ? preferences[key] : defaultValue;
    } catch (error) {
      console.warn('Error getting user preference:', error);
      return defaultValue;
    }
  }

  private getUserPreferences(): Record<string, unknown> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.USER_PREFERENCE);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.warn('Error loading user preferences:', error);
      return {};
    }
  }

  private hasUserManuallySelectedCity(): boolean {
    return this.getUserPreference('manual_city_selected', false) as boolean;
  }
}
