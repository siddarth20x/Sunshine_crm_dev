import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
  MatSnackBar,
} from '@angular/material/snack-bar';
import { SunshineInternalService } from 'src/app/sunshine-services/sunshine-internal.service';

@Component({
  selector: 'app-visa-check-dialog',
  templateUrl: './visa-check-dialog.component.html',
  styleUrls: ['./visa-check-dialog.component.css'],
})
export class VisaCheckDialogComponent implements OnInit {
  showProgressBar: boolean = false;
  dialogTitle: string = '';
  dialogText: string = '';
  dialogData: any = {};
  visaCheckForm: any;
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  durationInSeconds: number = 5;
  visaStatus = [
    'ACTIVE',
    'VOILATED',
    'CANCELLED',
    'NEARLY EXPIRED',
    'NO RECORD FOUND',
  ];
  contactMode: Array<string> = ['CALL', 'MESSAGE', 'EMAIL', 'VISIT'];

  constructor(
    public dialogRef: MatDialogRef<VisaCheckDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _sunshineAPI: SunshineInternalService,
    private _snackBar: MatSnackBar,
    private _datePipe: DatePipe
  ) {
    this.visaCheckForm = new FormGroup({
      app_user_id: new FormControl(null, [Validators.required]),
      lead_id: new FormControl(null, [Validators.required]),
      task_id: new FormControl(null),
      contact_mode_list: new FormControl(null),
      visa_passport_no: new FormControl(null),
      visa_status: new FormControl(null),
      visa_expiry_date: new FormControl(null),
      visa_file_number: new FormControl(null),
      visa_emirates: new FormControl(null),
      visa_company_name: new FormControl(null),
      visa_designation: new FormControl(null),
      visa_contact_no: new FormControl(null),
      visa_emirates_id: new FormControl(null),
      unified_number: new FormControl(null),
    });
  }

  ngOnInit(): void {
    this.receiveInjectedData();
  }

  receiveInjectedData() {
    this.dialogTitle = this.data.dialogTitle;
    this.dialogData = this.data.dialogData;
    console.log(this.dialogData);
    if (this.dialogData != undefined) {
      this.visaCheckForm.patchValue({
        lead_id: this.dialogData.lead_id,
        app_user_id: this.dialogData.app_user_id,
        contact_mode_list: this.dialogData.contact_mode_list,
        task_id: this.dialogData.task_id,
      });
      this.visaCheckForm
        .get('visa_passport_no')
        ?.setValidators(Validators.required);
      this.visaCheckForm.get('visa_status')?.setValidators(Validators.required);
      this.visaCheckForm
        .get('visa_expiry_date')
        ?.setValidators(Validators.required);
      this.visaCheckForm
        .get('visa_file_number')
        ?.setValidators(Validators.required);
      this.visaCheckForm
        .get('visa_emirates')
        ?.setValidators(Validators.required);
      this.visaCheckForm
        .get('visa_company_name')
        ?.setValidators(Validators.required);
      this.visaCheckForm
        .get('visa_designation')
        ?.setValidators(Validators.required);
      this.visaCheckForm
        .get('visa_contact_no')
        ?.setValidators(Validators.required);
      this.visaCheckForm
        .get('visa_emirates_id')
        ?.setValidators(Validators.required);
      this.visaCheckForm
        .get('unified_number')
        ?.setValidators(Validators.required);

      this.visaCheckForm.get('visa_passport_no')?.updateValueAndValidity();
      this.visaCheckForm.get('visa_status')?.updateValueAndValidity();
      this.visaCheckForm.get('visa_expiry_date')?.updateValueAndValidity();
      this.visaCheckForm.get('visa_file_number')?.updateValueAndValidity();
      this.visaCheckForm.get('visa_emirates')?.updateValueAndValidity();
      this.visaCheckForm.get('visa_company_name')?.updateValueAndValidity();
      this.visaCheckForm.get('visa_designation')?.updateValueAndValidity();
      this.visaCheckForm.get('visa_contact_no')?.updateValueAndValidity();
      this.visaCheckForm.get('visa_emirates_id')?.updateValueAndValidity();
      this.visaCheckForm.get('unified_number')?.updateValueAndValidity();
    }
  }

