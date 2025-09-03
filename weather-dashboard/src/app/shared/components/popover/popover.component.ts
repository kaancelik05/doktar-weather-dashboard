import { Component, ChangeDetectionStrategy, signal, input, output, effect, inject, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export interface PopoverItem {
  label: string;
  icon: string;
  route: string;
  description?: string;
}

@Component({
  selector: 'app-popover',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative" #popoverContainer>
      <!-- Custom Trigger Content -->
      <div 
        (click)="togglePopover()"
        (keydown.enter)="togglePopover()"
        (keydown.space)="togglePopover()"
        tabindex="0"
        role="button"
        aria-label="Popover aç/kapa"
        class="relative">
        <ng-content select="[slot=trigger]"></ng-content>
        
        <!-- Notification Badge -->
        <span 
          *ngIf="showBadge()" 
          class="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse"
        >
          {{ badgeCount() }}
        </span>
      </div>

      <!-- Backdrop -->
      <div 
        *ngIf="isOpen()"
        class="fixed inset-0 z-40 bg-black/20 dark:bg-black/40 backdrop-blur-sm"
        (click)="closePopover()"
        (keydown.enter)="closePopover()"
        (keydown.space)="closePopover()"
        tabindex="0"
        role="button"
        aria-label="Popover kapat"
      ></div>

      <!-- Popover Content -->
      <div
        *ngIf="isOpen()"
        [class]="getPopoverClasses()"
        class="absolute z-50 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 transition-colors"
        [style.width]="width()"
      >
        <!-- Header -->
        <div class="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 border-b border-gray-100 dark:border-gray-600">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 dark:text-white text-sm">{{ title() }}</h3>
                <p class="text-xs text-gray-500 dark:text-gray-300">{{ subtitle() }}</p>
              </div>
            </div>
            <button
              (click)="closePopover()"
              class="p-1 hover:bg-white/60 dark:hover:bg-gray-600/60 rounded-lg transition-colors"
              aria-label="Kapat"
            >
              <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Navigation Items -->
        <div class="py-2">
          <div *ngFor="let item of items(); let i = index" class="group">
            <a
              [routerLink]="item.route"
              routerLinkActive="bg-blue-50 border-r-2 border-blue-500"
              (click)="onItemClick(item)"
              class="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 group-hover:pl-6"
              [routerLinkActiveOptions]="{exact: false}"
            >
              <!-- Icon -->
              <div class="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-600 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-100 dark:group-hover:bg-blue-800 transition-colors">
                <div [innerHTML]="getIconSVG(item.icon)"></div>
              </div>
              
              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div 
                  class="font-medium text-gray-900 dark:text-white"
                  [class.text-blue-400]="isRouteActive(item.route)"
                  [class.dark:text-blue-700]="isRouteActive(item.route)"
                >{{ item.label }}</div>
                <div *ngIf="item.description" class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                  {{ item.description }}
                </div>
              </div>
              
              <!-- Arrow -->
              <svg class="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  `,

  styles: [`
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    
    [data-animation="slideIn"] {
      animation: slideIn 0.2s ease-out;
    }
  `]
})
export class PopoverComponent implements OnDestroy {
  // Inputs
  items = input.required<PopoverItem[]>();
  title = input<string>('Navigation');
  subtitle = input<string>('Choose a section');
  position = input<'left' | 'right' | 'center'>('right');
  width = input<string>('320px');
  triggerButtonClass = input<string>('w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors');
  showBadge = input<boolean>(false);
  badgeCount = input<number>(0);

  // Outputs
  itemClicked = output<PopoverItem>();
  opened = output<void>();
  closed = output<void>();

  // State
  isOpen = signal(false);

  // ViewChild for positioning
  @ViewChild('popoverContainer', { static: true }) popoverContainer!: ElementRef;

  private elementRef = inject(ElementRef);
  private sanitizer = inject(DomSanitizer);
  private router = inject(Router);

  constructor() {
    // Close popover when clicking outside
    effect(() => {
      if (this.isOpen()) {
        this.opened.emit();
        setTimeout(() => {
          document.addEventListener('click', this.handleOutsideClick);
        });
      } else {
        this.closed.emit();
        document.removeEventListener('click', this.handleOutsideClick);
      }
    });
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.handleOutsideClick);
  }

  private handleOutsideClick = (event: Event) => {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closePopover();
    }
  };

  togglePopover(): void {
    this.isOpen.set(!this.isOpen());
  }

  closePopover(): void {
    this.isOpen.set(false);
  }

  onItemClick(item: PopoverItem): void {
    this.itemClicked.emit(item);
    this.closePopover();
  }

  getPopoverClasses(): string {
    const baseClasses = 'animate-in fade-in slide-in-from-top-2 duration-200';
    
    switch (this.position()) {
      case 'left':
        return `${baseClasses} right-0 origin-top-right`;
      case 'center':
        return `${baseClasses} left-1/2 transform -translate-x-1/2 origin-top`;
      case 'right':
      default:
        return `${baseClasses} right-0 origin-top-right`;
    }
  }

  getIconSVG(iconName: string): SafeHtml {
    const iconMap: Record<string, string> = {
      dashboard: `
        <svg class="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7" />
        </svg>
      `,
      favorites: `
        <svg class="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      `,
      settings: `
        <svg class="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      `,
      weather: `
        <svg class="w-4 h-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      `
    };

    const svgContent = iconMap[iconName] || iconMap['dashboard'];
    return this.sanitizer.bypassSecurityTrustHtml(svgContent);
  }

  getCurrentTime(): string {
    return new Date().toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  isRouteActive(route: string): boolean {
    return this.router.url === route || this.router.url.startsWith(route + '/');
  }
}
