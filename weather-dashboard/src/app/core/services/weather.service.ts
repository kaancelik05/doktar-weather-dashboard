import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timeout, retryWhen, delay, take } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CurrentWeather, ForecastData, WeatherUnit } from '../models/weather.model';
import { environment } from '../../../environments/environment';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private readonly API_KEY = environment.openWeatherMapApiKey;
  private readonly BASE_URL = 'https://api.openweathermap.org/data/2.5';
  private readonly REQUEST_TIMEOUT = 10000; // 10 seconds
  private readonly RETRY_COUNT = 2;
  private readonly RETRY_DELAY = 1000; // 1 second

  private http = inject(HttpClient);
  private toastService = inject(ToastService);

  getCurrentWeather(city: string, units: WeatherUnit = 'metric'): Observable<CurrentWeather> {
    if (!city || !city.trim()) {
      return throwError(() => new Error('City name cannot be empty'));
    }

    const url = `${this.BASE_URL}/weather`;
    const params = {
      q: city.trim(),
      appid: this.API_KEY,
      units: units
    };

    return this.http.get<CurrentWeather>(url, { params }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retryWhen(errors => 
        errors.pipe(
          delay(this.RETRY_DELAY),
          take(this.RETRY_COUNT)
        )
      ),
      catchError((error) => this.handleError(error, `Unable to fetch weather data for ${city}`))
    );
  }

  getCurrentWeatherByCoords(lat: number, lon: number, units: WeatherUnit = 'metric'): Observable<CurrentWeather> {
    if (!this.isValidCoordinate(lat, lon)) {
      return throwError(() => new Error('Invalid coordinate information'));
    }

    const url = `${this.BASE_URL}/weather`;
    const params = {
      lat: lat.toString(),
      lon: lon.toString(),
      appid: this.API_KEY,
      units: units
    };

    return this.http.get<CurrentWeather>(url, { params }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retryWhen(errors => 
        errors.pipe(
          delay(this.RETRY_DELAY),
          take(this.RETRY_COUNT)
        )
      ),
      catchError((error) => this.handleError(error, 'Unable to fetch weather data for location'))
    );
  }

  getForecast(city: string, units: WeatherUnit = 'metric'): Observable<ForecastData> {
    if (!city || !city.trim()) {
      return throwError(() => new Error('City name cannot be empty'));
    }

    const url = `${this.BASE_URL}/forecast`;
    const params = {
      q: city.trim(),
      appid: this.API_KEY,
      units: units
    };

    return this.http.get<ForecastData>(url, { params }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retryWhen(errors => 
        errors.pipe(
          delay(this.RETRY_DELAY),
          take(this.RETRY_COUNT)
        )
      ),
      catchError((error) => this.handleError(error, `Unable to fetch weather forecast for ${city}`))
    );
  }

  getForecastByCoords(lat: number, lon: number, units: WeatherUnit = 'metric'): Observable<ForecastData> {
    if (!this.isValidCoordinate(lat, lon)) {
      return throwError(() => new Error('Invalid coordinate information'));
    }

    const url = `${this.BASE_URL}/forecast`;
    const params = {
      lat: lat.toString(),
      lon: lon.toString(),
      appid: this.API_KEY,
      units: units
    };

    return this.http.get<ForecastData>(url, { params }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retryWhen(errors => 
        errors.pipe(
          delay(this.RETRY_DELAY),
          take(this.RETRY_COUNT)
        )
      ),
      catchError((error) => this.handleError(error, 'Unable to fetch weather forecast for location'))
    );
  }

  searchCities(query: string, limit = 5): Observable<unknown[]> {
    if (!query || !query.trim()) {
      return throwError(() => new Error('Search term cannot be empty'));
    }

    if (limit <= 0 || limit > 50) {
      return throwError(() => new Error('Invalid limit value'));
    }

    const url = `${this.BASE_URL}/find`;
    const params = {
      q: query.trim(),
      appid: this.API_KEY,
      cnt: limit.toString()
    };

    return this.http.get<{ list?: unknown[] }>(url, { params }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      map(response => response?.list || []),
      retryWhen(errors => 
        errors.pipe(
          delay(this.RETRY_DELAY),
          take(this.RETRY_COUNT)
        )
      ),
      catchError((error) => this.handleError(error, 'City search failed'))
    );
  }

  getWeatherIconUrl(iconCode: string, size: '2x' | '4x' = '2x'): string {
    if (!iconCode) {
      console.warn('Icon code is empty, using default');
      return `https://openweathermap.org/img/wn/01d@${size}.png`; // Default sunny icon
    }
    return `https://openweathermap.org/img/wn/${iconCode}@${size}.png`;
  }

  private isValidCoordinate(lat: number, lon: number): boolean {
    return (
      typeof lat === 'number' && 
      typeof lon === 'number' &&
      !isNaN(lat) && 
      !isNaN(lon) &&
      lat >= -90 && 
      lat <= 90 && 
      lon >= -180 && 
      lon <= 180
    );
  }

  private handleError(error: HttpErrorResponse, customMessage?: string): Observable<never> {
    let errorMessage = customMessage || 'Unknown error occurred';
    
    console.error('Weather service error:', error);

    if (error.error instanceof ErrorEvent) {
      // Client-side/network error
      errorMessage = 'Please check your internet connection';
    } else if (error.status === 0 && error.statusText === 'Unknown Error') {
      // Timeout error (usually manifests as status 0 with Unknown Error)
      errorMessage = 'Request timed out. Please try again';
    } else {
      // Server-side error
      switch (error.status) {
        case 0:
          errorMessage = 'Please check your internet connection';
          break;
        case 401:
          errorMessage = 'Invalid API key';
          break;
        case 404:
          errorMessage = 'City not found';
          break;
        case 429:
          errorMessage = 'API limit exceeded. Please try again later';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later';
          break;
        case 502:
        case 503:
        case 504:
          errorMessage = 'Server temporarily unavailable';
          break;
        default:
          if (error.error?.message) {
            errorMessage = this.translateErrorMessage(error.error.message);
          } else if (customMessage) {
            errorMessage = customMessage;
          } else {
            errorMessage = `Error code: ${error.status}`;
          }
      }
    }
    
    // Log error for debugging
    console.error('Weather API Error:', {
      status: error.status,
      message: errorMessage,
      url: error.url,
      customMessage
    });
    
    return throwError(() => new Error(errorMessage));
  }

  private translateErrorMessage(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('city not found')) {
      return 'City not found';
    }
    if (lowerMessage.includes('invalid api key')) {
      return 'Invalid API key';
    }
    if (lowerMessage.includes('exceeded call frequency')) {
      return 'Too many requests sent';
    }
    if (lowerMessage.includes('nothing to geocode')) {
      return 'Invalid city name';
    }
    
    return message;
  }
}
