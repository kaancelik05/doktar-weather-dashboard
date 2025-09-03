# Weather Dashboard - Technical Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Project Structure](#project-structure)
5. [Development Standards](#development-standards)
6. [API Integration](#api-integration)
7. [State Management](#state-management)
8. [Component Architecture](#component-architecture)
9. [Testing Strategy](#testing-strategy)
10. [Performance Optimization](#performance-optimization)
11. [Build Configuration](#build-configuration)
12. [Development Workflow](#development-workflow)
13. [Deployment](#deployment)
14. [Security](#security)
15. [Accessibility](#accessibility)

## Project Overview

**Weather Dashboard** is a modern, responsive web application built with Angular 18 that provides real-time weather information and forecasts. The application features automatic location detection, favorite cities management, unit conversion, and a modern responsive UI.

### Key Features
- **Real-time Weather Data**: OpenWeatherMap API integration
- **5-Day Forecast**: Detailed weather predictions
- **Geolocation Support**: Automatic location detection
- **Favorites Management**: Save and manage favorite cities
- **Unit Conversion**: Celsius/Fahrenheit switching
- **Responsive Design**: Mobile-first approach
- **Dark Mode Support**: Theme switching capability
- **Modern UI**: TailwindCSS with custom design system

## Technology Stack

### Core Framework
- **Angular 18.2.0**: Latest stable version with standalone components
- **TypeScript 5.5.2**: Strict mode enabled for type safety
- **Node.js 20.17.0+**: Runtime environment
- **npm 8+**: Package manager

### UI Framework & Styling
- **TailwindCSS 3.4.17**: Utility-first CSS framework
- **@tailwindcss/typography 0.5.16**: Typography plugin
- **PostCSS 8.5.6**: CSS processing
- **Autoprefixer 10.4.21**: CSS vendor prefixing

### Charting & Visualization
- **Chart.js 4.5.0**: Canvas-based charting library
- **chartjs-plugin-datalabels 2.2.0**: Data label plugin

### Development Tools
- **Angular CLI 18.2.20**: Development tooling
- **ESLint 9.33.0**: Code linting
- **angular-eslint 20.2.0**: Angular-specific linting rules
- **TypeScript ESLint 8.40.0**: TypeScript linting integration

### Testing Framework
- **Jasmine 5.2.0**: Testing framework
- **Karma 6.4.0**: Test runner
- **@angular/testing**: Angular testing utilities

### Browser Support
- **Zone.js 0.14.10**: Change detection polyfill
- **Modern browsers**: ES2022 target support

## Architecture

### Architectural Patterns

#### 1. Clean Architecture
The project follows clean architecture principles with clear separation of concerns:

```
┌─────────────────────────────────────┐
│            Presentation Layer       │
│         (Components & UI)           │
├─────────────────────────────────────┤
│            Business Layer           │
│          (Services & Logic)         │
├─────────────────────────────────────┤
│             Data Layer              │
│        (Models & Interfaces)        │
└─────────────────────────────────────┘
```

#### 2. Reactive Programming
- **Angular Signals**: Modern reactive state management
- **RxJS**: For HTTP operations and async data streams
- **OnPush Change Detection**: Performance-optimized change detection

#### 3. Component-Based Architecture
- **Standalone Components**: No NgModules required
- **Feature-Based Organization**: Grouped by functionality
- **Shared Components**: Reusable UI components
- **Smart/Dumb Component Pattern**: Clear separation of concerns

## Project Structure

```
src/app/
├── core/                           # Core business logic
│   ├── config/                     # Configuration files
│   │   └── api-setup.md           # API documentation
│   ├── interceptors/              # HTTP interceptors
│   │   └── error.interceptor.ts   # Global error handling
│   ├── models/                    # TypeScript interfaces
│   │   ├── index.ts               # Barrel exports
│   │   └── weather.model.ts       # Weather data models
│   └── services/                  # Business services
│       ├── city-search.service.ts # City search functionality
│       ├── error-handler.service.ts # Error management
│       ├── geolocation.service.ts # Location services
│       ├── theme.service.ts       # Theme management
│       ├── toast.service.ts       # Notification system
│       ├── weather-state.service.ts # Global state management
│       └── weather.service.ts     # API communication
├── features/                      # Feature modules
│   ├── dashboard/                 # Main dashboard
│   │   ├── components/           # Dashboard-specific components
│   │   │   ├── five-day-forecast/
│   │   │   ├── main-weather-card/
│   │   │   ├── page-header/
│   │   │   ├── sunrise-sunset-card/
│   │   │   └── weather-stats/
│   │   └── dashboard.component.ts
│   ├── favorites/                 # Favorites management
│   ├── settings/                  # Application settings
│   └── weather/                   # Weather components
├── shared/                        # Shared components
│   ├── components/               # Reusable UI components
│   │   ├── button/
│   │   ├── card/
│   │   ├── confirm-dialog/
│   │   ├── loader/
│   │   ├── popover/
│   │   ├── skeleton/
│   │   ├── smart-search-input/
│   │   ├── temperature-chart/
│   │   ├── toast/
│   │   ├── weather-info-card/
│   │   └── weather-skeleton/
│   ├── directives/               # Custom directives
│   └── pipes/                    # Custom pipes
└── environments/                 # Environment configurations
    ├── environment.ts            # Development environment
    └── environment.prod.ts       # Production environment
```

## Development Standards

### Coding Conventions

#### 1. Angular Style Guide Compliance
- **Component Prefix**: All components use `app-` prefix
- **File Naming**: kebab-case for components, camelCase for services
- **Component Selectors**: `app-component-name` format
- **Directive Selectors**: `app` prefix with camelCase

#### 2. TypeScript Standards
```typescript
// Strict configuration enabled
{
  "strict": true,
  "noImplicitOverride": true,
  "noPropertyAccessFromIndexSignature": true,
  "noImplicitReturns": true,
  "noFallthroughCasesInSwitch": true,
  "strictInjectionParameters": true,
  "strictInputAccessModifiers": true,
  "strictTemplates": true
}
```

#### 3. Component Architecture
```typescript
@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CommonModule, /* other imports */],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<!-- inline template -->`,
  // or templateUrl: './example.component.html',
  // styleUrl: './example.component.css'
})
export class ExampleComponent {
  // Public properties and methods
  
  private injectedService = inject(SomeService);
  
  // Lifecycle hooks
  ngOnInit(): void {
    // Implementation
  }
}
```

#### 4. Service Architecture
```typescript
@Injectable({
  providedIn: 'root'
})
export class ExampleService {
  private readonly API_URL = 'https://api.example.com';
  
  private http = inject(HttpClient);
  
  // Public methods with proper return types
  getData(): Observable<DataType> {
    return this.http.get<DataType>(`${this.API_URL}/data`);
  }
}
```

### ESLint Configuration
```javascript
// eslint.config.js
module.exports = tseslint.config(
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/directive-selector": ["error", {
        type: "attribute",
        prefix: "app",
        style: "camelCase",
      }],
      "@angular-eslint/component-selector": ["error", {
        type: "element", 
        prefix: "app",
        style: "kebab-case",
      }],
    },
  }
);
```

## API Integration

### OpenWeatherMap API

#### Configuration
```typescript
// environment.ts
export const environment = {
  production: false,
  openWeatherMapApiKey: 'YOUR_API_KEY',
  geodb: {
    apiKey: 'YOUR_GEODB_API_KEY',
    baseUrl: 'https://wft-geo-db.p.rapidapi.com/v1/geo',
    host: 'wft-geo-db.p.rapidapi.com'
  }
};
```

#### Endpoints Used
- **Current Weather**: `GET /weather?q={city}&appid={apikey}&units={units}`
- **5-Day Forecast**: `GET /forecast?q={city}&appid={apikey}&units={units}`
- **By Coordinates**: `GET /weather?lat={lat}&lon={lon}&appid={apikey}&units={units}`

#### Rate Limiting
- **Free Tier**: 60 calls/minute, 1,000 calls/day
- **Error Handling**: Implemented in `error.interceptor.ts`
- **Caching**: Local storage for reduced API calls

### HTTP Interceptors

#### Error Interceptor
```typescript
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Global error handling logic
        return throwError(() => error);
      })
    );
  }
}
```

## State Management

### Angular Signals Implementation

#### WeatherStateService Architecture
```typescript
@Injectable({ providedIn: 'root' })
export class WeatherStateService {
  // Private signals (writable)
  private _currentWeather = signal<CurrentWeather | null>(null);
  private _forecast = signal<ForecastData | null>(null);
  private _favorites = signal<FavoriteCity[]>([]);
  private _settings = signal<WeatherSettings>({
    unit: 'metric',
    defaultCity: 'Istanbul'
  });
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  // Public readonly signals
  readonly currentWeather = this._currentWeather.asReadonly();
  readonly forecast = this._forecast.asReadonly();
  readonly favorites = this._favorites.asReadonly();
  readonly settings = this._settings.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  // Computed signals
  readonly currentTemperature = computed(() => {
    const weather = this._currentWeather();
    if (!weather) return null;
    const unit = this._settings().unit;
    return `${Math.round(weather.main.temp)}°${unit === 'metric' ? 'C' : 'F'}`;
  });

