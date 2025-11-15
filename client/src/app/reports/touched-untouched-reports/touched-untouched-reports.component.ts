import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
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
import { FormControl } from '@angular/forms';
import { Observable, startWith, map, of } from 'rxjs';

@Component({
  selector: 'app-touched-untouched-reports',
  templateUrl: './touched-untouched-reports.component.html',
  styleUrls: ['./touched-untouched-reports.component.css'],
})
export class TouchedUntouchedReportsComponent implements OnInit {
  loggedInUserId: any;
  fromDate: string = '';
  toDate: string = '';
  disableGenerateBtn: boolean = true;

  dataSource: any;
  expandedElement: any | null = null;
  myDataArray: any[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  resultsLength: number = 0;
  tableTxt: string = '';
  showProgressBar: boolean = false;
  columnsToDisplayWithExpand: string[] = [
    'lead_id',
    'company_name',
    'product_type',
    'customer_id',
    'account_number',
    'last_activity_dtm',
    'tnc',
    'no_of_allocation_days',
    'agreement_id',
    'customer_name',
    'total_outstanding_amount',
    'tracing_source_type_name',
    'visa_status',
    'mol_status',
    'note',
    'stage_status_code',
    'assigned_to_full_name',
    'assigned_by_full_name',
    'team_manager_full_name',
    'senior_manager_full_name',
  ];

  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  durationInSeconds = 5;
  paginatedData: any[] = [];
  pageSize = 5;

  stageArr: Array<string> = ['TOUCHED', 'UNTOUCHED', 'ALL'];
  dailyRepParams: any = {
    app_user_id: null,
    lead_id: null,
    agent_id: null,
    company_id: null,
    start_dtm: null,
    end_dtm: null,
    stage: null,
    stage_status_code: null,
    contact_mode_list: null,
    report_name: 'touched-untouched-report',
  };

  disableExportBtn: boolean = true;
  showCNCTBLBtn: boolean = false;
  myDataArrayCopy: any[] = [];

  allUsersArr: any[] = [];
  agentFullName = new FormControl();
  agentFilteredOptions!: Observable<any[]>;

  companyName = new FormControl();
  companyNameFilteredOptions!: Observable<any[]>;
  companyArr: any[] = [];

  associatedUsers: any = [];
  assignedCompanies: any = [];
  selectedStage: string = 'ALL';
  uiSelectedStage: string = 'ALL'; // Track UI selection separately from API params
  loggedInUserRoleName: any = '';
  showUserFilter: boolean = true;

  constructor(
    private _sunshineAPI: SunshineInternalService,
    private _datePipe: DatePipe,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    let usrDetails: any = sessionStorage.getItem('userDetails');
    let parsedUsrDetails = JSON.parse(usrDetails);
    this.loggedInUserId = parsedUsrDetails.user_id;
    this.loggedInUserRoleName = parsedUsrDetails.role_name;
    
    // Hide user filter for AGENT role
    if (this.loggedInUserRoleName == 'AGENT') {
      this.showUserFilter = false;
    }
    
    // this.generateCNCReport(this.loggedInUserId);
    this.getAllUsers();
    this.getAllClients();
    this.getAssociatedUsers();

    this.fromDate = this.calculateCurrentDate();
    // console.log(this.fromDate);
    this.dailyRepParams.start_dtm = this.fromDate;
    this.toDate = this.calculateCurrentDate();
    this.dailyRepParams.end_dtm = this.toDate;
    this.dailyRepParams.to_dtm = this.toDate;

    console.log(this.dailyRepParams);
  }
  private calculateCurrentDate(): string {
    let now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const day = String(now.getDate()).padStart(2, '0');
    this.disableGenerateBtn = false;

    const adjustedDate = `${year}-${month}-${day}`;
    return adjustedDate;
  }
  getAssociatedUsers() {
    let params = { reporting_to_id: this.loggedInUserId };
    this._sunshineAPI
      .fetchAllAssociatedAgents(params)
      .then((res: any) => {
        let response = res.data[0];
        this.associatedUsers = response;
        console.log(response);
        this.agentFilteredOptions = this.agentFullName.valueChanges.pipe(
          startWith(''),
          //   tap((value) =>
          //     console.log('Initial value:', value)
          // ),
          map((value) => {
            const stringValue =
              typeof value === 'string' ? value : value?.full_name || '';
            // console.log('Mapped value:', stringValue);
            return stringValue;
          }),
          map((fullName) => {
            const filteredResults = fullName
              ? this._filterAssignedBy(fullName)
              : response.slice();
            // console.log('Filtered results:', filteredResults);
            return filteredResults;
          })
        );
      })
      .catch((error) => {
        this.showProgressBar = false;
        console.error(error);
      });
  }

  getAllUsers() {
    this.showProgressBar = true;
    this._sunshineAPI
      .fetchAllUsers()
      .then((res: any) => {
        let resData = res.data[0];
        // Filter out deactivated users (status = 0)
        this.allUsersArr = resData.filter((user: any) => user.status !== 0);
        // this.allUsersArr = resData.filter((role: any) => {
        //   return role.role_name == 'AGENT';
        // });
        console.log(this.allUsersArr);
        this.showProgressBar = false;
        // this.agentFilteredOptions = this.agentFullName.valueChanges.pipe(
        //   startWith(''),
        //   //   tap((value) =>
        //   //     console.log('Initial value:', value)
        //   // ),
        //   map((value) => {
        //     const stringValue =
        //       typeof value === 'string' ? value : value.full_name;
        //     // console.log('Mapped value:', stringValue);
        //     return stringValue;
        //   }),
        //   map((fullName) => {
        //     const filteredResults = fullName
        //       ? this._filterAssignedBy(fullName)
        //       : this.allUsersArr.slice();
        //     // console.log('Filtered results:', filteredResults);
        //     return filteredResults;
        //   })
        // );

        // this.receiveInjectedData();
      })
      .catch((error) => {
        this.showProgressBar = false;
        console.error(error);
      });
  }
  private _filterAssignedBy(fullName: string): any[] {
    const filterValue = fullName.toLowerCase();
    return this.associatedUsers.filter((option: any) =>
      option.full_name.toLowerCase().includes(filterValue)
    );
  }
  private _filterCompanies(fullName: string): any[] {
    const filterValue = fullName.toLowerCase();
    return this.assignedCompanies.filter((option: any) =>
      option.company_name.toLowerCase().includes(filterValue)
    );
  }
  getAllClients() {
    this.showProgressBar = true;

    this._sunshineAPI
      .fetchAllCompany()
      .then((res: any) => {
        let resData = res.data;

        this.companyArr = resData.reverse();
        console.log('company-res:::', this.companyArr);
        this.showProgressBar = false;
        // this.companyNameFilteredOptions = this.companyName.valueChanges.pipe(
        //   startWith(''),
        //   //   tap((value) =>
        //   //     console.log('Initial value:', value)
        //   // ),
        //   map((value) => {
        //     const stringValue =
        //       typeof value === 'string' ? value : value.company_name;
        //     // console.log('Mapped value:', stringValue);
        //     return stringValue;
        //   }),
        //   map((companyName) => {
        //     const filteredResults = companyName
        //       ? this._filterCompanies(companyName)
        //       : this.companyArr.slice();
        //     // console.log('Filtered results:', filteredResults);
        //     return filteredResults;
        //   })
        // );
      })
      .catch((error) => {
        this.showProgressBar = false;
        console.error(error);
      });
  }
  agentHandler(value: any) {
    console.log(value);
    if (value) {
      console.log(this.allUsersArr);
      const user = this.allUsersArr.find(
        (user: any) => user.full_name === value
      );

      if (!user) {
        console.log('User not found');
        return;
      }

      const { user_id, full_name, email_address } = user;
      console.log(user_id);

      this.dailyRepParams.agent_id = user_id;
      this.disableGenerateBtn = false;
      this.getUserCompany(user_id);
    } else {
      this.companyNameFilteredOptions = of([]); // Assigning an observable of an empty array
    }
  }

  getUserCompany(agent_id: any) {
    let params = { user_id: agent_id };

    this._sunshineAPI
      .fectchUserCompany(params)
      .then((companyRes: any) => {
        const resData = companyRes?.data?.[0] || [];
        this.assignedCompanies = resData;
        this.companyNameFilteredOptions = this.companyName.valueChanges.pipe(
          startWith(''),
          //   tap((value) =>
          //     console.log('Initial value:', value)
          // ),
          map((value) => {
            const stringValue =
              typeof value === 'string' ? value : value?.company_name || '';
            // console.log('Mapped value:', stringValue);
            return stringValue;
          }),
          map((companyName) => {
            const filteredResults = companyName
              ? this._filterCompanies(companyName)
              : resData.slice();
            // console.log('Filtered results:', filteredResults);
            return filteredResults;
          })
        );
      })
      .catch((error: any) => {
        console.error('Error fetching user company:', error);
        const errorMessage =
          error?.message ||
          'An error occurred while fetching user company details.';
        // this.openSnackBar(errorMessage);
      });
  }
  companyHandler(value: any) {
    console.log(value);
    console.log(this.companyArr);
    const company = this.companyArr.find(
      (user: any) => user.company_name === value
    );

    if (!company) {
      console.log('Company not found');
      return;
    }

    const { company_id, company_name } = company;
    console.log(company_id);
    this.dailyRepParams.company_id = company_id;
    this.disableGenerateBtn = false;
  }

  fromDateHandler(event: any) {
    let inputDate = event.value._i;
    let fromDate = `${inputDate.year}-${inputDate.month + 1}-${inputDate.date}`;
    console.log('from-event', fromDate);
    this.dailyRepParams.start_dtm = fromDate;
    this.disableGenerateBtn = false;
  }

  toDateHandler(event: any) {
    let inputDate = event.value._i;
    let toDate = `${inputDate.year}-${inputDate.month + 1}-${inputDate.date}`;
    console.log('to-event', toDate);
    this.dailyRepParams.to_dtm = toDate;
    this.disableGenerateBtn = false;

    // console.log(
    //   'to-event',
    //   this._datePipe.transform(event.value._i, 'yyyy-MM-dd')
    // );
  }
  private uniqueResponseHandler(dailyResponse: any) {
    let fieldsTobeUnique = [
      'agreement_id',
      'customer_id',
      'product_type',
      'customer_name',
      'assigned_to',
      'assigned_by',
      'team_manager_id',
      'senior_manager_id',
      'last_activity_dtm',
    ];
    // console.log(dailyResponse);
    const uniqueRecords = dailyResponse.filter(
      (value: { [x: string]: any }, index: any, self: any[]) => {
        const identifier = fieldsTobeUnique
          .map((field) => value[field])
          .join('|');
        return (
          index ===
          self.findIndex((obj: { [x: string]: any }) =>
            fieldsTobeUnique.every((field) => obj[field] === value[field])
          )
        );
      }
    );

    // console.log(uniqueRecords);
    return uniqueRecords;
  }
  generateCNCReport(appUserId: number) {
    this.showProgressBar = true;
    console.log('touched-untouched-params::', this.dailyRepParams);

    this.dailyRepParams.app_user_id = appUserId;
    // Ensure we fetch all leads for proper touched/untouched filtering
    this.dailyRepParams.stage = null;

    this._sunshineAPI
      .contactableNonContactableReports(this.dailyRepParams)
      .then((res: any) => {
        const resData = res.data[0] || []; // Ensure resData is always an array
        // console.log('non-unique-response-TOUCHED/UNTOUCHED-reports::', resData);
        this.myDataArray = this.uniqueResponseHandler(resData);
        // console.log(
        //   'unique-response-TOUCHED/UNTOUCHED-reports::',
        //   this.myDataArray
        // );

        this.myDataArrayCopy = [...this.myDataArray]; // Store a reference-safe copy
        
        // Apply the current stage filter if one is selected
        if (this.uiSelectedStage && this.uiSelectedStage !== 'ALL') {
          this.applyStageFilter(this.uiSelectedStage);
        } else {
          // Set up the data source with all data initially
          this.dataSource = new MatTableDataSource(this.myDataArray);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
          this.resultsLength = this.myDataArray.length;
        }

        this.showProgressBar = false;
        if (this.myDataArray.length > 0) {
          this.showCNCTBLBtn = true;
          this.disableExportBtn = false;
        }
      })
      .catch((error) => {
        console.error(error);
        this.showProgressBar = false;
      });
  }

  contactableHandler(event: any) {
    let tnt = event.value;
    this.disableGenerateBtn = false;
    console.log('tnt:::', tnt);

    // For touched-untouched report, always fetch all data from backend
    // Note: The backend currently only returns leads with activity logs in the date range
    // This means it can only show "touched" leads, not "untouched" ones
    // To properly show untouched leads, the backend would need to be modified
    this.dailyRepParams.stage = null; // Always fetch all data
    this.uiSelectedStage = tnt; // Track UI selection
    this.selectedStage = tnt; // Update UI display

    // If data is already loaded, apply the filter
    if (this.myDataArrayCopy && this.myDataArrayCopy.length > 0) {
      this.applyStageFilter(tnt);
    }
  }

  private applyStageFilter(stage: string) {
    if (!this.myDataArrayCopy || this.myDataArrayCopy.length === 0) {
      // If no data is loaded yet, just update the UI state
      return;
    }

    if (stage === 'UNTOUCHED') {
      // For untouched, we want records where last_activity_dtm is null
      // This means no activity was recorded in the date range
      this.myDataArray = this.myDataArrayCopy.filter(
        (item: any) => item.last_activity_dtm == null
      );
      
      // If no untouched records found, show a message
      if (this.myDataArray.length === 0) {
        this.openSnackBar('No untouched records found in the selected date range. All leads in this period have activity logs.', 'info');
      }
    } else if (stage === 'TOUCHED') {
      // For touched, we want records where last_activity_dtm is not null
      // This means activity was recorded in the date range
      this.myDataArray = this.myDataArrayCopy.filter(
        (item: any) => item.last_activity_dtm !== null
      );
    } else {
      // ALL option - show all records
      this.myDataArray = [...this.myDataArrayCopy];
    }

    this.dataSource = new MatTableDataSource(this.myDataArray);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.resultsLength = this.myDataArray.length;
    
    console.log(`Filtered ${stage} records:`, this.myDataArray.length);
  }

  private openSnackBar(message: string, type: 'success' | 'error' | 'info' = 'info') {
    this._snackBar.open(message, 'Close', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: this.durationInSeconds * 1000,
      panelClass: type === 'error' ? ['error-snackbar'] : type === 'success' ? ['success-snackbar'] : ['info-snackbar']
    });
  }

