import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div 
      class="animate-pulse bg-gray-200 rounded"
      [class]="getSkeletonClasses()"
      [style.width]="width"
      [style.height]="height"
    ></div>
  `
})
export class SkeletonComponent {
  @Input() width = '100%';
  @Input() height = '20px';
  @Input() shape: 'rectangle' | 'circle' | 'text' = 'rectangle';
  @Input() className = '';

  getSkeletonClasses(): string {
    let classes = 'animate-pulse bg-gray-200';
    
    switch (this.shape) {
      case 'circle':
        classes += ' rounded-full';
        break;
      case 'text':
        classes += ' rounded h-4';
        break;
      default:
        classes += ' rounded';
    }
    
    if (this.className) {
      classes += ` ${this.className}`;
    }
    
    return classes;
  }
}
