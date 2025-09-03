import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <div 
        *ngFor="let toast of toastService.toasts(); trackBy: trackByToastId"
        class="transform transition-all duration-300 ease-in-out w-96 max-w-md"
        [class]="getToastClasses(toast)"
      >
        <div class="flex items-start">
          <!-- Icon -->
          <div class="flex-shrink-0">
            <svg 
              *ngIf="toast.type === 'success'"
              class="h-5 w-5 text-green-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            
            <svg 
              *ngIf="toast.type === 'error'"
              class="h-5 w-5 text-red-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            
            <svg 
              *ngIf="toast.type === 'warning'"
              class="h-5 w-5 text-yellow-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            
            <svg 
              *ngIf="toast.type === 'info'"
              class="h-5 w-5 text-blue-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <!-- Content -->
          <div class="ml-3 w-0 flex-1">
            <p class="text-sm font-medium" [class]="getTitleTextClass(toast)">
              {{ toast.title }}
            </p>
            <p 
              *ngIf="toast.message" 
              class="mt-1 text-sm" 
              [class]="getMessageTextClass(toast)"
            >
              {{ toast.message }}
            </p>
          </div>
          
          <!-- Close button -->
          <div class="ml-4 flex flex-shrink-0">
            <button
              type="button"
              (click)="removeToast(toast.id)"
              class="inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
              [class]="getCloseButtonClass(toast)"
            >
              <span class="sr-only">Close</span>
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Progress bar for timed toasts -->
        <div 
          *ngIf="!toast.persistent && toast.duration"
          class="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1"
        >
          <div 
            class="h-1 rounded-full transition-all ease-linear"
            [class]="getProgressBarClass(toast)"
            [style.animation]="'shrink ' + toast.duration + 'ms linear'"
          ></div>
        </div>
      </div>
    </div>
    
    <style>
      @keyframes shrink {
        from { width: 100%; }
        to { width: 0%; }
      }
    </style>
  `
})
export class ToastComponent {
  toastService = inject(ToastService);

  trackByToastId(index: number, toast: ToastMessage): string {
    return toast.id;
  }

  removeToast(id: string): void {
    this.toastService.remove(id);
  }

  getToastClasses(toast: ToastMessage): string {
    const baseClasses = 'rounded-lg shadow-lg p-4 pointer-events-auto transition-colors duration-300';
    
    switch (toast.type) {
      case 'success':
        return `${baseClasses} bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700`;
      case 'error':
        return `${baseClasses} bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700`;
      case 'warning':
        return `${baseClasses} bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700`;
      case 'info':
        return `${baseClasses} bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700`;
      default:
        return `${baseClasses} bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700`;
    }
  }

  getTitleTextClass(toast: ToastMessage): string {
    switch (toast.type) {
      case 'success':
        return 'text-green-800 dark:text-green-200';
      case 'error':
        return 'text-red-800 dark:text-red-200';
      case 'warning':
        return 'text-yellow-800 dark:text-yellow-200';
      case 'info':
        return 'text-blue-800 dark:text-blue-200';
      default:
        return 'text-gray-800 dark:text-gray-200';
    }
  }

  getMessageTextClass(toast: ToastMessage): string {
    switch (toast.type) {
      case 'success':
        return 'text-green-700 dark:text-green-300';
      case 'error':
        return 'text-red-700 dark:text-red-300';
      case 'warning':
        return 'text-yellow-700 dark:text-yellow-300';
      case 'info':
        return 'text-blue-700 dark:text-blue-300';
      default:
        return 'text-gray-700 dark:text-gray-300';
    }
  }

  getCloseButtonClass(toast: ToastMessage): string {
    switch (toast.type) {
      case 'success':
        return 'text-green-400 hover:text-green-600 focus:ring-green-500';
      case 'error':
        return 'text-red-400 hover:text-red-600 focus:ring-red-500';
      case 'warning':
        return 'text-yellow-400 hover:text-yellow-600 focus:ring-yellow-500';
      case 'info':
        return 'text-blue-400 hover:text-blue-600 focus:ring-blue-500';
      default:
        return 'text-gray-400 hover:text-gray-600 focus:ring-gray-500';
    }
  }

  getProgressBarClass(toast: ToastMessage): string {
    switch (toast.type) {
      case 'success':
        return 'bg-green-400';
      case 'error':
        return 'bg-red-400';
      case 'warning':
        return 'bg-yellow-400';
      case 'info':
        return 'bg-blue-400';
      default:
        return 'bg-gray-400';
    }
  }
}