  readonly dailyForecast = computed(() => {
    // Complex forecast processing logic
  });
}
```

#### Benefits of Signals
- **Performance**: Automatic fine-grained reactivity
- **Simplicity**: No subscriptions needed in templates
- **Type Safety**: Full TypeScript support
- **Computed Values**: Efficient derived state
- **Predictable Updates**: Clear state mutation patterns

### Local Storage Integration
```typescript
// Persistent state management
private saveSettingsToStorage(settings: WeatherSettings): void {
  try {
    localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.warn('Error saving settings:', error);
  }
}

private loadSettingsFromStorage(): WeatherSettings {
  try {
    const stored = localStorage.getItem(this.STORAGE_KEYS.SETTINGS);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Error loading settings:', error);
  }
  return { unit: 'metric', defaultCity: 'Istanbul' };
}
```

## Component Architecture

### Component Hierarchy

#### Dashboard Component (Smart Component)
```typescript
@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    WeatherSkeletonComponent,
    PageHeaderComponent,
    MainWeatherCardComponent,
    WeatherStatsComponent,
    FiveDayForecastComponent,
    SunriseSunsetCardComponent
  ]
})
export class DashboardComponent implements OnInit {
  weatherState = inject(WeatherStateService);
  
  // Component logic focusing on orchestration
}
```

#### Presentational Components (Dumb Components)
```typescript
@Component({
  selector: 'app-main-weather-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TemperatureChartComponent]
})
export class MainWeatherCardComponent {
  @Input() currentWeather: CurrentWeather | null = null;
  @Input() weatherIcon = '';
  @Input() weatherCondition = '';
  @Input() dailyTemperatures: DailyTemperatures | null = null;
  @Input() settings: WeatherSettings = { unit: 'metric', defaultCity: 'Istanbul' };

