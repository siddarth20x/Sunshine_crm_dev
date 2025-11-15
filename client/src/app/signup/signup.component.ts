import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SunshineInternalService } from '../sunshine-services/sunshine-internal.service';
import { Router } from '@angular/router';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnInit {
  singupForm: any;
  hide = true;
  selectedDesignation: string = '';
  designation: any[] = [
    { name: 'Super Admin' },
    { name: 'Admin' },
    { name: 'Manager' },
    { name: 'Team Lead' },
    { name: 'Agent' },
  ];
  deviceInfo: any = null;
  constructor(
    private _sunshineIternalApi: SunshineInternalService,
    private _router: Router,
    private deviceService: DeviceDetectorService
  ) {
    this.singupForm = new FormGroup({
      app_user_id: new FormControl(123, [Validators.required]),
      designation: new FormControl(null, [Validators.required]),
      first_name: new FormControl(null, [Validators.required]),
      last_name: new FormControl(null, [Validators.required]),
      email_id: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [Validators.required]),
      phone: new FormControl(null, [Validators.required]),
      mac_address: new FormControl('de: 43: 23'),
      is_admin: new FormControl(null, [Validators.required]),
      image_url: new FormControl('www.google.com', [Validators.required]),
    });
  }

  ngOnInit(): void {
    // //console.log(getMAC());
    this.epicFunction()
  }

  epicFunction() {
    //console.log('hello `Signup` component');
    this.deviceInfo = this.deviceService.getDeviceInfo();
    const isMobile = this.deviceService.isMobile();
    const isTablet = this.deviceService.isTablet();
    const isDesktopDevice = this.deviceService.isDesktop();
    this.deviceService.userAgent
    //console.log(this.deviceService);
  //   //console.log(isMobile); // returns if the device is a mobile device (android / iPhone / windows-phone etc)
  //   //console.log(isTablet); // returns if the device us a tablet (iPad etc)
  //   //console.log(isDesktopDevice); // returns if the app is running on a Desktop browser.
  }

  onDesignationSelect(event: any) {
    //console.log(event.value);
    let selDesig = event.value;
    selDesig != 'Agent'
      ? this.singupForm.patchValue({
          is_admin: 1,
        })
      : this.singupForm.patchValue({
          is_admin: 0,
        });
  }
  submit() {
    //console.log(this.singupForm.value);
    this._router.navigate(['/dashboard']);

    // this._sunshineIternalApi.newUserSignup(this.singupForm.value).subscribe((res: any) => {
    //   //console.log('signup-res--', res);
    //   this._router.navigate(['/dashboard']);
    // });
  }
}