  //! TYPE 2 : FUNCTION TO EXPORT THE EXCEL WITH TRANSFORMED HEADERS
  exportToExcelFormat(responseData: any[], filename: string) {
    const fileType =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';

    const keyAliases: any = {
      company_name: 'Bank Name',
      agreement_id: 'Aggreement No. / CRN No.',
      customer_id: 'Customer Id / CIF No.',
      product_type: 'Product Type',
      product_account_number: 'Product Account No',
      account_number:'Account no - Agreement No',
      allocation_status:'Allocation-Status',
      visa_passport_no : 'Passport-No',
      customer_name: 'Customer Name',
      last_activity_dtm: 'Touched / Untouched',
      no_of_allocation_days: 'No. of days from allocation',
      assigned_to_full_name: 'Agent Id',
      assigned_by_full_name: 'Team Leader Id',
      team_manager_full_name: 'Team Manager Id',
      senior_manager_full_name: 'Senior Manager Id',
    };

    // Function to transform keys
    const transformKeys = (obj: any) => {
      const newObj: any = {};
      for (let key in obj) {
        if (obj.hasOwnProperty(key) && keyAliases.hasOwnProperty(key)) {
          let value = obj[key];
          // Special condition for last_activity_dtm
          if (key === 'last_activity_dtm') {
            value = value !== null ? 'Touched' : 'Untouched';
          }
          // Use alias from the keyAliases object
          const newKey = keyAliases[key];
          newObj[newKey] = value;
        }
      }
      return newObj;
    };

    // Transform the response data
    const transformedData = responseData.map((item) => transformKeys(item));

    // Create worksheet and workbook
    const ws = XLSX.utils.json_to_sheet(transformedData);
    const wb = { Sheets: { data: ws }, SheetNames: ['data'] };

    // Write workbook to buffer
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    // Save file
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, filename + fileExtension);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  clearFilters() {
    this.showProgressBar = true;
    // Reset stage selection
    this.selectedStage = 'ALL';
    this.uiSelectedStage = 'ALL';
    this.dailyRepParams.stage = null;
    // this.dailyRepParams.app_user_id = this.loggedInUserId;
    this.generateCNCReport(this.loggedInUserId);
  }

  clearAgentSelection() {
    this.agentFullName.setValue(null);
    this.companyName.setValue(null);
    this.companyNameFilteredOptions = of([]);
    this.dailyRepParams.agent_id = null;
    this.dailyRepParams.company_id = null;
    // Reset the observable streams to prevent null reference errors
    this.agentFilteredOptions = of([]);
    // Removed API call to getAssociatedUsers() to prevent unnecessary API calls when clearing filters
    // this.agentFullName.reset();
  }
  clearcompanySelection() {
    this.companyName.setValue(null);
    this.dailyRepParams.company_id = null;
    // Reset the observable stream to prevent null reference errors
    this.companyNameFilteredOptions = of([]);
    // Removed API call to getUserCompany() to prevent unnecessary API calls when clearing filters
    // this.companyName.reset();
  }
}
