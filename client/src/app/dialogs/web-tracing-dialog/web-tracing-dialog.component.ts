import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
  MatSnackBar,
} from '@angular/material/snack-bar';
import { Observable, map, startWith } from 'rxjs';
import { SunshineInternalService } from 'src/app/sunshine-services/sunshine-internal.service';

@Component({
  selector: 'app-web-tracing-dialog',
  templateUrl: './web-tracing-dialog.component.html',
  styleUrls: ['./web-tracing-dialog.component.css'],
})
export class WebTracingDialogComponent implements OnInit {
  showProgressBar: boolean = false;
  dialogTitle: string = '';
  dialogText: string = '';
  dialogData: any = {};
  webTracingForm: any;
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  durationInSeconds: number = 5;
  tracingSourceTypeArr: any[] = [];
  tracingSourceTypeControl = new FormControl();
  tracingSourceTypeFilteredOptions!: Observable<any[]>;
  showTracedDetailsInput: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<WebTracingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _sunshineAPI: SunshineInternalService,
    private _snackBar: MatSnackBar,
    private _datePipe: DatePipe
  ) {
    this.webTracingForm = new FormGroup({
      app_user_id: new FormControl(null),
      lead_id: new FormControl(null),
      task_id: new FormControl(null),
      tracing_source_type_id: new FormControl(null, [Validators.required]),
      tracing_source_type_name: new FormControl(null),
      traced_details: new FormControl('', [Validators.required]),
    });
    
    this.webTracingForm.statusChanges.subscribe((status: string) => {
      console.log('Web Tracing Form Status:', status);
      console.log('Form Valid:', this.webTracingForm.valid);
      console.log('Form Values:', this.webTracingForm.value);
      console.log('Form Errors:', this.getFormValidationErrors());
      console.log('All fields filled:', this.areAllFieldsFilled());
    });
  }

  ngOnInit(): void {
    this.receiveInjectedData();
    this.getTracingSourceType();
  }
  
  areAllFieldsFilled(): boolean {
    const sourceTypeId = this.webTracingForm.get('tracing_source_type_id')?.value;
    const tracedDetails = this.webTracingForm.get('traced_details')?.value;
    
    return !!sourceTypeId && !!tracedDetails && 
           (typeof tracedDetails !== 'string' || tracedDetails.trim() !== '');
  }

  getFormValidationErrors() {
    const errors: any = {};
    Object.keys(this.webTracingForm.controls).forEach(key => {
      const control = this.webTracingForm.get(key);
      if (control.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }

  private _filterTST(tst: string): any[] {
    const filterValue = tst.toLowerCase();
    return this.tracingSourceTypeArr.filter((option) =>
      option.tracing_source_type_name.toLowerCase().includes(filterValue)
    );
  }

  receiveInjectedData() {
    this.dialogTitle = this.data.dialogTitle;
    this.dialogData = this.data.dialogData;
    console.log('Dialog Data:', this.dialogData);
    
    if (this.dialogData != undefined) {
      this.webTracingForm.patchValue({
        lead_id: this.dialogData.lead_id || 0,
        app_user_id: this.dialogData.app_user_id || 0,
        task_id: this.dialogData.task_id || 0,
      });
      
      console.log('Form after patching values:', this.webTracingForm.value);
      console.log('Form validity after patching:', this.webTracingForm.valid);
    }
  }
  
  getTracingSourceType() {
    let params = { tracing_source_type_id: null };
    this._sunshineAPI
      .fetchTracingSourceType(params)
      .then((res: any) => {
        console.log('tracing-source-type:::', res.data[0]);
        let resData = res.data[0];
        this.tracingSourceTypeArr = resData;
        this.tracingSourceTypeFilteredOptions =
          this.tracingSourceTypeControl.valueChanges.pipe(
            startWith(''),
            map((value) => this._filterTST(value || ''))
          );
      })
      .catch((error) => {
        console.error('tracing-source-type-err:::', error);
      });
  }

  tracedSourceHandler(value: any) {
    console.log('Traced source value:', value);
    const id = this.tracingSourceTypeArr.find(
      (user: any) => user.tracing_source_type_name === value
    );

    if (id) {
      this.showTracedDetailsInput = true;
      console.log('Found tracing source type ID:', id.tracing_source_type_id);
      this.webTracingForm.patchValue({
        tracing_source_type_id: id.tracing_source_type_id,
        tracing_source_type_name: value
      });
    } else {
      console.log('No matching tracing source type found');
    }
    
    console.log('Form after source selection:', this.webTracingForm.value);
    console.log('Form validity after source selection:', this.webTracingForm.valid);
  }
  
  saveWebTrace() {
    if (!this.areAllFieldsFilled()) {
      this.openSnackBar('Please fill in all required fields');
      return;
    }
    
    this.showProgressBar = true;

    const formData = {...this.webTracingForm.value};
    formData.app_user_id = formData.app_user_id || 0;
    formData.lead_id = formData.lead_id || 0;
    formData.task_id = formData.task_id || 0;
    
    console.log('save-web-trace-check::', formData);
    this._sunshineAPI
      .postNewWebTracing(formData)
      .then((res: any) => {
        console.log('NEW-WEB-TRACE-RES::>>', res);
        this.showProgressBar = false;
        this.openSnackBar(res.message);
        this.dialogRef.close({
          create: 1,
        });
      })
      .catch((error) => {
        console.error(error);
        this.showProgressBar = false;
        this.openSnackBar(error.response?.data?.message || 'Error saving web tracing');
        this.dialogRef.close({
          create: 0,
        });
      });
  }

  cancelWebTrace() {
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
