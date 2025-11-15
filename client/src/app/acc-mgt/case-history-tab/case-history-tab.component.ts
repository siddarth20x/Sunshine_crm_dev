import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { TasksDialogComponent } from 'src/app/dialogs/tasks-dialog/tasks-dialog.component';
import { CustomFunctionsService } from 'src/app/sunshine-services/custom-functions.service';
import { SunshineInternalService } from 'src/app/sunshine-services/sunshine-internal.service';

@Component({
  selector: 'app-case-history-tab',
  templateUrl: './case-history-tab.component.html',
  styleUrls: ['./case-history-tab.component.css'],
})
export class CaseHistoryTabComponent implements OnInit {
  allTaskTypes: any[] = [];
  displayedAccHoldersColumns: string[] = [];
  dataSource: any;
  myDataArray: any[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  resultsLength: number = 0;
  tableTxt: string = '';
  showProgressBar: boolean = false;
  downloadURLs: { [key: string]: string } = {};
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
  taskTypeAccess: {
    [key: string]: {
      read: boolean;
      // create: boolean;
      edit: boolean;
      upload: boolean;
    };
  } = {};
  userId: any;
  companyId: any;
  constructor(
    private _sunshineAPI: SunshineInternalService,
    private _aR: ActivatedRoute,
    private customFn: CustomFunctionsService,
    public _tasksDialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getAllTaskTypes();
    let userDetails: any = sessionStorage.getItem('userDetails');
    let parsedUsrDetails = JSON.parse(userDetails);
    this.userId = parsedUsrDetails.user_id;

    let usrParams = this._aR.snapshot.params;
    let lead_id = parseInt(usrParams['leadId']);
    this.leadId = lead_id;
    let company_id = parseInt(usrParams['companyId']);

    // ////console.log('lead_id-snapshot :', lead_id);
    this.companyId = company_id;
  }

  isDocumentUploadTaskType(taskTypeName: string): boolean {
    return taskTypeName === 'DOCUMENT UPLOAD';
  }

  getAllTaskTypes() {
    this._sunshineAPI
      .fetchTaskTypes()
      .then((res: any) => {
        let resData = res.data[0];
        this.allTaskTypes = resData;
        // Automatically select the first tab
        if (this.allTaskTypes.length > 0) {
          // this.selectedTab({ index: 0 });
        }
      })
      .catch((error) => console.error(error));
  }

  selectedTab(event: any) {
    let selectedTab: any;
    selectedTab = event.tab.textLabel;
    console.log('----', event);

    const taskType = this.allTaskTypes.find(
      (tab: any) => tab.task_type_name === selectedTab
    );

    if (taskType) {
      const privilegeMapping: { [key: string]: string } = {
        'PRELIMINARY CHECKS': 'PRELIMINARY_CHECKS',
        'FOLLOW UP': 'FOLLOW_UP',
        'DOCUMENT UPLOAD': 'DOCUMENTS',
        'FIELD VISIT': 'FIELD_VISIT_STATUS',
        'POLICE AND EXECUTION CASE DETAILS': 'POLICE_EXECUTION_CASE_DETAILS',
        'CALL REMINDER': 'CALL_REMINDER',
        'PAYMENT COLLECTION':'PAYMENT_COLLECTION'
      };

      const privilegeName = privilegeMapping[selectedTab];

      if (privilegeName) {
        this.isReadPrivilegedModule =
          this.customFn.checkForAllowedModuleAndPrivilegesForRead(
            this.readPrivilegeName,
            privilegeName
          );
        //console.log(privilegeName, this.isReadPrivilegedModule);

        this.isEditPrivilegedModule =
          this.customFn.checkForAllowedModuleAndPrivilegesForEdit(
            this.editPrivilegeName,
            privilegeName
          );
        //console.log(privilegeName, this.isEditPrivilegedModule);

        if (selectedTab === 'DOCUMENT UPLOAD') {
          this.isUploadPrivilegedModule =
            this.customFn.checkForAllowedModuleAndPrivilegesForUpload(
              this.uploadPrivilegeName,
              privilegeName
            );
          //console.log(privilegeName, this.isUploadPrivilegedModule);
        }

        this.taskTypeAccess[selectedTab] = {
          read: this.isReadPrivilegedModule,
          edit: this.isEditPrivilegedModule,
          upload:
            selectedTab === 'DOCUMENT UPLOAD'
              ? this.isUploadPrivilegedModule
              : false,
        };
      }

      const { task_type_id } = taskType;
      const leadSnapshotId = parseInt(this._aR.snapshot.params['leadId']);

      if (this.isReadPrivilegedModule) {
        this.fetchTaskByTaskTypeId(
          leadSnapshotId,
          task_type_id,
          this.companyId
        );
      }
    }
  }

  fetchTaskByTaskTypeId(leadId: number, taskId: number, companyId: number) {
    let taskParams = {
      app_user_id: this.userId,
      task_type_id: taskId,
      lead_id: leadId,
      company_id: companyId,
    };
    // console.log(taskParams);
    this._sunshineAPI
      .fetchAllTasks(taskParams)
      .then((res: any) => {
        let resData = res.data[0];
        this.myDataArray = resData;

        // Determine if document_url should be shown
        const hasDocumentUrl = this.myDataArray.some(
          (item) => item.document_url && item.document_url.trim() !== ''
        );

        // "stage": "NON CONTACTED",
        // "stage_status": "UNDER TRACING",
        // "stage_status_name": "NUMBER SWITCHED OFF",
        // "stage_status_code": "UTR",
        // Set the columns to be displayed based on the presence of document_url
        this.displayedAccHoldersColumns = [
          'task_id',
          'stage',
          'assigned_by_full_name',
          'assigned_to_full_name',
        ];
        if (hasDocumentUrl) {
          this.displayedAccHoldersColumns.push('document_url');
        }

        this.dataSource = new MatTableDataSource(this.myDataArray);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.resultsLength = this.myDataArray.length;
        this.showProgressBar = false;
      })
      .catch((error) => console.error('case-hist-task-get-err::',error));
  }

  downloadDocFromStorage(documentUrl: string, rowId: string): void {
    this.fetchDownloadURL(documentUrl).then((url) => {
      this.downloadURLs[rowId] = url;
    });
  }

  fetchDownloadURL(documentUrl: string): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(documentUrl);
      }, 1000);
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  viewTasks(tasks: any) {
    console.log('tasks:::', tasks);

    const dialogRef = this._tasksDialog.open(TasksDialogComponent, {
      // height: '25rem',
      // width: '25rem',
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
        this.fetchTaskByTaskTypeId(
          result.leadId,
          tasks.task_type_id,
          this.companyId
        );
      }
    });
  }
}
