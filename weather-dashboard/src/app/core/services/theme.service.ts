import { Injectable, effect, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_STORAGE_KEY = 'weather-dashboard-theme';
  
  // Signal to manage current theme
  private readonly _theme = signal<Theme>(this.getInitialTheme());
  
  // Computed signal for public access
  readonly theme = this._theme.asReadonly();

  constructor() {
    // Effect to apply theme changes to document
    effect(() => {
      this.applyTheme(this._theme());
    });
  }

  /**
   * Toggles between light and dark theme
   */
  toggleTheme(): void {
    const newTheme = this._theme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  /**
   * Sets a specific theme
   */
  setTheme(theme: Theme): void {
    this._theme.set(theme);
    this.saveThemeToStorage(theme);
  }

  /**
   * Gets the current theme
   */
  getCurrentTheme(): Theme {
    return this._theme();
  }

  /**
   * Checks if current theme is dark
   */
  isDarkMode(): boolean {
    return this._theme() === 'dark';
  }

  /**
   * Gets the initial theme from storage or system preference
   */
  private getInitialTheme(): Theme {
    // First check localStorage
    const savedTheme = localStorage.getItem(this.THEME_STORAGE_KEY) as Theme;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      return savedTheme;
    }

    // Fall back to system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  }

  /**
   * Applies the theme to the document
   */
  private applyTheme(theme: Theme): void {
    const htmlElement = document.documentElement;
    
    if (theme === 'dark') {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  }

  /**
   * Saves theme preference to localStorage
   */
  private saveThemeToStorage(theme: Theme): void {
    try {
      localStorage.setItem(this.THEME_STORAGE_KEY, theme);
    } catch (error) {
      console.warn('Could not save theme to localStorage:', error);
    }
  }
}
