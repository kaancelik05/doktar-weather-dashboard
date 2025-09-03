import { Component, Input, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="cardClasses()">
      <div *ngIf="title || subtitle" class="px-6 py-4 border-b border-secondary-200 dark:border-gray-700">
        <h3 *ngIf="title" class="text-lg font-semibold text-secondary-900 dark:text-white">
          {{ title }}
        </h3>
        <p *ngIf="subtitle" class="text-sm text-secondary-600 dark:text-gray-400 mt-1">
          {{ subtitle }}
        </p>
      </div>
      
      <div [class]="contentClasses()">
        <ng-content></ng-content>
      </div>
      
      <div *ngIf="hasFooter" class="px-6 py-4 bg-secondary-50 dark:bg-gray-700/30 border-t border-secondary-200 dark:border-gray-700 rounded-b-lg">
        <ng-content select="[slot=footer]"></ng-content>
      </div>
    </div>
  `
})
export class CardComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() padding = true;
  @Input() shadow = true;
  @Input() hasFooter = false;

  private readonly baseClasses = 'bg-white dark:bg-gray-800 overflow-hidden rounded-lg border border-secondary-200 dark:border-gray-700 transition-colors duration-300';
  private readonly shadowClasses = 'shadow-lg hover:shadow-xl transition-shadow duration-200';

  cardClasses = signal<string>('');
  contentClasses = signal<string>('');

  constructor() {
    this.updateClasses();
  }

  private updateClasses(): void {
    const cardClasses = [
      this.baseClasses,
      this.shadow ? this.shadowClasses : ''
    ].filter(Boolean).join(' ');
    
    const contentClasses = this.padding ? 'p-6' : '';
    
    this.cardClasses.set(cardClasses);
    this.contentClasses.set(contentClasses);
  }
}
