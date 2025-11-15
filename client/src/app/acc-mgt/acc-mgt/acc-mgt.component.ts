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
import { AccUploadDialogComponent } from 'src/app/dialogs/acc-upload-dialog/acc-upload-dialog.component';
import { CustomFunctionsService } from 'src/app/sunshine-services/custom-functions.service';
import { SunshineInternalService } from 'src/app/sunshine-services/sunshine-internal.service';
interface BankInfo {
  bank_name: string;
  lead_id: string;
}
@Component({
  selector: 'app-acc-mgt',
  templateUrl: './acc-mgt.component.html',
  styleUrls: ['./acc-mgt.component.css'],
})
export class AccMgtComponent implements OnInit {
  createPrivilegeName: string = 'CREATE';
  uploadPrivilegeName: string = 'UPLOAD';
  readPrivilegeName: string = 'READ';
  editPrivilegeName: string = 'EDIT';
  moduleName: string = 'ACCOUNT_MANAGEMENT';
  isCreatePrivilegedModule: any;
  isUploadPrivilegedModule: any;
  isReadPrivilegedModule: any;
  isEditPrivilegedModule: any;
  advSearchForm: any;
  userId: any;
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  step = 1;

  showProgressBar: boolean = false;
  displayedAccHoldersColumns: string[] = [];
  dataSource: any;
  myDataArray: any[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  resultsLength: number = 0;
  tableTxt: string = '';
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  durationInSeconds = 5;
  list = [{ name: 'Advanvce Search', delete: false }];
  hasLeadFetchError: boolean = false;
  loggedInUserRole: string = '';
  errMsg: string = '';
  companyArr: any[] = [];
  companyId: any;
  accMGTSnapshotURL: string = '';
  companyControl = new FormControl('');
  deactivatedUsers: any[] = [];

  // Add properties for pending days filter
  pendingDaysFilter: string = '';
  originalDataArray: any[] = [];

  // Add loading state for better UX
  isInitializing: boolean = true;

  constructor(
    public accountUploadDialog: MatDialog,
    private customFn: CustomFunctionsService,
    private _sunshineIntService: SunshineInternalService,
    private _fb: FormBuilder,
    private _snackBar: MatSnackBar,
    private _aR: ActivatedRoute,
    private _router: Router
  ) {
    this.advSearchForm = this._fb.group({
      app_user_id: [null],
      company_id: [null, [Validators.required]],
      company_name: [null],
      account_number: [null, [Validators.pattern('^[a-zA-Z0-9]*$')]],
      product_account_number: [null, [Validators.pattern('^[a-zA-Z0-9]*$')]],
      agreement_id: [null, [Validators.pattern('^[a-zA-Z0-9]*$')]],
      customer_name: [null],
      customer_id: [null, [Validators.pattern('^[a-zA-Z0-9]*$')]],
      passport_number: [null, [Validators.pattern('^[a-zA-Z0-9]*$')]],
      emirates_id_number: [null, [Validators.pattern('^[a-zA-Z0-9]*$')]],
      state: [null],
    });
  }

  ngOnInit(): void {
    // Set default privilege values immediately for faster UI rendering
    this.setDefaultPrivileges();

    // Get user details from session storage
    let userDetails: any = sessionStorage.getItem('userDetails');
    let parsedUsrDetails = JSON.parse(userDetails);
    this.userId = parsedUsrDetails.user_id;
    this.loggedInUserRole = parsedUsrDetails.role_name;

    // Set up form
    this.advSearchForm.patchValue({
      app_user_id: this.userId,
    });
    sessionStorage.removeItem('leadByIdResp');

    // Set up table columns immediately
    this.displayedAccHoldersColumns = [
      'status',
      'customer_name',
      'product_account_number',
      'product_type',
      'pli_status',
      'senior_manager',
      'team_manager',
      'team_lead',
      'agent',
      'last_worked_date',
      'pending_days',
    ];
    this.tableTxt = `Accounts Management (${this.resultsLength})`;

    // Run all initialization tasks in parallel for faster loading
    this.initializeComponent();
  }

  // New method to handle all initialization tasks in parallel
  private initializeComponent(): void {
    // Run privilege checks and API calls in parallel
    Promise.all([
      this.checkAndSetPrivilegesAsync(),
      this.getUserCompany(),
      this.fetchDeactivatedUsers(),
    ])
      .then(() => {
        // Handle route parameters after all data is loaded
        this.handleRouteParameters();
        // Mark initialization as complete
        this.isInitializing = false;
      })
      .catch((error) => {
        console.error('Error during component initialization:', error);
        // Mark initialization as complete even on error
        this.isInitializing = false;
      });
  }

  // Async version of privilege checking
  private async checkAndSetPrivilegesAsync(): Promise<void> {
    try {
      // Check if session storage data is available
      const hasAuthModules = sessionStorage.getItem('loggedInUsrAuthModules');
      const hasPrivileges = sessionStorage.getItem('privileges');

      if (hasAuthModules && hasPrivileges) {
        // Session storage is available, set privileges
        this.setPrivileges();
      } else {
        // Use default privileges (already set in ngOnInit)
        console.log(
          'Using default privileges for role:',
          this.loggedInUserRole
        );
      }
    } catch (error) {
      console.error('Error checking privileges:', error);
      // Keep default privileges
    }
  }

  // Set default privileges based on user role for immediate UI rendering
  private setDefaultPrivileges(): void {
    switch (this.loggedInUserRole) {
      case 'ADMIN':
      case 'APP_ADMIN':
        this.isCreatePrivilegedModule = true;
        this.isUploadPrivilegedModule = true;
        this.isReadPrivilegedModule = true;
        this.isEditPrivilegedModule = true;
        break;
      case 'SENIOR_MANAGER':
        this.isCreatePrivilegedModule = true;
        this.isUploadPrivilegedModule = true;
        this.isReadPrivilegedModule = true;
        this.isEditPrivilegedModule = true;
        break;
      case 'TEAM_MANAGER':
        this.isCreatePrivilegedModule = true;
        this.isUploadPrivilegedModule = true;
        this.isReadPrivilegedModule = true;
        this.isEditPrivilegedModule = true;
        break;
      case 'TEAM_LEAD':
        this.isCreatePrivilegedModule = true;
        this.isUploadPrivilegedModule = true;
        this.isReadPrivilegedModule = true;
        this.isEditPrivilegedModule = true;
        break;
      case 'AGENT':
        this.isCreatePrivilegedModule = false;
        this.isUploadPrivilegedModule = false;
        this.isReadPrivilegedModule = true;
        this.isEditPrivilegedModule = false;
        break;
      default:
        // Default to read-only access
        this.isCreatePrivilegedModule = false;
        this.isUploadPrivilegedModule = false;
        this.isReadPrivilegedModule = true;
        this.isEditPrivilegedModule = false;
        break;
    }
  }

  // Set privileges from session storage
  private setPrivileges(): void {
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
      this.customFn.checkForAllowedModuleAndPrivilegesForUpload(
        this.readPrivilegeName,
        this.moduleName
      );
  }

  // Handle route parameters after all data is loaded
  private handleRouteParameters(): void {
    let bankQueryParams: any = this._aR.snapshot;

    if (
      bankQueryParams.queryParams &&
      bankQueryParams.queryParams['id1'] &&
      bankQueryParams.queryParams['id2']
    ) {
      this.advSearchForm.patchValue({
        app_user_id: bankQueryParams.queryParams['id1'],
        company_id: bankQueryParams.queryParams['id2'],
      });
      console.log(bankQueryParams.queryParams['id2']);
      let routerSnapshot = bankQueryParams._routerState.url;
      sessionStorage.setItem('ac-mgt-url', routerSnapshot);
      this.advanceSerachFilters();
      let company: any = sessionStorage.getItem('company');
      let parsedCompany = [];
      try {
        parsedCompany = company ? JSON.parse(company) : [];
      } catch (e) {
        parsedCompany = [];
      }
      let compId = Array.isArray(parsedCompany)
        ? parsedCompany.find(
            (id: any) => id.company_id == bankQueryParams.queryParams['id2']
          )
        : null;

      if (compId) {
        this.advSearchForm.patchValue({ company_name: compId.company_name });
      } else {
        this.openSnackBar(
          'Company information not found. Please select a bank from "Advanced Search".'
        );
      }
    } else {
      this.openSnackBar(
        `Please select Bank from "Advanced Search" section to view accounts`
      );
      console.log(false);
    }
  }

  getUserCompany(): Promise<void> {
    let params = { user_id: this.userId };
    return this._sunshineIntService
      .fectchUserCompany(params)
      .then((companyRes: any) => {
        let resData = companyRes.data[0];
        this.companyArr = resData;
      })
      .catch((error) => {
        console.error(error);
        this.openSnackBar(error);
        throw error; // Re-throw to be caught by Promise.all
      });
  }
  companySelectHandler(event: any) {
    // let selectedCompanyId = event.value;
    // // console.log(selectedCompanyId);
    // this.companyId = selectedCompanyId;
    let selectedCompanyId = event.value;
    // console.log(selectedCompanyId);
    let compId = this.companyArr.find((id: any) => {
      return id.company_name == selectedCompanyId;
    });

    // console.log(compId);
    this.companyId = compId.company_id;
    this.advSearchForm.patchValue({ company_id: this.companyId });
    console.log(this.advSearchForm.value);
    this._router.navigate(['/account-management'], {
      queryParams: {
        id1: this.userId,
        id2: this.companyId,
      },
    });

    setTimeout(() => {
      // _routerState

      // console.log('settimeout---', this._aR.snapshot._routerState.url);
      let snapshot: any = this._aR.snapshot;
      // console.log(snapshot._routerState.url);
      let routerSnapshot = snapshot._routerState.url;
      sessionStorage.setItem('ac-mgt-url', routerSnapshot);
    }, 1000);
  }
  openAccUploadDialog() {
    const dialogRef = this.accountUploadDialog.open(AccUploadDialogComponent, {
      height: 'auto',
      // width: '90%',
      width: 'auto',
      data: {
        dialogTitle: 'Upload New Accounts',
        flag: 0,
      },
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      // //console.log(`Account Upload Dialog result:::`, result);

      if (result && result.upload == 1 && result.company_id) {
        this.openSnackBar(result.message);
        console.log(result.company_id);
        this.companyId = result.company_id;
        this.advSearchForm.patchValue({
          user_id: this.userId,
          company_id: this.companyId,
          file_upload_id: result.file_upload_id,
        });

        this.getAllAccounts();
        // this.advanceSerachFilters();
        this.getFailedCountsOnStage(result.file_upload_id);
      }
      // this.getAllUsers();
    });
  }
  getFailedCountsOnStage(fileUploadId: any) {
    // console.log('fileUploadId-on-stage', fileUploadId);
    this._sunshineIntService
      .getFailedEntriesCountOnStage({ file_upload_id: fileUploadId })
      .then((res: any) => {
        // Handle the response as needed
        console.log('Failed records count:', res);
        if (res.errorCode == 0 && res.data) {
          this.openSnackBar(
            `Number of records failed in staging: ${res.data[0].record_count}`
          );
        } else {
          this.openSnackBar(res.message);
        }
      });
  }
  openDeallocateAccUploadDialog() {
    const dialogRef = this.accountUploadDialog.open(AccUploadDialogComponent, {
      height: 'auto',
      // width: '90%',
      width: 'auto',
      data: {
        dialogTitle: 'De-Allocate Accounts',
        flag: 1,
      },
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      // //console.log(`Account Upload Dialog result:::`, result);

      if (result && result.upload == 1 && result.company_id) {
        this.openSnackBar(result.message);
        console.log(result.company_id);
        this.companyId = result.company_id;
        this.advSearchForm.patchValue({
          user_id: this.userId,
          company_id: this.companyId,
        });
        // this.advanceSerachFilters();
        this.getAllAccounts();
      }
      // this.getAllUsers();
    });
  }

  getAllAccounts() {
    this.showProgressBar = true;

    // Default columns to display
    this.displayedAccHoldersColumns = [
      'status',
      // 'lead_id',
      'customer_name',
      // 'account_number',
      'product_account_number',
      'product_type',
      'pli_status',
      'senior_manager',
      'team_manager',
      'team_lead',
      'agent',
      'last_worked_date',
    ];

    // Add the 'multiple_bank_list' column if the role is not 'AGENT'
    if (this.loggedInUserRole !== 'AGENT') {
      this.displayedAccHoldersColumns.push('multiple_bank_list');
    }
    let leadParams = {
      // app_user_id: null,
      app_user_id: this.userId,
      lead_id: null,
      company_id: this.companyId,
      lead_status_type_id: null,
      assigned_by: null,
      assigned_to: null,
      account_number: null,
      product_type: null,
      product_account_number: null,
    };

    console.log(leadParams);
    this._sunshineIntService
      .fetchAllLeads(leadParams)
      .then((res: any) => {
        let resData = res.data[0];
        this.myDataArray = resData;
        this.myDataArray = this.myDataArray.reverse().filter((lsTyoe: any) => {
          return lsTyoe.lead_status_type_name !== 'STOP FOLLOW UP';
        });
        //  let mulBanks= this.parseMultipleBanksList(this.myDataArray);
        // console.log('mulBanks', mulBanks);
        console.log('this.myDataArray', this.myDataArray);
        this.dataSource = new MatTableDataSource(this.myDataArray);
        this.setupCustomFilter();
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
        this.tableTxt = `Accounts Management (${this.resultsLength})`;
        console.log(this.resultsLength);

        this.showProgressBar = false;
      })
      .catch((error) => {
        this.errMsg = `No Account(s) Found`;
        this.showProgressBar = false;
        console.error('get-lead-err::', error.response.data);
        this.tableTxt = ``;
        this.hasLeadFetchError = true;
      });
  }
  parseMultipleBanksList(dataArray: any[]): BankInfo[] {
    const result: BankInfo[] = [];

    dataArray.forEach((data) => {
      const multipleBanksList = data.multiple_banks_list;

      if (multipleBanksList) {
        const banks = multipleBanksList.split(',');

        banks.forEach(
          (bank: {
            trim: () => {
              (): any;
              new (): any;
              split: { (arg0: string): [any, any]; new (): any };
            };
          }) => {
            const [bank_name, lead_id] = bank.trim().split(':');

            result.push({
              bank_name: bank_name.trim(),
              lead_id: lead_id.trim(),
            });
          }
        );
      }
    });

    return result;
  }

  // parseMultipleBanksList(data: any): BankInfo[] {
  //   const result: BankInfo[] = [];

  //   const multipleBanksList = data.multiple_banks_list;

  //   if (multipleBanksList) {
  //     const banks = multipleBanksList.split(',');

  //     banks.forEach((bank:any) => {
  //       const [bank_name, lead_id] = bank.trim().split(':');

  //       result.push({
  //         bank_name: bank_name.trim(),
  //         lead_id: lead_id.trim(),
  //       });
  //     });
  //   }

  //   return result;
  // }

  private setupCustomFilter(): void {
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const searchStr = filter.toLowerCase().trim();

      // If search string is empty or only contains spaces, show all results
      if (!searchStr) {
        return true;
      }

      // Check all relevant fields for partial matches
      const fieldsToSearch = [
        'customer_name',
        'product_account_number',
        'product_type',
        'senior_manager_full_name',
        'team_manager_full_name',
        'assigned_by_full_name',
        'assigned_to_full_name',
        'lead_status_type_name',
      ];

      return fieldsToSearch.some((field) => {
        const fieldValue = data[field];
        if (fieldValue) {
          const fieldStr = fieldValue.toString().toLowerCase().trim();
          return fieldStr.includes(searchStr);
        }
        return false;
      });
    };
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
      this.resultsLength = this.dataSource.filteredData.length;
    }
  }

  isDisabledFilterBtn(): boolean {
    // Check if at least one search parameter is provided
    const formValue = this.advSearchForm.value;
    const hasSearchParams =
      formValue.company_id ||
      formValue.account_number ||
      formValue.product_account_number ||
      formValue.agreement_id ||
      formValue.customer_name ||
      formValue.customer_id ||
      formValue.passport_number ||
      formValue.emirates_id_number ||
      formValue.state;

    return !hasSearchParams; // Disable button if no search parameters
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // if ('scrollBehavior' in document.documentElement.style) {
    //   window.scrollTo({ top: 1000, behavior: 'smooth' });
    // } else {
    //   // Fallback for browsers that do not support 'smooth' behavior
    //   window.scrollTo(0, 0);
    // }
  }

  advanceSerachFilters() {
    this.showProgressBar = true;
    // console.log('this.advSearchForm.value--->', this.advSearchForm.value);
    // console.log('form valid', this.advSearchForm);

    // Check if at least one search parameter is provided
    const formValue = this.advSearchForm.value;
    const hasSearchParams =
      formValue.company_id ||
      formValue.account_number ||
      formValue.product_account_number ||
      formValue.agreement_id ||
      formValue.customer_name ||
      formValue.customer_id ||
      formValue.passport_number ||
      formValue.emirates_id_number ||
      formValue.state;

    if (hasSearchParams) {
      // console.log('form valid');
      this.scrollToTop();
      let params = this.advSearchForm.value;

      // If state is provided, we need to handle it differently since it's not in the leads table
      const stateFilter = params.state;
      if (stateFilter) {
        // Remove state from params and handle it separately
        delete params.state;
      }

      this._sunshineIntService
        .fetchLeadsBySearchParams(params)
        .then((res: any) => {
          let response = res.data[0];
          if (response.length > 0) {
            console.log('adv-search-leads::', res);

            // If state filter is provided, we need to fetch address data and filter
            if (stateFilter) {
              this.filterByState(response, stateFilter);
            } else {
              let companyName =
                this.companyArr.find(
                  (company) =>
                    company.company_id == this.advSearchForm.value.company_id
                )?.company_name || null;
              console.log(companyName);
              this.openSnackBar(res.message);
              // //console.log('founds leads');
              this.myDataArray = response;
              ////console.log('all-accs', this.myDataArray);
              this.myDataArray = res.data[0];
              this.originalDataArray = [...this.myDataArray];
              this.dataSource = new MatTableDataSource(this.myDataArray);
              this.setupCustomFilter();
              this.dataSource.sort = this.sort;
              this.dataSource.sortingDataAccessor = (
                item: { [x: string]: any; modified_dtm: string },
                property: string
              ) => {
                switch (property) {
                  case 'last_worked_date':
                    // Convert the date string to a Date object for proper comparison
                    return item.modified_dtm
                      ? new Date(item.modified_dtm).getTime()
                      : 0;
                  case 'pending_days':
                    return this.calculatePendingDays(item);
                  default:
                    return item[property];
                }
              };
              this.dataSource.paginator = this.paginator;
              this.resultsLength = this.myDataArray.length;
              this.tableTxt = `Viewing (${this.resultsLength}) accounts for ${companyName}`;
              this.showProgressBar = false;
            }
            this.setupCustomFilter();
            this.dataSource.sort = this.sort;
            this.dataSource.sortingDataAccessor = (
              item: { [x: string]: any; modified_dtm: string },
              property: string
            ) => {
              switch (property) {
                case 'last_worked_date':
                  // Convert the date string to a Date object for proper comparison
                  return item.modified_dtm
                    ? new Date(item.modified_dtm).getTime()
                    : 0;
                case 'pending_days':
                  return this.calculatePendingDays(item);
                default:
                  return item[property];
              }
            };
            this.dataSource.paginator = this.paginator;
            this.resultsLength = this.myDataArray.length;
            let companyName =
              this.companyArr.find(
                (company) =>
                  company.company_id == this.advSearchForm.value.company_id
              )?.company_name || null;
            this.tableTxt = `Viewing (${this.resultsLength}) accounts for ${companyName}`;
            this.showProgressBar = false;
          } else {
            console.log('else:::::adv-search-leads::', res);
            this.showProgressBar = false;
            this.myDataArray = [];
            this.dataSource = new MatTableDataSource(this.myDataArray);
            this.setupCustomFilter();
            this.tableTxt = ``;
          }
          // else {

          //   this.myDataArray = response;
          //   ////console.log('all-accs', this.myDataArray);
          //   this.dataSource = new MatTableDataSource(this.myDataArray);
          //   this.dataSource.sort = this.sort;
          //   this.dataSource.paginator = this.paginator;
          //   this.resultsLength = this.myDataArray.length;
          //   this.showProgressBar = false;
          //   // //console.log('not found leads');
          // }
          // //console.log('advanceSerachFilters--->', res);
        })
        .catch((err) => {
          console.error('error::::adv-search-leads::', err);
          this.myDataArray = [];
          this.dataSource = new MatTableDataSource(this.myDataArray);
          this.setupCustomFilter();
          this.tableTxt = '';
          this.showProgressBar = false;

          // Handle different error response formats
          let errorMessage = 'An error occurred while searching for accounts';
          if (err.response && err.response.data && err.response.data.message) {
            errorMessage = err.response.data.message;
          } else if (err.message) {
            errorMessage = err.message;
          }

          this.openSnackBar(errorMessage);
        });
    } else {
      this.openSnackBar('Please provide at least one search parameter');
    }
  }

  advanceSerachClearFilters() {
    // this.advSearchForm.reset();
    this.advSearchForm.patchValue({
      company_id: null,
      company_name: null,
      account_number: null,
      product_account_number: null,
      agreement_id: null,
      customer_name: null,
      customer_id: null,
      passport_number: null,
      emirates_id_number: null,
      state: null,
    });
    this.dataSource.data = [];
    this.tableTxt = '';

    // this.getAllAccounts();
    // console.log('clear-filter:::', this.advSearchForm.value);
    this._router.navigate(['/account-management'], {
      // relativeTo: this._aR, // Use the current route as the base
      queryParams: { id1: null, id2: null }, // Clear all query parameters
      queryParamsHandling: 'merge', // or use 'preserve' if you want to keep existing ones
    });
    sessionStorage.removeItem('ac-mgt-url');
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, 'Close', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: this.durationInSeconds * 1000,
    });
  }

  calculatePendingDays(lead: any): number {
    if (!lead.modified_dtm) return -1;
    const modifiedDate = new Date(lead.modified_dtm);
    const today = new Date();
    // Use only the year, month, and date (ignore time)
    const modifiedDateOnly = new Date(
      modifiedDate.getFullYear(),
      modifiedDate.getMonth(),
      modifiedDate.getDate()
    );
    const todayDateOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const diffMs = todayDateOnly.getTime() - modifiedDateOnly.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays;
  }

  filterByPendingDays(): void {
    if (!this.pendingDaysFilter) {
      // If no filter is selected, show all data
      this.dataSource.data = this.originalDataArray;
    } else {
      const filteredData = this.originalDataArray.filter((item: any) => {
        const pendingDays = this.calculatePendingDays(item);
        return this.isInPendingDaysRange(pendingDays, this.pendingDaysFilter);
      });
      this.dataSource.data = filteredData;
    }

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  isInPendingDaysRange(pendingDays: number, range: string): boolean {
    if (range === '') return true; // All

    switch (range) {
      case '0-7':
        return pendingDays >= 0 && pendingDays <= 7;
      case '8-15':
        return pendingDays >= 8 && pendingDays <= 15;
      case '16-30':
        return pendingDays >= 16 && pendingDays <= 30;
      case '31-60':
        return pendingDays >= 31 && pendingDays <= 60;
      case '61-90':
        return pendingDays >= 61 && pendingDays <= 90;
      case '90+':
        return pendingDays >= 90;
      default:
        return true;
    }
  }

  navigateToUploadedFiles() {
    this._router.navigate(['/account-management/uploaded-files']);
  }

  failedRecordsRedirect() {
    this._router.navigate(['./account-management/failed-records']);
  }

  isUserDeactivated(fullName: string): boolean {
    return this.deactivatedUsers.some((user) => user.full_name === fullName);
  }

  fetchDeactivatedUsers(): Promise<void> {
    return this._sunshineIntService
      .fetchAllUsers()
      .then((userRes: any) => {
        this.deactivatedUsers = userRes.data[0].filter(
          (user: any) => user.status === 0
        );
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
        throw error; // Re-throw to be caught by Promise.all
      });
  }

  downloadAccounts() {
    if (!this.myDataArray || this.myDataArray.length === 0) {
      this.openSnackBar('No accounts available for download');
      return;
    }

    this.showProgressBar = true;

    // Get current date for filename
    const currentDate = new Date().toISOString().split('T')[0];
    const companyName =
      this.companyArr.find(
        (company) => company.company_id == this.advSearchForm.value.company_id
      )?.company_name || 'Unknown';

    // Create filename based on role
    let filename = '';
    if (this.loggedInUserRole === 'AGENT') {
      filename = `Accounts_Export_Agent_${companyName}_${currentDate}.csv`;
    } else if (this.loggedInUserRole === 'TEAM_LEAD') {
      filename = `Accounts_Export_TeamLead_${companyName}_${currentDate}.csv`;
    } else if (this.loggedInUserRole === 'TEAM_MANAGER') {
      filename = `Accounts_Export_TeamManager_${companyName}_${currentDate}.csv`;
    } else if (this.loggedInUserRole === 'SENIOR_MANAGER') {
      filename = `Accounts_Export_SeniorManager_${companyName}_${currentDate}.csv`;
    } else if (
      this.loggedInUserRole === 'ADMIN' ||
      this.loggedInUserRole === 'APP_ADMIN'
    ) {
      filename = `Accounts_Export_Admin_${companyName}_${currentDate}.csv`;
    } else {
      filename = `Accounts_Export_${this.loggedInUserRole}_${companyName}_${currentDate}.csv`;
    }

    // For all roles, fetch payment ledger data to get the missing fields
    this.fetchTOSAmountsForAccountsAndDownload(this.myDataArray, filename);
  }

  private fetchTOSAmountsForAccountsAndDownload(
    accounts: any[],
    filename: string
  ) {
    // Get all lead IDs
    const leadIds = accounts.map((account) => account.lead_id);

    // Make API calls to get payment ledger, contact, and address data for all leads
    Promise.all([
      this._sunshineIntService.fetchLeadsPaymentLedger({}),
      this._sunshineIntService.fetchLeadContacts({}),
      this._sunshineIntService.fetchLeadAddress({}),
    ])
      .then(([paymentLedgerResponse, contactsResponse, addressResponse]) => {
        const paymentLedgerData = paymentLedgerResponse.data[0] || [];
        const contactsData = contactsResponse.data[0] || [];
        const addressData = addressResponse.data[0] || [];

        // Create maps for payment ledger, contacts, and addresses
        const paymentLedgerMap = new Map();
        const contactsMap = new Map();
        const addressMap = new Map();

        // Group payment ledger data by lead_id and get the latest entry for each
        paymentLedgerData.forEach((entry: any) => {
          const leadId = entry.lead_id;
          if (leadIds.includes(leadId)) {
            if (
              !paymentLedgerMap.has(leadId) ||
              entry.lead_payment_ledger_id >
                paymentLedgerMap.get(leadId).lead_payment_ledger_id
            ) {
              paymentLedgerMap.set(leadId, entry);
            }
          }
        });

        // Group contacts data by lead_id and get primary contact
        contactsData.forEach((contact: any) => {
          const leadId = contact.lead_id;
          if (leadIds.includes(leadId)) {
            if (!contactsMap.has(leadId) || contact.is_primary === 1) {
              contactsMap.set(leadId, contact);
            }
          }
        });

        // Group address data by lead_id and get primary address
        addressData.forEach((address: any) => {
          const leadId = address.lead_id;
          if (leadIds.includes(leadId)) {
            if (!addressMap.has(leadId) || address.is_primary === 1) {
              addressMap.set(leadId, address);
            }
          }
        });

        // Add all data to accounts
        const accountsWithAllData = accounts.map((account) => {
          const paymentEntry = paymentLedgerMap.get(account.lead_id);
          const contactEntry = contactsMap.get(account.lead_id);
          const addressEntry = addressMap.get(account.lead_id);

          return {
            ...account,
            // Payment ledger data
            total_outstanding_amount: paymentEntry
              ? paymentEntry.total_outstanding_amount || ''
              : '',
            credit_limit: paymentEntry ? paymentEntry.credit_limit || '' : '',
            principal_outstanding_amount: paymentEntry
              ? paymentEntry.principal_outstanding_amount || ''
              : '',
            minimum_payment: paymentEntry
              ? paymentEntry.minimum_payment || ''
              : '',
            ghrc_offer_1: paymentEntry ? paymentEntry.ghrc_offer_1 || '' : '',
            ghrc_offer_2: paymentEntry ? paymentEntry.ghrc_offer_2 || '' : '',
            ghrc_offer_3: paymentEntry ? paymentEntry.ghrc_offer_3 || '' : '',
            last_paid_amount: paymentEntry
              ? paymentEntry.last_paid_amount || ''
              : '',
            last_paid_date: paymentEntry
              ? this.formatDate(paymentEntry.last_paid_date) || ''
              : '',
            // Contact data
            home_country_number: contactEntry ? contactEntry.phone || '' : '',
            mobile_number: contactEntry
              ? contactEntry.alternate_phone || ''
              : '',
            email_id: contactEntry ? contactEntry.email || '' : '',
            // Address data
            home_country_address: addressEntry
              ? this.formatAddress(addressEntry) || ''
              : '',
            city: addressEntry ? addressEntry.city || '' : '',
            pincode: addressEntry ? addressEntry.zipcode || '' : '',
            state: addressEntry ? addressEntry.state || '' : '',
          };
        });

        // Create export data based on role
        let exportData = [];
        if (this.loggedInUserRole === 'AGENT') {
          // For agents - keep existing format
          exportData = accountsWithAllData.map((account) => ({
            'Account no - Agreement No': account.account_number || '',
            'Product Type': account.product_type || '',
            'Product Account No': account.product_account_number || '',
            'Agreement ID': account.agreement_id || '',
            'Customer Name': account.customer_name || '',
            'Allocation Status': account.allocation_status || '',
            'Cust Id - Relationship No': account.customer_id || '',
            'TOS Amount': account.total_outstanding_amount || '',
            'Business Name': account.business_name || '',
            'Passport Number': account.passport_number || '',
            DOB: account.date_of_birth || '',
            'Emirates ID': account.emirates_id_number || '',
          }));
        } else {
          // For team lead and above - include all 60 fields
          exportData = accountsWithAllData.map((account) => ({
            'Senior Manager Id': account.senior_manager_full_name || '',
            'Team Manager Id': account.team_manager_full_name || '',
            'Team Lead Id': account.assigned_by_full_name || '',
            'Assigned To': account.assigned_to_full_name || '',
            'Account no - Agreement No': account.account_number || '',
            'Product Type': account.product_type || '',
            'Product Account No': account.product_account_number || '',
            'Agreement ID': account.agreement_id || '',
            'FINWARE_ACN01': account.finware_acn01 || '',
            'Allocation Status': account.allocation_status || '',
            'Cust Id - Relationship No': account.customer_id || '',
            'SME Account Name': account.business_name || '',
            'Customer Name': account.customer_name || '',
            'Credit Limit': account.credit_limit || '',
            'TOS Amount': account.total_outstanding_amount || '',
            'POS Amount': account.principal_outstanding_amount || '',
            'FRESH/STAB': account.fresh_stab || '',
            'Cycle Statement': account.cycle_statement || '',
            'BKT Status': account.bucket_status || '',
            'Card_Auth': account.card_auth || '',
            'DPD_R': account.dpd_r || '',
            'Mindue Manual': account.mindue_manual || '',
            'RB Amount': account.rb_amount || '',
            'Overdue Amount': account.overdue_amount || '',
            'Passport No': account.passport_number || '',
            DOB: this.formatDate(account.date_of_birth) || '',
            'Emirates ID Number': account.emirates_id_number || '',
            'DUE SINCE DATE': account.due_since_date || '',
            Vintage: account.vintage || '',
            'Date of WOFF': this.formatDate(account.date_of_woff) || '',
            Nationality: account.nationality || '',
            'Mobile Number': account.mobile_number || '',
            'Email ID': account.email_id || '',
            'Monthly Income': account.monthly_income || '',
            'Employer Details': account.employer_details || '',
            Designation: account.designation || '',
            'Company Contact': account.company_contact || '',
            'Office_Address': account.office_address || '',
            'Home Country Number': account.home_country_number || '',
            'Friend_residence_phone': account.friend_residence_phone || '',
            'Minimum Payment': account.minimum_payment || '',
            'GHRC Offer 1': account.ghrc_offer_1 || '',
            'GHRC Offer 2': account.ghrc_offer_2 || '',
            'GHRC Offer 3': account.ghrc_offer_3 || '',
            'Withdraw Date': this.formatDate(account.withdraw_date) || '',
            'Home Country Address': account.home_country_address || '',
            City: account.city || '',
            Pincode: account.pincode || '',
            State: account.state || '',
            'Father Name': account.father_name || '',
            'Mother Name': account.mother_name || '',
            'Spouse Name': account.spouse_name || '',
            'Last payment amount': account.last_paid_amount || '',
            'Last payment date': account.last_paid_date || '',
            'Last month Paid Unpaid': account.last_month_paid_unpaid || '',
            'Last Usage Date': account.last_usage_date || '',
            'DPD Strin': account.dpd_string || '',
            'PLI Status': account.pli_status || '',
            'Execution Status': account.execution_status || '',
            'Banker name': account.banker_name || '',
          }));
        }

        // Generate CSV and download
        this.generateAndDownloadCSV(exportData, filename);
      })
      .catch((error) => {
        this.showProgressBar = false;
        console.error('Error fetching data:', error);
        this.openSnackBar(
          'Error fetching data. Downloading without additional data.'
        );

        // Fallback: download without additional data
        let exportData = [];
        if (this.loggedInUserRole === 'AGENT') {
          // For agents - keep existing fallback format
          exportData = accounts.map((account) => ({
            'Account no - Agreement No': account.account_number || '',
            'Product Type': account.product_type || '',
            'Product Account No': account.product_account_number || '',
            'Agreement ID': account.agreement_id || '',
            'Customer Name': account.customer_name || '',
            'Allocation Status': account.allocation_status || '',
            'Cust Id - Relationship No': account.customer_id || '',
            'TOS Amount': '',
            'Business Name': account.business_name || '',
            'Passport Number': account.passport_number || '',
            DOB: account.date_of_birth || '',
            'Emirates ID': account.emirates_id_number || '',
          }));
        } else {
          // For team lead and above - fallback with all 60 columns
          exportData = accounts.map((account) => ({
            'Senior Manager Id': account.senior_manager_full_name || '',
            'Team Manager Id': account.team_manager_full_name || '',
            'Team Lead Id': account.assigned_by_full_name || '',
            'Assigned To': account.assigned_to_full_name || '',
            'Account no - Agreement No': account.account_number || '',
            'Product Type': account.product_type || '',
            'Product Account No': account.product_account_number || '',
            'Agreement ID': account.agreement_id || '',
            'FINWARE_ACN01': account.finware_acn01 || '',
            'Allocation Status': account.allocation_status || '',
            'Cust Id - Relationship No': account.customer_id || '',
            'SME Account Name': account.business_name || '',
            'Customer Name': account.customer_name || '',
            'Credit Limit': '',
            'TOS Amount': '',
            'POS Amount': '',
            'FRESH/STAB': account.fresh_stab || '',
            'Cycle Statement': account.cycle_statement || '',
            'BKT Status': account.bucket_status || '',
            'Card_Auth': account.card_auth || '',
            'DPD_R': account.dpd_r || '',
            'Mindue Manual': account.mindue_manual || '',
            'RB Amount': account.rb_amount || '',
            'Overdue Amount': account.overdue_amount || '',
            'Passport No': account.passport_number || '',
            DOB: this.formatDate(account.date_of_birth) || '',
            'Emirates ID Number': account.emirates_id_number || '',
            'DUE SINCE DATE': account.due_since_date || '',
            Vintage: account.vintage || '',
            'Date of WOFF': this.formatDate(account.date_of_woff) || '',
            Nationality: account.nationality || '',
            'Mobile Number': '',
            'Email ID': '',
            'Monthly Income': account.monthly_income || '',
            'Employer Details': account.employer_details || '',
            Designation: account.designation || '',
            'Company Contact': account.company_contact || '',
            'Office_Address': account.office_address || '',
            'Home Country Number': '',
            'Friend_residence_phone': account.friend_residence_phone || '',
            'Minimum Payment': '',
            'GHRC Offer 1': '',
            'GHRC Offer 2': '',
            'GHRC Offer 3': '',
            'Withdraw Date': this.formatDate(account.withdraw_date) || '',
            'Home Country Address': '',
            City: '',
            Pincode: '',
            State: '',
            'Father Name': account.father_name || '',
            'Mother Name': account.mother_name || '',
            'Spouse Name': account.spouse_name || '',
            'Last payment amount': '',
            'Last payment date': '',
            'Last month Paid Unpaid': account.last_month_paid_unpaid || '',
            'Last Usage Date': account.last_usage_date || '',
            'DPD Strin': account.dpd_string || '',
            'PLI Status': account.pli_status || '',
            'Execution Status': account.execution_status || '',
            'Banker name': account.banker_name || '',
          }));
        }

        this.generateAndDownloadCSV(exportData, filename);
      });
  }

  private generateAndDownloadCSV(data: any[], filename: string) {
    try {
      // Convert data to CSV format
      let csvContent = '';

      if (data.length > 0) {
        // Get headers from the first object
        const headers = Object.keys(data[0]);
        csvContent += headers.join(',') + '\n';

        // Add data rows
        data.forEach((row) => {
          const values = headers.map((header) => {
            const value = row[header] || '';
            // Escape commas and quotes in CSV
            if (
              typeof value === 'string' &&
              (value.includes(',') ||
                value.includes('"') ||
                value.includes('\n'))
            ) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          });
          csvContent += values.join(',') + '\n';
        });
      }

      // Create blob and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      this.showProgressBar = false;
      this.openSnackBar('Accounts downloaded successfully');
    } catch (error) {
      this.showProgressBar = false;
      console.error('CSV generation error:', error);
      this.openSnackBar('Failed to generate CSV file. Please try again.');
    }
  }

  private formatDate(dateString: string | null | undefined): string {
    if (!dateString) {
      return '';
    }
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '';
      }
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() is 0-indexed
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return '';
    }
  }

  private formatAddress(addressEntry: any): string {
    if (!addressEntry) {
      return '';
    }

    const addressParts = [];

    if (addressEntry.address_line_1) {
      addressParts.push(addressEntry.address_line_1);
    }
    if (addressEntry.address_line_2) {
      addressParts.push(addressEntry.address_line_2);
    }
    if (addressEntry.address_line_3) {
      addressParts.push(addressEntry.address_line_3);
    }

    // If no address lines, fall back to address_name
    if (addressParts.length === 0 && addressEntry.address_name) {
      addressParts.push(addressEntry.address_name);
    }

    return addressParts.join(', ');
  }

  private filterByState(accounts: any[], stateFilter: string): void {
    // Fetch address data for all accounts and filter by state
    const leadIds = accounts.map((account) => account.lead_id);

    this._sunshineIntService
      .fetchLeadAddress({})
      .then((addressRes: any) => {
        const addressData = addressRes.data[0] || [];

        // Create a map of lead_id to primary address
        const addressMap = new Map();
        addressData.forEach((address: any) => {
          if (leadIds.includes(address.lead_id) && address.is_primary === 1) {
            addressMap.set(address.lead_id, address);
          }
        });

        // Filter accounts by state
        const filteredAccounts = accounts.filter((account) => {
          const address = addressMap.get(account.lead_id);
          if (address && address.state) {
            return address.state
              .toLowerCase()
              .includes(stateFilter.toLowerCase());
          }
          return false;
        });

        // Update the data
        this.myDataArray = filteredAccounts;
        this.originalDataArray = [...this.myDataArray];
        this.dataSource = new MatTableDataSource(this.myDataArray);
        this.setupCustomFilter();
        this.dataSource.sort = this.sort;
        this.dataSource.sortingDataAccessor = (
          item: { [x: string]: any; modified_dtm: string },
          property: string
        ) => {
          switch (property) {
            case 'last_worked_date':
              return item.modified_dtm
                ? new Date(item.modified_dtm).getTime()
                : 0;
            case 'pending_days':
              return this.calculatePendingDays(item);
            default:
              return item[property];
          }
        };
        this.dataSource.paginator = this.paginator;
        this.resultsLength = this.myDataArray.length;

        let companyName =
          this.companyArr.find(
            (company) =>
              company.company_id == this.advSearchForm.value.company_id
          )?.company_name || null;

        this.tableTxt = `Viewing (${this.resultsLength}) accounts for ${companyName} filtered by state: ${stateFilter}`;
        this.showProgressBar = false;

        if (filteredAccounts.length === 0) {
          this.openSnackBar(`No accounts found for state: ${stateFilter}`);
        } else {
          this.openSnackBar(
            `Found ${filteredAccounts.length} accounts for state: ${stateFilter}`
          );
        }
      })
      .catch((error) => {
        console.error('Error fetching address data:', error);
        this.openSnackBar('Error fetching address data for state filtering');
        this.showProgressBar = false;
      });
  }
}
