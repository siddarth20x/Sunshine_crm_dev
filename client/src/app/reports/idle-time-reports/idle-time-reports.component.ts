import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SunshineInternalService } from 'src/app/sunshine-services/sunshine-internal.service';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-idle-time-reports',
  templateUrl: './idle-time-reports.component.html',
  styleUrls: ['./idle-time-reports.component.css'],
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
export class IdleTimeReportsComponent implements OnInit {
  loggedInUserId: any;
  fromTime: string = '';
  toTime: string = '';
  disableGenerateBtn: boolean = true;
  disableExportBtn: boolean = true;
  Math = Math; // Make Math available in template

  dataSource: any;
  expandedElement: any | null = null;
  myDataArray: any[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  resultsLength: number = 0;
  tableTxt: string = '';
  showProgressBar: boolean = false;
  columnsToDisplayWithExpand: string[] = [
    'full_name',
    'roles',
    'last_login',
    'last_activity_dtm',
    'idle_time_in_mins',
    // 'report_start_time',
    // 'report_end_time',
    'expand',
  ];

  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  durationInSeconds = 5;
  paginatedData: any[] = [];
  pageIndex = 0;
  pageSize = 20;
  totalResults = 0;
  private fetchUsersSubject = new Subject<number>();

  constructor(
    private _sunshineAPI: SunshineInternalService,
    private _datePipe: DatePipe,
    private _snackBar: MatSnackBar
  ) {
    // Debounce API calls to avoid multiple rapid requests
    this.fetchUsersSubject.pipe(debounceTime(400)).subscribe((userId) => {
      this._fetchAllInactiveUsers(userId);
    });
  }

  ngOnInit(): void {
    let usrDetails: any = sessionStorage.getItem('userDetails');
    let parsedUsrDetails = JSON.parse(usrDetails);
    this.loggedInUserId = parsedUsrDetails.user_id;

    // Set default dates: from=today, to=tomorrow (to ensure valid date range for SP)
    this.fromTime = this.calculateCurrentDate();
    this.toTime = this.calculateNextDate(); // Tomorrow instead of today
    this.disableGenerateBtn = false; // Enable since we have default dates

    console.log('Component initialized with date range:', this.fromTime, 'to', this.toTime);
    // Auto-load disabled - user must click "Generate" button
    // this.getAllInactiveUsers(this.loggedInUserId);
  }

  private calculateCurrentDate(): string {
    let now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const day = String(now.getDate()).padStart(2, '0');
    const adjustedDate = `${year}-${month}-${day}`;
    return adjustedDate;
  }

  private calculateNextDate(): string {
    let tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1); // Add 1 day
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    const adjustedDate = `${year}-${month}-${day}`;
    return adjustedDate;
  }

  fromDateHandler(event: any) {
    this.fromTime = event.target.value;
    console.log('From Date selected:', this.fromTime);
    this.disableGenerateBtn = false;
    this.disableExportBtn = true;
    // Reset pagination when filter changes
    this.pageIndex = 0;
    
    // Validate date range (auto-trigger disabled - user must click Generate)
    if (this.fromTime && this.toTime) {
      const startDate = new Date(this.fromTime);
      const endDate = new Date(this.toTime);
      
      if (startDate > endDate) {
        this.openSnackBar('Start date cannot be after end date. Please adjust your selection.');
        return;
      }
      
      console.log('Date range validated:', this.fromTime, 'to', this.toTime);
      // Auto-trigger disabled - user must click "Generate" button
      // this.getAllInactiveUsers(this.loggedInUserId);
    }
  }

