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
  selector: 'app-mol-check-dialog',
  templateUrl: './mol-check-dialog.component.html',
  styleUrls: ['./mol-check-dialog.component.css'],
})
export class MolCheckDialogComponent implements OnInit {
  showProgressBar: boolean = false;
  dialogTitle: string = '';
  dialogText: string = '';
  dialogData: any = {};
  molCheckForm: any;
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  durationInSeconds: number = 5;
  molStatus = [
    'ACTIVE',
    'INACTIVE',
    'UNDER PROCESS',
    'FINED',
    'NO RECORD FOUND',
  ];
  contactMode: Array<string> = ['CALL', 'MESSAGE', 'EMAIL', 'VISIT'];

  constructor(
    public dialogRef: MatDialogRef<MolCheckDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _sunshineAPI: SunshineInternalService,
    private _snackBar: MatSnackBar,
    private _datePipe: DatePipe
  ) {
    this.molCheckForm = new FormGroup({
      app_user_id: new FormControl(null, [Validators.required]),
      lead_id: new FormControl(null, [Validators.required]),
      task_id: new FormControl(null),
      contact_mode_list: new FormControl(null),
      mol_status: new FormControl(null),
      mol_work_permit_no: new FormControl(null),
      mol_company_name: new FormControl(null),
      mol_expiry_date: new FormControl(null),
      mol_salary: new FormControl(null),
      mol_passport_no: new FormControl(null),
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
      this.molCheckForm.patchValue({
        lead_id: this.dialogData.lead_id,
        app_user_id: this.dialogData.app_user_id,
        contact_mode_list: this.dialogData.contact_mode_list,
        task_id: this.dialogData.task_id,
      });
      this.molCheckForm.get('mol_status')?.setValidators(Validators.required);
      this.molCheckForm
        .get('mol_work_permit_no')
        ?.setValidators(Validators.required);
      this.molCheckForm
        .get('mol_company_name')
        ?.setValidators(Validators.required);
      this.molCheckForm
        .get('mol_expiry_date')
        ?.setValidators(Validators.required);
      this.molCheckForm.get('mol_salary')?.setValidators(Validators.required);
      this.molCheckForm
        .get('mol_passport_no')
        ?.setValidators(Validators.required);

      this.molCheckForm.get('mol_status')?.updateValueAndValidity();
      this.molCheckForm.get('mol_work_permit_no')?.updateValueAndValidity();
      this.molCheckForm.get('mol_company_name')?.updateValueAndValidity();
      this.molCheckForm.get('mol_expiry_date')?.updateValueAndValidity();
      this.molCheckForm.get('mol_salary')?.updateValueAndValidity();
      this.molCheckForm.get('mol_passport_no')?.updateValueAndValidity();
    }
  }

  selectMOLStatus(event: any) {
    // console.log(event.value);
    let molStatus = event.value;
    if (molStatus === 'NO RECORD FOUND') {
      //! REMOVE FORM VALIDATIONS
      this.molCheckForm.get('mol_status')?.clearValidators();
      this.molCheckForm.get('mol_work_permit_no')?.clearValidators();
      this.molCheckForm.get('mol_company_name')?.clearValidators();
      this.molCheckForm.get('mol_expiry_date')?.clearValidators();
      this.molCheckForm.get('mol_salary')?.clearValidators();
      this.molCheckForm.get('mol_passport_no')?.clearValidators();
    } else {
      //! KEEP FORM VALIDATIONS
      this.molCheckForm.get('mol_status')?.setValidators(Validators.required);
      this.molCheckForm
        .get('mol_work_permit_no')
        ?.setValidators(Validators.required);
      this.molCheckForm
        .get('mol_company_name')
        ?.setValidators(Validators.required);
      this.molCheckForm
        .get('mol_expiry_date')
        ?.setValidators(Validators.required);
      this.molCheckForm.get('mol_salary')?.setValidators(Validators.required);
      this.molCheckForm
        .get('mol_passport_no')
        ?.setValidators(Validators.required);
    }
    //! UPDATE VALIDITY ON FORM CONTROL VALIDATORS STATUS ON THE UI
    this.molCheckForm.get('mol_status')?.updateValueAndValidity();
    this.molCheckForm.get('mol_work_permit_no')?.updateValueAndValidity();
    this.molCheckForm.get('mol_company_name')?.updateValueAndValidity();
    this.molCheckForm.get('mol_expiry_date')?.updateValueAndValidity();
    this.molCheckForm.get('mol_salary')?.updateValueAndValidity();
    this.molCheckForm.get('mol_passport_no')?.updateValueAndValidity();
  }

  assignedDateHandler(event: any) {
    let inputDate = event.value._i;
    this._datePipe.transform(
      this.molCheckForm.value.mol_expiry_date,
      'yyyy-MM-dd'
    );
  }
  selectContactMode(event: any) {
    let contactMode = event.value;
    console.log(contactMode);
    this.molCheckForm.patchValue({
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
  saveMolCheck() {
    this.showProgressBar = true;

    this.molCheckForm.patchValue({
      mol_expiry_date: this._datePipe.transform(
        this.molCheckForm.value.mol_expiry_date,
        'yyyy-MM-dd'
      ),
    });
    console.log('save-mol-check::', this.molCheckForm.value);
    this._sunshineAPI
      .postNewMOLCheck(this.molCheckForm.value)
      .then((res: any) => {
        console.log('NEW-MOL-CHECK-RES::>>', res);
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

  cancelMolCheck() {
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
