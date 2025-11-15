import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SunshineInternalService } from '../../sunshine-services/sunshine-internal.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../../dialogs/dialog/dialog.component';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { ManageRolesDialogComponent } from '../../dialogs/manage-roles-dialog/manage-roles-dialog.component';
import { CustomFunctionsService } from '../../sunshine-services/custom-functions.service';
import { TargetsDialogComponent } from 'src/app/dialogs/targets-dialog/targets-dialog.component';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { ConfirmDialogComponent } from '../usr-view-mgt/confirm-dialog/confirm-dialog.component';
import { ScrollService } from 'src/app/sunshine-services/scroll.service';

@Component({
  selector: 'app-usr-mgt',
  templateUrl: './usr-mgt.component.html',
  styleUrls: ['./usr-mgt.component.css'],
})
export class UsrMgtComponent implements OnInit, OnDestroy {
  displayedAccHoldersColumns: string[] = [];
  dataSource: any;
  myDataArray: any[] = [];
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  resultsLength: number = 0;
  tableTxt: string = '';

  durationInSeconds = 5;
  showProgressBar: boolean = false;

  createBtnPrivilegeName: string = 'CREATE';
  moduleName: string = 'USER_MANAGEMENT';
  uploadBtnPrivilegeName: string = 'UPLOAD';
  // isCreatePrivilegedModule: boolean = true;
  // isUploadPrivilegedModule: boolean = true;

  isCreatePrivilegedModule: any;
  isUploadPrivilegedModule: any;
  deactivatedUsers: any[] = []; // Add this property to track deactivated users
  private routerSubscription: Subscription;

  constructor(
    private _sunshineIntService: SunshineInternalService,
    public createUserDialog: MatDialog,
    public manageRolesDialog: MatDialog,
    private _snackBar: MatSnackBar,
    private customFn: CustomFunctionsService,
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

    // this.isUploadPrivilegedModule =
    //   this.customFn.checkForAllowedModuleAndPrivilegesForUpload(
    //     this.uploadBtnPrivilegeName,
    //     this.moduleName
    //   );
    this.getAllUsers();
    this.dataSource = new MatTableDataSource(this.myDataArray);
    
    // Restore pagination state if it exists
    const savedPage = sessionStorage.getItem('userMgtPage');
    if (savedPage) {
      setTimeout(() => {
        if (this.paginator) {
          this.paginator.pageIndex = parseInt(savedPage);
        }
      });
    }
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

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    
    // Save pagination state when page changes
    if (this.paginator) {
      this.paginator.page.subscribe((event) => {
        sessionStorage.setItem('userMgtPage', event.pageIndex.toString());
      });
    }
    
    // Additional scroll to top after view is initialized for better reliability
    this.scrollToTop();
  }

