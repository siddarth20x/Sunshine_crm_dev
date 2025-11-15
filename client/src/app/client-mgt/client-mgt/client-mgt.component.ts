import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AccUploadDialogComponent } from 'src/app/dialogs/acc-upload-dialog/acc-upload-dialog.component';
import { CustomFunctionsService } from 'src/app/sunshine-services/custom-functions.service';
import { SunshineInternalService } from 'src/app/sunshine-services/sunshine-internal.service';
import { ScrollService } from 'src/app/sunshine-services/scroll.service';

@Component({
  selector: 'app-client-mgt',
  templateUrl: './client-mgt.component.html',
  styleUrls: ['./client-mgt.component.css'],
})
export class ClientMgtComponent implements OnInit, OnDestroy {
  isCreatePrivilegedModule: any;
  createBtnPrivilegeName: string = 'CREATE';
  moduleName: string = 'CLIENT_MANAGEMENT';
  allUsersData: any = [];
  deactivatedUsers: any[] = [];
  compTypeId: any;
  showProgressBar: boolean = false;
  displayedClientHoldersColumns: string[] = [
    'company_id',
    'company_name',
    'company_code',
    'team_manager_name',
    'team_lead_name',
    'country',
    'region',
  ];
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  myDataArray: any[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  resultsLength: number = 0;
  tableTxt: string = '';
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  durationInSeconds = 5;
  private routerSubscription: Subscription;
  
  constructor(
    public accountUploadDialog: MatDialog,
    private customFn: CustomFunctionsService,
    private _sunshineIntService: SunshineInternalService,
    private _snackBar: MatSnackBar,
    private router: Router,
    private scrollService: ScrollService
  ) {
    // Subscribe to router events to scroll to top on navigation
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.scrollToTop();
      });
  }

  ngOnInit(): void {
    // Scroll to top of the page when component initializes
    this.scrollToTop();
    
    this.isCreatePrivilegedModule =
      this.customFn.checkForAllowedModuleAndPrivilegesForCreate(
        this.createBtnPrivilegeName,
        this.moduleName
      );
    // console.log(this.isCreatePrivilegedModule);

    this.getAllUsers();
    this.getAllComapanyType();
  }

  ngOnDestroy(): void {
    // Clean up subscription
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  // Method to scroll to top of the page
  scrollToTop(): void {
    this.scrollService.scrollToTop();
  }

  isUserDeactivated(fullName: string): boolean {
    return this.deactivatedUsers.some(user => user.full_name === fullName);
  }

  getAllComapanyType() {
    this._sunshineIntService.fetchAllCompanyType().then((res: any) => {
      // console.log(res);
      if (res.errorCode == 0) {
        let companyTypes = res.data;
        let findId = companyTypes.find((comp: any) => {
          return (
            comp.company_type_name.toLowerCase().trim() ==
            'customer'.toLowerCase().trim()
          );
        });
        this.compTypeId = findId.company_type_id;
        // console.log(this.compTypeId);
      }
    });
  }

  ngAfterViewInit() {
    // Set up the data source with paginator and sort after view is initialized
    // this.dataSource.paginator = this.paginator;
    // this.dataSource.sort = this.sort;
    // Additional scroll to top after view is initialized for better reliability
    this.scrollToTop();
  }
  
  openAccUploadDialog() {
    const dialogRef = this.accountUploadDialog.open(AccUploadDialogComponent, {
      height: 'auto',
      // width: '90%',
      width: 'auto',
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      console.log(`Account Upload Dialog result: ${result}`);
      // this.getAllUsers();
    });
  }

  getAllClients() {
    this.showProgressBar = true;

    this._sunshineIntService
      .fetchAllCompany()
      .then((res: any) => {
        let resData = res.data;
        this.myDataArray = resData.reverse();

        const userMap = new Map(
          this.allUsersData.map((user: any) => [user.user_id, user.full_name])
        );

        // Iterate over allcompany array to add team_manager_name and team_lead_name
        this.myDataArray = this.myDataArray.map((company) => {
          return {
            ...company,
            team_manager_name: userMap.get(company.team_manager_id) || '',
            team_lead_name: userMap.get(company.team_lead_id) || '',
          };
        });
        // console.log(this.myDataArray)
        // this.myDataArray=[...this.myDataArray,...filter];
        console.log('fetchAllCompany', this.myDataArray);
        this.myDataArray = this.myDataArray.filter((comp: any) => {
          return comp.company_type_id == parseInt(this.compTypeId);
        });

        // Update the data source with the filtered data
        this.dataSource.data = this.myDataArray;
        this.resultsLength = this.myDataArray.length;
        this.showProgressBar = false;
      })
      .catch((error) => {
        this.showProgressBar = false;
        console.error(error);
        // Set empty data on error to prevent undefined issues
        this.dataSource.data = [];
        this.resultsLength = 0;
      });
    this.tableTxt = `Banks`;
  }

  getAllUsers() {
    // this.showProgressBar = true;

    this._sunshineIntService
      .fetchAllUsers()
      .then((res: any) => {
        let resData = res.data[0];
        this.allUsersData = resData;
        
        // Store deactivated users for warning display
        this.deactivatedUsers = resData.filter((user: any) => user.status === 0);
        
        // console.log('all-users', this.allUsersData);
        this.getAllClients();
      })
      .catch((error) => {
        // this.showProgressBar = false;
        console.error(error);
        // Still call getAllClients even if users fail to load
        this.getAllClients();
      });
    this.tableTxt = `User Management`;
  }
  
  getCompanyById(_id: any) {
    // this.userSaveProg = true;

    let compBody = {
      company_id: _id,
      company_name: null,
      user_id: null,
    };
    console.log(_id);

    this._sunshineIntService
      .fetchCompany(compBody)
      .then((companyIdRes: any) => {
        console.log(companyIdRes);
        let resData = companyIdRes.data[0][0];
        // console.log('getCompanyById', resData);
        // this.myDataArray=[...this.myDataArray,...resData]
        // let data = [{ team_lead_full_name: resData.team_lead_full_name }, { team_manager_full_name: resData.team_manager_full_name }]
        // console.log(data)
      })
      .catch((error) => {
        console.error('company-by-id-err', error);
        return error;
        // this.userSaveProg = false;
      });
  }
  
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // New methods for automatic deactivated user detection
  hasDeactivatedUsersInTable(): boolean {
    return this.myDataArray.some((company: any) => 
      this.isUserDeactivated(company.team_manager_name) || 
      this.isUserDeactivated(company.team_lead_name)
    );
  }

  getDeactivatedUsersInTable(): any[] {
    return this.myDataArray.filter((company: any) => 
      this.isUserDeactivated(company.team_manager_name) || 
      this.isUserDeactivated(company.team_lead_name)
    );
  }

  getDeactivatedUserWarnings(): string[] {
    const warnings: string[] = [];
    
    this.myDataArray.forEach((company: any) => {
      if (this.isUserDeactivated(company.team_manager_name)) {
        warnings.push(`Company "${company.company_name}" has deactivated Team Manager: ${company.team_manager_name}`);
      }
      if (this.isUserDeactivated(company.team_lead_name)) {
        warnings.push(`Company "${company.company_name}" has deactivated Team Lead: ${company.team_lead_name}`);
      }
    });
    
    return warnings;
  }

  // Method to get deactivated user count
  getDeactivatedUserCount(): number {
    return this.getDeactivatedUsersInTable().length;
  }


}
