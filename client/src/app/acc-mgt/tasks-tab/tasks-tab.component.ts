import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { TasksDialogComponent } from 'src/app/dialogs/tasks-dialog/tasks-dialog.component';
import { CustomFunctionsService } from 'src/app/sunshine-services/custom-functions.service';
import { SunshineInternalService } from 'src/app/sunshine-services/sunshine-internal.service';
import { NotificationService } from '../../shared/services/notification.service';

@Component({
  selector: 'app-tasks-tab',
  templateUrl: './tasks-tab.component.html',
  styleUrls: ['./tasks-tab.component.css'],
})
export class TasksTabComponent implements OnInit {
  completedTasks: any[] = [];
  inProgTasks: any[] = [];
  cancelledTasks: any[] = [];
  deferredTasks: any[] = [];
  tasksArr: any[] = [];
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  durationInSeconds = 5;

  @Output() submitClicked = new EventEmitter<any>();
  pendingTasks: any[] = [];
  leadId: any;

  createPrivilegeName: string = 'CREATE';
  uploadPrivilegeName: string = 'UPLOAD';
  readPrivilegeName: string = 'READ';
  editPrivilegeName: string = 'EDIT';
  moduleName: string = 'TASKS';
  isCreatePrivilegedModule: any;
  isUploadPrivilegedModule: any;
  isReadPrivilegedModule: any;
  isEditPrivilegedModule: any;
  reWorkTasks: any[] = [];
  awaitAssignmentTasks: any[] = [];
  userId: any;
  companyId: any;

  constructor(
    public _tasksDialog: MatDialog,
    private _aR: ActivatedRoute,
    private _snackBar: MatSnackBar,
    private _sunshineApi: SunshineInternalService,
    private customFn: CustomFunctionsService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
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
      this.customFn.checkForAllowedModuleAndPrivilegesForRead(
        this.readPrivilegeName,
        this.moduleName
      );

    this.isEditPrivilegedModule =
      this.customFn.checkForAllowedModuleAndPrivilegesForEdit(
        this.editPrivilegeName,
        this.moduleName
      );
    this.captureRouteParams();
  }
  captureRouteParams() {
    let usrParams = this._aR.snapshot.params;
    let lead_id = parseInt(usrParams['leadId']);
    this.leadId = lead_id;
    let company_id = parseInt(usrParams['companyId']);

    // ////console.log('lead_id-snapshot :', lead_id);
    this.companyId = company_id;
    this.getAllTasks(lead_id, company_id);
  }
  getAllTasks(leadId: number, companyId: number) {
    let userDetails: any = sessionStorage.getItem('userDetails');
    let parsedUsrDetails = JSON.parse(userDetails);
    this.userId = parsedUsrDetails.user_id;
    console.log(this.userId);
    let taskByLeadIdParams = {
      app_user_id: this.userId,
      task_id: null,
      task_type_id: null,
      disposition_code_id: null,
      task_status_type_id: null,
      lead_id: leadId,
      company_id: companyId,
    };
    // console.log(taskByLeadIdParams);
    this._sunshineApi
      .fetchAllTasks(taskByLeadIdParams)
      .then((res: any) => {
        let tasksRes = res.data[0];
        // console.log('tasks-res::', tasksRes, 'for lead id:::', leadId);
        this.tasksArr = tasksRes;
        if (tasksRes.length == 0) {
          // this.openSnackBar(`No Tasks Found`);
        } else {
          this.filterCompletedTasks();
          this.filterInProgTasks();
          this.filterCancelledTasks();
          this.filterDeferredTasks();
          this.filterPendingTasks();
          this.filterReWorkTasks();
          this.filterAwaitingAssignmentTasks();
        }
      })
      .catch((error) => {
        // console.log(error);
        this.openSnackBar(error);
      });
  }
  filterCompletedTasks() {
    let completedTasks = this.tasksArr.filter(
      (task: any) => task.task_status_type_name === 'COMPLETED'
    );
    // ////console.log(completedTasks);
    return (this.completedTasks = completedTasks);
  }
  filterInProgTasks() {
    let inProgTasks = this.tasksArr.filter(
      (task: any) => task.task_status_type_name === 'IN PROGRESS'
    );
    // ////console.log(inProgTasks);
    return (this.inProgTasks = inProgTasks);
  }
  filterCancelledTasks() {
    const cancelledTasks = this.tasksArr.filter(
      (task: any) => task.task_status_type_name === 'CANCELLED'
    );
    // ////console.log(cancelledTasks);
    return (this.cancelledTasks = cancelledTasks);
  }
  filterDeferredTasks() {
    const deferredTasks = this.tasksArr.filter(
      (task: any) => task.task_status_type_name === 'DEFERRED'
    );
    // ////console.log(deferredTasks);
    return (this.deferredTasks = deferredTasks);
  }
  filterPendingTasks() {
    // ////console.log(this.tasksArr);

    const pendingTasks = this.tasksArr.filter(
      (task: any) => task.task_status_type_name === 'PENDING'
    );
    // ////console.log(pendingTasks);
    return (this.pendingTasks = pendingTasks);
  }

