import { AfterViewInit, Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { SunshineInternalService } from './sunshine-services/sunshine-internal.service';
import { filter } from 'rxjs';
import { NotificationService } from './shared/services/notification.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  title = 'Sunshine';

  routerLink: any;
  isHidden: boolean = true;
  topNavItems = [
    { label: 'Dashboard', route: '/dashboard', icon: 'dashboard', exact: true },
    { label: 'Account Management', route: '/account-management', icon: 'manage_accounts', exact: false },
    { label: 'Bank Management', route: '/client-management', icon: 'account_balance', exact: false },
    { label: 'Activity Logs', route: '/activity-logs', icon: 'history', exact: true },
    { label: 'Disposition Code', route: '/disposition-code', icon: 'inventory', exact: false },
    { label: 'Reports', route: '/reports', icon: 'bar_chart', exact: false },
    { label: 'Targets', route: '/targets', icon: 'track_changes', exact: false },
    { label: 'Support', route: '/support', icon: 'support_agent', exact: true },
    { label: 'Training and COC', route: '/training-coc', icon: 'school', exact: true },
    { label: 'User Details', route: '/user-management', icon: 'person', exact: false }
  ];
  userFirstName: string = '';
  userLastName: string = '';
  userImage: string = '';
  userDesignation: string = '';
  notificationCount: any;
  notifications: any;
  showNotif: boolean = false;
  userId: any;

  constructor(
    private router: Router,
    private _sunshineAPI: SunshineInternalService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Start notification service to handle sidebar status
    this.notificationService.startNotificationChecks();
    
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        )
      )
      .subscribe((event: NavigationEnd) => {
        // Use urlAfterRedirects for robustness
        this.routerLink = event.urlAfterRedirects ? event.urlAfterRedirects.split('?')[0] : event.url.split('?')[0];
        this.isHidden = !(this.routerLink.includes('/login') || this.routerLink.includes('/forgot-password'));

        let userDetails: any;

        if (
          this.routerLink !== '/login' &&
          this.routerLink !== '/forgot-password'
        ) {
          // console.log(this.routerLink)
          userDetails = this.getUserDetailsFromSession();
          // console.log('on-login-ui>>>',userDetails);
          if (userDetails && userDetails !== null) {
            this.setUserDetails(userDetails);
            this._sunshineAPI.currentNotificationCount.subscribe((count) => {
              // console.log(count);
              this.getAllNotifications(this.userId);
            });
            
            // Refresh sidebar status for reminders when navigating
            this.notificationService.refreshSidebarStatus();
          }
        }
        if (!this.isHidden && userDetails) {
          this.setUserDetails(userDetails);
        }
      });
  }

  ngOnDestroy(): void {
    // Clean up notification checks when component is destroyed
    this.notificationService.stopNotificationChecks();
  }

  getUserDetailsFromSession(): any | null {
    const sessionData = sessionStorage.getItem('userDetails');
    return sessionData ? JSON.parse(sessionData) : null;
  }

  setUserDetails(userDetails: any): void {
    this.userId = userDetails.user_id;
    this.userDesignation = userDetails.designation;
    this.userFirstName = userDetails.first_name;
    this.userLastName = userDetails.last_name;
    this.userImage = userDetails.image_url;
  }

  ngAfterViewInit() {}

  getAllNotifications(user_id: any) {
    let params = { app_user_id: user_id };
    this._sunshineAPI
      .fetchAllNotifications(params)
      .then((res: any) => {
        this.notifications = res.data[0];
        // this.notificationCount = this.notifications.length;
        let unacknowledgedNotifications = this.notifications.filter(
          (notification: { notification_acknowledged_on: null }) =>
            notification.notification_acknowledged_on === null
        );
        this.notificationCount = unacknowledgedNotifications.length;
        // console.log(this.notificationCount);
        this.notificationCount > 99
          ? (this.notificationCount = '99+')
          : this.notificationCount;
      })
      .catch((err) => {
        console.error('Error fetching notifications:', err);
      });
  }
}
