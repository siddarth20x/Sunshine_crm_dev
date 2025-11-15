import { Component, Inject, OnInit } from '@angular/core';
import { SunshineInternalService } from 'src/app/sunshine-services/sunshine-internal.service';
// import { AccountsUpload } from '../../models/accounts.model';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

interface AccountsUpload {
  // company_id: string;
  senior_manager_id: null;
  team_manager_id: null;
  team_lead_id: null;
  assigned_to: null;
  account_no: null;
  product_type: null;
  product_account_no: null;
  agreement_id: null;
  finware_acn01: null;
  business_name: null;
  customer_name: null;
  allocation_status: null;
  cust_id: null;
  passport_no: null;
  dob: Date;
  bkt_status: null;
  card_auth: null;
  dpd_r: null;
  mindue_manual: null;
  rb_amount: null;
  overdue_amount: null;
  vintage: null;
  date_of_woff: Date;
  nationality: null;
  emirates_id_number: null;
  due_since_date: null;
  credit_limit: null;
  tos_amount: null;
  pos_amount: null;
  fresh_stab: null;
  cycle_statement: null;
  employer_details: null;
  designation: null;
  company_contact: null;
  office_address: null;
  home_country_number: null;
  friend_residence_phone: null;
  mobile_number: null;
  email_id: null;
  monthly_income: null;
  minimum_payment: null;
  ghrc_offer_1: null;
  ghrc_offer_2: null;
  ghrc_offer_3: null;
  withdraw_date: Date;
  home_country_address: null;
  city: null;
  pincode: null;
  state: null;
  father_name: null;
  mother_name: null;
  spouse_name: null;
  last_payment_amount: null;
  last_payment_date: Date;
  last_month_paid_unpaid: null;
  last_usage_date: Date;
  dpd_string: null;
  pli_status: null;
  execution_status: null;
  banker_name: null;
  reason: null;
  do_not_follow_flag: null;
  feedback: null;
  contactable_status: null;
  disposition_status: null;
  disposition_status_name: null;
  disposition_stage: null;
  traced_source: null;
  traced_details: null;
  visa_status: null;
  mol_status: null;
  contact_info: null;
  mol_passport_no: null;
  mol_expiry_date: Date;
  mol_work_permit_no: null;
  salary_in_mol: null;
  company_name_in_mol: null;
  sql_details: null;
  company_trade_license_details: null;
  additional_details: null;
  dcore_id: null;
  visa_passport_no: null;
  visa_expiry_date: Date;
  visa_file_number: null;
  visa_emirates: null;
  company_name_in_visa: null;
  designation_in_visa: null;
  contact_number_in_visa: null;
  visa_emirates_id: null;
  unified_number: null;
  allocation_type: null;
  file_upload_id: null;
  // created_id: string;
  // modified_id: string;
}

@Component({
  selector: 'app-acc-upload-dialog',
  templateUrl: './acc-upload-dialog.component.html',
  styleUrls: ['./acc-upload-dialog.component.css'],
})
export class AccUploadDialogComponent implements OnInit {
  csvContent: string = '';
  fd: FormData | undefined;
  progressBarMode: any = 'indeterminate';
  showProgressBar: boolean = false;
  processedCSV: any;
  // accountsModel!: AccountsUpload;
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  durationInSeconds = 5;
  uploadBtnDisabled: boolean = true;
  userId: any;
  file: any;
  companyId: any;
  companyArr: any;
  isCompanySelected: boolean = true;
  hideUI: boolean = false;
  errMsg: any;
  selectedCompanyDetails: any;
  dialogTitle: string = '';
  doNotFollowFlag: number = 0;
  dialogData: any = {};
  csvValidationError: any;
  uploadProgress: number = 0;
  firebaseFileUrl: string = '';
  allocationType: string = ''; 
  fileUploadId: any;

  constructor(
    private _sunshineApi: SunshineInternalService,
    private _snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<AccUploadDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private storage: AngularFireStorage
  ) {}

  ngOnInit(): void {
    let userDetails: any = sessionStorage.getItem('userDetails');
    let parsedUsrDetails = JSON.parse(userDetails);
    this.userId = parsedUsrDetails.user_id;
    this.getCompany();
    this.receiveInjectedData();
  }

