import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, map } from 'rxjs';
import { ConfigService } from './config.service';

export interface CitySearchResult {
  id: number;
  name: string;
  country: string;
  countryCode: string;
  region: string;
  latitude: number;
  longitude: number;
}

export interface GeoCityResult {
  id: number;
  name: string;
  country: string;
  countryCode: string;
  region: string;
  latitude: number;
  longitude: number;
}

export interface GeoCitiesResponse {
  data: GeoCityResult[];
  metadata: {
    currentOffset: number;
    totalCount: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CitySearchService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);

  private get API_BASE_URL(): string {
    return this.configService.geoDbConfig.baseUrl;
  }

  private get API_HEADERS() {
    return {
      'X-RapidAPI-Key': this.configService.geoDbConfig.apiKey,
      'X-RapidAPI-Host': this.configService.geoDbConfig.host
    };
  }

  searchCities(query: string, limit = 8): Observable<CitySearchResult[]> {
    if (!query || query.length < 3) {
      return of([]);
    }

    // API key varsa gerçek API'yi kullan, yoksa mock data döndür
    const apiKey = this.configService.geoDbConfig.apiKey;
    if (apiKey && apiKey !== 'YOUR_GEODB_API_KEY_HERE') {
      return this.searchCitiesFromAPI(query, limit);
    } else {
      // Fallback to mock data
      return this.getMockCityResults(query, limit);
    }
  }

