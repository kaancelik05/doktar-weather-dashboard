import { Component, Input, OnDestroy, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'warning' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [class]="buttonClasses()"
      [disabled]="disabled || loading"
      [attr.aria-label]="ariaLabel"
      [type]="type"
    >
      <span 
        *ngIf="loading" 
        class="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
        aria-hidden="true"
      >
        <svg class="w-full h-full" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </span>
      <ng-content></ng-content>
    </button>
  `
})
export class ButtonComponent implements OnDestroy {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() ariaLabel = '';

  private readonly baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed';

  private readonly variantClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700 text-white focus:ring-primary-500',
    secondary: 'bg-secondary-600 hover:bg-secondary-700 dark:bg-gray-600 dark:hover:bg-gray-700 text-white focus:ring-secondary-500 dark:focus:ring-gray-500',
    outline: 'border-2 border-primary-600 dark:border-primary-500 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 focus:ring-primary-500',
    ghost: 'text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 focus:ring-primary-500',
    warning: 'bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-600 dark:hover:bg-yellow-700 text-white focus:ring-yellow-500',
    danger: 'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white focus:ring-red-500'
  };

  private readonly sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  buttonClasses = signal<string>('');

  constructor() {
    this.updateClasses();
  }

  ngOnDestroy(): void {
    // Clean up any subscriptions if needed
    this.buttonClasses.set('');
  }

  private updateClasses(): void {
    const classes = [
      this.baseClasses,
      this.variantClasses[this.variant],
      this.sizeClasses[this.size]
    ].join(' ');
    
    this.buttonClasses.set(classes);
  }
}
