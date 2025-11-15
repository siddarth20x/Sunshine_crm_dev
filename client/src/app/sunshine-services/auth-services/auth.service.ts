import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor() {}
  // isLoggedIn() {
  //   const userLoggedIn = sessionStorage.getItem('token');
  //   //console.log(userLoggedIn);
  //   if (userLoggedIn && (userLoggedIn != null || userLoggedIn != undefined)) {
  //     return true;
  //   } else {
  //     return false;
  //   }
  // }
  isLoggedIn() {
    return !!sessionStorage.getItem('token');
  }
}