  selectVisaStatus(event: any) {
    // console.log(event.value);
    let visaStatus = event.value;
    if (visaStatus === 'NO RECORD FOUND') {
      //! REMOVE FORM VALIDATIONS
      this.visaCheckForm.get('visa_passport_no')?.clearValidators();
      this.visaCheckForm.get('visa_status')?.clearValidators();
      this.visaCheckForm.get('visa_expiry_date')?.clearValidators();
      this.visaCheckForm.get('visa_file_number')?.clearValidators();
      this.visaCheckForm.get('visa_emirates')?.clearValidators();
      this.visaCheckForm.get('visa_company_name')?.clearValidators();
      this.visaCheckForm.get('visa_designation')?.clearValidators();
      this.visaCheckForm.get('visa_contact_no')?.clearValidators();
      this.visaCheckForm.get('visa_emirates_id')?.clearValidators();
      this.visaCheckForm.get('unified_number')?.clearValidators();
    } else {
      //! KEEP FORM VALIDATIONS
      this.visaCheckForm
        .get('visa_passport_no')
        ?.setValidators(Validators.required);
      this.visaCheckForm.get('visa_status')?.setValidators(Validators.required);
      this.visaCheckForm
        .get('visa_expiry_date')
        ?.setValidators(Validators.required);
      this.visaCheckForm
        .get('visa_file_number')
        ?.setValidators(Validators.required);
      this.visaCheckForm
        .get('visa_emirates')
        ?.setValidators(Validators.required);
      this.visaCheckForm
        .get('visa_company_name')
        ?.setValidators(Validators.required);
      this.visaCheckForm
        .get('visa_designation')
        ?.setValidators(Validators.required);
      this.visaCheckForm
        .get('visa_contact_no')
        ?.setValidators(Validators.required);
      this.visaCheckForm
        .get('visa_emirates_id')
        ?.setValidators(Validators.required);
      this.visaCheckForm
        .get('unified_number')
        ?.setValidators(Validators.required);
    }
    //! UPDATE VALIDITY ON FORM CONTROL VALIDATORS STATUS ON THE UI
    this.visaCheckForm.get('visa_passport_no')?.updateValueAndValidity();
    this.visaCheckForm.get('visa_status')?.updateValueAndValidity();
    this.visaCheckForm.get('visa_expiry_date')?.updateValueAndValidity();
    this.visaCheckForm.get('visa_file_number')?.updateValueAndValidity();
    this.visaCheckForm.get('visa_emirates')?.updateValueAndValidity();
    this.visaCheckForm.get('visa_company_name')?.updateValueAndValidity();
    this.visaCheckForm.get('visa_designation')?.updateValueAndValidity();
    this.visaCheckForm.get('visa_contact_no')?.updateValueAndValidity();
    this.visaCheckForm.get('visa_emirates_id')?.updateValueAndValidity();
    this.visaCheckForm.get('unified_number')?.updateValueAndValidity();
  }

  assignedDateHandler(event: any) {
    let inputDate = event.value._i;
    // console.log(`${inputDate.year}-${inputDate.month + 1}-${inputDate.date}`);
    let expDate = `${inputDate.year}-${inputDate.month + 1}-${inputDate.date}`;
    this._datePipe.transform(
      this.visaCheckForm.value.visa_expiry_date,
      'yyyy-MM-dd'
    );
  }
  selectContactMode(event: any) {
    let contactMode = event.value;
    console.log(contactMode);
    this.visaCheckForm.patchValue({
      contact_mode_list: contactMode,
    });
    // if (contactMode) {
    //   this.hideContactAddress = true;
    // } else {
    //   this.hideContactAddress = false;
    // }
    // // console.log(event.value);
    // this.newTaskObj.mode_of_contact = contactMode;
    // this.editTaskObj.mode_of_contact = contactMode;
    // this.createTaskEmailNotif.mode_of_contact = contactMode;
    // this.selectedContactMode = contactMode;
  }
  saveVisaCheck() {
    this.showProgressBar = true;

    this.visaCheckForm.patchValue({
      visa_expiry_date: this._datePipe.transform(
        this.visaCheckForm.value.visa_expiry_date,
        'yyyy-MM-dd'
      ),
    });
    console.log('save-visa-check::', this.visaCheckForm.value);
    this._sunshineAPI
      .postNewVisaCheck(this.visaCheckForm.value)
      .then((res: any) => {
        console.log('NEW-VISA-CHECK-RES::>>', res);
        this.showProgressBar = false;
        this.openSnackBar(res.message);
        this.dialogRef.close({
          create: 1,
          // leadId: this.leadId,
        });
      })
      .catch((error) => {
        console.error(error);
        this.showProgressBar = false;
        this.openSnackBar(error.response.data.message);
        this.dialogRef.close({
          create: 0,
        });
      });
  }

  cancelVisaCheck() {
    this.dialogRef.close({
      cancel: 1,
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
