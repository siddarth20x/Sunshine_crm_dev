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
import { Observable, startWith, map } from 'rxjs';

@Component({
  selector: 'app-feedback-for-bank-reports',
  templateUrl: './feedback-for-bank-reports.component.html',
  styleUrls: ['./feedback-for-bank-reports.component.css'],
})
export class FeedbackForBankReportsComponent implements OnInit {
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
    'customer_name',
    'company_name',
    'product_type',
    'customer_id',
    'account_number',
    'stage_status_code',
    'total_outstanding_amount',
    'contacble_non_contactable',
    // 'expand',
  ];

  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  durationInSeconds = 5;
  paginatedData: any[] = [];
  pageSize = 5;

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
    report_name: 'feedback-for-bank-report',
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

  codes = new FormControl('');
  codesList: string[] = ['UNG', 'PTP', 'PAID', 'PART PAYMENT'];

  constructor(
    private _sunshineAPI: SunshineInternalService,
    private _datePipe: DatePipe,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    let usrDetails: any = sessionStorage.getItem('userDetails');
    let parsedUsrDetails = JSON.parse(usrDetails);
    this.loggedInUserId = parsedUsrDetails.user_id;
    // this.generateCNCReport(this.loggedInUserId);
    this.getAllUsers();
    this.getAllClients();
    this.fromDate = this.calculateCurrentDate();
    console.log(this.fromDate);

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
  getAllUsers() {
    this.showProgressBar = true;
    this._sunshineAPI
      .fetchAllUsers()
      .then((res: any) => {
        let resData = res.data[0];
        this.allUsersArr = resData.filter((role: any) => {
          return role.role_name == 'AGENT';
        });
        console.log(this.allUsersArr);
        this.showProgressBar = false;
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
              : this.allUsersArr.slice();
            // console.log('Filtered results:', filteredResults);
            return filteredResults;
          })
        );

        // this.receiveInjectedData();
      })
      .catch((error) => {
        this.showProgressBar = false;
        console.error(error);
      });
  }
  private _filterAssignedBy(fullName: string): any[] {
    const filterValue = fullName.toLowerCase();
    return this.allUsersArr.filter((option: any) =>
      option.full_name.toLowerCase().includes(filterValue)
    );
  }
  private _filterCompanies(fullName: string): any[] {
    const filterValue = fullName.toLowerCase();
    return this.companyArr.filter((option: any) =>
      option.company_name.toLowerCase().includes(filterValue)
    );
  }
  getAllClients() {
    this.showProgressBar = true;
    const usrDetails: any = sessionStorage.getItem('userDetails');
    const parsedUsrDetails = JSON.parse(usrDetails);
    const userId = parsedUsrDetails.user_id;

    this._sunshineAPI
      .fectchUserCompany({ user_id: userId })
      .then((res: any) => {
        let resData = res.data[0] || [];
        this.companyArr = resData;
        console.log('user-assigned-companies:::', this.companyArr);
        this.showProgressBar = false;
        this.companyNameFilteredOptions = this.companyName.valueChanges.pipe(
          startWith(''),
          map((value) => {
            const stringValue =
              typeof value === 'string' ? value : value.company_name;
            return stringValue;
          }),
          map((companyName) => {
            const filteredResults = companyName
              ? this._filterCompanies(companyName)
              : this.companyArr.slice();
            return filteredResults;
          })
        );
      })
      .catch((error) => {
        this.showProgressBar = false;
        console.error(error);
      });
  }
  agentHandler(value: any) {
    console.log(value);
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
  codesHandler(event: any) {
    let code = event.value;
    if (Array.isArray(code)) {
      // Convert array of strings to a comma-separated string
      code = code.join(',');
    }
    console.log(code);
    this.dailyRepParams.stage_status_code = code;
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
      'total_outstanding_amount',
      'note',
      'stage_status_code',
      'stage',
    ];
    const filteredResponse = dailyResponse.filter(
      (obj: { stage: null }) => obj.stage !== null
    );

    const uniqueRecords = filteredResponse.filter(
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
    return uniqueRecords;
  }
  generateCNCReport(appUserId: number) {
    this.showProgressBar = true;
    this.dailyRepParams.app_user_id = appUserId;
    this._sunshineAPI
      .contactableNonContactableReports(this.dailyRepParams)
      .then((res: any) => {
        let resData = res.data[0];
        console.log('non-unique-response-UNU-reports::', resData);
        this.myDataArray = this.uniqueResponseHandler(resData);
        console.log('unique-response-UNU-reports::', this.myDataArray);
        this.myDataArrayCopy = [...this.myDataArray]; // Store a reference-safe copy
        this.dataSource = new MatTableDataSource(this.myDataArray);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.resultsLength = this.myDataArray.length;
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

  //! TYPE 2 : FUNCTION TO EXPORT THE EXCEL WITH TRANSFORMED HEADERS
  exportToExcelFormat(responseData: any[], filename: string) {
    const fileType =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';

    const keyAliases: any = {
      company_name: 'Bank Name',
      account_number: 'Aggreement No. / CRN No.',
      customer_id: 'Customer Id / CIF No.',
      product_type: 'Product Type',
      customer_name: 'Customer Name',
      total_outstanding_amount: 'Outstanding',
      feedback: 'Feedback',
      stage_status_code: 'Code',
      stage: 'Contactable / Non-contactable',
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
    // this.dailyRepParams.app_user_id = this.loggedInUserId;
    this.generateCNCReport(this.loggedInUserId);
  }

  clearAgentSelection() {
    this.dailyRepParams.agent_id = null;
    // this.agentFullName.reset();
  }
  clearcompanySelection() {
    this.dailyRepParams.company_id = null;
    // this.companyName.reset();
  }
}
