import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import {
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
  MatSnackBar,
} from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AccUploadDialogComponent } from '../dialogs/acc-upload-dialog/acc-upload-dialog.component';
import { CustomFunctionsService } from '../sunshine-services/custom-functions.service';
import { SunshineInternalService } from '../sunshine-services/sunshine-internal.service';
import { TasksDialogComponent } from '../dialogs/tasks-dialog/tasks-dialog.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-field-vst-mgt',
  templateUrl: './field-vst-mgt.component.html',
  styleUrls: ['./field-vst-mgt.component.css'],
})
export class FieldVstMgtComponent implements OnInit {
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
  tasksArr: any[] = [];
  leadId: any;
  companyId: any;
  companyArr: any[] = [];
  fvTaskId: any;
  companyName: any;

  constructor(
    public accountUploadDialog: MatDialog,
    private customFn: CustomFunctionsService,
    private _sunshineIntService: SunshineInternalService,
    private _fb: FormBuilder,
    private _snackBar: MatSnackBar,
    private _aR: ActivatedRoute
  ) {}

  ngOnInit(): void {
    let userDetails: any = sessionStorage.getItem('userDetails');
    let parsedUsrDetails = JSON.parse(userDetails);
    this.userId = parsedUsrDetails.user_id;
    this.loggedInUserRole = parsedUsrDetails.role_name;

    // let usrParams = this._aR.snapshot.params;
    // let lead_id = parseInt(usrParams['leadId']);
    // this.leadId = lead_id;
    // let company_id = parseInt(usrParams['companyId']);

    // // ////console.log('lead_id-snapshot :', lead_id);

    this.displayedAccHoldersColumns = [
      'task_status_type_name',
      'account_number',
      'customer_name',
      'agreement_id',
      'product_type',
      'product_account_number',
      'assigned_by_full_name',
      'assigned_to_full_name',
      'stage',
      'mode_of_contact',
    ];

    if (!sessionStorage.getItem('company')) {
      this.getAllClients();
    } else {
      let companySession: any = sessionStorage.getItem('company');
      let parseCompanySession = JSON.parse(companySession);
      // console.log(parseCompanySession);
      this.companyArr = parseCompanySession;
    }

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

    let taskType: any = sessionStorage.getItem('taskType');
    let parsedtaskType = JSON.parse(taskType);
    // console.log(parsedtaskType);
    let fvTask = parsedtaskType.find((tt: any) => {
      return tt.task_type_name === 'FIELD VISIT';
    });
    // console.log(fvTask.task_type_id);
    this.fvTaskId = fvTask.task_type_id;
    // this.getAllTasks(this.fvTaskId, this.companyId);

    this.openSnackBar('Please select bank to fetch Field Visit Tasks')
  }

  getAllClients() {
    this._sunshineIntService
      .fectchUserCompany({ user_id: this.userId })
      .then((res: any) => {
        let resData = res.data[0];
        console.log('get-user-company-res:::', res.data[0]);
        sessionStorage.setItem('company', JSON.stringify(resData));
        // let resData = companyRes.data[0];
        console.log(resData);
        this.companyArr = resData;
      })
      .catch((error: any) => {
        console.error(error);
      });
  }

  companySelectHandler(event: any) {
    let selectedCompanyId = event.value;
    // console.log(selectedCompanyId);
    this.companyId = selectedCompanyId;
    this.companyName =
      this.companyArr.find((company) => company.company_id == this.companyId)
        ?.company_name || null;
    console.log(this.companyName);
  }
  openFVTaskDialog(tasks: any) {
    console.log(tasks);
    this.leadId = tasks.lead_id;
    const dialogRef = this.accountUploadDialog.open(TasksDialogComponent, {
      height: 'auto',
      // width: '90%',
      width: 'auto',
      autoFocus: false,
      data: {
        dialogTitle: 'View Tasks',
        dialogText: `This is test data`,
        dialogData: tasks,
        leadId: tasks.lead_id,
      },
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      // //console.log(`Account Upload Dialog result:::`, result);
      if (result && result.upload == 1) {
        this.openSnackBar(result.message);
        this.getAllTasks(4, this.companyId);
      }
    });
  }

  getAllTasks(taskTypeId: number, companyId: number) {
    this.displayedAccHoldersColumns = [
      'task_status_type_name',
      'account_number',
      'customer_name',
      'agreement_id',
      'product_type',
      'product_account_number',
      'assigned_by_full_name',
      'assigned_to_full_name',
      'stage',
      'mode_of_contact',
    ];
    let taskByLeadIdParams = {
      app_user_id: this.userId,
      task_id: null,
      task_type_id: taskTypeId,
      disposition_code_id: null,
      task_status_type_id: null,
      lead_id: null,
      company_id: companyId || null,
    };
    console.log(taskByLeadIdParams);
    this._sunshineIntService
      .fetchAllTasks(taskByLeadIdParams)
      .then((res: any) => {
        let tasksRes = res.data[0];
        // Filter tasks to show only those assigned to the logged-in user
        this.myDataArray = tasksRes.filter((task: any) => 
          String(task.assigned_to) === String(this.userId)
        ).reverse();
        console.log('tasks-res::', tasksRes);
        console.log('filtered-tasks-for-user::', this.myDataArray);
        this.dataSource = new MatTableDataSource(this.myDataArray);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.resultsLength = this.myDataArray.length;
        this.showProgressBar = false;
        this.tableTxt = `Field Visit Tasks for ${this.companyName}`;
      })
      .catch((error) => {
        console.log(error.response.data.message);
        this.openSnackBar(error.response.data.message + ' for selected bank');
      });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
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

  openSnackBar(message: string) {
    this._snackBar.open(message, 'Close', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: this.durationInSeconds * 1000,
    });
  }
}
