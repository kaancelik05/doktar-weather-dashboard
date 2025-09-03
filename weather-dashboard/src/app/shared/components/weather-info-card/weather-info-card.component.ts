import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface WeatherInfoCardData {
  title: string;
  value: string | number;
  unit?: string;
  description?: string;
  icon: string;
  progressValue?: number;
  progressMax?: number;
  progressColor?: string;
  quality?: 'good' | 'normal' | 'bad' | 'medium';
  showCircularProgress?: boolean;
  showLinearProgress?: boolean;
  showBarChart?: boolean;
  chartData?: number[];
}

@Component({
  selector: 'app-weather-info-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-32 bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-sm hover:shadow-md transition-all duration-200 dark:ring-1 dark:ring-gray-700/50 flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between mb-1">
        <h3 class="text-gray-700 dark:text-gray-300 text-xs font-medium">{{ data.title }}</h3>
        <div [class]="getIconClasses()">
          <i [class]="data.icon"></i>
        </div>
      </div>

      <!-- Main Value -->
      <div class="mb-1 flex-shrink-0">
        <div class="flex items-baseline space-x-1">
          <span class="text-xl font-bold text-gray-900 dark:text-white">{{ data.value }}</span>
          <span class="text-xs text-gray-500 dark:text-gray-400" *ngIf="data.unit">{{ data.unit }}</span>
        </div>
        <div class="text-xs text-gray-500 dark:text-gray-400" *ngIf="data.quality">
          {{ getQualityText() }}
        </div>
      </div>

      <!-- Progress Indicators - Flex-grow to fill remaining space -->
      <div class="flex-1 flex flex-col justify-end">
        <!-- Linear Progress Bar -->
        <div *ngIf="data.showLinearProgress" class="mb-1">
          <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1">
            <div 
              class="h-1 rounded-full transition-all duration-500"
              [class]="getProgressBarColor()"
              [style.width.%]="getProgressPercentage()"
            ></div>
          </div>
        </div>

        <!-- Circular Progress -->
        <div *ngIf="data.showCircularProgress" class="flex items-center justify-center mb-1">
          <div class="relative w-10 h-10">
            <svg class="w-10 h-10 transform -rotate-90" viewBox="0 0 36 36">
              <!-- Background circle -->
              <path
                class="text-gray-200 dark:text-gray-600"
                stroke="currentColor"
                stroke-width="2"
                fill="none"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <!-- Progress circle -->
              <path
                [class]="getCircularProgressColor()"
                stroke="currentColor"
                stroke-width="2"
                fill="none"
                stroke-linecap="round"
                [attr.stroke-dasharray]="getCircularDashArray()"
                [attr.stroke-dashoffset]="getCircularDashOffset()"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="text-xs font-semibold text-gray-700 dark:text-gray-200">{{ Math.round(getProgressPercentage()) }}%</span>
            </div>
          </div>
        </div>

        <!-- Bar Chart -->
        <div *ngIf="data.showBarChart && data.chartData" class="mb-1">
          <div class="flex items-end justify-between h-6 space-x-0.5">
            <div 
              *ngFor="let value of data.chartData; let i = index"
              class="flex-1 rounded-t-sm transition-all duration-300"
              [class]="getBarColor(i)"
              [style.height.%]="(value / getMaxChartValue()) * 100"
            ></div>
          </div>
        </div>

        <!-- Quality Indicator -->
        <div *ngIf="data.quality" class="flex items-center justify-between mt-auto">
          <div class="flex space-x-0.5">
            <div 
              *ngFor="let level of ['good', 'normal', 'bad']; let i = index"
              class="w-4 h-1 rounded-full"
              [class]="getQualityIndicatorColor(level, i)"
            ></div>
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400 ml-2 truncate">
            {{ data.description }}
          </div>
        </div>
      </div>
    </div>
  `
})
export class WeatherInfoCardComponent {
  @Input() data!: WeatherInfoCardData;

  Math = Math;

  getIconClasses(): string {
    const baseClasses = 'w-8 h-8 rounded-lg flex items-center justify-center text-white';
    return `${baseClasses} ${this.getIconBackgroundColor()}`;
  }

  getIconBackgroundColor(): string {
    if (this.data.progressColor) {
      switch (this.data.progressColor) {
        case 'blue': return 'bg-blue-500';
        case 'green': return 'bg-green-500';
        case 'yellow': return 'bg-yellow-500';
        case 'red': return 'bg-red-500';
        case 'purple': return 'bg-purple-500';
        default: return 'bg-blue-500';
      }
    }
    return 'bg-blue-500';
  }

  getProgressBarColor(): string {
    if (this.data.progressColor) {
      switch (this.data.progressColor) {
        case 'blue': return 'bg-blue-500';
        case 'green': return 'bg-green-500';
        case 'yellow': return 'bg-yellow-500';
        case 'red': return 'bg-red-500';
        case 'purple': return 'bg-purple-500';
        default: return 'bg-blue-500';
      }
    }
    return 'bg-blue-500';
  }

  getCircularProgressColor(): string {
    if (this.data.progressColor) {
      switch (this.data.progressColor) {
        case 'blue': return 'text-blue-500';
        case 'green': return 'text-green-500';
        case 'yellow': return 'text-yellow-500';
        case 'red': return 'text-red-500';
        case 'purple': return 'text-purple-500';
        default: return 'text-blue-500';
      }
    }
    return 'text-blue-500';
  }

  getProgressPercentage(): number {
    if (!this.data.progressValue || !this.data.progressMax) return 0;
    return (this.data.progressValue / this.data.progressMax) * 100;
  }

  getCircularDashArray(): string {
    return '100 100';
  }

  getCircularDashOffset(): number {
    const percentage = this.getProgressPercentage();
    return 100 - percentage;
  }

  getQualityText(): string {
    switch (this.data.quality) {
      case 'good': return 'Good';
      case 'normal': return 'Normal';
      case 'bad': return 'Bad';
      case 'medium': return 'Medium';
      default: return '';
    }
  }

  getQualityIndicatorColor(level: string, index: number): string {
    const qualityOrder = ['good', 'normal', 'bad'];
    const currentIndex = qualityOrder.indexOf(this.data.quality || 'normal');
    
    if (index <= currentIndex) {
      switch (level) {
        case 'good': return 'bg-green-500';
        case 'normal': return 'bg-yellow-500';
        case 'bad': return 'bg-red-500';
        default: return 'bg-gray-200 dark:bg-gray-600';
      }
    }
    return 'bg-gray-200 dark:bg-gray-600';
  }

  getMaxChartValue(): number {
    if (!this.data.chartData) return 100;
    return Math.max(...this.data.chartData);
  }

  getBarColor(index: number): string {
    const colors = ['bg-blue-400', 'bg-blue-500', 'bg-blue-600'];
    return colors[index % colors.length] || 'bg-blue-500';
  }
}