  filterReWorkTasks() {
    // ////console.log(this.tasksArr);

    const reWorkTasks = this.tasksArr.filter(
      (task: any) => task.task_status_type_name === 'RE WORK'
    );
    // ////console.log(pendingTasks);
    return (this.reWorkTasks = reWorkTasks);
  }

  filterAwaitingAssignmentTasks() {
    // ////console.log(this.tasksArr);

    const awaitTasks = this.tasksArr.filter(
      (task: any) => task.task_status_type_name === 'AWAITING ASSIGNMENT'
    );
    // ////console.log(pendingTasks);
    return (this.awaitAssignmentTasks = awaitTasks);
  }

  createTasks() {
    const dialogRef = this._tasksDialog.open(TasksDialogComponent, {
      // height: '25rem',
      // width: '25rem',
      autoFocus: false,
      data: {
        dialogTitle: 'Create New Task',
        dialogText: `This is new task data`,
        leadId: this.leadId,
      },
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      console.log(`Create Task Dialog result:::`, result);
      if (result && result.create == 1) {
        // this.getTAskByTaskID(result.taskId);
        this.getAllTasks(result.leadId, this.companyId);
        
        // Refresh sidebar status after task creation
        this.notificationService.refreshSidebarStatus();
        
        // Trigger dashboard counts refresh to update touched/untouched status
        this.notificationService.triggerDashboardRefresh();
      }
    });
  }
  viewTasks(tasks: any) {
    // //console.log('tasks:::', tasks);

    const dialogRef = this._tasksDialog.open(TasksDialogComponent, {
      // height: '25rem',
      // width: 'auto',
      autoFocus: false,
      data: {
        dialogTitle: 'View Tasks',
        dialogText: `This is test data`,
        dialogData: tasks,
        leadId: this.leadId,
      },
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      // //console.log(`View / Update Task Dialog result::::`, result);
      if (result && result.update == 1) {
        // this.getTAskByTaskID(result.taskId);
        this.getAllTasks(result.leadId, this.companyId);
        
        // Refresh sidebar status after task update
        this.notificationService.refreshSidebarStatus();
        
        // Trigger dashboard counts refresh to update touched/untouched status
        this.notificationService.triggerDashboardRefresh();
      }
    });
  }

  // getTAskByTaskID(taskID: number) {
  //   let taskByLeadIdParams = {
  //     task_id: taskID,
  //     task_type_id: null,
  //     disposition_code_id: null,
  //     task_status_type_id: null,
  //     lead_id: null,
  //   };
  //   this._sunshineApi
  //     .fetchAllTasks(taskByLeadIdParams)
  //     .then((res: any) => {
  //       let tasksRes = res.data[0];
  //       //console.log(`tasks-res-by-id-${taskID}::`, tasksRes);
  //       this.tasksArr = tasksRes;
  //       if (tasksRes.length == 0) {
  //         this.openSnackBar(`No Tasks Found`);
  //       } else {
  //         this.filterCompletedTasks();
  //         this.filterInProgTasks();
  //         this.filterCancelledTasks();
  //         this.filterDeferredTasks();
  //         this.filterPendingTasks();
  //       }
  //     })
  //     .catch(
  //       (error) => //console.log(error)
  //       // this.openSnackBar(err)
  //     );
  // }

  openSnackBar(message: string) {
    this._snackBar.open(message, 'Close', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: this.durationInSeconds * 1000,
    });
  }
}