  private getMockCityResults(query: string, limit: number): Observable<CitySearchResult[]> {
    // Geniş şehir listesi - gerçek dünya şehirleri
    const worldCities: CitySearchResult[] = [
      // Türkiye
      { id: 1, name: 'Istanbul', country: 'Turkey', countryCode: 'TR', region: 'Marmara', latitude: 41.0082, longitude: 28.9784 },
      { id: 2, name: 'Ankara', country: 'Turkey', countryCode: 'TR', region: 'Central Anatolia', latitude: 39.9334, longitude: 32.8597 },
      { id: 3, name: 'Izmir', country: 'Turkey', countryCode: 'TR', region: 'Aegean', latitude: 38.4192, longitude: 27.1287 },
      { id: 4, name: 'Antalya', country: 'Turkey', countryCode: 'TR', region: 'Mediterranean', latitude: 36.8969, longitude: 30.7133 },
      { id: 5, name: 'Bursa', country: 'Turkey', countryCode: 'TR', region: 'Marmara', latitude: 40.1826, longitude: 29.0665 },
      
      // ABD
      { id: 101, name: 'New York', country: 'United States', countryCode: 'US', region: 'New York', latitude: 40.7128, longitude: -74.0060 },
      { id: 102, name: 'Los Angeles', country: 'United States', countryCode: 'US', region: 'California', latitude: 34.0522, longitude: -118.2437 },
      { id: 103, name: 'Chicago', country: 'United States', countryCode: 'US', region: 'Illinois', latitude: 41.8781, longitude: -87.6298 },
      { id: 104, name: 'Houston', country: 'United States', countryCode: 'US', region: 'Texas', latitude: 29.7604, longitude: -95.3698 },
      { id: 105, name: 'Phoenix', country: 'United States', countryCode: 'US', region: 'Arizona', latitude: 33.4484, longitude: -112.0740 },
      { id: 106, name: 'Philadelphia', country: 'United States', countryCode: 'US', region: 'Pennsylvania', latitude: 39.9526, longitude: -75.1652 },
      { id: 107, name: 'San Antonio', country: 'United States', countryCode: 'US', region: 'Texas', latitude: 29.4241, longitude: -98.4936 },
      { id: 108, name: 'San Diego', country: 'United States', countryCode: 'US', region: 'California', latitude: 32.7157, longitude: -117.1611 },
      { id: 109, name: 'Dallas', country: 'United States', countryCode: 'US', region: 'Texas', latitude: 32.7767, longitude: -96.7970 },
      { id: 110, name: 'San Jose', country: 'United States', countryCode: 'US', region: 'California', latitude: 37.3382, longitude: -121.8863 },

      // İngiltere
      { id: 201, name: 'London', country: 'United Kingdom', countryCode: 'GB', region: 'England', latitude: 51.5074, longitude: -0.1278 },
      { id: 202, name: 'Manchester', country: 'United Kingdom', countryCode: 'GB', region: 'England', latitude: 53.4808, longitude: -2.2426 },
      { id: 203, name: 'Birmingham', country: 'United Kingdom', countryCode: 'GB', region: 'England', latitude: 52.4862, longitude: -1.8904 },
      { id: 204, name: 'Liverpool', country: 'United Kingdom', countryCode: 'GB', region: 'England', latitude: 53.4084, longitude: -2.9916 },
      { id: 205, name: 'Edinburgh', country: 'United Kingdom', countryCode: 'GB', region: 'Scotland', latitude: 55.9533, longitude: -3.1883 },

      // Almanya
      { id: 301, name: 'Berlin', country: 'Germany', countryCode: 'DE', region: 'Berlin', latitude: 52.5200, longitude: 13.4050 },
      { id: 302, name: 'Munich', country: 'Germany', countryCode: 'DE', region: 'Bavaria', latitude: 48.1351, longitude: 11.5820 },
      { id: 303, name: 'Hamburg', country: 'Germany', countryCode: 'DE', region: 'Hamburg', latitude: 53.5511, longitude: 9.9937 },
      { id: 304, name: 'Cologne', country: 'Germany', countryCode: 'DE', region: 'North Rhine-Westphalia', latitude: 50.9375, longitude: 6.9603 },
      { id: 305, name: 'Frankfurt', country: 'Germany', countryCode: 'DE', region: 'Hesse', latitude: 50.1109, longitude: 8.6821 },

      // Fransa
      { id: 401, name: 'Paris', country: 'France', countryCode: 'FR', region: 'Île-de-France', latitude: 48.8566, longitude: 2.3522 },
      { id: 402, name: 'Marseille', country: 'France', countryCode: 'FR', region: 'Provence-Alpes-Côte d\'Azur', latitude: 43.2965, longitude: 5.3698 },
      { id: 403, name: 'Lyon', country: 'France', countryCode: 'FR', region: 'Auvergne-Rhône-Alpes', latitude: 45.7640, longitude: 4.8357 },
      { id: 404, name: 'Nice', country: 'France', countryCode: 'FR', region: 'Provence-Alpes-Côte d\'Azur', latitude: 43.7102, longitude: 7.2620 },

      // İtalya
      { id: 501, name: 'Rome', country: 'Italy', countryCode: 'IT', region: 'Lazio', latitude: 41.9028, longitude: 12.4964 },
      { id: 502, name: 'Milan', country: 'Italy', countryCode: 'IT', region: 'Lombardy', latitude: 45.4642, longitude: 9.1900 },
      { id: 503, name: 'Naples', country: 'Italy', countryCode: 'IT', region: 'Campania', latitude: 40.8518, longitude: 14.2681 },
      { id: 504, name: 'Venice', country: 'Italy', countryCode: 'IT', region: 'Veneto', latitude: 45.4408, longitude: 12.3155 },
      { id: 505, name: 'Florence', country: 'Italy', countryCode: 'IT', region: 'Tuscany', latitude: 43.7696, longitude: 11.2558 },

      // İspanya
      { id: 601, name: 'Madrid', country: 'Spain', countryCode: 'ES', region: 'Community of Madrid', latitude: 40.4168, longitude: -3.7038 },
      { id: 602, name: 'Barcelona', country: 'Spain', countryCode: 'ES', region: 'Catalonia', latitude: 41.3851, longitude: 2.1734 },
      { id: 603, name: 'Valencia', country: 'Spain', countryCode: 'ES', region: 'Valencian Community', latitude: 39.4699, longitude: -0.3763 },
      { id: 604, name: 'Seville', country: 'Spain', countryCode: 'ES', region: 'Andalusia', latitude: 37.3891, longitude: -5.9845 },

      // Hollanda
      { id: 701, name: 'Amsterdam', country: 'Netherlands', countryCode: 'NL', region: 'North Holland', latitude: 52.3676, longitude: 4.9041 },
      { id: 702, name: 'Rotterdam', country: 'Netherlands', countryCode: 'NL', region: 'South Holland', latitude: 51.9244, longitude: 4.4777 },
      { id: 703, name: 'The Hague', country: 'Netherlands', countryCode: 'NL', region: 'South Holland', latitude: 52.0705, longitude: 4.3007 },

      // Japonya
      { id: 801, name: 'Tokyo', country: 'Japan', countryCode: 'JP', region: 'Kantō', latitude: 35.6762, longitude: 139.6503 },
      { id: 802, name: 'Osaka', country: 'Japan', countryCode: 'JP', region: 'Kansai', latitude: 34.6937, longitude: 135.5023 },
      { id: 803, name: 'Kyoto', country: 'Japan', countryCode: 'JP', region: 'Kansai', latitude: 35.0116, longitude: 135.7681 },
      { id: 804, name: 'Yokohama', country: 'Japan', countryCode: 'JP', region: 'Kantō', latitude: 35.4437, longitude: 139.6380 },

      // Avustralya
      { id: 901, name: 'Sydney', country: 'Australia', countryCode: 'AU', region: 'New South Wales', latitude: -33.8688, longitude: 151.2093 },
      { id: 902, name: 'Melbourne', country: 'Australia', countryCode: 'AU', region: 'Victoria', latitude: -37.8136, longitude: 144.9631 },
      { id: 903, name: 'Brisbane', country: 'Australia', countryCode: 'AU', region: 'Queensland', latitude: -27.4698, longitude: 153.0251 },
      { id: 904, name: 'Perth', country: 'Australia', countryCode: 'AU', region: 'Western Australia', latitude: -31.9505, longitude: 115.8605 },

      // Kanada
      { id: 1001, name: 'Toronto', country: 'Canada', countryCode: 'CA', region: 'Ontario', latitude: 43.6532, longitude: -79.3832 },
      { id: 1002, name: 'Vancouver', country: 'Canada', countryCode: 'CA', region: 'British Columbia', latitude: 49.2827, longitude: -123.1207 },
      { id: 1003, name: 'Montreal', country: 'Canada', countryCode: 'CA', region: 'Quebec', latitude: 45.5017, longitude: -73.5673 },
      { id: 1004, name: 'Calgary', country: 'Canada', countryCode: 'CA', region: 'Alberta', latitude: 51.0447, longitude: -114.0719 },

      // Avusturya
      { id: 1101, name: 'Vienna', country: 'Austria', countryCode: 'AT', region: 'Vienna', latitude: 48.2082, longitude: 16.3738 },
      { id: 1102, name: 'Salzburg', country: 'Austria', countryCode: 'AT', region: 'Salzburg', latitude: 47.8095, longitude: 13.0550 },

      // Çek Cumhuriyeti
      { id: 1201, name: 'Prague', country: 'Czech Republic', countryCode: 'CZ', region: 'Prague', latitude: 50.0755, longitude: 14.4378 },

      // Macaristan
      { id: 1301, name: 'Budapest', country: 'Hungary', countryCode: 'HU', region: 'Central Hungary', latitude: 47.4979, longitude: 19.0402 },

      // Polonya
      { id: 1401, name: 'Warsaw', country: 'Poland', countryCode: 'PL', region: 'Masovian Voivodeship', latitude: 52.2297, longitude: 21.0122 },
      { id: 1402, name: 'Krakow', country: 'Poland', countryCode: 'PL', region: 'Lesser Poland Voivodeship', latitude: 50.0647, longitude: 19.9450 },

      // İsveç
      { id: 1501, name: 'Stockholm', country: 'Sweden', countryCode: 'SE', region: 'Stockholm County', latitude: 59.3293, longitude: 18.0686 },
      { id: 1502, name: 'Gothenburg', country: 'Sweden', countryCode: 'SE', region: 'Västra Götaland County', latitude: 57.7089, longitude: 11.9746 },

      // Danimarka
      { id: 1601, name: 'Copenhagen', country: 'Denmark', countryCode: 'DK', region: 'Capital Region', latitude: 55.6761, longitude: 12.5683 },

      // Norveç
      { id: 1701, name: 'Oslo', country: 'Norway', countryCode: 'NO', region: 'Oslo', latitude: 59.9139, longitude: 10.7522 },

      // Finlandiya
      { id: 1801, name: 'Helsinki', country: 'Finland', countryCode: 'FI', region: 'Uusimaa', latitude: 60.1699, longitude: 24.9384 },

      // İrlanda
      { id: 1901, name: 'Dublin', country: 'Ireland', countryCode: 'IE', region: 'Leinster', latitude: 53.3498, longitude: -6.2603 },

      // Portekiz
      { id: 2001, name: 'Lisbon', country: 'Portugal', countryCode: 'PT', region: 'Lisbon', latitude: 38.7223, longitude: -9.1393 },
      { id: 2002, name: 'Porto', country: 'Portugal', countryCode: 'PT', region: 'Norte', latitude: 41.1579, longitude: -8.6291 },

      // İsviçre
      { id: 2101, name: 'Zurich', country: 'Switzerland', countryCode: 'CH', region: 'Zurich', latitude: 47.3769, longitude: 8.5417 },
      { id: 2102, name: 'Geneva', country: 'Switzerland', countryCode: 'CH', region: 'Geneva', latitude: 46.2044, longitude: 6.1432 },

      // Belçika
      { id: 2201, name: 'Brussels', country: 'Belgium', countryCode: 'BE', region: 'Brussels-Capital', latitude: 50.8503, longitude: 4.3517 },
      { id: 2202, name: 'Antwerp', country: 'Belgium', countryCode: 'BE', region: 'Flanders', latitude: 51.2194, longitude: 4.4025 },

      // Yunanistan
      { id: 2301, name: 'Athens', country: 'Greece', countryCode: 'GR', region: 'Attica', latitude: 37.9838, longitude: 23.7275 },

      // Rusya
      { id: 2401, name: 'Moscow', country: 'Russia', countryCode: 'RU', region: 'Central Federal District', latitude: 55.7558, longitude: 37.6173 },
      { id: 2402, name: 'Saint Petersburg', country: 'Russia', countryCode: 'RU', region: 'Northwestern Federal District', latitude: 59.9311, longitude: 30.3609 },

      // Brezilya
      { id: 2501, name: 'São Paulo', country: 'Brazil', countryCode: 'BR', region: 'Southeast', latitude: -23.5505, longitude: -46.6333 },
      { id: 2502, name: 'Rio de Janeiro', country: 'Brazil', countryCode: 'BR', region: 'Southeast', latitude: -22.9068, longitude: -43.1729 },

      // Arjantin
      { id: 2601, name: 'Buenos Aires', country: 'Argentina', countryCode: 'AR', region: 'Buenos Aires Province', latitude: -34.6118, longitude: -58.3960 },

      // Meksika
      { id: 2701, name: 'Mexico City', country: 'Mexico', countryCode: 'MX', region: 'Mexico City', latitude: 19.4326, longitude: -99.1332 },

      // Güney Kore
      { id: 2801, name: 'Seoul', country: 'South Korea', countryCode: 'KR', region: 'Seoul', latitude: 37.5665, longitude: 126.9780 },
      { id: 2802, name: 'Busan', country: 'South Korea', countryCode: 'KR', region: 'South Gyeongsang', latitude: 35.1796, longitude: 129.0756 },

      // Çin
      { id: 2901, name: 'Beijing', country: 'China', countryCode: 'CN', region: 'Beijing', latitude: 39.9042, longitude: 116.4074 },
      { id: 2902, name: 'Shanghai', country: 'China', countryCode: 'CN', region: 'Shanghai', latitude: 31.2304, longitude: 121.4737 },
      { id: 2903, name: 'Guangzhou', country: 'China', countryCode: 'CN', region: 'Guangdong', latitude: 23.1291, longitude: 113.2644 },

      // Hindistan
      { id: 3001, name: 'Mumbai', country: 'India', countryCode: 'IN', region: 'Maharashtra', latitude: 19.0760, longitude: 72.8777 },
      { id: 3002, name: 'Delhi', country: 'India', countryCode: 'IN', region: 'Delhi', latitude: 28.7041, longitude: 77.1025 },
      { id: 3003, name: 'Bangalore', country: 'India', countryCode: 'IN', region: 'Karnataka', latitude: 12.9716, longitude: 77.5946 },

      // Tayland
      { id: 3101, name: 'Bangkok', country: 'Thailand', countryCode: 'TH', region: 'Bangkok', latitude: 13.7563, longitude: 100.5018 },

      // Singapur
      { id: 3201, name: 'Singapore', country: 'Singapore', countryCode: 'SG', region: 'Singapore', latitude: 1.3521, longitude: 103.8198 },

      // Malezya
      { id: 3301, name: 'Kuala Lumpur', country: 'Malaysia', countryCode: 'MY', region: 'Kuala Lumpur', latitude: 3.1390, longitude: 101.6869 },

      // Endonezya
      { id: 3401, name: 'Jakarta', country: 'Indonesia', countryCode: 'ID', region: 'Jakarta', latitude: -6.2088, longitude: 106.8456 },

      // Filipinler
      { id: 3501, name: 'Manila', country: 'Philippines', countryCode: 'PH', region: 'National Capital Region', latitude: 14.5995, longitude: 120.9842 },

      // Vietnam
      { id: 3601, name: 'Ho Chi Minh City', country: 'Vietnam', countryCode: 'VN', region: 'Southeast', latitude: 10.8231, longitude: 106.6297 },
      { id: 3602, name: 'Hanoi', country: 'Vietnam', countryCode: 'VN', region: 'Red River Delta', latitude: 21.0285, longitude: 105.8542 },

      // Güney Afrika
      { id: 3701, name: 'Cape Town', country: 'South Africa', countryCode: 'ZA', region: 'Western Cape', latitude: -33.9249, longitude: 18.4241 },
      { id: 3702, name: 'Johannesburg', country: 'South Africa', countryCode: 'ZA', region: 'Gauteng', latitude: -26.2041, longitude: 28.0473 },

      // Mısır
      { id: 3801, name: 'Cairo', country: 'Egypt', countryCode: 'EG', region: 'Cairo Governorate', latitude: 30.0444, longitude: 31.2357 },

      // Fas
      { id: 3901, name: 'Casablanca', country: 'Morocco', countryCode: 'MA', region: 'Casablanca-Settat', latitude: 33.5731, longitude: -7.5898 },

      // İsrail
      { id: 4001, name: 'Tel Aviv', country: 'Israel', countryCode: 'IL', region: 'Tel Aviv District', latitude: 32.0853, longitude: 34.7818 },
      { id: 4002, name: 'Jerusalem', country: 'Israel', countryCode: 'IL', region: 'Jerusalem District', latitude: 31.7683, longitude: 35.2137 },

      // BAE
      { id: 4101, name: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE', region: 'Dubai', latitude: 25.2048, longitude: 55.2708 },
      { id: 4102, name: 'Abu Dhabi', country: 'United Arab Emirates', countryCode: 'AE', region: 'Abu Dhabi', latitude: 24.2532, longitude: 54.3665 },

      // Katar
      { id: 4201, name: 'Doha', country: 'Qatar', countryCode: 'QA', region: 'Doha', latitude: 25.2760, longitude: 51.5200 },

      // Suudi Arabistan
      { id: 4301, name: 'Riyadh', country: 'Saudi Arabia', countryCode: 'SA', region: 'Riyadh Province', latitude: 24.7136, longitude: 46.6753 },
      { id: 4302, name: 'Jeddah', country: 'Saudi Arabia', countryCode: 'SA', region: 'Makkah Province', latitude: 21.4858, longitude: 39.1925 }
    ];

    const normalizedQuery = query.toLowerCase();
    
    const filteredCities = worldCities
      .filter(city => 
        city.name.toLowerCase().includes(normalizedQuery) ||
        city.country.toLowerCase().includes(normalizedQuery)
      )
      .slice(0, limit);

    return of(filteredCities);
  }

  // Gerçek GeoDB API kullanımı
  private searchCitiesFromAPI(query: string, limit: number): Observable<CitySearchResult[]> {
    const params = {
      namePrefix: query,
      limit: limit.toString(),
      minPopulation: '10000', // En az 10k nüfus
      types: 'CITY',
      sort: '-population', // Nüfusa göre azalan sıralama
      languageCode: 'en' // İngilizce sonuçlar
    };

    console.log('Searching cities with GeoDB API:', { query, limit });

    return this.http.get<GeoCitiesResponse>(`${this.API_BASE_URL}/cities`, {
      params,
      headers: this.API_HEADERS
    }).pipe(
      map(response => {
        console.log('GeoDB API response:', response);
        return response.data.map(city => ({
          id: city.id,
          name: city.name,
          country: city.country,
          countryCode: city.countryCode,
          region: city.region,
          latitude: city.latitude,
          longitude: city.longitude
        }));
      }),
      catchError(error => {
        console.warn('GeoDB API error, falling back to mock data:', error);
        // API hatası durumunda mock data'ya geri dön
        return this.getMockCityResults(query, limit);
      })
    );
  }
}
