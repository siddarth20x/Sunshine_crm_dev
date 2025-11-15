import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { CustomFunctionsService } from 'src/app/sunshine-services/custom-functions.service';
import { SunshineInternalService } from 'src/app/sunshine-services/sunshine-internal.service';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-logs-interaction-tab',
  templateUrl: './logs-interaction-tab.component.html',
  styleUrls: ['./logs-interaction-tab.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed, void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class LogsInteractionTabComponent implements OnInit, AfterViewInit {
  currentDate: string | null = null;
  date7DaysAgo: string | null = null;
  allTaskTypes: any[] = [];
  displayedAccHoldersColumns: string[] = [];
  // dataSource = new MatTableDataSource<any>([]);

  // myDataArray:PeriodicElement[]=[];
  // dataSource = this.myDataArray;
  // columnsToDisplay = ['activity_dtm','activity_type','activity_detail'];
  // columnsToDisplayWithExpand = ['activity_dtm','activity_type','activity_detail','expand'];
  // expandedElement!: PeriodicElement | null;
  displayedColumns: string[] = [
    'activity_dtm',
    'activity_type',
    'task_status',
    'lead_status',
    'stage_status_code',
    'activity_detail',
  ];
  columnsToDisplayWithExpand: string[] = [
    'activity_dtm',
    'activity_type',
    'task_status',
    'lead_status',
    'stage_status_code',
    'activity_detail',
    'expand',
  ];
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  expandedElement: any | null = null;
  myDataArray: any[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  resultsLength: number = 0;
  tableTxt: string = '';
  showProgressBar: boolean = false;
  displayedLogsHoldersColumns: any = [
    'activity_dtm',
    'activity_type',
    'activity_detail',
    'expand',
  ];

  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  durationInSeconds = 5;
  leadId: number = 0;
  paginatedData: any[] = [];
  pageSize = 5;
  fromDate: any;
  toDate: any;

  activities = [
    { activity_type: 'TASK_INSERT', details: 'Details about TASK_INSERT' },
    { activity_type: 'TASK_UPDATE', details: 'Details about TASK_UPDATE' },
    {
      activity_type: 'ACCOUNT_UPDATE',
      details: 'Details about ACCOUNT_UPDATE',
    },
    {
      activity_type: 'ACCOUNT_INSERT',
      details: 'Details about ACCOUNT_INSERT',
    },
    { activity_type: 'NOTES_INSERT', details: 'Details about NOTES_INSERT' },
    { activity_type: 'NOTES_UPDATE', details: 'Details about NOTES_UPDATE' },
  ];
  createPrivilegeName: string = 'CREATE';
  uploadPrivilegeName: string = 'UPLOAD';
  readPrivilegeName: string = 'READ';
  editPrivilegeName: string = 'EDIT';
  moduleName: string = 'LOGS_AND_INTERACTIONS';
  isCreatePrivilegedModule: any;
  isUploadPrivilegedModule: any;
  isReadPrivilegedModule: any;
  isEditPrivilegedModule: any;
  currentTimestamp: string = '';
  currentDates: string = '';

  constructor(
    private _sunshineAPI: SunshineInternalService,
    private _snackBar: MatSnackBar,
    private _aR: ActivatedRoute,
    private customFn: CustomFunctionsService,
    private _datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.isCreatePrivilegedModule =
      this.customFn.checkForAllowedModuleAndPrivilegesForCreate(
        this.createPrivilegeName,
        this.moduleName
      );
    this.isUploadPrivilegedModule =
      this.customFn.checkForAllowedModuleAndPrivilegesForUpload(
        this.uploadPrivilegeName,
        this.moduleName
      );
    this.isReadPrivilegedModule =
      this.customFn.checkForAllowedModuleAndPrivilegesForRead(
        this.readPrivilegeName,
        this.moduleName
      );
    this.isEditPrivilegedModule =
      this.customFn.checkForAllowedModuleAndPrivilegesForEdit(
        this.editPrivilegeName,
        this.moduleName
      );

    this.currentDate = `${this.formatDate(
      new Date()
    )} ${this.getCurrentTimestamp()}`;
    this.date7DaysAgo = `${this.formatDate(
      new Date(new Date().setDate(new Date().getDate() - 7))
    )} ${this.getCurrentTimestamp()}`;

    this.captureRouteParams();

    // let now = new Date();
    // this.currentDates = now.toLocaleDateString(); // Get the current date
    // this.currentTimestamp = now.toLocaleTimeString();
    // console.log(this.currentDates, this.currentTimestamp);

    let now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + 1; // Months are zero-indexed
    let day = now.getDate();
    let hours = String(now.getHours()).padStart(2, '0');
    let minutes = String(now.getMinutes()).padStart(2, '0');
    let seconds = String(now.getSeconds()).padStart(2, '0');

    console.log(year, month, day, hours, minutes, seconds);
  }

  ngAfterViewInit() {
    // Ensure paginator and sort are properly connected after view initialization
    // This handles cases where data was loaded in ngOnInit before the view was ready
    if (this.dataSource && this.dataSource.data.length > 0) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }
  toggleRow(row: any) {
    row.expanded = !row.expanded;
    // this.dataSource = new MatTableDataSource(this.myDataArray);
  }
  isExpansionDetailRow = (index: number, row: any) => row.expanded === true;

  // getActivityTypeClass(activityType: string): string {
  //   switch (activityType) {
  //     case 'TASK_INSERT':
  //       return 'task-insert';
  //     case 'TASK_UPDATE':
  //       return 'task-update';
  //     case 'ACCOUNT_UPDATE':
  //       return 'account-update';
  //     case 'ACCOUNT_INSERT':
  //       return 'account-insert';
  //     case 'NOTES_INSERT':
  //       return 'notes-insert';
  //     case 'NOTES_UPDATE':
  //       return 'notes-update';
  //     default:
  //       return '';
  //   }
  // }

  // getActivityTypeLabel(activityType: string): string {
  //   switch (activityType) {
  //     case 'TASK_INSERT':
  //       return 'New Task Added';
  //     case 'TASK_UPDATE':
  //       return 'Task Updated';
  //     case 'ACCOUNT_INSERT':
  //       return 'New Account Added';
  //     case 'ACCOUNT_UPDATE':
  //       return 'Account Updated';
  //     case 'NOTES_INSERT':
  //       return 'New Note Added';
  //     case 'NOTES_UPDATE':
  //       return 'Note Updated';
  //     default:
  //       return 'Unknown Activity';
  //   }
  // }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  captureRouteParams() {
    let usrParams = this._aR.snapshot.params;
    //console.log(usrParams);
    let lead_id = parseInt(usrParams['leadId']);
    this.leadId = lead_id;
    this.getAllactivityLogs(lead_id);
  }

  fromDateHandler(event: any) {
    let dateEvent = event.value._i;
    //console.log(dateEvent);
    this.date7DaysAgo = `${dateEvent.year}-${dateEvent.month + 1}-${
      dateEvent.date
    }`;
    let date = new Date(this.date7DaysAgo);
    this.date7DaysAgo = this._datePipe.transform(
      date,
      `yyyy-MM-dd ${this.getCurrentTimestamp()}`
    );
    //console.log(this.date7DaysAgo)

    //console.log("this.date7DaysAgo-->", this.date7DaysAgo)
  }

  toDateHandler(event: any) {
    let dateEvent = event.value._i;
    this.currentDate = `${dateEvent.year}-${dateEvent.month + 1}-${
      dateEvent.date
    } `;
    let date = new Date(this.currentDate);
    this.currentDate = this._datePipe.transform(
      date,
      `yyyy-MM-dd ${this.getCurrentTimestamp()}`
    );
    //console.log(this.currentDate)

    // //console.log(this.getCurrentTimestamp())
  }
  getCurrentTimestamp() {
    let now = new Date();

    // let year = now.getFullYear();
    // let month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    // let day = String(now.getDate()).padStart(2, '0');

    let hours = String(now.getHours()).padStart(2, '0');
    let minutes = String(now.getMinutes()).padStart(2, '0');
    let seconds = String(now.getSeconds()).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
  }
  getAllactivityLogs(leadId: number) {
    this.showProgressBar = true;

    let leadParams = {
      lead_id: leadId,
      start_dtm: this.date7DaysAgo,
      end_dtm: this.currentDate,
      user_id: null,
      filter_user_id: null,
      filter_from_date: null,
      filter_to_date: null
    };
    // let leadParams = {
    //   lead_id: leadId,
    //   start_dtm: null,
    //   end_dtm: null,
    // };

    console.log('API call parameters:', leadParams);
    this._sunshineAPI
      .fetchLeadsActivityLogs(leadParams)
      .then((res: any) => {
        console.log('fetchLeadsActivityLogs full response-->', res);
        let resData = res.data[0];
        console.log('fetchLeadsActivityLogs resData-->', resData);
        
        if (resData && Array.isArray(resData)) {
          this.myDataArray = resData.reverse();
          this.dataSource = new MatTableDataSource(this.myDataArray);
          // Only assign paginator and sort if they are initialized
          if (this.sort) {
            this.dataSource.sort = this.sort;
          }
          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
          }
          this.resultsLength = resData.length;
          console.log('Activity logs loaded successfully, count:', this.resultsLength);
        } else {
          console.log('No activity logs data found or data is not an array');
          this.myDataArray = [];
          this.dataSource = new MatTableDataSource<any>([]);
          this.resultsLength = 0;
        }
        this.showProgressBar = false;
      })
      .catch((error) => {
        this.showProgressBar = false;
        console.error(error);
      });
  }

  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.paginator.pageIndex = event.pageIndex;
    this.paginateData();
  }

  paginateData() {
    let startIndex = this.paginator.pageIndex * this.pageSize;
    let endIndex = startIndex + this.pageSize;
    this.paginatedData = this.myDataArray.slice(startIndex, endIndex);
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, 'Okay', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: this.durationInSeconds * 1000,
    });
  }

  typeToFilter(event: Event) {
    let filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  applyFilters() {
    this.showProgressBar = true;

    let leadParams = {
      lead_id: this.leadId,
      start_dtm: this.date7DaysAgo,
      end_dtm: this.currentDate,
      user_id: null,
      filter_user_id: null,
      filter_from_date: null,
      filter_to_date: null
    };

    console.log('applyFilters API call parameters:', leadParams);
    this._sunshineAPI
      .fetchLeadsActivityLogs(leadParams)
      .then((res: any) => {
        let resData = res.data[0];
        console.log('fetchLeadsActivityLogs-->', resData);
        
        if (resData && Array.isArray(resData)) {
          this.myDataArray = resData.reverse();
          this.dataSource = new MatTableDataSource(this.myDataArray);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
          this.resultsLength = resData.length;
          this.paginateData();
        } else {
          this.myDataArray = [];
          this.dataSource = new MatTableDataSource<any>([]);
          this.resultsLength = 0;
        }
        this.showProgressBar = false;
      })
      .catch((error) => {
        this.showProgressBar = false;
        console.error(error);
      });
  }

  clearFilters() {
    this.showProgressBar = true;

    this.currentDate = null;
    this.date7DaysAgo = null;
    let leadParams = { 
      lead_id: this.leadId, 
      start_dtm: null, 
      end_dtm: null,
      user_id: null,
      filter_user_id: null,
      filter_from_date: null,
      filter_to_date: null
    };
    console.log('clearFilters - Testing without date filters:', leadParams);
    this._sunshineAPI
      .fetchLeadsActivityLogs(leadParams)
      .then((res: any) => {
        let resData = res.data[0];
        
        if (resData && Array.isArray(resData)) {
          this.myDataArray = resData.reverse();
          this.dataSource = new MatTableDataSource(this.myDataArray);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
          this.resultsLength = resData.length;
          this.paginateData();
        } else {
          this.myDataArray = [];
          this.dataSource = new MatTableDataSource<any>([]);
          this.resultsLength = 0;
        }
        this.showProgressBar = false;
      })
      .catch((error) => {
        this.showProgressBar = false;
        console.error(error);
      });
  }

  applyFilter(event: Event) {
    let filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Format activity type to human readable format
  formatActivityType(activityType: string): string {
    const activityTypeMap: { [key: string]: string } = {
      'MOL_CHECK_INSERT': 'MOL Check Added',
      'VISA_CHECK_INSERT': 'Visa Check Added',
      'LEADS_PAYMENT_LEDGER_INSERT': 'Payment Ledger Entry Added',
      'ADDRESS_INSERT': 'Address Added',
      'CONTACT_INSERT': 'Contact Added',
      'TRACED_DETAILS_INSERT': 'Tracing Details Added',
      'NOTES_INSERT': 'Note Added',
      'TASK_INSERT': 'Task Created',
      'NEW_ACCOUNT': 'New Account Created',
      'TASK_UPDATE': 'Task Updated',
      'ACCOUNT_UPDATE': 'Account Updated',
      'ACCOUNT_INSERT': 'Account Inserted',
      'NOTES_UPDATE': 'Note Updated',
      'CONTACT_UPDATE': 'Contact Updated',
      'ADDRESS_UPDATE': 'Address Updated',
      'MOL_CHECK_UPDATE': 'MOL Check Updated',
      'VISA_CHECK_UPDATE': 'Visa Check Updated',
      'PAYMENT_LEDGER_UPDATE': 'Payment Ledger Updated',
      'TRACED_DETAILS_UPDATE': 'Tracing Details Updated'
    };
    
    return activityTypeMap[activityType] || activityType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

}
