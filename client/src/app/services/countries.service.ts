import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Country {
  name: string;
  code: string;
  phoneCode: string;
  pattern: string;
  placeholder: string;
}

@Injectable({
  providedIn: 'root'
})
export class CountriesService {
  private countriesData: Country[] = [];

  constructor(private http: HttpClient) {}

  // Load countries from CSV file
  loadCountries(): Observable<Country[]> {
    if (this.countriesData.length > 0) {
      return new Observable(observer => {
        observer.next(this.countriesData);
        observer.complete();
      });
    }

    return this.http.get('assets/data/countries.csv', { responseType: 'text' }).pipe(
      map(csvData => {
        const lines = csvData.split('\n');
        const countries: Country[] = [];
        
        // Skip header row
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line) {
            const columns = line.split(',');
            if (columns.length >= 5) {
              countries.push({
                name: columns[0],
                code: columns[1],
                phoneCode: columns[2],
                pattern: columns[3],
                placeholder: columns[4]
              });
            }
          }
        }
        
        this.countriesData = countries;
        return countries;
      })
    );
  }

  // Get countries data
  getCountries(): Country[] {
    return this.countriesData;
  }

  // Find country by code
  getCountryByCode(code: string): Country | undefined {
    return this.countriesData.find(country => country.code === code);
  }

  // Find country by phone code
  getCountryByPhoneCode(phoneCode: string): Country | undefined {
    return this.countriesData.find(country => country.phoneCode === phoneCode);
  }
}
