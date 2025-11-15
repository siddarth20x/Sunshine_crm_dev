import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { timer, switchMap } from 'rxjs';
import { Subscription } from 'rxjs/internal/Subscription';
import { SunshineInternalService } from 'src/app/sunshine-services/sunshine-internal.service';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, AfterViewInit {
  userFirstName: string = '';
  userLastName: string = '';
  userImage: string = '';
  userDesignation: string = '';

  notifications: any = [];
  notificationCount: any;
  autoRefresh: number = 10000;

  constructor(private _sunshineApi: SunshineInternalService) {}

  ngOnInit(): void {
    if (sessionStorage.getItem('userDetails')) {
      let sessionData: any = sessionStorage.getItem('userDetails');
      let parsedUserSessionData = JSON.parse(sessionData);
      const userId = parsedUserSessionData.user_id;
      const userEmail = parsedUserSessionData.email_address;
      this.userDesignation = parsedUserSessionData.role_name;
      this.userFirstName = parsedUserSessionData.first_name;
      this.userLastName = parsedUserSessionData.last_name;
      this.userImage = parsedUserSessionData.image_url;
      if (userId) {
        // this.getAllNotifications(this.app_user_id)

        this.getAllNotifications(userId);

        //? update notification count by subscribing the update notif event
        this._sunshineApi.currentNotificationCount.subscribe((count) => {
          // this.notificationCount = count;
          this.getAllNotifications(userId);
        });
      }
    }
  }
  ngAfterViewInit(): void {
    // setTimeout(() => {
    // if (sessionStorage.getItem('userDetails')) {
    //   let sessionData: any = sessionStorage.getItem('userDetails');
    //   let parsedUserSessionData = JSON.parse(sessionData);
    //   const userId = parsedUserSessionData.user_id;
    //   const userEmail = parsedUserSessionData.email_address;
    //   this.userDesignation = parsedUserSessionData.designation;
    //   this.userFirstName = parsedUserSessionData.first_name;
    //   this.userLastName = parsedUserSessionData.last_name;
    //   this.userImage = parsedUserSessionData.image_url;
    // }
    // }, 1000);
  }

  getAllNotifications(user_id: any) {
    let params = { app_user_id: user_id };

    this._sunshineApi
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
        this.notificationCount > 99
          ? (this.notificationCount = '99+')
          : this.notificationCount;

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
}