  toDateHandler(event: any) {
    this.toTime = event.target.value;
    console.log('To Date selected:', this.toTime);
    this.disableGenerateBtn = false;
    this.disableExportBtn = true;
    // Reset pagination when filter changes
    this.pageIndex = 0;
    
    // Validate date range (auto-trigger disabled - user must click Generate)
    if (this.fromTime && this.toTime) {
      const startDate = new Date(this.fromTime);
      const endDate = new Date(this.toTime);
      
      if (startDate > endDate) {
        this.openSnackBar('End date cannot be before start date. Please adjust your selection.');
        return;
      }
      
      console.log('Date range validated:', this.fromTime, 'to', this.toTime);
      // Auto-trigger disabled - user must click "Generate" button
      // this.getAllInactiveUsers(this.loggedInUserId);
    }
  }
  ngAfterViewInit() {
    // this.dataSource.paginator = this.paginator;
    // this.dataSource.sort = this.sort;
  }
  getAllInactiveUsers(appUserId: number) {
    this.showProgressBar = true;
    this.disableExportBtn = true;
    this.fetchUsersSubject.next(appUserId);
  }

  private _fetchAllInactiveUsers(appUserId: number) {
    // Format dates for API request - using date only without time
    const startDate = this.fromTime ? new Date(this.fromTime) : null;
    const endDate = this.toTime ? new Date(this.toTime) : null;

    console.log('Raw date inputs - fromTime:', this.fromTime, 'toTime:', this.toTime);
    console.log('Parsed dates - startDate:', startDate, 'endDate:', endDate);

    // Validate date range
    if (startDate && endDate && startDate > endDate) {
      this.openSnackBar('Start date cannot be after end date. Please check your date selection.');
      this.showProgressBar = false;
      return;
    }

    let params = {
      app_user_id: appUserId,
      start_dtm: startDate ? this._datePipe.transform(startDate, 'yyyy-MM-dd') : null,
      end_dtm: endDate ? this._datePipe.transform(endDate, 'yyyy-MM-dd') : null,
      company_id: 1,
      page: this.pageIndex,
      pageSize: this.pageSize
    };

    console.log('=== DATE FILTER DEBUG ===');
    console.log('Formatted API Request params:', params);
    console.log('Date range being sent to API:', params.start_dtm, 'to', params.end_dtm);
    console.log('========================');

    this._sunshineAPI
      .fetchInactiveUsers(params)
      .then((res: any) => {
        console.log('=== API RESPONSE DEBUG ===');
        console.log('Full API response:', res);
        console.log('res.data:', res.data);
        
        // Handle the nested array structure from API response
        let resData = [];
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          // Check if data is nested array structure [[...]] or flat array [...]
          if (Array.isArray(res.data[0])) {
            resData = res.data[0]; // Nested array structure
          } else {
            resData = res.data; // Flat array structure
          }
        }
        
        console.log('Processed resData:', resData);
        console.log('Number of records found for date range', params.start_dtm, 'to', params.end_dtm, ':', resData.length);
        
        // Debug: Check if the returned data actually matches the date filter
        if (resData.length > 0) {
          console.log('Sample records (first 3):');
          resData.slice(0, 3).forEach((record: any, index: number) => {
            console.log(`Record ${index + 1}:`, {
              name: record.full_name,
              last_login: record.last_login,
              last_activity: record.last_activity_dtm,
              report_start: record.report_start_time,
              report_end: record.report_end_time
            });
          });
        }
        console.log('========================');
        
        // TEMPORARY FIX: Since API is not filtering properly, filter on frontend
        let filteredData = resData;
        
        if (this.fromTime && this.toTime) {
          const startDate = new Date(this.fromTime);
          const endDate = new Date(this.toTime);
          
          console.log('Applying client-side date filtering...');
          console.log('Original data count:', resData.length);
          
          filteredData = resData.filter((user: any) => {
            // Check multiple date fields to see which one should be used for filtering
            const lastLogin = user.last_login ? new Date(user.last_login) : null;
            const lastActivity = user.last_activity_dtm ? new Date(user.last_activity_dtm) : null;
            const reportStart = user.report_start_time ? new Date(user.report_start_time) : null;
            const reportEnd = user.report_end_time ? new Date(user.report_end_time) : null;
            
            // For idle time reports, we probably want to filter by last_activity_dtm or last_login
            // Let's try filtering by last_activity_dtm first, then last_login if no activity date
            const dateToCheck = lastActivity || lastLogin;
            
            if (dateToCheck) {
              const isInRange = dateToCheck >= startDate && dateToCheck <= endDate;
              if (!isInRange) {
                console.log(`Filtering out user ${user.full_name}: date ${dateToCheck.toDateString()} not in range ${startDate.toDateString()} - ${endDate.toDateString()}`);
              }
              return isInRange;
            }
            
            // If no date available, exclude from results
            console.log(`Filtering out user ${user.full_name}: no valid date found`);
            return false;
          });
          
          console.log('Filtered data count:', filteredData.length);
        }
        
        this.totalResults = filteredData.length;
        this.myDataArray = filteredData;
        this.resultsLength = this.myDataArray.length;
        
        // Initialize MatTableDataSource with the filtered data
        this.dataSource = new MatTableDataSource(this.myDataArray);
        
        console.log('Final myDataArray:', this.myDataArray);
        console.log('Final resultsLength:', this.resultsLength);
        
        this.showProgressBar = false;
        
        // For server-side pagination, we don't connect the paginator to dataSource
        // The pagination is handled by the onPageChange method
        if (this.sort) {
          this.dataSource.sort = this.sort;
        }
        
        this.disableExportBtn = this.resultsLength === 0;
      })
      .catch((error) => {
        console.error('Error fetching inactive users:', error);
        this.disableExportBtn = true;
        this.showProgressBar = false;
        this.openSnackBar('Error loading idle time data. Please try again.');
        
        // Clear data on error to show 'no results'
        this.myDataArray = [];
        this.resultsLength = 0;
        this.totalResults = 0;
        this.dataSource = new MatTableDataSource([]);
      });
  }

  exportToExcelFormat(responseData: any[], filename: string) {
    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';
    //   const ws = XLSX.utils.json_to_sheet(reponseData);
  //   const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
  //   const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  //   const data = new Blob([excelBuffer], { type: fileType });
  //   FileSaver.saveAs(data, filename + fileExtension);
  // }


  //! TYPE 2 : FUNCTION TO EXPORT THE EXCEL WITH TRANSFORMED HEADERS
  // exportToExcelFormat(responseData: any[], filename: string) {
  //   const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  //   const fileExtension = '.xlsx';
    // Function to transform keys
    const transformKeys = (obj: any) => {
      const newObj: any = {};
      for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
          // Convert key to uppercase and remove special characters
          const newKey = key.toUpperCase().replace(/[^A-Z0-9]/g, ' ');
          newObj[newKey] = obj[key];
        }
      }
      return newObj;
    };
  
    // Transform the response data
    const transformedData = responseData.map(item => transformKeys(item));
  
    // Create worksheet and workbook
    const ws = XLSX.utils.json_to_sheet(transformedData);
    const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
  
    // Write workbook to buffer
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  
    // Save file
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, filename + fileExtension);
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, 'Okay', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: this.durationInSeconds * 1000,
    });
  }
  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.getAllInactiveUsers(this.loggedInUserId);
  }

  paginateData() {
    const startIndex = this.paginator.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedData = this.myDataArray.slice(startIndex, endIndex);
  }

  clearFilters() {
    this.showProgressBar = true;

    // Reset dates and pagination
    this.toTime = '';
    this.fromTime = '';
    this.pageIndex = 0;
    this.disableGenerateBtn = true;
    
    const leadParams = {
      app_user_id: this.loggedInUserId,
      start_dtm: null,
      end_dtm: null,
      company_id: 1,
      page: this.pageIndex,
      pageSize: this.pageSize
    };
    this._sunshineAPI
      .fetchInactiveUsers(leadParams)
      .then((res: any) => {
        // Handle the nested array structure from API response
        let resData = [];
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          // Check if data is nested array structure [[...]] or flat array [...]
          if (Array.isArray(res.data[0])) {
            resData = res.data[0]; // Nested array structure
          } else {
            resData = res.data; // Flat array structure
          }
        }
        
        this.myDataArray = resData;
        this.resultsLength = this.myDataArray.length;
        this.dataSource = new MatTableDataSource(this.myDataArray);
        this.showProgressBar = false;
      })
      .catch((error) => {
        this.showProgressBar = false;
        console.error(error);
      });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
