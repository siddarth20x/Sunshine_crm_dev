import { DatePipe } from '@angular/common';
import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { timer, switchMap } from 'rxjs';
import { Subscription } from 'rxjs/internal/Subscription';
import { SunshineInternalService } from 'src/app/sunshine-services/sunshine-internal.service';

interface Notification {
  title: string;
  message: string;
  date: Date;
  status: 'Draft' | 'In-progress' | 'Completed';
}

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css'],
})
export class NotificationComponent implements OnInit {
  app_user_id: any;
  advFilterForm: any;
  step: any = 1;

  pageSize: any = 5;
  pageIndex: number = 0;

  dataSource: any;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  notifications: any = [];
  paginatedNotifications: any = [];
  notificationsType: any = [];
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  durationInSeconds: number = 5;
  notificationsLength: number = 0;

  // @Output() notifCount = new EventEmitter();
  // message: string = '';
  subscription!: Subscription;
  autoRefresh: number = 1000;

  constructor(
    private _fb: FormBuilder,
    private _sunshineApi: SunshineInternalService,
    private _snackBar: MatSnackBar,
    private _datePipe: DatePipe
  ) {
    this.advFilterForm = this._fb.group({
      notification_type_id: [null],
      effective_from: [null],
      notification_acknowledged_on: [null],
    });
  }

  ngOnInit(): void {
    // this.dataSource.paginator = this.paginator;
    // this.dataSource.sort = this.sort;
    // this.dataSource = new MatTableDataSource(this.notifications);
    this.getAllNotificationType();
    let userDetails: any = sessionStorage.getItem('userDetails');
    let parsedUsrDetails = JSON.parse(userDetails);
    this.app_user_id = parsedUsrDetails.user_id;
    if (this.app_user_id) {
      // this.getAllNotifications(this.app_user_id)
      this.getAllNotifications(this.app_user_id);
      // this.updatePaginatedNotifications();
    }
  }
  ngAfterViewInit(): void {
    // Ensure paginator is set after view init
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  getAllNotificationType() {
    this._sunshineApi.fetchAllNotificationsType().then((res: any) => {
      if (res.errorCode == 0) {
        this.notificationsType = res.data[0];
        console.log('this.notificationsType-->', this.notificationsType);
      }
    });
  }

  getAllNotifications(user_id: any) {
    let params = { app_user_id: user_id };

    this._sunshineApi
      .fetchAllNotifications(params)
      .then((res: any) => {
        console.log('getAllNotifications-->', res);
        this.notifications = res.data[0].reverse();
        this.notificationsLength = this.notifications.length;
        
        console.log(this.notificationsLength);
        // this.notifCount.emit(this.notificationsLength);

        // //! Observable logic
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

        this._sunshineApi.updateNotificationCount(this.notificationsLength); // Emit count here
        // this.subscription = this._sunshineApi.currentMessage.subscribe(
        //   (message) => (this.message = message)
        // );
        this.updatePaginatedNotifications();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  filteNotification() {}

  getStatusColor(status: string): string {
    switch (status) {
      case 'Draft':
        return 'warn';
      case 'In-progress':
        return 'accent';
      case 'Completed':
        return 'primary';
      default:
        return '';
    }
  }

  // deleteNotification(notification: Notification) {
  //   this.notifications = this.notifications.filter(notif => notif !== notification);
  //   this.updatePaginatedNotifications();
  // }

  updatePaginatedNotifications() {
    // console.log(this.paginator)
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedNotifications = this.notifications.slice(
      startIndex,
      endIndex
    );
  }
  applyFilter(event: any) {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.paginatedNotifications = this.notifications.filter(
      (notification: any) =>
        notification.notification_type_description
          .toLowerCase()
          .includes(filterValue) ||
        notification.notification_message.toLowerCase().includes(filterValue)
    );
    this.notificationsLength = this.paginatedNotifications.length;
    this.paginatedNotifications = this.paginatedNotifications.slice(
      0,
      this.pageSize
    );
  }

  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.updatePaginatedNotifications();
  }

  advanceSearchFilters() {
    console.log(this.advFilterForm.value);
  }

  advanceSearchClearFilters() {}
  openSnackBar(message: string) {
    this._snackBar.open(message, 'Okay', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: this.durationInSeconds * 1000,
    });
    // this._snackBar.open(message);
  }

  markAsRead(notification: any) {
    console.log(notification);
    if (notification) {
      let payload = {
        app_user_id: this.app_user_id,
        user_notification_id: notification.user_notification_id,
        notification_acknowledged_on: this._datePipe.transform(
          new Date(),
          'yyyy-MM-dd hh:mm:ss'
        ),
      };

      this._sunshineApi
        .editNotification(payload)
        .then((res: any) => {
          console.log(res);
          if (res.errorCode == 0) {
            this.openSnackBar('Marked As Read');
            this.getAllNotifications(this.app_user_id);
          }
        })
        .catch((err) => {
          console.log(err);
          this.openSnackBar(err);
        });
    }
  }

  markAsUnread(notification: any) {
    // console.log(notification)
    // if (notification) {
    //   let payload = {
    //     app_user_id: this.app_user_id,
    //     user_notification_id: notification.user_notification_id,
    //     notification_acknowledged_on: null
    //   }
    //   this._sunshineApi.editNotification(payload).then((res: any) => {
    //     console.log(res);
    //     if (res.errorCode == 0) {
    //       this.openSnackBar('Marked As Unread');
    //       this.getAllNotifications(this.app_user_id)
    //     }else{
    //       this.openSnackBar('Something Went Wrong');
    //     }
    //   })
    //     .catch((err) => {
    //       console.log(err);
    //       this.openSnackBar(err)
    //     })
    // }
  }
}
