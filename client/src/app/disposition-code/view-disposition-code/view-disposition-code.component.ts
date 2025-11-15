import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomFunctionsService } from 'src/app/sunshine-services/custom-functions.service';
import { SunshineInternalService } from 'src/app/sunshine-services/sunshine-internal.service';

@Component({
  selector: 'app-view-disposition-code',
  templateUrl: './view-disposition-code.component.html',
  styleUrls: ['./view-disposition-code.component.css'],
})
export class ViewDispositionCodeComponent implements OnInit {
  dispositionForm: any = [];
  userSaveProg: any;
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  durationInSeconds = 5;
  app_user_id: any;
  disposition_code_id: any;
  isAgent: boolean = false;
  loggedInUserRole: string = '';
  
  // Change detection properties
  originalFormValues: any = {};
  hasChanges: boolean = false;

  constructor(
    private _sunshineIntService: SunshineInternalService,
    private _customFn: CustomFunctionsService,
    private _fb: FormBuilder,
    private _snackBar: MatSnackBar,
    private _aR: ActivatedRoute,
    private _router: Router
  ) {
    this.dispositionForm = this._fb.group({
      app_user_id: [null],
      disposition_code_id: [null],
      stage: [null, [Validators.required]],
      stage_status: [null, [Validators.required]],
      stage_status_name: [null, [Validators.required]],
      stage_status_code: [null, [Validators.required]],
    });
  }

  ngOnInit(): void {
    let userDetails: any = sessionStorage.getItem('userDetails');
    let parsedUsrDetails = JSON.parse(userDetails);
    this.app_user_id = parsedUsrDetails.user_id;
    this.loggedInUserRole = parsedUsrDetails.role_name;
    
    // Check if user is an agent
    this.isAgent = this.loggedInUserRole.toUpperCase() === 'AGENT';
    
    if (this.app_user_id) {
      this.dispositionForm.patchValue({
        app_user_id: this.app_user_id,
      });
    }

    // Disable form controls for agents
    if (this.isAgent) {
      this.dispositionForm.disable();
    }

    this.captureRouteParams();
    
    // Subscribe to form value changes for change detection
    this.dispositionForm.valueChanges.subscribe(() => {
      this.checkForChanges();
    });
  }

  captureRouteParams() {
    let usrParams = this._aR.snapshot.params;
    let dispositionId = parseInt(usrParams['disposition_code_id']);
    // console.log('usrId-snapshot :', usrId);
    this.disposition_code_id = dispositionId;
    this.dispositionForm.patchValue({
      disposition_code_id: this.disposition_code_id,
    });
    this.getDispositionById(this.disposition_code_id);

    // this.userId = usrId;
    // this.urc.company_id = this.companyId;
    // this.urc.user_id = this.userId;
  }

  getDispositionById(id: any) {
    let params = { disposition_code_id: id };
    this._sunshineIntService
      .fetchAllDispositionCode(params)
      .then((res: any) => {
        console.log(res);
        if (res.errorCode == 0) {
          console.log('getDispositionById-->', res);
          let response = res.data[0][0];
          this.dispositionForm.patchValue({
            stage: response.stage,
            stage_status: response.stage_status,
            stage_status_name: response.stage_status_name,
            stage_status_code: response.stage_status_code,
          });
          
          // Store original values for change detection
          this.originalFormValues = {
            stage: response.stage,
            stage_status: response.stage_status,
            stage_status_name: response.stage_status_name,
            stage_status_code: response.stage_status_code,
          };
          
          // Reset change detection
          this.hasChanges = false;
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  // Check if any form values have changed from original values
  checkForChanges() {
    if (this.isAgent) {
      this.hasChanges = false;
      return;
    }
    
    const currentValues = this.dispositionForm.value;
    this.hasChanges = 
      currentValues.stage !== this.originalFormValues.stage ||
      currentValues.stage_status !== this.originalFormValues.stage_status ||
      currentValues.stage_status_name !== this.originalFormValues.stage_status_name ||
      currentValues.stage_status_code !== this.originalFormValues.stage_status_code;
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, 'Close', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: this.durationInSeconds * 1000,
    });
    // this._snackBar.open(message);
  }

  updateDisposition() {
    // Only allow update if user is not an agent
    if (this.isAgent) {
      this.openSnackBar('Agents are not authorized to edit disposition codes');
      return;
    }

    // Only allow update if there are changes
    if (!this.hasChanges) {
      this.openSnackBar('No changes detected. Please make changes before saving.');
      return;
    }

    console.log(this.dispositionForm.value);
    if (this.dispositionForm.valid) {
      this.dispositionForm.patchValue({
        stage: this.dispositionForm.value.stage.toUpperCase(),
        stage_status: this.dispositionForm.value.stage_status.toUpperCase(),
        stage_status_name:
          this.dispositionForm.value.stage_status_name.toUpperCase(),
        stage_status_code:
          this.dispositionForm.value.stage_status_code.toUpperCase(),
      });
      let payload = this.dispositionForm.value;
        // console.log("updateDisposition-->",payload)
      this._sunshineIntService
        .editDispositionCode(payload)
        .then((res: any) => {
          console.log('createDisposition res-->', res);
          if (res.errorCode == 0) {
            this.openSnackBar(res.message);
            this._router.navigate(['./disposition-code']);
            this.dispositionForm.reset();
          }
        })
        .catch((err) => {
          this.openSnackBar(err);
        });
    } else {
      this.dispositionForm.markAllAsTouched();
    }
  }
}