  receiveInjectedData() {
    this.dialogTitle = this.data.dialogTitle;
    this.doNotFollowFlag = this.data.flag;
    console.log(this.doNotFollowFlag, this.dialogTitle);
  }
  getCompany() {
    let params = { user_id: this.userId };
    this._sunshineApi
      .fectchUserCompany(params)
      .then((companyRes: any) => {
        let resData = companyRes.data[0];
        console.log(resData);
        this.companyArr = resData;
      })
      .catch((error) => {
        // console.error(error);
        this.openSnackBar(error);
      });
  }

  companySelectHandler(event: any) {
    let selectedCompanyId = event.value;
    console.log(selectedCompanyId);
    if (!selectedCompanyId) {
      this.isCompanySelected = true;
      this.hideUI = false;
    } else {
      this.companyId = selectedCompanyId;
      //console.log(this.companyId);
      this.isCompanySelected = false;
      this.hideUI = true;
      this.selectedCompanyDetails = this.checkTeamMgrTeamLead(this.companyId);
      console.log('this.selectedCompanyDetails', this.selectedCompanyDetails);
    }
  }
  onFileSelected(event: any): void {
    this.showProgressBar = true;
    this.progressBarMode = 'query';
    const file = event.target.files[0];
    this.file = file;
    
    // Check file extension on frontend as well
    const fileExtension = file.name.toLowerCase().split('.').pop();
    if (fileExtension !== 'csv') {
      this.showProgressBar = false;
      this.processedCSV = [];
      this.uploadBtnDisabled = true;
      this.openSnackBar('Only CSV file format is allowed. Please upload a file with .csv extension.');
      return;
    }
    
    const reader: FileReader = new FileReader();

    reader.onload = (e) => {
      const csv: any = reader.result as any;
      this.csvContent = csv;
    };
    reader.readAsText(file);

    const formData: FormData = new FormData();
    formData.append('csvFile', file, file.name);
    this._sunshineApi
      .uploadToProcessCSV(formData)
      .then((res: any) => {
        this.csvValidationError = [];
        this.showProgressBar = false;
        this.openSnackBar(res.message);
        if (res.data) {
          this.processedCSV = res.data;
          console.log('processedCSV:::', this.processedCSV);
          this.uploadBtnDisabled = false;
        }
      })
      .catch((error) => {
        this.processedCSV = [];
        this.uploadBtnDisabled = true;
        this.showProgressBar = false;
        this.openSnackBar(error.response?.data?.message || 'Error processing CSV');
        this.csvValidationError = error.response?.data?.errors;
        console.log('csvValidationError:::', this.csvValidationError);
      });
  }
  checkTeamMgrTeamLead(companyId: number) {
    return this.companyArr.find(
      (company: any) => company.company_id === companyId
    );
  }

  async uploadAndStageAccounts() {
    this.uploadBtnDisabled = true;
    this.showProgressBar = true;

    try {
      // 1. Upload file to Firebase and store in DB
      const formData = new FormData();
      formData.append('csvFile', this.file, this.file.name);
      formData.append('app_user_id', this.userId.toString());
      formData.append('file_type', 'csv');
      formData.append('file_name', this.file.name);
      formData.append('company_id', this.companyId.toString());
      

      const uploadRes = await this._sunshineApi.uploadAccountFile(formData);
      console.log('File uploaded:', uploadRes);

      // 2. Stage accounts in DB (existing logic)
      const params = {
        company_id: this.companyId,
        user_id: this.userId,
        do_not_follow_flag: this.doNotFollowFlag,
        allocation_type:this.allocationType,
        file_upload_id: uploadRes.data.sql_file_upload_id
      };
this.fileUploadId = uploadRes.data.sql_file_upload_id;
      this.selectedCompanyDetails = this.checkTeamMgrTeamLead(this.companyId);
      
      if (!params.company_id) {
        this.openSnackBar(`Please select a company`);
        this.uploadBtnDisabled = false;
        this.showProgressBar = false;
        return;
      }

      const stageFormData = new FormData();
      stageFormData.append('csvFile', this.file, this.file.name);
      
      const stageRes = await this._sunshineApi.uploadToLeadStage(stageFormData, params);
      console.log('Accounts staged:', stageRes);
      
      this.showProgressBar = false;
      this.openSnackBar(stageRes.message);
      
      this.dialogRef.close({
        message: `Staging Successful`,
        upload: 1,
        company_id: params.company_id,
        file_upload_id: uploadRes.data.sql_file_upload_id
      });

      // 3. Transfer leads from stage to main
      await this.transferLeadsFromStageToMain(this.selectedCompanyDetails);

    } catch (error: any) {
      console.error('Upload/Stage error:', error);
      this.showProgressBar = false;
      this.uploadBtnDisabled = false;
      this.openSnackBar(error.response?.data?.message || error.message || 'Upload failed');
      this.dialogRef.close({
        message: `Upload Failed`,
        upload: 0,
        file_upload_id: null
      });
    }
  }

