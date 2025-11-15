import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SunshineInternalService } from '../sunshine-services/sunshine-internal.service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: any;
  hide = true;
  deviceInfo: any = null;
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  durationInSeconds = 5;
  showProgressBar: boolean = false;
  notifications: any = [];
  notificationCount: number = 0;
  passwordHidden: boolean = false;
  reset: boolean = false;
  constructor(
    private _sunshineIternalApi: SunshineInternalService,
    private _snackBar: MatSnackBar,
    private _aR: ActivatedRoute,
    private _router: Router
  ) {
    this.forgotPasswordForm = new FormGroup({
      email_address: new FormControl(null, [
        Validators.required,
        Validators.email,
      ]),
      user_id: new FormControl(null),
      first_name: new FormControl(null),
      last_name: new FormControl(null),
      phone: new FormControl(null),
      mac_address: new FormControl(null),
      token: new FormControl(null),
      status: new FormControl(1),
    });
  }

  ngOnInit() {
    sessionStorage.clear();
    let routeParams = this._aR.snapshot.queryParams;
    console.log(routeParams);
    if (
      routeParams['user_id'] != undefined &&
      routeParams['jwt'] != undefined &&
      routeParams['email'] != undefined
    ) {
      // console.log(this.forgotPasswordForm.value);
      this.forgotPasswordForm.addControl(
        'password',
        new FormControl(null, Validators.required)
      );
      this.forgotPasswordForm.addControl(
        'app_user_id',
        new FormControl(null, Validators.required)
      );
      this.passwordHidden = true;
      this.reset = true;
      this.forgotPasswordForm.patchValue({
        app_user_id: routeParams['user_id'],
        user_id: routeParams['user_id'],
        email_address: routeParams['email'],
        token: routeParams['jwt'],
        // first_name: routeParams['first_name'],
        // last_name: routeParams['last_name'],
        status: 1,
      });
      this.forgotPasswordForm.controls['email_address'].disable();
    }
  }
  submit() {
    // this.openSnackBar(
    //   `Please wait while we are looking for user with '${this.forgotPasswordForm.value.email_address}'`
    // );

    this.showProgressBar = true;
    // console.log(this.forgotPasswordForm.value);

    this.forgotPasswordForm.patchValue({
      email_address: this.forgotPasswordForm.value.email_address.trim(),
      // password: this.forgotPasswordForm.value.password.trim(),
    });

    this._sunshineIternalApi
      .fetchUserByIdForForgotPwd(this.forgotPasswordForm.value)
      .then((response: any) => {
        let resData = response.data[0][0];
        // console.log('fgt-pwd-res:::', response);
        // console.log('fgt-pwd-resData:::', resData);

        if (resData!==undefined && resData.length === 0) {
          // this.openSnackBar(
          //   `No user found in our system with ${this.forgotPasswordForm.value.email_address}`
          // );
          this.openSnackBar(
            `Please enter valid email address`
          );
          this.showProgressBar = false;
          return;
        } else {
          // this.openSnackBar(
          //   `User found in our system with ${this.forgotPasswordForm.value.email_address}`
          // );
          this.forgotPasswordForm.patchValue({
            user_id: resData.user_id,
            first_name: resData.first_name,
            last_name: resData.last_name,
            // phone: resData.phone,
            // mac_address: resData.mac_address,
            // token: resData.token,
            // status: resData.status,
          });
          console.log(this.forgotPasswordForm.value)
          this.generateJWTForFoundUser();
          this.showProgressBar = false;
        }
      })
      .catch((error) => {
        this.showProgressBar = false;
        console.error('fgtpwd-err', error);
        // let errorMsg = error.response.data.message;
        this.openSnackBar(
          `Please enter valid email address`
        );
      });
  }
  async generateJWTForFoundUser() {
    try {
      const res: any = await this._sunshineIternalApi.forgotPwdTokenGen(
        this.forgotPasswordForm.value
      );

      const resData = res.data;
      this.forgotPasswordForm.patchValue({ token: resData });

      // console.log(this.forgotPasswordForm.value)
      await this.updateLastLoginDetails(this.forgotPasswordForm.value);
      await this.sendEmail(this.forgotPasswordForm.value);
    } catch (err) {
      console.error('Error generating token', err);
    }
  }
  async updateLastLoginDetails(data: any) {
    // this.userSaveProg = true;
    console.log('update-userForm:::', data);
    const currentTimestamp = this.getCurrentTimestamp();
    let updateUserBody = {
      app_user_id: data.user_id,
      user_id: data.user_id,
      designation: null,
      first_name: null,
      last_name: null,
      email_address: null,
      password: null,
      phone: null,
      otp: null,
      mac_address: null,
      allowed_ip: null,
      last_login: currentTimestamp,
      last_login_ip_address: null,
      is_admin: null,
      image_url: null,
      reporting_to_id: null,
      token: data.token,
      status: 1,
    };

    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      updateUserBody.last_login_ip_address = data.ip;
      // console.log(updateUserBody)
      await this._sunshineIternalApi
        .editUser(updateUserBody)
        .then((res: any) => {
          console.log('editUser-for-token-res', res);
          // this.openSnackBar(res.message);
          // this._router.navigate(['/dashboard']);
        })
        .catch((error) => {
          console.error('editUser-for-token-err::::', error);
          // this.openSnackBar(error);
        });
    } catch (error) {
      this.openSnackBar(`Error fetching IP`);
    }

    // console.log(updateUserBody);
  }

  getCurrentTimestamp() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const day = String(now.getDate()).padStart(2, '0');

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
  sendEmail(userDetails: any) {
    console.log('sendEmail for forgot pwd usrdetls-->', userDetails);
  
    // Destructuring userDetails and providing default values for undefined or null
    const { 
      user_id = '', 
      first_name = '', 
      last_name = '', 
      email_address = '', 
      token = '' 
    } = userDetails;
  
    let link = `https://sunshine-crm-dev-client.el.r.appspot.com/#/forgot-password?user_id=${user_id}&jwt=${token}&email=${email_address}`;
    // let link = `http://localhost:4200/#/forgot-password?user_id=${user_id}&jwt=${token}&email=${email_address}`;
  
    let emailBody = `
      Hi ${first_name} ${last_name},
      <br><br>
      Forgot Password Details:
      <ul>
        <li><strong>First Name:</strong> ${first_name}</li>
        <li><strong>Last Name:</strong> ${last_name}</li>
        <li><strong>Email Address:</strong> ${email_address}</li>
      </ul>
      <br>
      Below is your forgot password link:
      <br>
      URL :<a href=${link}>Click here to reset</a> 
      <br>
      Thank you,<br>
      Team Sunshine Solutions Pvt. Ltd.<br>
      This automated mail was sent by Sunshine Solutions Pvt. Ltd. Please do not reply directly to this email. 
      For questions or assistance, please get in touch with info@mailers.codeswift.in.
    `;
  
    let receiverEmailId = email_address;
    let emailSubject = `Forgot Password`;
  
    let finalEmail = {
      to: receiverEmailId,
      subject: emailSubject,
      emailBody: emailBody,
    };
  
    this._sunshineIternalApi
      .sendForgotPwdEmail(finalEmail)
      .then((res: any) => {
        console.log('email-res::::', res);
        this.openSnackBar(`Password reset email sent successfully`);
      })
      .catch((error) => {
        this.openSnackBar(error);
      });
  }
  
  openSnackBar(message: string) {
    this._snackBar.open(message, 'Close', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: this.durationInSeconds * 1000,
    });
  }

  resetPassword() {
    console.log('before-reset::', this.forgotPasswordForm.value);
    this.showProgressBar = true;
    this._sunshineIternalApi
      .resetPwdUser(this.forgotPasswordForm.value)
      .then((res: any) => {
        this.showProgressBar = false;
        console.log('reset-res--', res);
        let response = res.data;
        this.openSnackBar(res.message);
        this._router.navigate(['/login']);
      })
      .catch((error) => {
        this.showProgressBar = false;

        this.openSnackBar(error);
      });
  }
}
