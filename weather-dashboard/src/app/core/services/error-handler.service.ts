import { Injectable, ErrorHandler, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class GlobalErrorHandler implements ErrorHandler {
  private toastService = inject(ToastService);

  handleError(error: unknown): void {
    console.error('Global error caught:', error);

    let userMessage = 'An unexpected error occurred';
    let details = '';

    if (error instanceof Error) {
      userMessage = this.getFriendlyErrorMessage(error.message);
      details = error.message;
    } else if (typeof error === 'string') {
      userMessage = this.getFriendlyErrorMessage(error);
      details = error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      const errorWithMessage = error as { message: string };
      userMessage = this.getFriendlyErrorMessage(errorWithMessage.message);
      details = errorWithMessage.message;
    }

    // Don't show error toast for certain Angular internal errors
    if (this.shouldIgnoreError(details)) {
      return;
    }

    this.toastService.error(
      'Error',
      userMessage,
      false // Not persistent for global errors
    );
  }

  private getFriendlyErrorMessage(originalMessage: string): string {
    const message = originalMessage.toLowerCase();

    // Network errors
    if (message.includes('fetch') || message.includes('network')) {
      return 'Please check your internet connection';
    }

    // API errors
    if (message.includes('api') || message.includes('server')) {
      return 'Unable to connect to server';
    }

    // Timeout errors
    if (message.includes('timeout')) {
      return 'Request timed out';
    }

    // Permission errors
    if (message.includes('permission') || message.includes('unauthorized')) {
      return 'Permission error occurred';
    }

    // Weather specific errors
    if (message.includes('weather')) {
      return 'Unable to fetch weather data';
    }

    if (message.includes('city')) {
      return 'City not found';
    }

    if (message.includes('location')) {
      return 'Unable to get location information';
    }

    // Return original message if no pattern matches, but clean it up
    return this.cleanErrorMessage(originalMessage);
  }

  private cleanErrorMessage(message: string): string {
    // Remove technical details and keep user-friendly part
    return message
      .replace(/Http failure response for.*?:/i, '')
      .replace(/Error:/i, '')
      .replace(/^\s*\d+\s*-?\s*/i, '') // Remove error codes at start
      .trim() || 'An error occurred';
  }

  private shouldIgnoreError(errorMessage: string): boolean {
    const ignoredPatterns = [
      'non-error promise rejection',
      'script error',
      'network error',
      'loading chunk',
      'dynamically imported module'
    ];

    const message = errorMessage.toLowerCase();
    return ignoredPatterns.some(pattern => message.includes(pattern));
  }
}
