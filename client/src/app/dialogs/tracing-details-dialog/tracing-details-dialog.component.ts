import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
  MatSnackBar,
} from '@angular/material/snack-bar';
import { Observable, startWith, map } from 'rxjs';
import { SunshineInternalService } from 'src/app/sunshine-services/sunshine-internal.service';
import { WebTracingDialogComponent } from '../web-tracing-dialog/web-tracing-dialog.component';

@Component({
  selector: 'app-tracing-details-dialog',
  templateUrl: './tracing-details-dialog.component.html',
  styleUrls: ['./tracing-details-dialog.component.css'],
})
export class TracingDetailsDialogComponent implements OnInit {
  showProgressBar: boolean = false;
  dialogTitle: string = '';
  dialogText: string = '';
  dialogData: any = {};
  tracingDetails: any;
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  durationInSeconds: number = 5;

  constructor(
    public dialogRef: MatDialogRef<TracingDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _sunshineAPI: SunshineInternalService,
    private _snackBar: MatSnackBar
  ) {
    this.tracingDetails = new FormGroup({
      app_user_id: new FormControl(null),
      lead_id: new FormControl(null),
      task_id: new FormControl(null),
      sql_details: new FormControl('', [Validators.required]),
      company_trade_license_details: new FormControl('', [
        Validators.required,
      ]),
      additional_details: new FormControl('', [Validators.required]),
    });

    this.tracingDetails.statusChanges.subscribe((status: string) => {
      console.log('Tracing Details Form Status:', status);
      console.log('Form Valid:', this.tracingDetails.valid);
      console.log('Form Values:', this.tracingDetails.value);
      console.log('Form Errors:', this.getFormValidationErrors());
      console.log('All fields filled:', this.areAllFieldsFilled());
    });
  }

  ngOnInit(): void {
    this.receiveInjectedData();
  }

  areAllFieldsFilled(): boolean {
    const sqlDetails = this.tracingDetails.get('sql_details')?.value;
    const licenseDetails = this.tracingDetails.get('company_trade_license_details')?.value;
    const additionalDetails = this.tracingDetails.get('additional_details')?.value;
    
    return !!sqlDetails && !!licenseDetails && !!additionalDetails &&
           sqlDetails.trim() !== '' && licenseDetails.trim() !== '' && additionalDetails.trim() !== '';
  }

  getFormValidationErrors() {
    const errors: any = {};
    Object.keys(this.tracingDetails.controls).forEach(key => {
      const control = this.tracingDetails.get(key);
      if (control.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }

  receiveInjectedData() {
    this.dialogTitle = this.data.dialogTitle;
    this.dialogData = this.data.dialogData;
    console.log('Dialog Data:', this.dialogData);
    
    if (this.dialogData != undefined) {
      this.tracingDetails.patchValue({
        lead_id: this.dialogData.lead_id || 0,
        app_user_id: this.dialogData.app_user_id || 0,
        task_id: this.dialogData.task_id || 0,
      });
      
      console.log('Form after patching values:', this.tracingDetails.value);
      console.log('Form validity after patching:', this.tracingDetails.valid);
    }
  }

  saveTraceDetails() {
    if (!this.areAllFieldsFilled()) {
      this.openSnackBar('Please fill in all required fields');
      return;
    }
    
    this.showProgressBar = true;

    const formData = {...this.tracingDetails.value};
    formData.app_user_id = formData.app_user_id || 0;
    formData.lead_id = formData.lead_id || 0;
    formData.task_id = formData.task_id || 0;

    console.log('save-trace-check::', formData);
    this._sunshineAPI
      .postNewTracing(formData)
      .then((res: any) => {
        console.log('NEW-TRACE-RES::>>', res);
        this.showProgressBar = false;
        this.openSnackBar(res.message);
        this.dialogRef.close({
          create: 1,
        });
      })
      .catch((error) => {
        console.error(error);
        this.showProgressBar = false;
        this.openSnackBar(error.response?.data?.message || 'Error saving tracing details');
        this.dialogRef.close({
          create: 0,
        });
      });
  }

  cancelTraceDetails() {
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
  }
}