  async transferLeadsFromStageToMain(selectedCompanyDetails: any) {
    this.openSnackBar(`Processing of Staged Leads Started`);
    let params = { app_user_id: this.userId, company_id: this.companyId };
    if (params.company_id && params.app_user_id) {
      this._sunshineApi
        .transferLeadsFromStage(params)
        .then((res: any) => {
          console.log('leads-to-main:::', res);
          if (res.errorCode == 0) {
            this.dialogRef.close({
              message: `Uploaded Successfully`,
              upload: 1,
              company_id: params.company_id,
            });
            this.openSnackBar(res.message);
            const {
              team_lead_id,
              team_manager_id,
              team_lead_email,
              team_lead_full_name,
              team_manager_email,
              team_manager_full_name,
            } = selectedCompanyDetails;
            if (team_lead_id && team_manager_id) {
              if (team_lead_id !== team_manager_id) {
                this.sendEmailToTeamLead(selectedCompanyDetails);
                this.sendEmailToTeamManager(selectedCompanyDetails);
              } else {
                this.sendEmailToBoth(selectedCompanyDetails);
              }
            }
          } else {
            this.dialogRef.close({
              message: `Upload Failed`,
              upload: 0,
            });
            this.openSnackBar(res.message);
          }
        })
        .catch((error) => {
          console.log('leads-to-main-error:::', error);
          this.openSnackBar(error.response.message);
          this.dialogRef.close({
            message: `Something went wrong while uploading`,
            upload: 0,
          });
        });
    } else {
      this.openSnackBar(`Company or User Id cannot be null`);
    }
  }

  //? validation with scientific notation returns all field
  // validateAccountsUploadArray(responseArray: AccountsUpload[]): boolean {
  //   const requiredFields: (keyof AccountsUpload)[] = [
  //     'senior_manager_id',
  //     'team_manager_id',
  //     'team_lead_id',
  //     'assigned_to',
  //     'account_no',
  //     'product_type',
  //     'product_account_no',
  //     'customer_name',
  //     'allocation_status',
  //     'cust_id',
  //     'banker_name',
  //   ];

  //   const dateFields: (keyof AccountsUpload)[] = [
  //     'dob',
  //     'date_of_woff',
  //     'last_payment_date',
  //     'withdraw_date',
  //   ];

  //   const scientificNotationRegex = /^[+-]?\d+(\.\d+)?[eE][+-]?\d+$/;
  //   const dateRegex = /^\d{2}-[A-Za-z]{3}-\d{4}$/;

  //   // Helper to show error and disable upload button
  //   const showError = (message: string): boolean => {
  //     this.validationToastr(message);
  //     this.uploadBtnDisabled = true;
  //     return false;
  //   };

  //   // Helper to validate required fields
  //   const validateRequiredFields = (response: AccountsUpload): boolean => {
  //     for (const field of requiredFields) {
  //       const value = response[field]?.toString().trim();

  //       if (value === undefined) {
  //         return showError(`Field "${field}" is missing.`);
  //       }
  //       if (value === '') {
  //         return showError(`Field "${field}" contains an empty string.`);
  //       }
  //       if (scientificNotationRegex.test(value)) {
  //         invalidFields.add(field);
  //       }
  //     }
  //     return true;
  //   };

  //   // Helper to validate date fields
  //   const validateDateFields = (response: AccountsUpload): boolean => {
  //     for (const field of dateFields) {
  //       const value = response[field];

