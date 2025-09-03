import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private _toasts = signal<ToastMessage[]>([]);
  readonly toasts = this._toasts.asReadonly();

  private readonly DEFAULT_DURATION = 5000;

  success(title: string, message?: string, duration?: number): void {
    this.addToast({
      type: 'success',
      title,
      message,
      duration
    });
  }

  error(title: string, message?: string, persistent = false): void {
    this.addToast({
      type: 'error',
      title,
      message,
      persistent,
      duration: persistent ? undefined : 7000
    });
  }

  warning(title: string, message?: string, duration?: number): void {
    this.addToast({
      type: 'warning',
      title,
      message,
      duration
    });
  }

  info(title: string, message?: string, duration?: number): void {
    this.addToast({
      type: 'info',
      title,
      message,
      duration
    });
  }

  remove(id: string): void {
    const currentToasts = this._toasts();
    this._toasts.set(currentToasts.filter(toast => toast.id !== id));
  }

  clear(): void {
    this._toasts.set([]);
  }

  private addToast(toast: Omit<ToastMessage, 'id'>): void {
    const id = this.generateId();
    const newToast: ToastMessage = {
      ...toast,
      id,
      duration: toast.duration || this.DEFAULT_DURATION
    };

    const currentToasts = this._toasts();
    this._toasts.set([...currentToasts, newToast]);

    // Auto remove after duration (unless persistent)
    if (!toast.persistent && newToast.duration) {
      setTimeout(() => {
        this.remove(id);
      }, newToast.duration);
    }
  }

  private generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
