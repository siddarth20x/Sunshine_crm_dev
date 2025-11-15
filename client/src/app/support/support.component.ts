import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { SupportDialogComponent } from '../dialogs/support-dialog/support-dialog.component';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomFunctionsService } from '../sunshine-services/custom-functions.service';
import { SunshineInternalService } from '../sunshine-services/sunshine-internal.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.css'],
})
export class SupportComponent implements OnInit {
  loggedInUserId: any;
  displayedClientHoldersColumns: string[] = [];
  dataSource: any;
  myDataArray: any[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  resultsLength: number = 0;
  tableTxt: string = '';
  showProgressBar: boolean = false;
  isITManager: boolean = false;
  allUsers: any[] = []; // Cache for all users
  deactivatedUsers: any[] = []; // Add this property to track deactivated users

  createPrivilegeName: string = 'CREATE';
  readPrivilegeName: string = 'READ';
  moduleName: string = 'SUPPORT';
  isCreatePrivilegedModule: any;
  isReadPrivilegedModule: any;
  editPrivilegeName: string = 'EDIT';
  isEditPrivilegedModule: any;

  constructor(
    private _sunshineApi: SunshineInternalService,
    private _snackBar: MatSnackBar,
    private customFn: CustomFunctionsService,
    public supportDialog: MatDialog
  ) {}

  ngOnInit(): void {
    let usrDetails: any = sessionStorage.getItem('userDetails');
    let parsedUsrDetails = JSON.parse(usrDetails);
    this.loggedInUserId = parsedUsrDetails.user_id;
    
    // Check if user is IT manager
    this.isITManager = parsedUsrDetails.role_name === 'IT MANAGER';

    // Set create privilege based on role
    if (this.isITManager) {
      this.isCreatePrivilegedModule = true;
    } else {
      this.isCreatePrivilegedModule = this.customFn.checkForAllowedModuleAndPrivilegesForCreate(
        this.createPrivilegeName,
        this.moduleName
      );
    }

    this.isReadPrivilegedModule = this.customFn.checkForAllowedModuleAndPrivilegesForRead(
      this.readPrivilegeName,
      this.moduleName
    );

    this.isEditPrivilegedModule = this.customFn.checkForAllowedModuleAndPrivilegesForEdit(
      this.editPrivilegeName,
      this.moduleName
    );

    this.fetchAllUsers();
  }

  fetchAllUsers() {
    this._sunshineApi.fetchAllUsers()
      .then((res: any) => {
        let resData = res.data[0];
        this.allUsers = resData.filter((user: any) => user.status !== 0);
        this.deactivatedUsers = resData.filter((user: any) => user.status === 0);
        this.getAllTickets();
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
        this.getAllTickets();
      });
  }

  raiseTktDialog() {
    let usrDetails: any = sessionStorage.getItem('userDetails');
    let parsedUsrDetails = JSON.parse(usrDetails);
    const dialogRef = this.supportDialog.open(SupportDialogComponent, {
      data: {
        dialogTitle: 'Raise New Ticket',
        dialogText: `This is new ticket data`,
        dialogData: { 
          app_user_id: this.loggedInUserId,
          ticket_raised_by_id: parsedUsrDetails.user_id,
          ticket_raised_by_full_name: parsedUsrDetails.full_name
        },
      },
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      console.log(`Create Ticket Dialog result:::`, result);
      if (result && result.create == 1) {
        this.getAllTickets();
      }
    });
  }

  getAllTickets() {
    this.showProgressBar = true;

    this.displayedClientHoldersColumns = [
      'ticket_id',
      'ticket_status_type_name',
      'ticket_issue_category_type_name',
      'full_name',
      'created_by_name',
      'ticket_raised_dtm',
      'ticket_resolved_dtm',
    ];

    let usrDetails: any = sessionStorage.getItem('userDetails');
    let parsedUsrDetails = JSON.parse(usrDetails);
    let userRole = parsedUsrDetails.role_name;

    // For regular users, we need to fetch tickets in two ways:
    // 1. Tickets where user is creator/modifier (app_user_id filter)
    // 2. Tickets where user is the one the ticket was raised for (ticket_raised_by_id filter)
    
    if (userRole === 'ADMIN' || userRole === 'IT MANAGER') {
      // Admin and IT managers see all tickets
      let params = {
        app_user_id: null,
        ticket_id: null,
        ticket_status_type_id: null,
        ticket_issue_category_type_id: null,
        ticket_raised_by_id: null,
        ticket_raised_dtm: null,
        ticket_resolved_dtm: null,
      };

      this._sunshineApi.fetchAllTickets(params)
        .then((res: any) => {
          let resData = res.data;
          console.log('all-tickets-res::', resData[0]);
          
          this.myDataArray = resData[0].sort((a: any, b: any) => {
            return b.ticket_id - a.ticket_id;
          });
          
          this.setupDataSource();
        })
        .catch((error) => {
          this.showProgressBar = false;
          console.error(error);
        });
    } else {
      // For regular users, fetch tickets where they are creator/modifier
      let paramsForCreated = {
        app_user_id: this.loggedInUserId,
        ticket_id: null,
        ticket_status_type_id: null,
        ticket_issue_category_type_id: null,
        ticket_raised_by_id: null,
        ticket_raised_dtm: null,
        ticket_resolved_dtm: null,
      };

      this._sunshineApi.fetchAllTickets(paramsForCreated)
        .then((res: any) => {
          let createdTickets = res.data[0];
          
          // Then fetch tickets where user is the one the ticket was raised for
          let paramsForRaisedBy = {
            app_user_id: null,
            ticket_id: null,
            ticket_status_type_id: null,
            ticket_issue_category_type_id: null,
            ticket_raised_by_id: this.loggedInUserId,
            ticket_raised_dtm: null,
            ticket_resolved_dtm: null,
          };
          
          this._sunshineApi.fetchAllTickets(paramsForRaisedBy)
            .then((raisedByRes: any) => {
              let raisedByTickets = raisedByRes.data[0];
              
              // Combine both sets of tickets and remove duplicates
              let combinedTickets = [...createdTickets];
              
              raisedByTickets.forEach((ticket: any) => {
                if (!combinedTickets.find((t: any) => t.ticket_id === ticket.ticket_id)) {
                  combinedTickets.push(ticket);
                }
              });
              
              // Sort tickets by ticket_id in descending order
              this.myDataArray = combinedTickets.sort((a: any, b: any) => {
                return b.ticket_id - a.ticket_id;
              });
              
              this.setupDataSource();
            })
            .catch((error) => {
              console.error('Error fetching raised by tickets:', error);
              this.setupDataSource();
            });
        })
        .catch((error) => {
          this.showProgressBar = false;
          console.error(error);
        });
    }
    
    this.tableTxt = `Tickets`;
  }

  private setupDataSource() {
    // Add created_by_name to each ticket
    this.myDataArray.forEach((ticket: any) => {
      if (ticket.created_id) {
        ticket.created_by_name = this.getUserNameById(ticket.created_id);
      } else {
        ticket.created_by_name = 'N/A';
      }
    });
    
    this.dataSource = new MatTableDataSource(this.myDataArray);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.resultsLength = this.myDataArray.length;
    this.showProgressBar = false;
  }

  private getUserNameById(userId: number): string {
    try {
      // Find user in cached data
      const user = this.allUsers.find((u: any) => u.user_id === userId);
      if (user) {
        return user.full_name || `${user.first_name} ${user.last_name}`;
      }
      
      // Fallback to session storage for current user
      let usrDetails: any = sessionStorage.getItem('userDetails');
      let parsedUsrDetails = JSON.parse(usrDetails);
      
      if (parsedUsrDetails.user_id === userId) {
        return parsedUsrDetails.full_name;
      }
      
      return `User ${userId}`;
    } catch (error) {
      console.error('Error getting user name:', error);
      return 'Unknown User';
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  viewTicket(row: any) {
    console.log('ticket-row::', row);

    const dialogRef = this.supportDialog.open(SupportDialogComponent, {
      // height: '25rem',
      // width: '25rem',
      data: {
        dialogTitle: 'View Ticket',
        dialogText: `This is view ticket data`,
        dialogData: {
          app_user_id: this.loggedInUserId,
          ticket_id: row.ticket_id,
          ticket_status_type_id: row.ticket_status_type_id,
          ticket_status_type_name: row.ticket_status_type_name,
          ticket_issue_category_type_id: row.ticket_issue_category_type_id,
          ticket_issue_category_type_name: row.ticket_issue_category_type_name,
          ticket_raised_by_id: row.ticket_raised_by_id,
          ticket_raised_dtm: row.ticket_raised_dtm,
          ticket_resolved_dtm: row.ticket_resolved_dtm,
          ticket_raised_by_full_name: row.full_name,
          status: row.status,
        },
      },
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      console.log(`Update Ticket Dialog result:::`, result);
      if (result && result.update == 1) {
        this.getAllTickets();
      }
    });
  }

  // Add method to check if a user is deactivated
  isUserDeactivated(fullName: string): boolean {
    return this.deactivatedUsers.some(user => user.full_name === fullName);
  }


}
