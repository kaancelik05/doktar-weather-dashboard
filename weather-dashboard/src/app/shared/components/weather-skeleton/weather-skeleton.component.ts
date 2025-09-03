import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonComponent } from '../skeleton/skeleton.component';

@Component({
  selector: 'app-weather-skeleton',
  standalone: true,
  imports: [CommonModule, SkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Main Weather Card Skeleton -->
      <div class="lg:col-span-3">
        <div class="rounded-2xl p-8 bg-gray-100 min-h-[400px] relative overflow-hidden">
        <!-- Header Skeleton -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center space-x-2">
            <app-skeleton width="20px" height="20px" shape="circle"></app-skeleton>
            <app-skeleton width="120px" height="20px" shape="text"></app-skeleton>
          </div>
          <app-skeleton width="80px" height="16px" shape="text"></app-skeleton>
        </div>

        <!-- Main Temperature Skeleton -->
        <div class="flex items-center justify-between mb-8">
          <div>
            <app-skeleton width="150px" height="80px" className="mb-4"></app-skeleton>
            <app-skeleton width="180px" height="24px" shape="text"></app-skeleton>
          </div>
          <div class="text-right">
            <app-skeleton width="96px" height="96px" shape="circle"></app-skeleton>
          </div>
        </div>

        <!-- Temperature Chart Skeleton -->
        <div class="mb-6">
          <app-skeleton width="80px" height="16px" shape="text" className="mb-3"></app-skeleton>
          <div class="h-20 bg-gray-200 rounded-lg p-3 mb-3 animate-pulse"></div>
          
          <!-- Temperature Labels Grid Skeleton -->
          <div class="grid grid-cols-4 gap-2">
            <div class="text-center" *ngFor="let item of [1,2,3,4]">
              <app-skeleton width="60px" height="12px" shape="text" className="mb-1 mx-auto"></app-skeleton>
              <app-skeleton width="40px" height="16px" shape="text" className="mx-auto"></app-skeleton>
            </div>
          </div>
        </div>

        <!-- Weather Stats Skeleton -->
        <div class="grid grid-cols-3 gap-4">
          <div class="flex items-center space-x-2" *ngFor="let item of [1,2,3]">
            <app-skeleton width="32px" height="32px" shape="circle"></app-skeleton>
            <div>
              <app-skeleton width="60px" height="12px" shape="text" className="mb-1"></app-skeleton>
              <app-skeleton width="50px" height="18px" shape="text"></app-skeleton>
            </div>
          </div>
        </div>

        <!-- Bottom Info Cards Grid Skeleton -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div class="bg-white rounded-xl p-4 shadow-sm" *ngFor="let item of [1,2,3,4]">
            <div class="flex items-center justify-between mb-3">
              <app-skeleton width="40px" height="12px" shape="text"></app-skeleton>
              <app-skeleton width="32px" height="32px" shape="circle"></app-skeleton>
            </div>
            <app-skeleton width="80px" height="12px" shape="text" className="mb-1"></app-skeleton>
            <app-skeleton width="60px" height="32px" shape="text"></app-skeleton>
          </div>
        </div>
        </div>
      </div>

      <!-- Right Sidebar Skeleton -->
      <div class="bg-white rounded-xl p-6 shadow-sm">
        <div class="flex items-center justify-between mb-6">
          <app-skeleton width="80px" height="18px" shape="text"></app-skeleton>
          <div class="flex space-x-1">
            <app-skeleton width="24px" height="24px" shape="circle"></app-skeleton>
            <app-skeleton width="24px" height="24px" shape="circle"></app-skeleton>
          </div>
        </div>
        
        <!-- Weekly Forecast Skeleton -->
        <div class="space-y-4">
          <div class="flex items-center justify-between p-3 rounded-lg" *ngFor="let day of [1,2,3,4,5]">
            <div class="flex items-center space-x-3">
              <app-skeleton width="32px" height="32px" shape="circle"></app-skeleton>
              <div>
                <app-skeleton width="50px" height="16px" shape="text" className="mb-1"></app-skeleton>
                <app-skeleton width="60px" height="14px" shape="text"></app-skeleton>
              </div>
            </div>
            <div class="text-right">
              <app-skeleton width="40px" height="16px" shape="text" className="mb-1"></app-skeleton>
              <app-skeleton width="30px" height="12px" shape="text"></app-skeleton>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class WeatherSkeletonComponent {}
