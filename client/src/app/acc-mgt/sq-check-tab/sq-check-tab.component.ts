import { Component, OnInit } from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { CustomFunctionsService } from 'src/app/sunshine-services/custom-functions.service';
import { SunshineInternalService } from 'src/app/sunshine-services/sunshine-internal.service';

@Component({
  selector: 'app-sq-check-tab',
  templateUrl: './sq-check-tab.component.html',
  styleUrls: ['./sq-check-tab.component.css'],
})
export class SqCheckTabComponent implements OnInit {
  createPrivilegeName: string = 'CREATE';
  uploadPrivilegeName: string = 'UPLOAD';
  readPrivilegeName: string = 'READ';
  editPrivilegeName: string = 'EDIT';
  moduleName: string = 'SQ_CHECK';
  isCreatePrivilegedModule: any;
  isUploadPrivilegedModule: any;
  isReadPrivilegedModule: any;
  isEditPrivilegedModule: any;
  sqParamsType: any[] = [];
  sqCheckArray: any[] = [];

  scoringOptions1Status = ['MET', 'NOT MET'];
  scoringOptions2Status = ['MET', 'NOT MET'];
  scoringOptions3Status = ['MET', 'NOT MET'];

  totalS1Score: number = 0;
  totalS2Score: number = 0;
  totalS3Score: number = 0;

  selectedParamTypeIds: number[] = [];
  leadId: any;
  appUserId: any;

  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  durationInSeconds: number = 5;
  showProgressBar: boolean = false;
  sqIsAvailable: boolean = false;

  showScoring2 = false; // Set this to false to hide the Scoring 2 columns
  showScoring3 = false; // Set this to false to hide the Scoring 3 columns

  constructor(
    private customFn: CustomFunctionsService,
    private _sunshineAPI: SunshineInternalService,
    private _aR: ActivatedRoute,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
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
      this.customFn.checkForAllowedModuleAndPrivilegesForRead(
        this.readPrivilegeName,
        this.moduleName
      );

    this.isEditPrivilegedModule =
      this.customFn.checkForAllowedModuleAndPrivilegesForEdit(
        this.editPrivilegeName,
        this.moduleName
      );

    this.captureRouteParams();
    // this.getSQParams();
  }

  captureRouteParams() {
    let usrParams = this._aR.snapshot.params;
    let lead_id = parseInt(usrParams['leadId']);
    this.leadId = lead_id;

    let ssUserById: any = sessionStorage.getItem('userDetails');
    let parsedUserById = JSON.parse(ssUserById);
    this.appUserId = parsedUserById.user_id;

    this.getSQCheckByLeadId(this.leadId);
  }

  getSQParams() {
    let params = {
      sq_parameter_type_id: null,
    };
    this._sunshineAPI
      .fetchSQParamType(params)
      .then((res: any) => {
        // console.log(res.data[0]);
        let resData = res.data[0];
        this.sqCheckArray = this.createArrayOfObjects(resData.length);
        this.sqParamsType = resData;
        // console.log(this.sqCheckArray);
      })
      .catch((error) => {
        console.log('SQParamType::', error);
      });
  }

  createArrayOfObjects(length: number): Array<any> {
    let array = [];

    for (let i = 0; i < length; i++) {
      array.push({
        app_user_id: this.appUserId,
        lead_id: this.leadId, // or some default value
        sq_parameter_type_id: null, // or some default value
        scoring1_status: null, // or some default value
        scoring1: null, // or some default value
        scoring2_status: null, // or some default value
        scoring2: null, // or some default value
        scoring3_status: null, // or some default value
        scoring3: null, // or some default value
      });
    }
    return array;
  }

  parameterHandler(event: any, i: number) {
    // console.log(event.value, i);
    let sqptId = event.value;
    this.sqCheckArray[i].sq_parameter_type_id = sqptId;
    this.selectedParamTypeIds[i] = sqptId;
  }

  // getFilteredParams(index: number): any[] {
  //   // Filter the available options to exclude the selected parameter type IDs
  //   return this.sqParamsType.filter(
  //     (sqpt) =>
  //       !this.selectedParamTypeIds.includes(sqpt.sq_parameter_type_id) ||
  //       this.sqCheckArray[index].sq_parameter_type_id ===
  //         sqpt.sq_parameter_type_id
  //   );
  // }

