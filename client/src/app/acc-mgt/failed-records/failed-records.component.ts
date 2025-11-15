import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { SunshineInternalService } from 'src/app/sunshine-services/sunshine-internal.service';

@Component({
  selector: 'app-failed-records',
  templateUrl: './failed-records.component.html',
  styleUrls: ['./failed-records.component.css'],
})
export class FailedRecordsComponent implements OnInit {
  showProgressBar: boolean = false;
  displayedAccHoldersColumns: string[] = [];
  dataSource: any;
  myDataArray: any[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  resultsLength: number = 0;
  tableTxt: string = 'Show Failed Records';
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  durationInSeconds = 5;
  userId: any;
  companyId: any;
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  step = 1;
  hasLeadFetchError: boolean = false;
  loggedInUserRole: string = '';
  errMsg: string = '';
  companyArr: any[] = [];
  companyName: any;
  advSearchForm: any;

  constructor(
    private accountUploadDialog: MatDialog,
    private _sunshineIntService: SunshineInternalService,
    private _fb: FormBuilder,
    private _snackBar: MatSnackBar,
    private _aR: ActivatedRoute,
    private _router: Router
  ) {
    this.advSearchForm = this._fb.group({
      in_company_id: [null, [Validators.required]],
      company_name: [null, [Validators.required]],
      in_start_dtm: [null],
      in_end_dtm: [null],
    });
  }

  ngOnInit(): void {
    let userDetails: any = sessionStorage.getItem('userDetails');
    let parsedUsrDetails = JSON.parse(userDetails);
    this.userId = parsedUsrDetails.user_id;
    this.loggedInUserRole = parsedUsrDetails.role_name;
    this.displayedAccHoldersColumns = [
      'last_worked_date',
      'status',
      // 'lead_id',
      'customer_name',
      // 'account_number',
      'product_account_number',
      'product_type',
      // 'pli_status',
      'senior_manager',
      'team_manager',
      'team_lead',
      'agent',
      'reason'
    ];
    this.tableTxt = `Failed Accounts (${this.resultsLength})`;
    this.getUserCompany();
    this.openSnackBar(`Please select Bank to view failed accounts`);
    // this.getAllAccounts();
  }
  companySelectHandler(event: any) {
    // let selectedCompanyId = event.value;
    // // console.log(selectedCompanyId);
    // this.companyId = selectedCompanyId;
    let selectedCompanyId = event.value;

    console.log(selectedCompanyId);
    let compId = this.companyArr.find((id: any) => {
      return id.company_name == selectedCompanyId;
    });

    console.log(compId);
    this.companyId = compId.company_id;
    this.advSearchForm.patchValue({
      in_company_id: this.companyId,
      company_name: selectedCompanyId,
    });
    // this.companyId = 10;

    this.companyName =
      this.companyArr.find((company) => company.company_id == this.companyId)
        ?.company_name || null;
    console.log(this.companyName);
    // this.getAllAccounts();
  }
  getUserCompany() {
    let params = { user_id: this.userId };
    this._sunshineIntService
      .fectchUserCompany(params)
      .then((companyRes: any) => {
        let resData = companyRes.data[0];
        console.log(resData);
        this.companyArr = resData;
        // sessionStorage.setItem('company', JSON.stringify(resData));
      })
      .catch((error) => {
        console.error(error);
        this.openSnackBar(error);
      });
  }

  getAllAccounts(params: any) {
    this.showProgressBar = true;

    // Default columns to display
    this.displayedAccHoldersColumns = [
      'last_worked_date',
      'status',
      // 'lead_id',
      'customer_name',
      // 'account_number',
      'product_account_number',
      'product_type',
      // 'pli_status',
      'senior_manager',
      'team_manager',
      'team_lead',
      'agent',
      'reason'
    ];

    // Add the 'multiple_bank_list' column if the role is not 'AGENT'
    // if (this.loggedInUserRole !== 'AGENT') {
    //   this.displayedAccHoldersColumns.push('multiple_bank_list');
    // }
    let leadParams = params;

    console.log(leadParams);
    this._sunshineIntService
      .fetchAllFailedLeads(leadParams)
      .then((res: any) => {
        let resData = res.data[0];
        console.log(res);
        this.myDataArray = resData;
        this.myDataArray = this.myDataArray.reverse().filter((lsTyoe: any) => {
          return lsTyoe.lead_status_type_name !== 'STOP FOLLOW UP';
        });
        //  let mulBanks= this.parseMultipleBanksList(this.myDataArray);
        // console.log('mulBanks', mulBanks);
        console.log('this.myDataArray', this.myDataArray);
        this.dataSource = new MatTableDataSource(this.myDataArray);
        this.dataSource.sort = this.sort;
        this.dataSource.sortingDataAccessor = (
          item: {
            [x: string]: any;
            multiple_banks_list: {
              split: (arg0: string) => {
                (): any;
                new (): any;
                length: any;
              };
            };
          },
          property: string | number
        ) => {
          switch (property) {
            case 'multiple_bank_list':
              // Example: Sort by the number of banks in the list
              return item.multiple_banks_list
                ? item.multiple_banks_list.split(',').length
                : 0;
            default:
              return item[property];
          }
        };
        this.dataSource.paginator = this.paginator;
        this.resultsLength = this.myDataArray.length;
        console.log(this.resultsLength);
        this.tableTxt = `Viewing Failed (${this.resultsLength}) accounts for ${this.companyName}`;
        console.log(this.resultsLength);

        this.showProgressBar = false;
        this.advSearchForm.addControl(
          'company_name',
          this._fb.control(this.companyName, [Validators.required]) // Default value and validators
        );
      })
      .catch((error) => {
        this.errMsg = `No Account(s) Found`;
        this.showProgressBar = false;
        console.error('get-lead-err::', error.response.data);
        this.tableTxt = ``;
        this.hasLeadFetchError = true;
      });
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
      this.resultsLength = this.dataSource.filteredData.length;
    }
  }
  openSnackBar(message: string) {
    this._snackBar.open(message, 'Close', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: this.durationInSeconds * 1000,
    });
  }
  advanceSerachFilters() {
    if (this.advSearchForm.valid) {
      this.advSearchForm.removeControl('company_name');
      console.log(this.advSearchForm.value);
      const startDtm = this.advSearchForm.get('in_start_dtm')?.value;
      const endDtm = this.advSearchForm.get('in_end_dtm')?.value;

      this.advSearchForm.patchValue({
        in_start_dtm: startDtm ? startDtm : null,
        in_end_dtm: endDtm ? endDtm : null,
      });
      this.getAllAccounts(this.advSearchForm.value);
    }
  }
  advanceSerachClearFilters() {
    this.advSearchForm.reset()
  }
}
