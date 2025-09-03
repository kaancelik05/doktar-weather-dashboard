import { Injectable, inject } from '@angular/core';
import { Observable, from, of, throwError } from 'rxjs';
import { map, catchError, timeout, switchMap } from 'rxjs/operators';
import { WeatherService } from './weather.service';
import { ToastService } from './toast.service';

export interface GeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface GeolocationResult {
  position: GeolocationPosition;
  cityName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  private weatherService = inject(WeatherService);
  private toastService = inject(ToastService);

  /**
   * Kullanıcının mevcut konumunu alır ve şehir adını döner
   */
  getCurrentLocation(): Observable<GeolocationResult> {
    // Geolocation API'si desteklenip desteklenmediğini kontrol et
    if (!navigator.geolocation) {
      return throwError(() => new Error('Geolocation is not supported by this browser'));
    }

    // Konum izinlerini kontrol et
    return from(this.checkPermissions()).pipe(
      switchMap(hasPermission => {
        if (!hasPermission) {
          return throwError(() => new Error('Location permission denied'));
        }
        
        return this.getPosition();
      }),
      switchMap(position => {
        // Koordinatları şehir adına çevir
        return this.reverseGeocode(position).pipe(
          map(cityName => ({
            position,
            cityName
          }))
        );
      }),
      catchError(error => {
        console.error('Geolocation error:', error);
        this.toastService.error('Location Error', this.getErrorMessage(error));
        return throwError(() => error);
      })
    );
  }

  /**
   * Sadece koordinatları alır, şehir adı aramaz
   */
  getCurrentPosition(): Observable<GeolocationPosition> {
    if (!navigator.geolocation) {
      return throwError(() => new Error('Geolocation is not supported by this browser'));
    }

    return from(this.checkPermissions()).pipe(
      switchMap(hasPermission => {
        if (!hasPermission) {
          return throwError(() => new Error('Location permission denied'));
        }
        
        return this.getPosition();
      }),
      catchError(error => {
        console.error('Geolocation error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Konum izinlerini kontrol eder
   */
  private async checkPermissions(): Promise<boolean> {
    try {
      // Modern tarayıcılarda permissions API'si kullan
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        return permission.state === 'granted' || permission.state === 'prompt';
      }
      
      // Eski tarayıcılar için true döner, gerçek izin getCurrentPosition'da kontrol edilir
      return true;
    } catch (error) {
      console.warn('Permissions API not supported:', error);
      return true;
    }
  }

  /**
   * Aktual konum pozisyonunu alır
   */
  private getPosition(): Observable<GeolocationPosition> {
    const options: PositionOptions = {
      enableHighAccuracy: false, // Daha hızlı sonuç için false
      timeout: 10000, // 10 saniye timeout
      maximumAge: 300000 // 5 dakika cache
    };

    return new Observable<GeolocationPosition>(observer => {
      const success = (position: globalThis.GeolocationPosition) => {
        observer.next({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        observer.complete();
      };

      const error = (error: GeolocationPositionError) => {
        observer.error(error);
      };

      navigator.geolocation.getCurrentPosition(success, error, options);
    }).pipe(
      timeout(15000), // 15 saniye genel timeout
      catchError(error => {
        return throwError(() => this.mapGeolocationError(error));
      })
    );
  }

  /**
   * Koordinatları şehir adına çevirir (reverse geocoding)
   */
  private reverseGeocode(position: GeolocationPosition): Observable<string> {
    return this.weatherService.getCurrentWeatherByCoords(
      position.latitude, 
      position.longitude, 
      'metric'
    ).pipe(
      map(weather => weather.name),
      catchError(error => {
        console.warn('Reverse geocoding failed:', error);
        // Fallback: koordinatlara yakın bilinen bir şehir döner
        return of(this.getFallbackCity(position));
      })
    );
  }

  /**
   * Koordinatlara göre fallback şehir döner
   */
  private getFallbackCity(position: GeolocationPosition): string {
    const { latitude, longitude } = position;
    
    // Türkiye sınırları içinde mi kontrol et
    if (latitude >= 36 && latitude <= 42 && longitude >= 26 && longitude <= 45) {
      return 'Istanbul'; // Türkiye için Istanbul
    }
    
    // Avrupa
    if (latitude >= 35 && latitude <= 71 && longitude >= -10 && longitude <= 40) {
      return 'London';
    }
    
    // Kuzey Amerika
    if (latitude >= 25 && latitude <= 72 && longitude >= -168 && longitude <= -52) {
      return 'New York';
    }
    
    // Asya
    if (latitude >= 10 && latitude <= 55 && longitude >= 60 && longitude <= 180) {
      return 'Tokyo';
    }
    
    // Varsayılan
    return 'Istanbul';
  }

  /**
   * Geolocation hatalarını kullanıcı dostu mesajlara çevirir
   */
  private mapGeolocationError(error: any): Error {
    if (error?.code) {
      switch (error.code) {
        case 1: // PERMISSION_DENIED
          return new Error('Location access permission denied. Please enable location services and try again.');
        case 2: // POSITION_UNAVAILABLE
          return new Error('Location information is unavailable. Please check your internet connection.');
        case 3: // TIMEOUT
          return new Error('Location request timed out. Please try again.');
        default:
          return new Error('An unknown error occurred while getting your location.');
      }
    }
    
    if (error?.name === 'TimeoutError') {
      return new Error('Location request timed out. Please try again.');
    }
    
    return new Error(error?.message || 'Unable to get your location.');
  }

  /**
   * Hata mesajlarını kullanıcı dostu hale getirir
   */
  private getErrorMessage(error: any): string {
    if (error?.message) {
      return error.message;
    }
    
    if (typeof error === 'string') {
      return error;
    }
    
    return 'Unable to get your location. Please try searching manually.';
  }

  /**
   * Geolocation API'sinin desteklenip desteklenmediğini kontrol eder
   */
  isGeolocationSupported(): boolean {
    return 'geolocation' in navigator;
  }

  /**
   * HTTPS bağlantısı olup olmadığını kontrol eder (geolocation için gerekli)
   */
  isSecureContext(): boolean {
    return location.protocol === 'https:' || location.hostname === 'localhost';
  }

  /**
   * Geolocation kullanılabilir mi tam kontrol
   */
  isGeolocationAvailable(): boolean {
    return this.isGeolocationSupported() && this.isSecureContext();
  }
}