  getAllUsers() {
    this.showProgressBar = true;
  
    this.displayedAccHoldersColumns = [
      'user_id',
      'first_name',
      'last_name',
      'email_address',
      'phone',
      'role',
      'reporting_to',
      'actions',
    ];
  
    this._sunshineIntService
      .fetchAllUsers()
      .then((res: any) => {
        let resData = res.data[0];
        console.log('Fetched Users:', resData);

        // Store deactivated users for warning messages
        this.deactivatedUsers = resData.filter((user: any) => user.status === 0);

        // Filter out deactivated users (status = 0)
        const activeUsers = resData.filter((user: any) => user.status !== 0);
        console.log('Active Users:', activeUsers.length);

        // Process the data to include reporting manager names and role names
        this.myDataArray = activeUsers.reverse().map((user: any) => {
          if (user.reporting_to_id) {
            // Look for reporting manager among all users (including deactivated)
            const reportingManager = resData.find((manager: any) => manager.user_id === user.reporting_to_id);
            if (reportingManager) {
              user.reporting_to_name = `${reportingManager.first_name} ${reportingManager.last_name}`;
              // Keep the reporting_to_id even if manager is deactivated for warning display
            } else {
              // If reporting manager not found, clear the reporting_to_id
              user.reporting_to_id = null;
              user.reporting_to_name = 'Not Assigned';
            }
          }

          if (user.role_name) {
            user.role = user.role_name;
          } else if (user.role) {
            user.role = user.role;
          } else {
            user.role = 'Not Assigned';
          }

          return user;
        });

        this.dataSource = new MatTableDataSource(this.myDataArray);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.resultsLength = this.myDataArray.length;
        this.showProgressBar = false;
      })
      .catch((error) => {
        this.showProgressBar = false;
        console.error(error);
      });
  
    this.tableTxt = `User Management`;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openCreateUserDialog() {
    const dialogRef = this.createUserDialog.open(DialogComponent, {
      // height: '25rem',
      // width: '25rem',
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      console.log(`Create User Dialog result::::`, result);
      if (result && result.create) {
        this.getAllUsers();
      }
    });
  }

  openTargetsDialog() {
    const dialogRef = this.createUserDialog.open(TargetsDialogComponent, {
      data: {
        dialogTitle: 'Assign New Target',
      },
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      console.log(`Create Target Dialog result::::`, result);
      if (result && result.create) {
        // this.getAllUsers();
      }
    });
  }

  openManageRolesDialog() {
    const dialogRef = this.createUserDialog.open(ManageRolesDialogComponent, {
      height: '90%',
      width: 'auto',
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      //console.log(`Manage Roles Dialog result: ${result}`);
      // this.getAllUsers();
    });
  }

  deActivateUser(user: any) {
    const dialogRef = this.createUserDialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { 
        userName: `${user.first_name} ${user.last_name}` 
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.showProgressBar = true;
        
        // Get the current user ID from session storage
        let userDetails: any = sessionStorage.getItem('userDetails');
        let parsedUsrDetails = JSON.parse(userDetails);
        let app_user_id = parsedUsrDetails.user_id;
        
        // Create a more complete update body similar to usr-view-mgt component
        const updateUserBody = {
          app_user_id: app_user_id,
          user_id: user.user_id,
          first_name: user.first_name,
          last_name: user.last_name,
          email_address: user.email_address,
          phone: user.phone,
          mac_address: user.mac_address,
          allowed_ip: user.allowed_ip,
          role_name: user.role_name,
          reporting_to_id: user.reporting_to_id,
          status: 0
        };

        this._sunshineIntService.editUser(updateUserBody)
          .then((res: any) => {
            this.showProgressBar = false;
            this.openSnackBar(`User ${user.first_name} ${user.last_name} has been Deleted`);
            this.getAllUsers(); // Refresh the table
          })
          .catch((error) => {
            this.showProgressBar = false;
            this.openSnackBar(`Failed to delete user ${user.first_name} ${user.last_name}`);
            console.error('Deletion error:', error);
          });
      }
    });
  }

 // checkForAllowedModuleAndPrivilegesForCreate(
  //   privilegeName: any,
  //   moduleName: any
  // ) {
  //   //console.log('priv-name', privilegeName);
  //   //console.log('module-name', moduleName);
  //   if (
  //     sessionStorage.getItem('loggedInUsrSelecedModuleGroup') &&
  //     sessionStorage.getItem('privileges')
  //   ) {
  //     let sessionModuleGroup: any = sessionStorage.getItem(
  //       'loggedInUsrSelecedModuleGroup'
  //     );
  //     let parsedSessionModuleGroup = JSON.parse(sessionModuleGroup);

  //     //! obtain privilege mask for 'moduleName' module_name
  //     let foundModuleName = parsedSessionModuleGroup.find((mod: any) => {
  //       const matchedModName = mod.module_name == moduleName;
  //       return matchedModName ? mod.privilege_mask : null;
  //     });
  //     // //console.log(`Reuturned module name :`, foundModuleName);
  //     let foundModulePrivilegeMask = foundModuleName.privilege_mask;

  //     //*-------------------------------------------------------------------------//

  //     let sessionPrivileges: any = sessionStorage.getItem('privileges');
  //     let parsedSessionPrivileges = JSON.parse(sessionPrivileges);

  //     //! obtain the privilege bit for 'privilegeName' privilege
  //     let foundPrivilege = parsedSessionPrivileges.find((priv: any) => {
  //       const matchedPrivilegeName = priv.privilege_name == privilegeName;
  //       return matchedPrivilegeName ? priv.privilege_bit : null;
  //     });
  //     // //console.log(
  //     //   `Returned privilege bit for ${privilegeName} : `,
  //     //   foundPrivilege.privilege_bit
  //     // );
  //     let foundCreatePrivBit = foundPrivilege.privilege_bit;

  //     //! pass privilege_bit for "privilegeName" & privilegeMask for "moduleName" to check if bit is part of mask or not
  //     let value = this.checkIfBitIsPartOfMask(
  //       foundCreatePrivBit,
  //       foundModulePrivilegeMask
  //     );
  //     //console.log(
  //       `privilege bit mask value for ${privilegeName} & ${moduleName} :`,
  //       value
  //     );

  //     //! if bit is part of mask / bit is not part of mask, then, show / hide the UI element respectively
  //     value != 0
  //       ? (this.isCreatePrivilegedModule = true)
  //       : (this.isCreatePrivilegedModule = false);

  //     // //console.log('isPrivilegedModule :', this.isPrivilegedModule);
  //   } else {
  //     this.openSnackBar(`ACCESS DENIED FOR ${privilegeName}`);
  //   }
  // }
  // checkForAllowedModuleAndPrivilegesForUpload(
  //   privilegeName: any,
  //   moduleName: any
  // ) {
  //   //console.log('priv-name', privilegeName);
  //   //console.log('module-name', moduleName);
  //   if (
  //     sessionStorage.getItem('loggedInUsrSelecedModuleGroup') &&
  //     sessionStorage.getItem('privileges')
  //   ) {
  //     let sessionModuleGroup: any = sessionStorage.getItem(
  //       'loggedInUsrSelecedModuleGroup'
  //     );
  //     let parsedSessionModuleGroup = JSON.parse(sessionModuleGroup);

  //     //! obtain privilege mask for 'moduleName' module_name
  //     let foundModuleName = parsedSessionModuleGroup.find((mod: any) => {
  //       const matchedModName = mod.module_name == moduleName;
  //       return matchedModName ? mod.privilege_mask : null;
  //     });
  //     // //console.log(`Reuturned module name :`, foundModuleName);
  //     let foundModulePrivilegeMask = foundModuleName.privilege_mask;

  //     //*-------------------------------------------------------------------------//

  //     let sessionPrivileges: any = sessionStorage.getItem('privileges');
  //     let parsedSessionPrivileges = JSON.parse(sessionPrivileges);

  //     //! obtain the privilege bit for 'privilegeName' privilege
  //     let foundPrivilege = parsedSessionPrivileges.find((priv: any) => {
  //       const matchedPrivilegeName = priv.privilege_name == privilegeName;
  //       return matchedPrivilegeName ? priv.privilege_bit : null;
  //     });
  //     // //console.log(
  //     //   `Returned privilege bit for ${privilegeName} : `,
  //     //   foundPrivilege.privilege_bit
  //     // );
  //     let foundCreatePrivBit = foundPrivilege.privilege_bit;

  //     //! pass privilege_bit for "privilegeName" & privilegeMask for "moduleName" to check if bit is part of mask or not
  //     let value = this.checkIfBitIsPartOfMask(
  //       foundCreatePrivBit,
  //       foundModulePrivilegeMask
  //     );
  //     //console.log(
  //       `privilege bit mask value for ${privilegeName} & ${moduleName} :`,
  //       value
  //     );

  //     //! if bit is part of mask / bit is not part of mask, then, show / hide the UI element respectively
  //     value != 0
  //       ? (this.isUploadPrivilegedModule = true)
  //       : (this.isUploadPrivilegedModule = false);

  //     // //console.log('isPrivilegedModule :', this.isPrivilegedModule);
  //   } else {
  //     this.openSnackBar(`ACCESS DENIED FOR ${privilegeName}`);
  //   }
  // }

  // checkIfBitIsPartOfMask(privilegeBit: number, privilegeMask: number) {
  //   return privilegeBit & privilegeMask;
  // }
  // Add method to check if a user is deactivated
  isUserDeactivated(fullName: string): boolean {
    return this.deactivatedUsers.some(user => 
      `${user.first_name} ${user.last_name}` === fullName
    );
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, 'Close', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: 10000, // 10 seconds in milliseconds
    });
  }
}
