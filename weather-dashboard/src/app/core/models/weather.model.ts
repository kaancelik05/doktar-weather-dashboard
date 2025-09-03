export interface WeatherData {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface MainWeatherInfo {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
  sea_level?: number;
  grnd_level?: number;
}

export interface WindInfo {
  speed: number;
  deg: number;
  gust?: number;
}

export interface CloudsInfo {
  all: number;
}

export interface RainInfo {
  '1h'?: number;
  '3h'?: number;
}

export interface SnowInfo {
  '1h'?: number;
  '3h'?: number;
}

export interface SystemInfo {
  type?: number;
  id?: number;
  country: string;
  sunrise: number;
  sunset: number;
}

export interface Coordinates {
  lon: number;
  lat: number;
}

export interface CurrentWeather {
  coord: Coordinates;
  weather: WeatherData[];
  base: string;
  main: MainWeatherInfo;
  visibility: number;
  wind: WindInfo;
  clouds: CloudsInfo;
  rain?: RainInfo;
  snow?: SnowInfo;
  dt: number;
  sys: SystemInfo;
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

export interface ForecastItem {
  dt: number;
  main: MainWeatherInfo;
  weather: WeatherData[];
  clouds: CloudsInfo;
  wind: WindInfo;
  rain?: RainInfo;
  snow?: SnowInfo;
  visibility: number;
  pop: number; // Probability of precipitation
  sys: {
    pod: string; // Part of day (n = night, d = day)
  };
  dt_txt: string;
}

export interface ForecastData {
  cod: string;
  message: number;
  cnt: number;
  list: ForecastItem[];
  city: {
    id: number;
    name: string;
    coord: Coordinates;
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

export interface WeatherError {
  cod: string;
  message: string;
}

export type WeatherUnit = 'metric' | 'imperial';

export interface WeatherSettings {
  unit: WeatherUnit;
  defaultCity: string;
}

export interface FavoriteCity {
  id: string;
  name: string;
  country: string;
  coord: Coordinates;
  addedAt: Date;
}

export interface WeatherState {
  currentWeather: CurrentWeather | null;
  forecast: ForecastData | null;
  favorites: FavoriteCity[];
  settings: WeatherSettings;
  loading: boolean;
  error: string | null;
  selectedCity: string;
}