  //       if (value) {
  //         let dateString: string;

  //         if (typeof value === 'string') {
  //           dateString = value.trim();
  //         } else if (value instanceof Date) {
  //           // Convert the Date object to the required dd-MMM-yyyy format
  //           dateString = value
  //             .toLocaleDateString('en-GB', {
  //               day: '2-digit',
  //               month: 'short',
  //               year: 'numeric',
  //             })
  //             .replace(/ /g, '-');
  //         } else {
  //           return showError(
  //             `Field "${field}" contains an invalid type. Expected string or Date.`
  //           );
  //         }

  //         if (!dateRegex.test(dateString)) {
  //           return showError(
  //             `Field "${field}" contains an invalid date format. Expected: dd-MMM-yyyy.`
  //           );
  //         }
  //       }
  //     }
  //     return true;
  //   };

  //   const invalidFields = new Set<string>();

  //   for (const response of responseArray) {
  //     // Check for empty rows
  //     const hasNonEmptyFields = Object.values(response).some(
  //       (value) =>
  //         (typeof value === 'string' && value.trim() !== '') ||
  //         value instanceof Date
  //     );

  //     if (!hasNonEmptyFields) {
  //       return showError(`Empty row detected. Please check the file.`);
  //     }

  //     // Validate required fields and date fields
  //     if (!validateRequiredFields(response) || !validateDateFields(response)) {
  //       return false;
  //     }
  //   }

  //   // Handle scientific notation errors
  //   if (invalidFields.size > 0) {
  //     return showError(
  //       `${invalidFields.size} field(s) contain scientific notation: ${[
  //         ...invalidFields,
  //       ].join(', ')}.`
  //     );
  //   }

  //   // If all validations pass
  //   this.openSnackBar('Looks Good');
  //   this.uploadBtnDisabled = false;
  //   return true;
  // }

  // validationToastr(message: string) {
  //   this.errMsg = message;
  //   this._snackBar.open(message, 'Close', {
  //     horizontalPosition: this.horizontalPosition,
  //     verticalPosition: this.verticalPosition,
  //     duration: this.durationInSeconds * 1000,
  //   });
  // }

