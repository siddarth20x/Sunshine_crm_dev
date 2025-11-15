import { Injectable } from '@angular/core';
import { data } from '../models/data';
@Injectable({
  providedIn: 'root',
})
export class LocationServiceService {
  constructor() {}

  getCountries() {
    return data.countries;
  }

  getStatesByCountry(country: string) {
    console.log(country);
    console.log(data);
    return data.countries.find((c) => c.name === country)?.states || [];
  }

  getCitiesByState(country: string, state: string) {
    console.log(country, state);

    const selectedCountry = data.countries.find((c) => c.name === country);
    return selectedCountry?.states.find((s) => s.name === state)?.cities || [];
  }
}
