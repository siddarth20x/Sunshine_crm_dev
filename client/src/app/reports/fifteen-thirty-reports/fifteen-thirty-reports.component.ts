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
  selector: 'app-fifteen-thirty-reports',
  templateUrl: './fifteen-thirty-reports.component.html',
  styleUrls: ['./fifteen-thirty-reports.component.css'],
})
export class FifteenThirtyReportsComponent implements OnInit {
  loggedInUserId: any;
  fromTime: string = '';
  toTime: string = '';
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
    // 'last_activity_dtm',
    // 'report_end_time',
    // 'expand',
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
    report_name: '15-30-days-not-working-report',
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
  associatedUsers:any=[];
  assignedCompanies:any=[];

  constructor(
    private _sunshineAPI: SunshineInternalService,
    private _datePipe: DatePipe,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    let usrDetails: any = sessionStorage.getItem('userDetails');
    let parsedUsrDetails = JSON.parse(usrDetails);
    this.loggedInUserId = parsedUsrDetails.user_id;
    let now = new Date();
    let fromDate = new Date(now);
    fromDate.setDate(now.getDate() - 15); // Subtract 15 days

    // Format the fromDate
    const fromYear = fromDate.getFullYear();
    const fromMonth = String(fromDate.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const fromDay = String(fromDate.getDate()).padStart(2, '0');
    const fromHours = String(fromDate.getHours()).padStart(2, '0');
    const fromMinutes = String(fromDate.getMinutes()).padStart(2, '0');
    const fromSeconds = String(fromDate.getSeconds()).padStart(2, '0');
    const adjustedFromTime = `${fromYear}-${fromMonth}-${fromDay} ${fromHours}:${fromMinutes}:${fromSeconds}`;

    this.fromTime = adjustedFromTime;
    console.log('fromTime', this.fromTime);
    this.dailyRepParams.start_dtm = this.fromTime;

    // Format the now date for toTime
    const toYear = now.getFullYear();
    const toMonth = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const toDay = String(now.getDate()).padStart(2, '0');
    const toHours = String(now.getHours()).padStart(2, '0');
    const toMinutes = String(now.getMinutes()).padStart(2, '0');
    const toSeconds = String(now.getSeconds()).padStart(2, '0');
    const adjustedToTime = `${toYear}-${toMonth}-${toDay} ${toHours}:${toMinutes}:${toSeconds}`;

    this.toTime = adjustedToTime;
    console.log('toTime', this.toTime);
    this.dailyRepParams.end_dtm = this.toTime;

    this.getAllUsers();
    this.getAllClients();
    this.generateCNCReport(this.loggedInUserId);
    this.getAssociatedUsers();
  }
  getAssociatedUsers() {
    let params = { reporting_to_id: this.loggedInUserId };
    this._sunshineAPI
      .fetchAllAssociatedAgents(params)
      .then((res: any) => {
        let response = res.data[0];
        this.associatedUsers=response
        console.log(response);
        this.agentFilteredOptions = this.agentFullName.valueChanges.pipe(
          startWith(''),
          //   tap((value) =>
          //     console.log('Initial value:', value)
          // ),
          map((value) => {
            const stringValue =
              typeof value === 'string' ? value : value.full_name;
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
        this.allUsersArr=resData
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
     if(value){
     console.log(this.allUsersArr);
     const user = this.allUsersArr.find((user: any) => user.full_name === value);
 
     // if (!user) {
     //   this.openSnackBar('User not found');
     //   return;
     // }
 
     const { user_id, full_name, email_address } = user;
     console.log(user_id);
 
     this.dailyRepParams.agent_id = user_id;
     this.disableGenerateBtn = false;
     this.getUserCompany(user_id);
   }
   else{
      this.companyNameFilteredOptions = of([]); // Assigning an observable of an empty array
   }
   }
   getUserCompany(agent_id: any) {
    let params = { user_id: agent_id };

    this._sunshineAPI
      .fectchUserCompany(params)
      .then((companyRes: any) => {
        const resData = companyRes?.data?.[0] || [];
        this.assignedCompanies=resData
        this.companyNameFilteredOptions = this.companyName.valueChanges.pipe(
          startWith(''),
          //   tap((value) =>
          //     console.log('Initial value:', value)
          // ),
          map((value) => {
            const stringValue =
              typeof value === 'string' ? value : value.company_name;
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

    // if (!user) {
    //   this.openSnackBar('User not found');
    //   return;
    // }

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

  generateCNCReport(appUserId: number) {
    this.showProgressBar = true;

    this.dailyRepParams.app_user_id = appUserId;
    this._sunshineAPI
      .contactableNonContactableReports(this.dailyRepParams)
      .then((res: any) => {
        let resData = res.data[0];
        console.log('non-unique-response-1530-reports::', resData);
        this.myDataArray = [...new Set(resData)].reverse();
        console.log('unique-response-1530-reports::', this.myDataArray);
        this.myDataArrayCopy = [...new Set(resData)].reverse();
        this.dataSource = new MatTableDataSource(this.myDataArray);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.resultsLength = resData.length;
        // this.paginateData();
        this.showProgressBar = false;
        if (resData.length > 0) {
          this.showCNCTBLBtn = true;
          this.disableExportBtn = false;
        } else {
          this.showCNCTBLBtn = false;
          this.disableExportBtn = true;
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  contactableHandler(event: any) {
    let tnt = event.value;
    this.disableGenerateBtn = false;

    if (tnt === 'UNTOUCHED') {
      this.myDataArray = this.myDataArrayCopy.filter(
        (item: any) => item.last_activity_dtm == null
      );
    } else if (tnt === 'TOUCHED') {
      this.myDataArray = this.myDataArrayCopy.filter(
        (item: any) => item.last_activity_dtm !== null
      );
    } else {
      this.myDataArray = this.myDataArrayCopy;
    }
  }

  //! TYPE 2 : FUNCTION TO EXPORT THE EXCEL WITH TRANSFORMED HEADERS
  exportToExcelFormat(responseData: any[], filename: string) {
    const fileType =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';

    const keyAliases: any = {
      company_name: 'Company Name',
      agreement_id: 'Agreement No. / CRN No.',
      customer_id: 'Customer Id / CIF No.',
      product_type: 'Product Type',
      customer_name: 'Customer Name',
      assigned_to_full_name: 'Agent Id',
      assigned_by_full_name: 'Team Leader Id',
      team_manager_full_name: 'Team Manager Id',
      senior_manager_full_name: 'Senior Manger id',
    };

    // Function to transform keys
    const transformKeys = (obj: any) => {
      const newObj: any = {};
      for (let key in obj) {
        if (obj.hasOwnProperty(key) && keyAliases.hasOwnProperty(key)) {
          // Use alias from the keyAliases object
          const newKey = keyAliases[key];
          newObj[newKey] = obj[key];
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
    // this.dailyRepParams.app_user_id = this.loggedInUserId;
    this.generateCNCReport(this.loggedInUserId);
  }

  clearAgentSelection() {
    this.agentFullName.setValue(null);
    this.companyName.setValue(null);
    this.companyNameFilteredOptions = of([]);
    this.dailyRepParams.agent_id = null;
    this.dailyRepParams.company_id = null;
    this.getAssociatedUsers();
    // this.agentFullName.reset();
  }
  clearcompanySelection() {
    this.companyName.setValue(null);
    this.dailyRepParams.company_id = null;
    if (this.dailyRepParams.agent_id != null) {
      this.getUserCompany(this.dailyRepParams.agent_id);
    }
    // this.companyName.reset();
  }
}