  openSnackBar(message: string) {
    this._snackBar.open(message, 'Close', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: this.durationInSeconds * 1000,
    });
    // this._snackBar.open(message);
  }

  sendEmailToTeamLead(selectedCompanyDetails: any) {
    // Logic to send email to team lead

    let emailBody = `
      Hi ${
        selectedCompanyDetails.team_lead_full_name === undefined ||
        selectedCompanyDetails.team_lead_full_name === null
          ? ''
          : selectedCompanyDetails.team_lead_full_name
      },
      <br><br>
      <strong>${this.processedCSV.length}</strong> New Account(s) Uploaded for:
      <ul>
        <li><strong>Company Name:</strong> ${
          selectedCompanyDetails.company_name === undefined ||
          selectedCompanyDetails.company_name === null
            ? ''
            : selectedCompanyDetails.company_name
        }</li>
        <li><strong>Company Code:</strong> ${
          selectedCompanyDetails.company_code === undefined ||
          selectedCompanyDetails.company_code === null
            ? ''
            : selectedCompanyDetails.company_code
        }</li>
        <li><strong>Company Type:</strong> ${
          selectedCompanyDetails.company_type_name === undefined ||
          selectedCompanyDetails.company_type_name === null
            ? ''
            : selectedCompanyDetails.company_type_name
        }</li>
        <li><strong>Website:</strong> ${
          selectedCompanyDetails.website === undefined ||
          selectedCompanyDetails.website === null
            ? ''
            : selectedCompanyDetails.website
        }</li>
      </ul>
      <br>
      Thank you,<br>
      Team Sunshine Solutions Pvt. Ltd.<br>
      This automated mail was sent by Sunshine Solutions Pvt. Ltd. Please do not reply directly to this email. 
      For questions or assistance, please get in touch with info@mailers.codeswift.in.
    `;

    let receiverEmailId = selectedCompanyDetails.team_lead_email;
    let emailSubject = `New Accounts Upload`;

    let finalEmail = {
      to: receiverEmailId,
      subject: emailSubject,
      emailBody: emailBody,
    };

    this._sunshineApi
      .sendEmail(finalEmail)
      .then((res: any) => {
        console.log('email-res::::', res);
        this.openSnackBar(res.message);
        console.log(
          `Email sent to team lead with id: ${selectedCompanyDetails.team_lead_email}`
        );
      })
      .catch((error) => {
        this.openSnackBar(error);
      });
  }

  sendEmailToTeamManager(selectedCompanyDetails: any) {
    // Logic to send email to team lead

    let emailBody = `
      Hi ${
        selectedCompanyDetails.team_manager_full_name === undefined ||
        selectedCompanyDetails.team_manager_full_name === null
          ? ''
          : selectedCompanyDetails.team_manager_full_name
      },
      <br><br>
      <strong>${this.processedCSV.length}</strong> New Account(s) Uploaded for:
      <ul>
        <li><strong>Company Name:</strong> ${
          selectedCompanyDetails.company_name === undefined ||
          selectedCompanyDetails.company_name === null
            ? ''
            : selectedCompanyDetails.company_name
        }</li>
        <li><strong>Company Code:</strong> ${
          selectedCompanyDetails.company_code === undefined ||
          selectedCompanyDetails.company_code === null
            ? ''
            : selectedCompanyDetails.company_code
        }</li>
        <li><strong>Company Type:</strong> ${
          selectedCompanyDetails.company_type_name === undefined ||
          selectedCompanyDetails.company_type_name === null
            ? ''
            : selectedCompanyDetails.company_type_name
        }</li>
        <li><strong>Website:</strong> ${
          selectedCompanyDetails.website === undefined ||
          selectedCompanyDetails.website === null
            ? ''
            : selectedCompanyDetails.website
        }</li>
      </ul>
      <br>
      Thank you,<br>
      Team Sunshine Solutions Pvt. Ltd.<br>
      This automated mail was sent by Sunshine Solutions Pvt. Ltd. Please do not reply directly to this email. 
      For questions or assistance, please get in touch with info@mailers.codeswift.in.
    `;

    let receiverEmailId = selectedCompanyDetails.team_manager_email;
    let emailSubject = `New Accounts Upload`;

    let finalEmail = {
      to: receiverEmailId,
      subject: emailSubject,
      emailBody: emailBody,
    };

    this._sunshineApi
      .sendEmail(finalEmail)
      .then((res: any) => {
        console.log('email-res::::', res);
        this.openSnackBar(res.message);
        console.log(
          `Email sent to team manager with id: ${selectedCompanyDetails.team_manager_email}`
        );
      })
      .catch((error) => {
        this.openSnackBar(error);
      });
  }

  sendEmailToBoth(selectedCompanyDetails: any) {
    let emailBody = `
      Hi ${selectedCompanyDetails.team_manager_full_name},
      <br><br>
      <strong>${this.processedCSV.length}</strong> New Account(s) Uploaded for:
      <ul>
        <li><strong>Company Name:</strong> ${selectedCompanyDetails.company_name}</li>
        <li><strong>Company Code:</strong> ${selectedCompanyDetails.company_code}</li>
        <li><strong>Company Type:</strong> ${selectedCompanyDetails.company_type_name}</li>
        <li><strong>Website:</strong> ${selectedCompanyDetails.website}</li>
      </ul>
      <br>
      Thank you,<br>
      Team Sunshine Solutions Pvt. Ltd.<br>
      This automated mail was sent by Sunshine Solutions Pvt. Ltd. Please do not reply directly to this email. 
      For questions or assistance, please get in touch with info@mailers.codeswift.in.
    `;

    let receiverEmailId = selectedCompanyDetails.team_manager_email;
    let emailSubject = `New Accounts Upload`;

    let finalEmail = {
      to: receiverEmailId,
      subject: emailSubject,
      emailBody: emailBody,
    };

    this._sunshineApi
      .sendEmail(finalEmail)
      .then((res: any) => {
        console.log('email-res::::', res);
        this.openSnackBar(res.message);
        console.log(
          `Email sent to both with id: ${selectedCompanyDetails.team_manager_email}`
        );
      })
      .catch((error) => {
        this.openSnackBar(error);
      });
  }
}
