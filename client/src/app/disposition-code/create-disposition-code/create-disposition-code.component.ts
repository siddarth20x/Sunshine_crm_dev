import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CustomFunctionsService } from 'src/app/sunshine-services/custom-functions.service';
import { SunshineInternalService } from 'src/app/sunshine-services/sunshine-internal.service';

@Component({
  selector: 'app-create-disposition-code',
  templateUrl: './create-disposition-code.component.html',
  styleUrls: ['./create-disposition-code.component.css']
})
export class CreateDispositionCodeComponent implements OnInit {

  dispositionForm: any = [];
  userSaveProg: any;
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  durationInSeconds = 5;
  app_user_id: any;

  constructor(
    private _sunshineIntService: SunshineInternalService, 
    private _customFn: CustomFunctionsService, 
    private _fb: FormBuilder, 
    private _snackBar: MatSnackBar,
    private _router: Router
  ) {
    this.dispositionForm = this._fb.group({
      app_user_id: [null],
      stage: [null, [Validators.required]],
      stage_status: [null, [Validators.required]],
      stage_status_name: [null, [Validators.required]]
    })
  }

  ngOnInit(): void {
    let userDetails: any = sessionStorage.getItem('userDetails');
    let parsedUsrDetails = JSON.parse(userDetails);
    this.app_user_id = parsedUsrDetails.user_id;
    if (this.app_user_id) {
      this.dispositionForm.patchValue({
        app_user_id: this.app_user_id
      })
    }

  }

  openSnackBar(message: string) {
    this._snackBar.open(message, 'Close', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: this.durationInSeconds * 1000,
    });
    // this._snackBar.open(message);
  }

  createDisposition() {
    console.log(this.dispositionForm.value)
    if (this.dispositionForm.valid) {
      this.dispositionForm.patchValue({
        stage: this.dispositionForm.value.stage.toUpperCase(),
        stage_status: this.dispositionForm.value.stage_status.toUpperCase(),
        stage_status_name: this.dispositionForm.value.stage_status_name.toUpperCase(),
      })
      let payload = this.dispositionForm.value
      this.userSaveProg = true;
      this._sunshineIntService.postDispositionCode(payload).then((res: any) => {
        console.log('createDisposition res-->', res)
        this.userSaveProg = false;
        if (res.errorCode == 0) {
          this.openSnackBar(res.message);
          this.dispositionForm.reset();
          // Navigate to disposition table after successful creation
          this._router.navigate(['/disposition-code']);
        } else {
          this.openSnackBar(res.message || 'Failed to save disposition code');
        }
      }).catch((err) => {
        this.userSaveProg = false;
        console.error('Error creating disposition:', err);
        this.openSnackBar(err.message || err.toString() || 'An error occurred while saving the disposition code')
      })
    }

    else {
      this.dispositionForm.markAllAsTouched();
    }
  }
}
