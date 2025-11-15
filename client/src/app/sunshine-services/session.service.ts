import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  getCurrentUser() {
    const userDetails = JSON.parse(sessionStorage.getItem('userDetails') || '{}');
    return userDetails;
  }

  getCurrentCompany() {
    const companyDetails = JSON.parse(sessionStorage.getItem('companyDetails') || '{}');
    return companyDetails;
  }
} 