  // Pure presentation logic only
}
```

### Component Communication Patterns

1. **Parent-Child**: Input/Output properties
2. **Service Injection**: Shared state through services
3. **Signal Propagation**: Reactive updates via signals

### UI Component Library

#### Reusable Components
- **ButtonComponent**: Standardized button with variants
- **CardComponent**: Consistent card layout
- **LoaderComponent**: Loading states
- **ToastComponent**: Notification system
- **SkeletonComponent**: Loading placeholders

## Testing Strategy

### Unit Testing Setup

#### Test Configuration
```typescript
// Component Test Example
describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockWeatherService: MockWeatherStateService;

  beforeEach(async () => {
    mockWeatherService = new MockWeatherStateService();

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, HttpClientTestingModule],
      providers: [
        { provide: WeatherStateService, useValue: mockWeatherService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });
});
```

#### Testing Patterns
- **Component Testing**: Isolated component behavior
- **Service Testing**: Business logic validation
- **Integration Testing**: Component-service interaction
- **Mock Strategy**: Dependency injection with test doubles

### Test Coverage Areas
- Component creation and initialization
- User interaction handling
- State management operations
- API integration points
- Error handling scenarios
- Loading states
- Responsive behavior

## Performance Optimization

### Change Detection Strategy
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
```
- **OnPush Strategy**: All components use OnPush for optimal performance
- **Signal Integration**: Automatic fine-grained updates
- **Immutable State**: Signals ensure immutable state updates

### Bundle Optimization
```json
{
  "budgets": [
    {
      "type": "initial",
      "maximumWarning": "500kB",
      "maximumError": "1MB"
    },
    {
      "type": "anyComponentStyle",
      "maximumWarning": "2kB",
      "maximumError": "4kB"
    }
  ]
}
```

