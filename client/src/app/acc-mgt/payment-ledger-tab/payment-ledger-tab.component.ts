import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { PaymentLedgerDialogComponent } from 'src/app/dialogs/payment-ledger-dialog/payment-ledger-dialog.component';
import { CustomFunctionsService } from 'src/app/sunshine-services/custom-functions.service';
import { SunshineInternalService } from 'src/app/sunshine-services/sunshine-internal.service';

@Component({
  selector: 'app-payment-ledger-tab',
  templateUrl: './payment-ledger-tab.component.html',
  styleUrls: ['./payment-ledger-tab.component.css'],
})
export class PaymentLedgerTabComponent implements OnInit {
  myDataArray: any;
  dataSource: any;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  resultsLength: any;
  showProgressBar: boolean = false;
  leadId: any;
  loggedInUserId: any;

  columnsToDisplayWithExpand: string[] = [
    'task_id',
    'lead_payment_ledger_id',
    'credit_limit',
    'principal_outstanding_amount',
    'total_outstanding_amount',
    'minimum_payment',
    'last_paid_amount',
    'last_paid_date',
    'fresh_stab',
    'cycle_statement',
    'card_auth',
    'dpd_r',
    'mindue_manual',
    'rb_amount',
    'overdue_amount',
    'due_since_date',
    'last_month_paid_unpaid',
    'last_usage_date',
    'dpd_string',
    'monthly_income',
  ];

  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  durationInSeconds: number = 5;

  createPrivilegeName: string = 'CREATE';
  uploadPrivilegeName: string = 'UPLOAD';
  readPrivilegeName: string = 'READ';
  editPrivilegeName: string = 'EDIT';
  moduleName: string = 'PAYMENT_LEDGER';
  isCreatePrivilegedModule: any;
  isUploadPrivilegedModule: any;
  isReadPrivilegedModule: any;
  isEditPrivilegedModule: any;

  constructor(
    private _aR: ActivatedRoute,
    private _sunshineApi: SunshineInternalService,
    private customFn: CustomFunctionsService,
    private _snackBar: MatSnackBar,
    private _datePipe: DatePipe,
    public _paymentLedgerDialog: MatDialog
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
    let ssUserById: any = sessionStorage.getItem('userDetails');
    let parsedUserById = JSON.parse(ssUserById);
    this.loggedInUserId = parsedUserById.user_id;

    this.captureRouteParams();
  }

  captureRouteParams() {
    let usrParams = this._aR.snapshot.params;
    let lead_id = parseInt(usrParams['leadId']);
    this.leadId = lead_id;
    this.getLeadPaymentLedgerDetails(lead_id);
  }
  getLeadPaymentLedgerDetails(leadId: number) {
    let params = { lead_id: leadId };

    this._sunshineApi
      .fetchLeadsPaymentLedger(params)
      .then((res: any) => {
        console.log('GET-PAYMENT-LEDGER-RES::', res.data[0]);
        let resData = res.data[0];
        // Data is already sorted by created_dtm DESC from the stored procedure
        this.myDataArray = resData;
        // //console.log('all-accs', this.myDataArray);
        this.dataSource = new MatTableDataSource(this.myDataArray);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.resultsLength = this.myDataArray.length;
        this.showProgressBar = false;
      })
      .catch((error) => {
        console.error(error);
      });
  }
  openNewPaymentDialog() {
    const dialogRef = this._paymentLedgerDialog.open(
      PaymentLedgerDialogComponent,
      {
        // height: '25rem',
        // width: 'auto',
        data: {
          dialogTitle: 'New Payment Ledger Entry',
          dialogText: `This is test data`,
          dialogData: this.myDataArray.at(-1),
          leadId: this.leadId,
          appUserId: this.loggedInUserId,
        },
      }
    );
    dialogRef.afterClosed().subscribe((result: any) => {
      // console.log(`New Payment Ledger Dialog result::::`, result);
      if (result && result.create == 1) {
        this.getLeadPaymentLedgerDetails(result.leadId);
      }
    });
  }

  viewPaymentLedgerEntry(paymentDetail: any) {
    console.log('paymentDetail:::', paymentDetail);

    const dialogRef = this._paymentLedgerDialog.open(
      PaymentLedgerDialogComponent,
      {
        // height: '25rem',
        // width: '25rem',
        data: {
          dialogTitle: 'View Payment Ledger Entry',
          dialogText: `This is test data`,
          dialogData: paymentDetail,
          leadId: this.leadId,
        },
      }
    );
    dialogRef.afterClosed().subscribe((result: any) => {
      console.log(`Vew Payment Dialog result::::`, result);
      if (result && result.update == 1) {
        // this.getTAskByTaskID(result.taskId);
        this.getLeadPaymentLedgerDetails(result.leadId);
      }
    });
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, 'Okay', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: this.durationInSeconds * 1000,
    });
    // this._snackBar.open(message);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}