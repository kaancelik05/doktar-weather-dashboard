import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, retryWhen, mergeMap } from 'rxjs/operators';
import { ToastService } from '../services/toast.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private readonly MAX_RETRIES = 2;
  private readonly RETRY_DELAY = 1000;

  private toastService = inject(ToastService);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      retryWhen(errors => this.handleRetry(errors)),
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  private handleRetry(errors: Observable<HttpErrorResponse>): Observable<number> {
    return errors.pipe(
      mergeMap((error, index) => {
        const retryAttempt = index + 1;
        
        // Only retry for certain error types and within retry limit
        if (retryAttempt <= this.MAX_RETRIES && this.shouldRetry(error)) {
          return timer(this.RETRY_DELAY);
        }
        
        // Don't retry, let the error pass through
        return throwError(() => error);
      })
    );
  }

  private shouldRetry(error: HttpErrorResponse): boolean {
    // Retry for network errors and server errors (5xx)
    return !error.status || // Network error
           error.status >= 500 || // Server error
           error.status === 408; // Request timeout
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Unknown error occurred';
    const shouldShowToast = true;

    if (error.error instanceof ErrorEvent) {
      // Client-side/network error
      errorMessage = 'Please check your internet connection';
    } else {
      switch (error.status) {
        case 0:
          errorMessage = 'Please check your internet connection';
          break;
        case 400:
          errorMessage = 'Invalid request';
          break;
        case 401:
          errorMessage = 'Invalid API key';
          break;
        case 403:
          errorMessage = 'Access denied';
          break;
        case 404:
          errorMessage = 'City not found';
          break;
        case 408:
          errorMessage = 'Request timed out';
          break;
        case 429:
          errorMessage = 'Too many requests. Please wait';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later';
          break;
        case 502:
          errorMessage = 'Server temporarily unavailable';
          break;
        case 503:
          errorMessage = 'Service temporarily unavailable';
          break;
        case 504:
          errorMessage = 'Server timeout';
          break;
        default:
          if (error.error?.message) {
            errorMessage = this.processServerErrorMessage(error.error.message);
          } else {
            errorMessage = `Error code: ${error.status}`;
          }
      }
    }

    // Show toast notification for API errors
    if (shouldShowToast) {
      this.toastService.error(
        'API Error',
        errorMessage,
        false
      );
    }

    return throwError(() => new Error(errorMessage));
  }

  private processServerErrorMessage(message: string): string {
    // Process common OpenWeatherMap API error messages
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('city not found')) {
      return 'City not found';
    }
    
    if (lowerMessage.includes('invalid api key')) {
      return 'Invalid API key';
    }
    
    if (lowerMessage.includes('exceeded call frequency')) {
      return 'Too many requests. Please wait';
    }
    
    if (lowerMessage.includes('calls per minute limit')) {
      return 'Rate limit exceeded';
    }
    
    // Return cleaned message
    return message.charAt(0).toUpperCase() + message.slice(1);
  }
}