### Loading Strategies
- **Skeleton Loading**: Visual loading states
- **Progressive Loading**: Prioritized content loading
- **Image Optimization**: Lazy loading for weather icons
- **Caching**: Local storage for API responses

## Build Configuration

### Angular Configuration (angular.json)
```json
{
  "build": {
    "builder": "@angular-devkit/build-angular:application",
    "options": {
      "outputPath": "dist/weather-dashboard",
      "index": "src/index.html",
      "browser": "src/main.ts",
      "polyfills": ["zone.js"],
      "tsConfig": "tsconfig.app.json",
      "assets": [{"glob": "**/*", "input": "public"}],
      "styles": ["src/styles.css"],
      "scripts": []
    }
  }
}
```

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "lib": ["ES2022", "dom"],
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### TailwindCSS Configuration
```javascript
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        }
      },
      fontFamily: {
        sans: ['Urbanist', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      }
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
```

## Development Workflow

### Scripts
```json
{
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build",
    "watch": "ng build --watch --configuration development",
    "test": "ng test",
    "lint": "ng lint"
  }
}
```

### Development Server
- **Port**: 4200 (default)
- **Hot Reload**: Enabled for development
- **Source Maps**: Enabled for debugging
- **Live Reload**: Automatic browser refresh

### Git Workflow
- **Branch Strategy**: Feature branches
- **Commit Convention**: Conventional commits
- **Code Review**: Required before merge
- **CI/CD**: Automated testing and deployment

## Deployment

### Production Build
```bash
npm run build --prod
```

### Build Outputs
- **Optimized Bundle**: Minified and compressed
- **Hash-based Caching**: File versioning
- **Tree Shaking**: Unused code elimination
- **Ahead-of-Time Compilation**: Pre-compiled templates

### Environment Configuration
```typescript
// environment.prod.ts
export const environment = {
  production: true,
  openWeatherMapApiKey: process.env['OPENWEATHER_API_KEY'],
  geodb: {
    apiKey: process.env['GEODB_API_KEY'],
    baseUrl: 'https://wft-geo-db.p.rapidapi.com/v1/geo',
    host: 'wft-geo-db.p.rapidapi.com'
  }
};
```

### Hosting Requirements
- **HTTPS**: Required for geolocation API
- **Static Hosting**: Single Page Application
- **Browser Support**: Modern browsers (ES2022)
- **CDN**: Recommended for global distribution

## Security

### API Security
- **Environment Variables**: Secure API key storage
- **HTTPS Only**: All API communications encrypted
- **Rate Limiting**: Client-side request throttling
- **Error Handling**: No sensitive data exposure

### Content Security
- **XSS Prevention**: Angular's built-in sanitization
- **Safe Navigation**: Null-safe property access
- **Input Validation**: Type-safe interfaces
- **CORS Handling**: Proper cross-origin configuration

### Data Privacy
- **Local Storage**: User preferences only
- **No Personal Data**: Location data not stored
- **Cache Management**: Automatic cleanup
- **User Consent**: Geolocation permission handling

## Accessibility

### WCAG 2.1 AA Compliance
- **Semantic HTML**: Proper element usage
- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: Full keyboard accessibility
- **Color Contrast**: Minimum 4.5:1 ratio
- **Focus Management**: Visible focus indicators

### Implementation Features
```html
<!-- Example of accessible components -->
<button
  [attr.aria-label]="weatherState.isFavorite() ? 'Remove from favorites' : 'Add to favorites'"
  [attr.aria-pressed]="weatherState.isFavorite()"
  class="focus:ring-2 focus:ring-blue-500"
>
  <!-- Button content -->
</button>
```

### Responsive Design
- **Mobile First**: Mobile-optimized design
- **Breakpoints**: 768px (tablet), 1024px (desktop)
- **Touch Targets**: Minimum 44px touch areas
- **Flexible Layouts**: CSS Grid and Flexbox

---

## Conclusion

This technical documentation provides a comprehensive overview of the Weather Dashboard application's architecture, technologies, and development practices. The application demonstrates modern Angular development patterns with a focus on performance, maintainability, and user experience.

For additional information or questions about specific implementation details, please refer to the inline code documentation or contact the development team.
