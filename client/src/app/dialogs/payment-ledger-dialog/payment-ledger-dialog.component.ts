import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TasksDialogComponent } from '../tasks-dialog/tasks-dialog.component';
import { CustomFunctionsService } from 'src/app/sunshine-services/custom-functions.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { SunshineInternalService } from 'src/app/sunshine-services/sunshine-internal.service';
import { ActivatedRoute } from '@angular/router';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';

@Component({
  selector: 'app-payment-ledger-dialog',
  templateUrl: './payment-ledger-dialog.component.html',
  styleUrls: ['./payment-ledger-dialog.component.css'],
})
export class PaymentLedgerDialogComponent implements OnInit {
  dialogTitle: string = '';
  dialogText: string = '';
  showProgressBar: boolean = false;
  dialogData: any;

  createPrivilegeName: string = 'CREATE';
  uploadPrivilegeName: string = 'UPLOAD';
  readPrivilegeName: string = 'READ';
  editPrivilegeName: string = 'EDIT';
  moduleName: string = 'PAYMENT LEDGER';
  isCreatePrivilegedModule: any;
  isUploadPrivilegedModule: any;
  isReadPrivilegedModule: any;
  isEditPrivilegedModule: any;

  paymentLedgerForm: any;
  disableCreateTaskBtn: any;
  currentDate: any;
  leadId: number = 0;

  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  durationInSeconds: number = 5;
  appUserId: any;
  newTaskObj: any;
  loggedInUserId: any;
  editTaskObj: any;
  isDisabled: boolean = false;
  tasksArr: any[] = [];
  userId: any;
  companyId: any;

