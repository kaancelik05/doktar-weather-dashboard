import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastComponent, PopoverComponent, PopoverItem } from './shared/components';
import { WeatherStateService } from './core/services/weather-state.service';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ToastComponent, PopoverComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <!-- Header -->
      <header class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 transition-colors duration-300">
        <div class="px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <!-- Left Section: Logo and Brand -->
            <div class="flex items-center space-x-4">
              <div class="flex items-center space-x-3 cursor-pointer" role="link" tabindex="0" (click)="navigateToDashboard()" (keyup.enter)="navigateToDashboard()">
                <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                </div>
                <div class="hidden sm:block">
                  <h1 class="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Weather Dashboard</h1>
                </div>
              </div>
            </div>

            <!-- Right Section: Actions and Navigation -->
            <div class="flex items-center space-x-3">

              <!-- Unit Toggle (C/F) -->
              <button 
                (click)="toggleUnit()"
                class="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors group"
                [title]="getUnitToggleTitle()"
                aria-label="Change temperature unit"
              >
                <div class="flex items-center space-x-1">
                  <span class="text-sm font-medium transition-colors duration-200"
                        [class.text-blue-600]="weatherState.settings().unit === 'metric'"
                        [class.text-gray-400]="weatherState.settings().unit !== 'metric'"
                        [class.font-bold]="weatherState.settings().unit === 'metric'">°C</span>
                  
                  <!-- Toggle Icon - Hidden on small screens to save space -->
                  <svg class="hidden sm:block w-4 h-4 transition-transform duration-200 group-hover:scale-110" 
                       fill="none" 
                       viewBox="0 0 24 24" 
                       stroke="currentColor">
                    <path stroke-linecap="round" 
                          stroke-linejoin="round" 
                          stroke-width="2" 
                          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  
                  <!-- Separator for mobile -->
                  <span class="text-gray-300 sm:hidden">|</span>
                  
                  <span class="text-sm font-medium transition-colors duration-200"
                        [class.text-blue-600]="weatherState.settings().unit === 'imperial'"
                        [class.text-gray-400]="weatherState.settings().unit !== 'imperial'"
                        [class.font-bold]="weatherState.settings().unit === 'imperial'">°F</span>
                </div>
              </button>

              <!-- Theme Toggle -->
              <button 
                (click)="toggleTheme()"
                class="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                [title]="getThemeToggleTitle()"
                aria-label="Toggle theme"
              >
                <!-- Light Mode Icon (shown in dark mode) -->
                <svg *ngIf="themeService.isDarkMode()" 
                     class="w-5 h-5" 
                     fill="none" 
                     viewBox="0 0 24 24" 
                     stroke="currentColor">
                  <path stroke-linecap="round" 
                        stroke-linejoin="round" 
                        stroke-width="2" 
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <!-- Dark Mode Icon (shown in light mode) -->
                <svg *ngIf="!themeService.isDarkMode()" 
                     class="w-5 h-5" 
                     fill="none" 
                     viewBox="0 0 24 24" 
                     stroke="currentColor">
                  <path stroke-linecap="round" 
                        stroke-linejoin="round" 
                        stroke-width="2" 
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </button>

              <!-- Navigation Popover -->
              <app-popover
                [items]="navigationItems"
                title="Navigation"
                subtitle="Navigate between pages"
                position="right"
                width="min(400px, 90vw)"
                [showBadge]="false"
                triggerButtonClass=""
                (itemClicked)="onNavigationItemClicked($event)"
              >
                <div slot="trigger" class="flex items-center space-x-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer">
                  <svg class="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <span class="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200">Menu</span>
                </div>
              </app-popover>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content Area -->
      <main class="flex-1">
        <router-outlet></router-outlet>
      </main>
    </div>
    
    <!-- Toast Notifications -->
    <app-toast></app-toast>
  `
})
export class AppComponent {
  title = 'weather-dashboard';
  weatherState = inject(WeatherStateService);
  themeService = inject(ThemeService);
  private readonly router: Router = inject(Router);

  // Navigation items for the popover
  navigationItems: PopoverItem[] = [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard',
      description: 'Main page and weather overview'
    },
    {
      label: 'Favorites',
      icon: 'favorites',
      route: '/favorites',
      description: 'Saved cities and quick access'
    },
    {
      label: 'Settings',
      icon: 'settings',
      route: '/settings',
      description: 'Application preferences and configuration'
    }
  ];

  onNavigationItemClicked(item: PopoverItem): void {
    // Router navigation is handled automatically by routerLink
    console.log('Navigation item clicked:', item.label);
  }

  toggleUnit(): void {
    const currentUnit = this.weatherState.settings().unit;
    const newUnit = currentUnit === 'metric' ? 'imperial' : 'metric';
    this.weatherState.setUnit(newUnit);
  }

  getUnitToggleTitle(): string {
    return this.weatherState.settings().unit === 'metric' 
      ? 'Fahrenheit' 
      : 'Celsius';
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  getThemeToggleTitle(): string {
    return this.themeService.isDarkMode() 
      ? 'Açık temaya geç' 
      : 'Koyu temaya geç';
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
