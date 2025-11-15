import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SunshineInternalService } from '../sunshine-services/sunshine-internal.service';
import { Router } from '@angular/router';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { NotificationService } from '../shared/services/notification.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm: any;
  hide = true;
  deviceInfo: any = null;
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  durationInSeconds = 5;
  showProgressBar: boolean = false;
  notifications: any = [];
  notificationCount: number = 0;
  constructor(
    private _sunshineIternalApi: SunshineInternalService,
    private _snackBar: MatSnackBar,
    private _router: Router,
    private notificationService: NotificationService
  ) {
    this.loginForm = new FormGroup({
      email_address: new FormControl(null, [
        Validators.required,
        Validators.email,
      ]),
      password: new FormControl(null, [Validators.required]),
      user_id: new FormControl(null),
      first_name: new FormControl(null),
      last_name: new FormControl(null),
      phone: new FormControl(null),
      mac_address: new FormControl(null),
      status: new FormControl(1),
    });
  }

  ngOnInit() {
    // //console.log(getMAC());
    sessionStorage.clear();
    this.getAllPrivileges();
    this.getAllRoles();
    this.getAllNotificationType();
    this.getAllTaskTypes();

    // this.getDeviceMAC();

    if (!sessionStorage.getItem('device-ip')) {
      this._sunshineIternalApi
        .getIP()
        .then(async (data) => {
          // console.log('IP Data:', data.ip);
          sessionStorage.setItem('device-ip', data.ip);
        })
        .catch((error) => {
          console.error('Error fetching IP:', error);
        });
    }
  }
  // console.log("cors error")
  // getDeviceMAC() {
  //   this._sunshineIternalApi
  //     .getClientMac()
  //     .then((res: any) => {
  //       console.log('MAC res::', res.data.macAddress);
  //       let macAddress = res.data.macAddress;
  //       if (macAddress !== null || macAddress !== undefined) {
  //         this.loginForm.patchValue({ mac_address: macAddress });
  //       }
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
  // }

  submit() {
    this.showProgressBar = true;
    // console.log(this.loginForm.value);

    this.loginForm.patchValue({
      email_address: this.loginForm.value.email_address.trim(),
      password: this.loginForm.value.password.trim(),
    });

    this._sunshineIternalApi
      .loginUser(this.loginForm.value)
      .then((response: any) => {
        let resData = response;
        // console.log('login-res', resData);
        sessionStorage.setItem(
          'userDetails',
          JSON.stringify(resData.data.data)
        );
        sessionStorage.setItem('token', resData.data.token);
        let userId = resData.data.data.user_id;
        this.getAllURCDetailsofLoggedInUser(userId);
        this._router.navigate(['/dashboard']);
        this.updateLastLoginDetails(userId);
        this.openSnackBar(resData.data.message);
        this.getAllComapanyType();
        
        // Initialize sidebar status for reminders
        this.notificationService.initializeSidebarStatusOnLogin(userId);
        
        let currentTimestamp = this.getCurrentTimestamp();
        // console.log(
        //   'current-timestamp-after-login:::',
        //   currentTimestamp,
        //   typeof currentTimestamp
        // );
        // let adjustedTimeStamp = this._sunshineIternalApi.adjustTimestamp(currentTimestamp,0);
        // console.log('adjusted-timestamp-after-login:::', adjustedTimeStamp);
        // sessionStorage.setItem('timestampAt0',adjustedTimeStamp)
        this.showProgressBar = false;
      })
      .catch((error) => {
        this.showProgressBar = false;
        console.error('login-err', error.response);
        let errorMsg = error.response.data.message;
        this.openSnackBar(errorMsg);
      });
  }

  async updateLastLoginDetails(userId: number) {
    // this.userSaveProg = true;
    //console.log('update-userForm:::', this.userForm.value);
    const currentTimestamp = this.getCurrentTimestamp();
    let updateUserBody = {
      app_user_id: userId,
      user_id: userId,
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
      status: 1,
    };

    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      updateUserBody.last_login_ip_address = data.ip;
      await this._sunshineIternalApi
        .editUser(updateUserBody)
        .then((res: any) => {
          console.log('editUser-res', res);
          // this.openSnackBar(res.message);
          // this._router.navigate(['/dashboard']);
          this._sunshineIternalApi.currentNotificationCount.subscribe(
            (count) => {
              this.getAllNotifications(userId);
            }
          );
        })
        .catch((error) => {
          console.error('editUser-err::::', error);
          // this.openSnackBar(error);
        });
    } catch (error) {
      this.openSnackBar(`Error fetching IP`);
    }

    // console.log(updateUserBody);
  }

  getAllNotifications(user_id: any) {
    let params = { app_user_id: user_id };
    // console.log(user_id);
    this._sunshineIternalApi
      .fetchAllNotifications(params)
      .then((res: any) => {
        // console.log("getAllNotifications-->",res);
        this.notifications = res.data[0];
        // this.notificationCount = this.notifications.length;
        let unacknowledgedNotifications = this.notifications.filter(
          (notification: { notification_acknowledged_on: null }) =>
            notification.notification_acknowledged_on === null
        );
        this.notificationCount = unacknowledgedNotifications.length;
        // console.log(this.notificationCount);

        //! Observable logic
        // let notifResp = timer(0, this.autoRefresh).pipe(
        //   switchMap(() => this._sunshineApi.fetchAllNotifications(params))
        // );
        // notifResp.subscribe((notifRes: any) => {
        //   if (notifRes.errorCode == 0) {
        //     let resData = notifRes.data[0].reverse();
        //     console.log('notifRes-observable---', resData);
        //     // sessionStorage.setItem('loggedInUsrAuthModules', JSON.stringify(resData));
        //     // this.checkAuthModules();
        //   } else {
        //     //console.log('activity-log-err', urcRes);
        //   }
        // });
        // console.log(this.notificationCount);
      })
      .catch((err) => {
        console.log(err);
      });
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
  // adjustTimestamp(capturedTimestamp: string) {
  //   // Parse the captured timestamp
  //   const now = new Date(capturedTimestamp);

  //   // Subtract 5 hours and 30 minutes
  //   now.setHours(now.getHours() - 5);
  //   now.setMinutes(now.getMinutes() - 30);

  //   const year = now.getFullYear();
  //   const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  //   const day = String(now.getDate()).padStart(2, '0');

  //   const hours = String(now.getHours()).padStart(2, '0');
  //   const minutes = String(now.getMinutes()).padStart(2, '0');
  //   const seconds = String(now.getSeconds()).padStart(2, '0');

  //   return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  // }
  getAllNotificationType() {
    this._sunshineIternalApi.fetchAllNotificationsType().then((res: any) => {
      if (res.errorCode == 0) {
        // this.notificationsType = res.data[0];
        // console.log('this.notificationsType-->', this.notificationsType);
        // console.log(res.data[0]);
        let resData = res.data[0];
        sessionStorage.setItem('notifType', JSON.stringify(resData));
      }
    });
  }
  openSnackBar(message: string) {
    this._snackBar.open(message, 'Close', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: this.durationInSeconds * 1000,
    });
  }

  getAllURCDetailsofLoggedInUser(userId: any) {
    let urcBody = {
      // "user_role_company_id": null,
      user_id: userId,
      // "role_id": null,
      // "company_id": null
    };

    this._sunshineIternalApi
      .fetchURC(urcBody)
      .then((urcRes: any) => {
        let resData = urcRes.data.data[0];
        //console.log('urc-res-', resData);
        sessionStorage.setItem(
          'loggedInUsrAuthModules',
          JSON.stringify(resData)
        );
      })
      .catch((error) => {
        console.error('urc-err', error.response);
      });
  }

  getAllPrivileges() {
    this._sunshineIternalApi
      .fetchAllPrivileges()
      .then((res: any) => {
        let resData = res.data[0];
        //console.log('privilege-res', resData);
        sessionStorage.setItem('privileges', JSON.stringify(resData));
        // this.privilegesList = resData;
      })
      .catch((error) => {
        //console.log('privilege-err', error);
      });
  }

  getAllRoles() {
    if (!sessionStorage.getItem('roles')) {
      this._sunshineIternalApi
        .fetchRoles()
        .then((rolesRes: any) => {
          // //console.log('userIdRes', userIdRes.data[0][0]);
          let resData = rolesRes.data[0];
          //console.log(resData);
          sessionStorage.setItem('roles', JSON.stringify(resData));
        })
        .catch((error) => {
          console.error('user-by-id-err', error);
        });
    }
  }

  getAllComapanyType() {
    this._sunshineIternalApi
      .fetchAllCompanyType()
      .then((res: any) => {
        // console.log(res.data);
        sessionStorage.setItem('companyType', JSON.stringify(res.data));
      })
      .catch((error) => {
        console.error('company-by-id-err', error);
      });
  }

  getAllTaskTypes() {
    this._sunshineIternalApi
      .fetchTaskTypes()
      .then((res: any) => {
        let resData = res.data[0];
        // console.log(resData);
        sessionStorage.setItem('taskType', JSON.stringify(resData));
      })
      .catch((error) => console.error(error));
  }
}