  constructor(
    public dialogRef: MatDialogRef<TasksDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _datePipe: DatePipe,
    private _sunshineAPI: SunshineInternalService,
    private _snackBar: MatSnackBar,
    private _aR: ActivatedRoute
  ) {
    this.paymentLedgerForm = new FormGroup({
      lead_payment_ledger_id: new FormControl(null, Validators.required),
      lead_id: new FormControl(null, Validators.required),
      task_id: new FormControl(null, Validators.required),
      app_user_id: new FormControl(null, Validators.required),
      last_paid_amount: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^\d{0,10}$/),
      ]),
      last_paid_date: new FormControl(null, Validators.required),
      ghrc_offer_1: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^\d{0,10}$/),
      ]),
      ghrc_offer_2: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^\d{0,10}$/),
      ]),
      ghrc_offer_3: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^\d{0,10}$/),
      ]),
      minimum_payment: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^\d{0,10}$/),
      ]),
      total_outstanding_amount: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^\d{0,10}$/),
      ]),
      principal_outstanding_amount: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^\d{0,10}$/),
      ]),
      credit_limit: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^\d{0,10}$/),
      ]),
      status: new FormControl(1),
    });
  }

  ngOnInit(): void {
    this.getUserSessionDetails();
    this.receiveInjectedData();
    // let userDetails: any = sessionStorage.getItem('userDetails');
    // let parsedUsrDetails = JSON.parse(userDetails);
    // this.userId = parsedUsrDetails.user_id;

    let usrParams = this._aR.snapshot.params;
    // let lead_id = parseInt(usrParams['leadId']);
    // this.leadId = lead_id;
    // let company_id = parseInt(usrParams['companyId']);

    console.log('usrParams-snapshot :', this._aR.snapshot.paramMap);
    // this.companyId = company_id;
  }

  getUserSessionDetails() {
    let usrDetails: any = sessionStorage.getItem('userDetails');
    let parsedUsrDetails = JSON.parse(usrDetails);
    this.appUserId = parsedUsrDetails.user_id;

    let leadResById: any = sessionStorage.getItem('leadByIdResp');
    let parsedleadResById = JSON.parse(leadResById);
    this.leadId = parsedleadResById[0].lead_id;

    this.paymentLedgerForm.patchValue({
      app_user_id: this.appUserId,
      lead_id: this.leadId,
    });
    this.getAllTasks(this.leadId, this.companyId);

    // console.log(this.paymentLedgerForm.value);
  }

  // receiveInjectedData() {
  //   this.dialogTitle = this.data.dialogTitle;
  //   this.dialogText = this.data.dialogText;
  //   this.dialogData = this.data.dialogData;
  //   console.log(this.dialogData);

  //   if (
  //     this.dialogData?.ghrc_offer_1 !== null ||
  //     this.dialogData?.ghrc_offer_2 !== null ||
  //     this.dialogData?.ghrc_offer_3 !== null ||
  //     this.dialogData?.minimum_payment !== null ||
  //     this.dialogData?.total_outstanding_amount !== null ||
  //     this.dialogData?.principal_outstanding_amount !== null ||
  //     this.dialogData?.credit_limit !== null
  //   ) {
  //     console.log(true);
  //     this.paymentLedgerForm.patchValue({
  //       ghrc_offer_1: this.dialogData?.ghrc_offer_1,
  //       ghrc_offer_2: this.dialogData?.ghrc_offer_2,
  //       ghrc_offer_3: this.dialogData?.ghrc_offer_3,
  //       minimum_payment: this.dialogData?.minimum_payment,
  //       total_outstanding_amount: this.dialogData?.total_outstanding_amount,
  //       principal_outstanding_amount: this.dialogData?.principal_outstanding_amount,
  //       credit_limit: this.dialogData?.credit_limit,
  //     });

  //     // Disable only the specified fields
  //     this.paymentLedgerForm.get('ghrc_offer_1')?.disable();
  //     this.paymentLedgerForm.get('ghrc_offer_2')?.disable();
  //     this.paymentLedgerForm.get('ghrc_offer_3')?.disable();
  //     // this.paymentLedgerForm.get('minimum_payment')?.disable();
  //     this.paymentLedgerForm.get('total_outstanding_amount')?.disable();
  //     this.paymentLedgerForm.get('principal_outstanding_amount')?.disable();
  //     this.paymentLedgerForm.get('credit_limit')?.disable();

  //     this.isDisabled = true;
  //   }

  //   if (this.dialogData != undefined) {
  //     this.paymentLedgerForm.patchValue({
  //       lead_payment_ledger_id: this.dialogData.lead_payment_ledger_id,
  //       app_user_id: this.appUserId,
  //       lead_id: this.data.leadId,
  //       task_id: this.data.task_id,
  //       last_paid_amount: this.dialogData.last_paid_amount,
  //       last_paid_date: this.dialogData.last_paid_date.split('T')[0],
  //       ghrc_offer_1: this.dialogData?.ghrc_offer_1,
  //       ghrc_offer_2: this.dialogData?.ghrc_offer_2,
  //       ghrc_offer_3: this.dialogData?.ghrc_offer_3,
  //       minimum_payment: this.dialogData?.minimum_payment,
  //       total_outstanding_amount: this.dialogData?.total_outstanding_amount,
  //       principal_outstanding_amount:
  //         this.dialogData?.principal_outstanding_amount,
  //       credit_limit: this.dialogData?.credit_limit,
  //     });
  //     console.log(this.paymentLedgerForm.value);
  //   }
  // }

  receiveInjectedData() {
    this.dialogTitle = this.data.dialogTitle;
    this.dialogText = this.data.dialogText;
    this.dialogData = this.data.dialogData;
    console.log(this.dialogData);

    if (this.dialogData) {
      const {
        ghrc_offer_1,
        ghrc_offer_2,
        ghrc_offer_3,
        minimum_payment,
        total_outstanding_amount,
        principal_outstanding_amount,
        credit_limit,
        lead_payment_ledger_id,
        last_paid_amount,
        last_paid_date,
        task_id
      } = this.dialogData;

      // Patch values for form
      this.paymentLedgerForm.patchValue({
        lead_payment_ledger_id: lead_payment_ledger_id,
        app_user_id: this.appUserId,
        lead_id: this.data.leadId,
        task_id: task_id,
        last_paid_amount: last_paid_amount,
        last_paid_date: last_paid_date ? last_paid_date.split('T')[0] : null,
        ghrc_offer_1: ghrc_offer_1,
        ghrc_offer_2: ghrc_offer_2,
        ghrc_offer_3: ghrc_offer_3,
        minimum_payment: minimum_payment,
        total_outstanding_amount: total_outstanding_amount,
        principal_outstanding_amount: principal_outstanding_amount,
        credit_limit: credit_limit,
      });

      console.log(this.paymentLedgerForm.value);

      // Disable only the specified fields if any of them are non-null
      if (
        ghrc_offer_1 !== null ||
        ghrc_offer_2 !== null ||
        ghrc_offer_3 !== null ||
        minimum_payment !== null ||
        total_outstanding_amount !== null ||
        principal_outstanding_amount !== null ||
        credit_limit !== null
      ) {
        console.log(true);

        [
          'ghrc_offer_1',
          'ghrc_offer_2',
          'ghrc_offer_3',
          'total_outstanding_amount',
          'principal_outstanding_amount',
          'credit_limit',
        ].forEach((field) => this.paymentLedgerForm.get(field)?.disable());

        this.isDisabled = true;
      }
    }
  }

  getAllTasks(leadId: number, companyId: number) {
    let taskByLeadIdParams = {
      app_user_id: this.appUserId,
      task_id: null,
      task_type_id: null,
      disposition_code_id: null,
      task_status_type_id: null,
      lead_id: leadId,
      company_id: companyId,
    };
    console.log(taskByLeadIdParams);
    this._sunshineAPI
      .fetchAllTasks(taskByLeadIdParams)
      .then((res: any) => {
        let tasksRes: any = res.data[0];
        console.log('tasks-res::', tasksRes, 'for lead id:::', leadId);
        this.tasksArr = tasksRes.filter((task: { task_type_name: string }) => {
          return task.task_type_name == 'PAYMENT COLLECTION';
        });
        console.log(this.tasksArr);
      })
      .catch((error: any) => {
        // console.log(error);
        this.openSnackBar(error);
      });
  }

  tasksHandler(event: any) {
    let taskId = event.value;
    console.log(taskId);
    this.paymentLedgerForm.patchValue({
      task_id: taskId,
    });
  }
  assignedDateHandler(event: any) {
    // console.log(event.value._i);

    let dateEvent = event.value._i;
    this.currentDate = `${dateEvent.year}-${dateEvent.month + 1}-${
      dateEvent.date
    } `;
    let date = new Date(this.currentDate);
    this.currentDate = this._datePipe.transform(date, `yyyy-MM-dd`);

    this.paymentLedgerForm.patchValue({
      last_paid_date: this.currentDate,
    });
    // console.log(`last-paid-date::`, this.paymentLedgerForm.value);
  }

  createPaymentLedgerEntry() {
    this.showProgressBar = true;

    // Use getRawValue() to include disabled fields
    const formData = this.paymentLedgerForm.getRawValue();
    console.log('Form data with disabled fields:', formData);
    //USE KEY FOR UPDATE lead_payment_ledger_id

    this._sunshineAPI
      .postPaymentLedgerEntry(formData)
      .then((res: any) => {
        console.log('NEW-PAYMENT-RES::>>', res);
        this.showProgressBar = false;
        this.openSnackBar(res.message);
        this.dialogRef.close({
          create: 1,
          leadId: this.leadId,
        });
      })
      .catch((error: { response: { data: { message: any } } }) => {
        console.error(error);
        this.showProgressBar = false;
        this.openSnackBar(error.response.data.message);
        this.dialogRef.close({
          create: 0,
        });
      });
  }

  cancelTask() {
    this.dialogRef.close({
      message: `Payment Ledger Entry Cancelled`,
      cancel: 1,
    });
  }

  updatePayment(arg0: any) {
    this.showProgressBar = true;

    // Use getRawValue() to include disabled fields
    const formData = this.paymentLedgerForm.getRawValue();
    console.log('update-lpl:::', formData);
    //USE KEY FOR UPDATE lead_payment_ledger_id

    this._sunshineAPI
      .editPaymentLedgerEntry(formData)
      .then((res: any) => {
        console.log('NEW-PAYMENT-RES::>>', res);
        this.showProgressBar = false;
        this.openSnackBar(res.message);
        this.dialogRef.close({
          message: `Payment Ledger Entry Updated`,
          update: 1,
          leadId: formData.lead_id,
        });
      })
      .catch((error: { response: { data: { message: any } } }) => {
        console.error(error);
        this.showProgressBar = false;
        this.openSnackBar(error.response.data.message);
        this.dialogRef.close({
          message: `Failed to update Payment Ledger Entry`,
          update: 0,
          // leadId: this.newTaskObj.lead_id,
        });
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
}
