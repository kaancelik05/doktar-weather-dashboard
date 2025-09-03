import { Component, Input, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export type LoaderSize = 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="containerClasses()">
      <div [class]="spinnerClasses()" [attr.aria-label]="ariaLabel">
        <svg class="animate-spin w-full h-full" fill="none" viewBox="0 0 24 24">
          <circle 
            class="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            stroke-width="4"
          ></circle>
          <path 
            class="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
      <p *ngIf="message" [class]="messageClasses()">
        {{ message }}
      </p>
    </div>
  `
})
export class LoaderComponent {
  @Input() size: LoaderSize = 'md';
  @Input() message = '';
  @Input() centered = false;
  @Input() color = 'text-primary-600';
  @Input() ariaLabel = 'Yükleniyor...';

  private readonly sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  containerClasses = signal<string>('');
  spinnerClasses = signal<string>('');
  messageClasses = signal<string>('');

  constructor() {
    this.updateClasses();
  }

  private updateClasses(): void {
    const containerClasses = [
      'flex flex-col items-center',
      this.centered ? 'justify-center min-h-[200px]' : ''
    ].filter(Boolean).join(' ');

    const spinnerClasses = [
      this.sizeClasses[this.size],
      this.color
    ].join(' ');

    const messageClasses = [
      'mt-2 text-sm font-medium',
      this.color
    ].join(' ');

    this.containerClasses.set(containerClasses);
    this.spinnerClasses.set(spinnerClasses);
    this.messageClasses.set(messageClasses);
  }
}
