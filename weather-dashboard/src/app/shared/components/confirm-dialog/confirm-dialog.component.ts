import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div 
      class="fixed inset-0 z-50 overflow-y-auto"
      [class.hidden]="!isOpen()"
      tabindex="0"
      (click)="onBackdropClick($event)"
      (keydown.escape)="onCancel()"
      (keydown.enter)="onCancel()"
      (keydown.space)="onCancel()"
    >
      <!-- Backdrop -->
      <div 
        class="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
        [class.opacity-0]="!isOpen()"
        [class.opacity-100]="isOpen()"
      ></div>

      <!-- Dialog -->
      <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div 
          class="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all duration-300 sm:my-8 sm:w-full sm:max-w-lg sm:p-6"
          [class.scale-95]="!isOpen()"
          [class.scale-100]="isOpen()"
          [class.opacity-0]="!isOpen()"
          [class.opacity-100]="isOpen()"
          role="dialog"
          [attr.aria-modal]="true"
          [attr.aria-labelledby]="'dialog-title'"
          [attr.aria-describedby]="'dialog-description'"
          tabindex="0"
          (click)="$event.stopPropagation()"
          (keydown.enter)="$event.stopPropagation()"
          (keydown.space)="$event.stopPropagation()"
        >
          <!-- Icon -->
          <div class="sm:flex sm:items-start">
            <div 
              class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10"
              [ngClass]="getIconClasses()"
            >
              <!-- Warning Icon -->
              <svg 
                *ngIf="data().type === 'warning'"
                class="h-6 w-6"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke-width="1.5" 
                stroke="currentColor"
              >
                <path 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" 
                />
              </svg>
              
              <!-- Danger Icon -->
              <svg 
                *ngIf="data().type === 'danger'"
                class="h-6 w-6"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke-width="1.5" 
                stroke="currentColor"
              >
                <path 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" 
                />
              </svg>

              <!-- Info Icon -->
              <svg 
                *ngIf="data().type === 'info' || !data().type"
                class="h-6 w-6"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke-width="1.5" 
                stroke="currentColor"
              >
                <path 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" 
                />
              </svg>
            </div>

            <!-- Content -->
            <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
              <h3 id="dialog-title" class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                {{ data().title }}
              </h3>
              <div class="mt-2">
                <p id="dialog-description" class="text-sm text-gray-500 dark:text-gray-400">
                  {{ data().message }}
                </p>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <app-button
              [variant]="getConfirmButtonVariant()"
              [size]="'sm'"
              class="w-full sm:ml-3 sm:w-auto"
              (click)="onConfirm()"
            >
              {{ data().confirmText || 'Confirm' }}
            </app-button>
            
            <app-button
              variant="outline"
              [size]="'sm'"
              class="mt-3 w-full sm:mt-0 sm:w-auto"
              (click)="onCancel()"
            >
              {{ data().cancelText || 'Cancel' }}
            </app-button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ConfirmDialogComponent {
  // Inputs
  isOpen = input<boolean>(false);
  data = input.required<ConfirmDialogData>();
  
  // Outputs
  confirmed = output<void>();
  cancelled = output<void>();
  closed = output<void>();

  getIconClasses(): string {
    const type = this.data().type || 'info';
    
    switch (type) {
      case 'warning':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400';
      case 'danger':
        return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
      case 'info':
      default:
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
    }
  }

  getConfirmButtonVariant(): 'primary' | 'warning' | 'danger' {
    const type = this.data().type || 'info';
    
    switch (type) {
      case 'warning':
        return 'warning';
      case 'danger':
        return 'danger';
      case 'info':
      default:
        return 'primary';
    }
  }

  onConfirm(): void {
    this.confirmed.emit();
    this.closed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }
}
