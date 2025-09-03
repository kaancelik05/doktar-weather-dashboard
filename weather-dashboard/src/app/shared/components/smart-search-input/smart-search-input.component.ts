import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil, of } from 'rxjs';
import { CitySearchService, CitySearchResult } from '../../../core/services/city-search.service';

export interface SearchSuggestion {
  name: string;
  isPopular?: boolean;
  country?: string;
  countryCode?: string;
  displayText?: string;
}

@Component({
  selector: 'app-smart-search-input',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center space-x-3">
      <div class="relative flex-1">
        <input
          #searchInput
          type="text"
          [placeholder]="placeholder"
          class="w-full px-4 py-2 pl-10 pr-4 border border-secondary-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-300"
          [value]="searchQuery()"
          (input)="onSearchInput($event)"
          (keydown)="onKeyDown($event, searchInput)"
          (focus)="showSuggestions.set(true)"
          (blur)="onInputBlur()"
          [disabled]="disabled"
          autocomplete="off"
        />
        
        <!-- Search Icon -->
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-secondary-400 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <!-- Clear Search Icon -->
        <button
          *ngIf="searchQuery()"
          type="button"
          class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
          (click)="clearSearch(searchInput)"
          (keydown.enter)="clearSearch(searchInput)"
          (keydown.space)="clearSearch(searchInput)"
          title="Aramayı temizle"
          aria-label="Aramayı temizle"
        >
          <svg class="h-5 w-5 text-secondary-400 dark:text-gray-400 hover:text-secondary-600 dark:hover:text-gray-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Search Suggestions Dropdown -->
      <div 
        *ngIf="showSuggestions() && (filteredSuggestions().length > 0 || (searchQuery() && searchQuery().length > 0 && searchQuery().length < 3))"
        class="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-secondary-200 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto transition-colors duration-300"
      >
        <div class="p-2">
          <div *ngIf="!searchQuery() || searchQuery().length < 3" class="text-xs text-secondary-500 dark:text-gray-400 mb-2 px-2">
            <span *ngIf="!searchQuery()">Popular cities:</span>
            <span *ngIf="searchQuery() && searchQuery().length > 0 && searchQuery().length < 3" class="text-amber-600 dark:text-amber-400">
              Type at least 3 characters to search cities...
            </span>
          </div>
          <div *ngIf="searchQuery() && searchQuery().length >= 3" class="text-xs text-secondary-500 dark:text-gray-400 mb-2 px-2">
            Suggestions for "{{ searchQuery() }}":
            <span *ngIf="searchLoading()" class="ml-2 text-primary-500 dark:text-primary-400">Loading...</span>
          </div>
          
          <button
            *ngFor="let suggestion of filteredSuggestions(); let i = index; trackBy: trackBySuggestion"
            (mousedown)="selectSuggestion(suggestion)"
            [class]="'w-full text-left px-3 py-2 rounded-md text-sm transition-colors ' + 
              (selectedSuggestionIndex() === i ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : 'hover:bg-secondary-50 dark:hover:bg-gray-700 text-secondary-700 dark:text-gray-200')"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <svg class="w-4 h-4 text-secondary-400 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div class="flex flex-col">
                  <span class="font-medium">{{ suggestion.name }}</span>
                  <span *ngIf="suggestion.country" class="text-xs text-secondary-500 dark:text-gray-400">{{ suggestion.country }}</span>
                </div>
              </div>
              <div *ngIf="suggestion.isPopular" class="flex items-center">
                <svg class="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              </div>
            </div>
          </button>
          
          <div *ngIf="filteredSuggestions().length === 0" class="px-3 py-2 text-sm text-secondary-500 dark:text-gray-400">
            No cities found
          </div>
        </div>
        </div>
      </div>
      
      <!-- Action Button Slot -->
      <div *ngIf="showActionButton" class="flex-shrink-0">
        <ng-content select="[slot=action-button]"></ng-content>
      </div>
    </div>
  `
})
export class SmartSearchInputComponent implements OnDestroy {
  @Input() placeholder = 'Search city...';
  @Input() disabled = false;
  @Input() showActionButton = false;
  @Input() inputClasses = 'w-full px-4 py-2 pl-10 pr-4 border border-secondary-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-300';

  @Output() citySelected = new EventEmitter<string>();
  @Output() searchQueryChanged = new EventEmitter<string>();

  // Services
  private citySearchService = inject(CitySearchService);
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  // Search suggestions state
  searchQuery = signal('');
  showSuggestions = signal(false);
  selectedSuggestionIndex = signal(-1);
  apiCities = signal<CitySearchResult[]>([]);
  searchLoading = signal(false);

  // Popular cities list
  readonly popularCities = [
    'Istanbul', 'London', 'New York', 'Tokyo', 'Paris',
    'Berlin', 'Madrid', 'Rome', 'Barcelona', 'Amsterdam',
    'Vienna', 'Prague', 'Budapest', 'Warsaw', 'Stockholm',
    'Copenhagen', 'Helsinki', 'Oslo', 'Dublin', 'Lisbon'
  ];

  // Combined suggestions: popular cities + API results
  filteredSuggestions = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const apiResults = this.apiCities();
    
    if (!query || query.length < 3) {
      // Show popular cities when no query or query too short
      return this.popularCities
        .slice(0, 6)
        .map(city => ({ 
          name: city, 
          isPopular: true, 
          country: '', 
          countryCode: '',
          displayText: city
        }));
    }
    
    // Combine API results with filtered popular cities
    const popularMatches = this.popularCities
      .filter(city => city.toLowerCase().includes(query))
      .map(city => ({ 
        name: city, 
        isPopular: true, 
        country: '', 
        countryCode: '',
        displayText: city
      }));

    const apiMatches = apiResults.map(city => ({
      name: city.name,
      isPopular: false,
      country: city.country,
      countryCode: city.countryCode,
      displayText: `${city.name}, ${city.country}`
    }));

    // Combine and deduplicate, prioritize popular cities
    const combined = [...popularMatches, ...apiMatches];
    const unique = combined.filter((city, index, arr) => 
      arr.findIndex(c => c.name.toLowerCase() === city.name.toLowerCase()) === index
    );

    return unique.slice(0, 8); // Show max 8 suggestions
  });

  constructor() {
    // Setup debounced API search
    this.searchSubject.pipe(
      debounceTime(700),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query || query.length < 3) {
          this.apiCities.set([]);
          this.searchLoading.set(false);
          return of([]);
        }
        
        this.searchLoading.set(true);
        return this.citySearchService.searchCities(query, 6);
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (cities) => {
        this.apiCities.set(cities);
        this.searchLoading.set(false);
      },
      error: (error: unknown) => {
        console.warn('City search error:', error);
        this.apiCities.set([]);
        this.searchLoading.set(false);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const query = target.value;
    this.searchQuery.set(query);
    this.selectedSuggestionIndex.set(-1);
    this.showSuggestions.set(true);
    
    // Emit search query change
    this.searchQueryChanged.emit(query);
    
    // Trigger API search with debouncing
    this.searchSubject.next(query);
  }

  onKeyDown(event: KeyboardEvent, inputElement: HTMLInputElement): void {
    const suggestions = this.filteredSuggestions();
    const currentIndex = this.selectedSuggestionIndex();

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        const nextIndex = currentIndex < suggestions.length - 1 ? currentIndex + 1 : 0;
        this.selectedSuggestionIndex.set(nextIndex);
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : suggestions.length - 1;
        this.selectedSuggestionIndex.set(prevIndex);
        break;
      }
      case 'Enter':
        event.preventDefault();
        if (currentIndex >= 0 && suggestions[currentIndex]) {
          this.selectSuggestion(suggestions[currentIndex]);
        } else if (this.searchQuery().trim()) {
          this.citySelected.emit(this.searchQuery().trim());
        }
        break;
      case 'Escape':
        this.showSuggestions.set(false);
        this.selectedSuggestionIndex.set(-1);
        inputElement.blur();
        break;
    }
  }

  onInputBlur(): void {
    // Delay hiding suggestions to allow click events on suggestions
    setTimeout(() => {
      this.showSuggestions.set(false);
      this.selectedSuggestionIndex.set(-1);
    }, 200);
  }

  selectSuggestion(suggestion: SearchSuggestion): void {
    const cityName = suggestion.name;
    this.searchQuery.set(cityName);
    this.showSuggestions.set(false);
    this.selectedSuggestionIndex.set(-1);
    this.citySelected.emit(cityName);
  }

  clearSearch(searchInput?: HTMLInputElement): void {
    this.searchQuery.set('');
    this.showSuggestions.set(false);
    this.selectedSuggestionIndex.set(-1);
    this.apiCities.set([]);
    this.searchLoading.set(false);

    // Emit empty search query change
    this.searchQueryChanged.emit('');

    // Keep focus on input if element is provided
    if (searchInput) {
      setTimeout(() => {
        searchInput.focus();
      }, 0);
    }
  }

  // Public method to set search query programmatically
  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }

  trackBySuggestion(index: number, suggestion: SearchSuggestion): string {
    return suggestion.name + (suggestion.country || '');
  }
}