  scoring1Handler(event: any, i: number) {
    let value = event.target.value;
    this.sqCheckArray[i].scoring1 = Number(value);
    this.sqCheckArray[i].sq_parameter_type_id =
      this.sqParamsType[i]['sq_parameter_type_id'];
    // console.log(i, this.sqCheckArray);

    // Calculate the total score for scoring1
    let totalS1Score = this.sqCheckArray.reduce((total, score) => {
      let scoring1 = score.scoring1 || 0;
      return total + scoring1;
    }, 0);

    // console.log('Total scoring1 score:', totalS1Score);
    this.totalS1Score = totalS1Score;
  }
  scoring2Handler(event: any, i: number) {
    let value = event.target.value;
    this.sqCheckArray[i].scoring2 = Number(value);
    this.sqCheckArray[i].sq_parameter_type_id =
      this.sqParamsType[i]['sq_parameter_type_id'];
    // console.log(i, this.sqCheckArray);

    // Calculate the total score for scoring1
    let totalS2Score = this.sqCheckArray.reduce((total, score) => {
      let scoring2 = score.scoring2 || 0;
      return total + scoring2;
    }, 0);

    // console.log('Total scoring2 score:', totalS2Score);
    this.totalS2Score = totalS2Score;
  }
  scoring3Handler(event: any, i: number) {
    let value = event.target.value;
    this.sqCheckArray[i].scoring3 = Number(value);
    this.sqCheckArray[i].sq_parameter_type_id =
      this.sqParamsType[i]['sq_parameter_type_id'];
    // console.log(i, this.sqCheckArray);

    // Calculate the total score for scoring1
    let totalS3Score = this.sqCheckArray.reduce((total, score) => {
      let scoring3 = score.scoring3 || 0;
      return total + scoring3;
    }, 0);

    // console.log('Total scoring3 score:', totalS3Score);
    this.totalS3Score = totalS3Score;
  }
  scoring1StsHandler(event: any, i: number) {
    let value = event.value;
    console.log('s1sts::', value);

    // console.log(value);
    this.sqCheckArray[i].scoring1_status = value;
    this.sqCheckArray[i].sq_parameter_type_id =
      this.sqParamsType[i]['sq_parameter_type_id'];
    console.log(i, this.sqCheckArray);
  }
  scoring2StsHandler(event: any, i: number) {
    let value = event.value;
    console.log('s2sts::', value);

    this.sqCheckArray[i].scoring2_status = value;
    this.sqCheckArray[i].sq_parameter_type_id =
      this.sqParamsType[i]['sq_parameter_type_id'];
    console.log(i, this.sqCheckArray);

    value !== 'MET' ? (this.totalS2Score = 0) : this.totalS2Score;
  }
  scoring3StsHandler(event: any, i: number) {
    let value = event.value;
    console.log('s3sts::', value);
    this.sqCheckArray[i].scoring3_status = value;
    this.sqCheckArray[i].sq_parameter_type_id =
      this.sqParamsType[i]['sq_parameter_type_id'];
    console.log(i, this.sqCheckArray);
  }

  saveSQScores() {
    this.showProgressBar = true;
    console.log('save-sq-check:::', this.sqCheckArray);
    for (let i = 0; i < this.sqCheckArray.length; i++) {
      const element = this.sqCheckArray[i];
      this._sunshineAPI
        .postSQCheckScores(element)
        .then((res: any) => {
          console.log(`SQ-Check_save::at:${i}:`, res);
          this.showProgressBar = false;
          this.openSnackBar(res.message);
        })
        .catch((error) => {
          this.showProgressBar = false;
          console.log('SQ-Check_err>>>', error);
          this.openSnackBar(error);
        });
    }
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, 'Okay', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: this.durationInSeconds * 1000,
    });
    // this._snackBar.open(message);
  }

  getSQCheckByLeadId(leadId: number) {
    let params = {
      sq_check_id: null,
      lead_id: leadId,
      sq_parameter_type_id: null,
    };
    this._sunshineAPI
      .getSQCheckScores(params)
      .then((res: any) => {
        let resData = res.data[0];
        if (resData.length > 0) {
          this.sqIsAvailable = true;
          this.sqCheckArray = resData;
          console.log(this.sqCheckArray);
          // Calculate the total score for scoring1
          let totalS1Score = this.sqCheckArray.reduce((total, score) => {
            let scoring1 = score.scoring1 || 0;
            return total + scoring1;
          }, 0);
          this.totalS1Score = totalS1Score;

          // Calculate the total score for scoring1
          let totalS2Score = this.sqCheckArray.reduce((total, score) => {
            let scoring2 = score.scoring2 || 0;
            return total + scoring2;
          }, 0);
          this.totalS2Score = totalS2Score;

          // Calculate the total score for scoring1
          let totalS3Score = this.sqCheckArray.reduce((total, score) => {
            let scoring3 = score.scoring3 || 0;
            return total + scoring3;
          }, 0);
          this.totalS3Score = totalS3Score;
        } else {
          this.getSQParams();
        }
      })
      .catch((error) => {
        this.openSnackBar(error);
      });
  }
}
