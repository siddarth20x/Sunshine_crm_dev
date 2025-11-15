import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SupportDialogComponent } from '../dialogs/support-dialog/support-dialog.component';
import { CustomFunctionsService } from '../sunshine-services/custom-functions.service';
import { SunshineInternalService } from '../sunshine-services/sunshine-internal.service';
import { TargetsDialogComponent } from '../dialogs/targets-dialog/targets-dialog.component';
import { ConfirmationDialogComponent } from '../dialogs/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-targets',
  templateUrl: './targets.component.html',
  styleUrls: ['./targets.component.css'],
})
export class TargetsComponent implements OnInit {
  loggedInUserId: any;
  loggedInUserRole: string = '';
  loggedInUserName: string = '';
  isTeamLeadOrAgent: boolean = false;
  displayedClientHoldersColumns: string[] = [];
  dataSource: any;
  myDataArray: any[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  resultsLength: number = 0;
  tableTxt: string = '';
  showProgressBar: boolean = false;

  createPrivilegeName: string = 'CREATE';
  readPrivilegeName: string = 'READ';
  moduleName: string = 'TARGETS';
  isCreatePrivilegedModule: any;
  isReadPrivilegedModule: any;
  editPrivilegeName: string = 'EDIT';
  isEditPrivilegedModule: any;

  deactivatedUsers: any[] = [];

  constructor(
    private _sunshineApi: SunshineInternalService,
    private _snackBar: MatSnackBar,
    private customFn: CustomFunctionsService,
    public targetsDialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.isCreatePrivilegedModule =
      this.customFn.checkForAllowedModuleAndPrivilegesForCreate(
        this.createPrivilegeName,
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

    let usrDetails: any = sessionStorage.getItem('userDetails');
    let parsedUsrDetails = JSON.parse(usrDetails);
    this.loggedInUserId = parsedUsrDetails.user_id;
    this.loggedInUserRole = parsedUsrDetails.role_name;
    this.loggedInUserName = parsedUsrDetails.full_name;
    
    // Check if user is a team lead or agent
    this.isTeamLeadOrAgent = ['TEAM LEAD', 'AGENT'].includes(this.loggedInUserRole.toUpperCase());
    
    this.getAllTargets();
  }

  isUserDeactivated(fullName: string): boolean {
    return this.deactivatedUsers.some(user => user.full_name === fullName);
  }

  raiseTktDialog() {
    const dialogRef = this.targetsDialog.open(TargetsDialogComponent, {
      // height: '25rem',
      // width: '25rem',
      data: {
        dialogTitle: 'Assign New Target',
        dialogText: `This is new ticket data`,
        dialogData: { app_user_id: this.loggedInUserId },
      },
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      console.log(`Create Target Dialog result:::`, result);
      if (result && result.create == 1) {
        this.getAllTargets();
      }
    });
  }

  getAllTargets() {
    this.showProgressBar = true;

    this.displayedClientHoldersColumns = [
      'target_id',
      'target_assigned_by_full_name',
      'senior_manager_full_name',
      'team_manager_full_name',
      'team_lead_full_name',
      'agent_full_name',
      'target_amount',
      'achieved_target',
      'created_by_full_name'
    ];

    // Only add actions column if user is not a team lead or agent
    if (!this.isTeamLeadOrAgent) {
      this.displayedClientHoldersColumns.push('actions');
    }

    let params: any = {
      app_user_id: this.loggedInUserId,
      target_id: null,
      status: 'ACTIVE'  // Only fetch active targets by default
    };

    // For admin users, we don't need to filter by app_user_id
    if (this.loggedInUserRole.toUpperCase() === 'ADMIN') {
      delete params.app_user_id;
    }

    // First fetch all users to map IDs to names
    this._sunshineApi.fetchAllUsers()
      .then((userRes: any) => {
        const userMap = new Map();
        userRes.data[0].forEach((user: any) => {
          userMap.set(user.user_id, user.full_name);
        });

        // Store deactivated users for table warning icons
        this.deactivatedUsers = userRes.data[0].filter((user: any) => user.status === 0);

        // Now fetch targets
        return this._sunshineApi.fetchTargets(params)
          .then((res: any) => {
            let resData = res.data[0];
            console.log('all-targets-res::', resData);
            
            // Filter out any inactive targets and ensure proper number formatting
            this.myDataArray = resData
              .filter((target: any) => target.status !== 0)
              .map((target: any) => {
                // Get creator's name from userMap using created_id or created_by
                const createdById = target.created_id || target.created_by;
                const createdByFullName = userMap.get(createdById) || 'Unknown User';
                
                // Map team manager name if team_manager_id exists but team_manager_full_name is missing
                let teamManagerFullName = target.team_manager_full_name;
                if (target.team_manager_id && !target.team_manager_full_name) {
                  teamManagerFullName = userMap.get(target.team_manager_id) || '';
                }
                
                // Map senior manager name if senior_manager_id exists but senior_manager_full_name is missing
                let seniorManagerFullName = target.senior_manager_full_name;
                if (target.senior_manager_id && !target.senior_manager_full_name) {
                  seniorManagerFullName = userMap.get(target.senior_manager_id) || '';
                }
                
                // Map team lead name if team_lead_id exists but team_lead_full_name is missing
                let teamLeadFullName = target.team_lead_full_name;
                if (target.team_lead_id && !target.team_lead_full_name) {
                  teamLeadFullName = userMap.get(target.team_lead_id) || '';
                }
                
                // Map agent name if agent_id exists but agent_full_name is missing
                let agentFullName = target.agent_full_name;
                if (target.agent_id && !target.agent_full_name) {
                  agentFullName = userMap.get(target.agent_id) || '';
                }
                
                // Map target assigned by name if target_assigned_by exists but target_assigned_by_full_name is missing
                let targetAssignedByFullName = target.target_assigned_by_full_name;
                if (target.target_assigned_by && !target.target_assigned_by_full_name) {
                  targetAssignedByFullName = userMap.get(target.target_assigned_by) || '';
                }
                
                return {
                  ...target,
                  target_amount: Number(target.target_amount) || 0,
                  achieved_target: Number(target.achieved_target) || 0,
                  working_days: Number(target.working_days) || 0,
                  created_by_full_name: createdByFullName, // Use the mapped name from created_id/created_by
                  team_manager_full_name: teamManagerFullName,
                  senior_manager_full_name: seniorManagerFullName,
                  team_lead_full_name: teamLeadFullName,
                  agent_full_name: agentFullName,
                  target_assigned_by_full_name: targetAssignedByFullName
                };
              })
              .reverse();

            // Calculate totals for verification
            const totalTargetAmount = this.myDataArray.reduce((sum, target) => sum + target.target_amount, 0);
            const totalAchievedAmount = this.myDataArray.reduce((sum, target) => sum + target.achieved_target, 0);
            console.log('Total Target Amount:', totalTargetAmount);
            console.log('Total Achieved Amount:', totalAchievedAmount);
            console.log('Total targets found:', this.myDataArray.length);

            this.dataSource = new MatTableDataSource(this.myDataArray);
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
            this.resultsLength = this.myDataArray.length;
            this.showProgressBar = false;
          });
      })
      .catch((error) => {
        this.showProgressBar = false;
        console.error(error);
        this._snackBar.open('Error fetching targets: ' + error.message, 'Close', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
        });
      });
    
    this.tableTxt = this.loggedInUserRole.toUpperCase() === 'ADMIN' ? 'All Targets' : 'Targets Assigned';
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  viewTicket(row: any) {
    console.log('target-row::', row);

    const dialogRef = this.targetsDialog.open(TargetsDialogComponent, {
      // height: '25rem',
      // width: '25rem',
      data: {
        dialogTitle: 'View Target',
        dialogText: `This is view target data`,
        dialogData: {
          app_user_id: this.loggedInUserId,
          target_id: row.target_id,
          admin_id: row.admin_id,
          admin_full_name: row.admin_full_name,
          agent_id: row.agent_id,
          agent_full_name: row.agent_full_name,
          team_lead_id: row.team_lead_id,
          team_lead_full_name: row.team_lead_full_name,
          senior_manager_id: row.senior_manager_id,
          senior_manager_full_name: row.senior_manager_full_name,
          team_manager_id: row.team_manager_id,
          team_manager_full_name: row.team_manager_full_name,
          target_amount: row.target_amount,
          target_assigned_by: row.target_assigned_by,
          target_assigned_by_full_name: row.target_assigned_by_full_name,
          working_days: row.working_days,
          achieved_target: row.achieved_target,
          from_date: row.from_date,
          to_date: row.to_date,
          status: row.status,
          created_by: row.created_by,
          created_by_full_name: row.created_by_full_name,
        },
      },
    });
dialogRef.afterClosed().subscribe(result => {
  console.log(`Update Target Dialog result:::`, result);
  if (result && result.update) {
    this.getAllTargets(); // This will fetch the latest data and update the table
  }
    });
  }

  deleteTarget(row: any) {
    const dialogRef = this.targetsDialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Target',
        message: 'Are you sure you want to delete this target?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.showProgressBar = true;
        const payload = {
          target_id: row.target_id,
          in_status: 0  // Use numeric 0 for inactive status
        };

        this._sunshineApi.editTargets(payload)
          .then((res: any) => {
            this.showProgressBar = false;
            
            // Remove the deleted target from the local data array
            this.myDataArray = this.myDataArray.filter(target => target.target_id !== row.target_id);
            
            // Update the data source with the filtered array
            this.dataSource = new MatTableDataSource(this.myDataArray);
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
            this.resultsLength = this.myDataArray.length;

            // Calculate updated totals including working days
            const totalTargetAmount = this.myDataArray.reduce((sum, target) => sum + Number(target.target_amount), 0);
            const totalAchievedAmount = this.myDataArray.reduce((sum, target) => sum + Number(target.achieved_target), 0);
            const totalWorkingDays = this.myDataArray.reduce((sum, target) => {
              const days = target.working_days ? parseInt(target.working_days, 10) : 0;
              return sum + days;
            }, 0);

            // Dispatch custom event for dashboard update
            const event = new CustomEvent('targetUpdated', {
              detail: {
                action: 'delete',
                targetId: row.target_id,
                totalTargetAmount,
                totalAchievedAmount,
                totalWorkingDays,
                deletedTarget: {
                  targetAmount: Number(row.target_amount),
                  achievedAmount: Number(row.achieved_target),
                  workingDays: Number(row.working_days) || 0
                }
              }
            });
            window.dispatchEvent(event);

            this._snackBar.open('Target deleted successfully', 'Close', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
            });
          })
          .catch((error) => {
            this.showProgressBar = false;
            console.error('Delete target error:', error);
            this._snackBar.open('Error deleting target: ' + error.message, 'Close', {
              duration: 5000,
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
            });
          });
      }
    });
  }
}
