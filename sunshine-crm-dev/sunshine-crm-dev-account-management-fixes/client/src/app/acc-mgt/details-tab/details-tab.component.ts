import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, map, startWith } from 'rxjs';
import { PaymentLedgerDialogComponent } from 'src/app/dialogs/payment-ledger-dialog/payment-ledger-dialog.component';
import { TasksDialogComponent } from 'src/app/dialogs/tasks-dialog/tasks-dialog.component';
import { CustomFunctionsService } from 'src/app/sunshine-services/custom-functions.service';
import { SunshineInternalService } from 'src/app/sunshine-services/sunshine-internal.service';

@Component({
  selector: 'app-details-tab',
  templateUrl: './details-tab.component.html',
  styleUrls: ['./details-tab.component.css'],
})
export class DetailsTabComponent implements OnInit {
  accountsUserForm: any;
  leadId: number = 0;
  leadResById: any[] = [];
  EIDhide = true;
  passportHide = true;
  cifcishide = true;
  acHide = true;
  pdAcNo = true;
  agId = true;

  assignedByControl = new FormControl();
  assignedByFilteredOptions!: Observable<any[]>;
  assignedToControl = new FormControl();
  assignedToFilteredOptions!: Observable<any[]>;
  allUsersArr: any = [];
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  durationInSeconds: number = 5;
  loggedInUserId: any;
  loggedInUserRole: any;
  updateAddinfo: boolean = true;
  persnolInfo: any = {};

  createPrivilegeName: string = 'CREATE';
  uploadPrivilegeName: string = 'UPLOAD';
  readPrivilegeName: string = 'READ';
  editPrivilegeName: string = 'EDIT';
  moduleName: string = 'PERSONAL_INFORMATION';
  isCreatePrivilegedModule: any;
  isUploadPrivilegedModule: any;
  isReadPrivilegedModule: any;
  isEditPrivilegedModule: any;
  hasChange: boolean = false;
  additionalInfoInitialValues: any = {};

  // Define the fields that belong to Additional Information tab
  additionalInfoFields = [
    'emirates_id_number',
    'selected_emirates_id',
    'employer_details',
    'designation',
    'company_contact',
    'business_name',
    'banker_name',
    'pli_status',
    'execution_status',
    'bucket_status',
    'overdue',
    'vintage',
    'date_of_woff',
    'allocation_status',
    'settlement_status',
    'finware_acn01',
    'fresh_stab',
    'cycle_statement',
    'card_auth',
    'dpd_r',
    'due_since_date',
    'dcore_id'
  ];

  visaStatus = [
    'ACTIVE',
    'NO RECORD FOUND',
    'VOILATED',
    'CANCELLED',
    'NEARLY EXPIRED',
  ];
  molStatus = [
    'ACTIVE',
    'INACTIVE',
    'UNDER PROCESS',
    'FINED',
    'NO RECORD FOUND',
  ];

  settlementStatus = ['CLOSED', 'ON GOING'];

  dataSource: any;

  expandedElement: any | null = null;
  myDataArray: any[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  resultsLength: number = 0;
  tableTxt: string = '';
  showProgressBar: boolean = false;
  addnInfo: any = {};
  companyId: any;
  emiratesIds: any[] = [];
  showEmiratesDropdown: boolean = false;

  constructor(
    private _aR: ActivatedRoute,
    private _sunshineApi: SunshineInternalService,
    private customFn: CustomFunctionsService,
    private _snackBar: MatSnackBar,
    private _datePipe: DatePipe,
    public _paymentLedgerDialog: MatDialog
  ) {
    this.accountsUserForm = new FormGroup({
      app_user_id: new FormControl(null),
      father_name: new FormControl(null),
      mother_name: new FormControl(null),
      spouse_name: new FormControl(null),
      date_of_birth: new FormControl(null, Validators.required),
      customer_id: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^\d{0,10}$/),
      ]),
      emirates_id_number: new FormControl(null, [
        Validators.required,
        Validators.maxLength(15),
      ]),
      selected_emirates_id: new FormControl(null, [
        Validators.maxLength(15),
      ]),
      passport_number: new FormControl(null, [
        Validators.required,
        Validators.maxLength(8),
      ]),
      nationality: new FormControl(null, Validators.required),
      // email_id: new FormControl(null, [Validators.email]),
      // mobile_number: new FormControl(null, [Validators.pattern(/^\d{0,10}$/)]),
      // home_country_number: new FormControl('', [
      //   Validators.required,
      //   Validators.pattern(/^\d{0,10}$/),
      //   Validators.maxLength(10),
      // ]),
      // home_country_address: new FormControl(null, Validators.required),
      // city: new FormControl(null, Validators.required),
      // pincode: new FormControl(null, [
      //   Validators.required,
      //   Validators.pattern(/^\d{0,10}$/),
      // ]),
      // state: new FormControl(null, Validators.required),
      employer_details: new FormControl(null, Validators.required),
      designation: new FormControl(null, Validators.required),
      company_contact: new FormControl(null, Validators.pattern(/^\d{0,10}$/)),
      business_name: new FormControl(null),
      banker_name: new FormControl(null),
      account_number: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^\d{0,10}$/),
      ]),
      product_type: new FormControl(null, Validators.required),
      product_account_number: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^\d{0,10}$/),
      ]),
      pli_status: new FormControl(null),
      execution_status: new FormControl(null),
      overdue: new FormControl(null),
      // last_paid_amount: new FormControl(null, Validators.pattern(/^\d{0,10}$/)),
      // last_paid_date: new FormControl(null),
      // ghrc_offer_1: new FormControl(null, [Validators.pattern(/^\d{0,10}$/)]),
      // ghrc_offer_2: new FormControl(null, [Validators.pattern(/^\d{0,10}$/)]),
      // ghrc_offer_3: new FormControl(null, [Validators.pattern(/^\d{0,10}$/)]),
      withdraw_date: new FormControl(null),
      // minimum_payment: new FormControl(null, Validators.pattern(/^\d{0,10}$/)),
      // total_outstanding_amount: new FormControl(
      //   null,
      //   Validators.pattern(/^\d{0,10}$/)
      // ),
      // principal_outstanding_amount: new FormControl(
      //   null,
      //   Validators.pattern(/^\d{0,10}$/)
      // ),
      // credit_limit: new FormControl(null, Validators.pattern(/^\d{0,10}$/)),
      bucket_status: new FormControl(null),
      vintage: new FormControl(null),
      date_of_woff: new FormControl(null),
      allocation_status: new FormControl(null),
      agreement_id: new FormControl(null, [
        Validators.required,
        Validators.pattern(/^\d{0,10}$/),
      ]),
      assigned_to_full_name: new FormControl(null),
      assigned_by_full_name: new FormControl(null),
      company_id: new FormControl(null),
      lead_status_type_id: new FormControl(null),
      template_type_id: new FormControl(null),
      assigned_by: new FormControl(null),
      assigned_to: new FormControl(null),
      customer_name: new FormControl(null, Validators.required),
      // visa_status: new FormControl(null, Validators.required),
      // mol_status: new FormControl(null, Validators.required),
      is_visit_required: new FormControl(null),
      settlement_status: new FormControl(null),
      senior_manager_id: new FormControl(null),
      team_manager_id: new FormControl(null),
      // New fields added for enhanced account details
      finware_acn01: new FormControl(null),
      fresh_stab: new FormControl(null),
      cycle_statement: new FormControl(null),
      card_auth: new FormControl(null),
      dpd_r: new FormControl(null),
      due_since_date: new FormControl(null),
      dcore_id: new FormControl(null),
    });
  }

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
    // ////console.log('DETAILS TAB NG-ON-INIT');
    // ////console.log('ss-found');
    // let ssLeadById: any = sessionStorage.getItem('leadByIdResp');
    // let parsedLeadById = JSON.parse(ssLeadById);
    // //console.log(':::::', parsedLeadById);
    let ssUserById: any = sessionStorage.getItem('userDetails');
    let parsedUserById = JSON.parse(ssUserById);
    this.loggedInUserRole = parsedUserById.role_name;
    //console.log('::parsedUserById::', parsedUserById);

    this.loggedInUserId = parsedUserById.user_id;
    //console.log(this.loggedInUserId);
    //console.log(this.loggedInUserRole);

    this.captureRouteParams(this.loggedInUserId);
    // this.patchForm(parsedLeadById[0]);
    // this.leadResById = parsedLeadById;
    this.getAllUsers();

    this.assignedByFilteredOptions = this.assignedByControl.valueChanges.pipe(
      startWith(''),
      map((value) => (typeof value === 'string' ? value : value.full_name)),
      map((fullName) =>
        fullName ? this._filterAssignedBy(fullName) : this.allUsersArr.slice()
      )
    );

    this.assignedToFilteredOptions = this.assignedToControl.valueChanges.pipe(
      startWith(''),
      map((value) => (typeof value === 'string' ? value : value.full_name)),
      map((fullName) =>
        fullName ? this._filterAssignedTo(fullName) : this.allUsersArr.slice()
      )
    );
  }

  onTabChanged(event: any) {
    let currentIndex = event.index;
    let currentTabLabel = event.tab.textLabel;
    console.log(currentIndex, currentTabLabel);

    switch (currentTabLabel) {
      case 'Additional Information':
        this.isReadPrivilegedModule =
          this.customFn.checkForAllowedModuleAndPrivilegesForRead(
            this.readPrivilegeName,
            'ADDITIONAL_INFORMATION'
          );
        this.isEditPrivilegedModule =
          this.customFn.checkForAllowedModuleAndPrivilegesForEdit(
            this.editPrivilegeName,
            'ADDITIONAL_INFORMATION'
          );
        break;

      case 'Payment Ledger':
        this.isReadPrivilegedModule =
          this.customFn.checkForAllowedModuleAndPrivilegesForRead(
            this.readPrivilegeName,
            'PAYMENT_LEDGER'
          );
        this.isEditPrivilegedModule =
          this.customFn.checkForAllowedModuleAndPrivilegesForEdit(
            this.editPrivilegeName,
            'PAYMENT_LEDGER'
          );
        break;

      // case 'Contacts':
      //   this.isReadPrivilegedModule =
      //     this.customFn.checkForAllowedModuleAndPrivilegesForRead(
      //       this.readPrivilegeName,
      //       'CONTACTS'
      //     );
      //   this.isEditPrivilegedModule =
      //     this.customFn.checkForAllowedModuleAndPrivilegesForEdit(
      //       this.editPrivilegeName,
      //       'CONTACTS'
      //     );
      //   break;

      // case 'Address':
      //   this.isReadPrivilegedModule =
      //     this.customFn.checkForAllowedModuleAndPrivilegesForRead(
      //       this.readPrivilegeName,
      //       'ADDRESS'
      //     );
      //   this.isEditPrivilegedModule =
      //     this.customFn.checkForAllowedModuleAndPrivilegesForEdit(
      //       this.editPrivilegeName,
      //       'ADDRESS'
      //     );
      //   break;

      default:
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
        break;
    }
  }

  getAllUsers() {
    // this.showProgressBar = true;
    this._sunshineApi
      .fetchAllUsers()
      .then((res: any) => {
        let resData = res.data[0];
        // //console.log(resData);
        this.allUsersArr = resData;
        // this.showProgressBar = false;
      })
      .catch((error) => {
        // this.showProgressBar = false;
        console.error(error);
      });
  }

  private _filterAssignedBy(value: string) {
    return this.allUsersArr.filter((option: any) =>
      option.full_name.toLowerCase().includes(value.toLowerCase())
    );
  }

  private _filterAssignedTo(value: string) {
    return this.allUsersArr.filter((option: any) =>
      option.full_name.toLowerCase().includes(value.toLowerCase())
    );
  }

  captureRouteParams(loggedInUserId: number) {
    let usrParams = this._aR.snapshot.params;
    let lead_id = parseInt(usrParams['leadId']);
    let company_id = parseInt(usrParams['companyId']);
    //console.log('lead_id-snapshot :', lead_id);
    this.companyId = company_id;
    this.leadId = lead_id;
    //console.log(loggedInUserId);
    this.fetchLeadByLeadId(loggedInUserId, lead_id, company_id);
    // this.getLeadPaymentLedgerDetails(lead_id);
  }

  assignedByHandler(value: any) {
    let byId = this.allUsersArr.filter((id: any) => {
      if (id.full_name === value) {
        return id.user_id;
      }
    });
    let assignById = byId[0]['user_id'];
    this.accountsUserForm.value.assigned_by = assignById;
  }
  assignedToHandler(value: any) {
    let toId = this.allUsersArr.filter((id: any) => {
      if (id.full_name === value) {
        return id.user_id;
      }
    });
    let assignToId = toId[0]['user_id'];
    this.accountsUserForm.value.assigned_to = assignToId;

    if (
      this.accountsUserForm.value.assigned_by ===
      this.accountsUserForm.value.assigned_to
    ) {
      this.accountsUserForm.patchValue({
        assigned_to_full_name: '',
      });
      this.openSnackBar('Assigned By and Assigned To cannot be same');
    }
  }
  fetchLeadByLeadId(appUserId: number, leadId: number, companyId: any) {
    //console.log(this.loggedInUserId);
    let leadParams = {
      app_user_id: this.loggedInUserId || appUserId,
      lead_id: leadId,
      company_id: companyId,
      lead_status_type_id: null,
      assigned_by: null,
      assigned_to: null,
      account_number: null,
      product_type: null,
      product_account_number: null,
    };
    //console.log(leadParams);
    this._sunshineApi
      .fetchAllLeads(leadParams)
      .then((res: any) => {
        let resData = res.data[0];
        // //console.log(res);
        this.leadResById = resData;
        sessionStorage.setItem('leadByIdResp', JSON.stringify(resData));
        this.patchForm(resData[0]);
      })
      .catch((error) => console.error(error));
  }

  patchForm(leadData: any) {
    // console.log(leadData);

    this.persnolInfo['father_name'] = leadData.father_name;
    this.persnolInfo['mother_name'] = leadData.mother_name;
    this.persnolInfo['spouse_name'] = leadData.spouse_name;
    this.persnolInfo['date_of_birth'] = leadData.date_of_birth;
    this.persnolInfo['customer_id'] = leadData.customer_id;
    this.persnolInfo['nationality'] = leadData.nationality;
    this.persnolInfo['email_id'] = leadData.email_id;
    this.persnolInfo['mobile_number'] = leadData.mobile_number;

    this.addnInfo['emirates_id_number'] = leadData.emirates_id_number;
    this.addnInfo['passport_number'] = leadData.passport_number;
    this.addnInfo['product_account_number'] = leadData.product_account_number;
    this.addnInfo['agreement_id'] = leadData.agreement_id;
    this.addnInfo['account_number'] = leadData.account_number;
    this.addnInfo['product_type'] = leadData.product_type;
    this.addnInfo['visa_emirates_id'] = leadData.v_visa_emirates_id || leadData.visa_emirates_id || null;

    this.accountsUserForm.patchValue({
      assigned_to_full_name: leadData.assigned_to_full_name,
      assigned_by_full_name: leadData.assigned_by_full_name,
      app_user_id: this.loggedInUserId,
      father_name: leadData.father_name,
      mother_name: leadData.mother_name,
      spouse_name: leadData.spouse_name,
      date_of_birth: leadData.date_of_birth
        ? leadData.date_of_birth.split('T')[0]
        : null,
      customer_id: leadData.customer_id,
      emirates_id_number: leadData.emirates_id_number,
      passport_number: leadData.passport_number,
      nationality: leadData.nationality,
      employer_details: leadData.employer_details,
      designation: leadData.designation,
      company_contact: leadData.company_contact,
      business_name: leadData.business_name,
      banker_name: leadData.banker_name,
      account_number: leadData.account_number,
      product_type: leadData.product_type,
      product_account_number: leadData.product_account_number,
      pli_status: leadData.pli_status,
      execution_status: leadData.execution_status,
      overdue: leadData.overdue,
      withdraw_date: leadData.withdraw_date
        ? leadData.withdraw_date.split('T')[0]
        : null,
      bucket_status: leadData.bucket_status,
      vintage: leadData.vintage,
      date_of_woff: leadData.date_of_woff
        ? leadData.date_of_woff.split('T')[0]
        : null,
      allocation_status: leadData.allocation_status,
      agreement_id: leadData.agreement_id,
      company_id: leadData.company_id,
      lead_status_type_id: leadData.lead_status_type_id,
      template_type_id: leadData.template_type_id,
      assigned_by: leadData.assigned_by,
      assigned_to: leadData.assigned_to,
      customer_name: leadData.customer_name,
      is_visit_required: leadData.is_visit_required,
      settlement_status: leadData.settlement_status,
      senior_manager_id: leadData.senior_manager_id,
      team_manager_id: leadData.team_manager_id,
      // New fields added for enhanced account details
      finware_acn01: leadData.finware_acn01,
      fresh_stab: leadData.fresh_stab,
      cycle_statement: leadData.cycle_statement,
      card_auth: leadData.card_auth,
      dpd_r: leadData.dpd_r,
      due_since_date: leadData.due_since_date ? leadData.due_since_date.split('T')[0] : null,
      dcore_id: leadData.dcore_id,
      // email_id: leadData.email_id,
      // mobile_number: leadData.mobile_number,
      // home_country_number: leadData.home_country_number,
      // home_country_address: leadData.home_country_address,
      // city: leadData.city,
      // pincode: leadData.pincode,
      // state: leadData.state,
      // last_paid_amount: leadData.last_paid_amount,
      // last_paid_date: leadData.last_paid_date
      // ? leadData.last_paid_date.split('T')[0]
      // : null,
      // this._datePipe.transform(resData.last_login, 'yyyy-MM-dd hh:mm:ss'),
      // ghrc_offer_1: leadData.ghrc_offer_1,
      // ghrc_offer_2: leadData.ghrc_offer_2,
      // ghrc_offer_3: leadData.ghrc_offer_3,
      // minimum_payment: leadData.minimum_payment,
      // total_outstanding_amount: leadData.total_outstanding_amount,
      // principal_outstanding_amount: leadData.principal_outstanding_amount,
      // credit_limit: leadData.credit_limit,
      // visa_status: leadData.visa_status,
      // mol_status: leadData.mol_status,
    });
    // console.log('::>>', this.accountsUserForm.value.account_number);

    // Store initial values for Additional Information fields only
    this.updateAdditionalInfoInitialValues();

    // Subscribe to form changes and only track Additional Information fields
    this.accountsUserForm.valueChanges.subscribe((value: any) => {
      this.hasChange = this.additionalInfoFields.some(
        (field) => this.accountsUserForm.get(field)?.value !== this.additionalInfoInitialValues[field]
      );
    });
    // console.log('::>>', this.accountsUserForm.value);
    // this.onCreateGroupFormValueChange()
    
    // Fetch Emirates IDs for this account
    this.fetchEmiratesIds();
  }

  fetchEmiratesIds() {
    if (this.leadId) {
      this._sunshineApi.getAccountEmiratesIds({ lead_id: this.leadId })
        .then((res: any) => {
          this.emiratesIds = res.data || [];
          
          // Show dropdown only if there are more than 1 Emirates IDs
          this.showEmiratesDropdown = this.emiratesIds.length > 1;
          
          if (this.showEmiratesDropdown && this.emiratesIds.length > 0) {
            // Set the latest Emirates ID as the default value
            const latestEmiratesId = this.emiratesIds[0]; // First one is the latest
            this.accountsUserForm.patchValue({
              selected_emirates_id: latestEmiratesId.value
            });
            
            // Update initial values after patching
            this.additionalInfoInitialValues['selected_emirates_id'] = latestEmiratesId.value;
            
            // Disable the original Emirates ID field when dropdown is shown, but keep dropdown enabled for viewing
            this.accountsUserForm.get('emirates_id_number')?.disable();
            // Don't disable selected_emirates_id to allow dropdown to open
          } else if (this.emiratesIds.length === 1) {
            // If only one Emirates ID, set it and disable the field
            this.accountsUserForm.patchValue({
              emirates_id_number: this.emiratesIds[0].value
            });
            
            // Update initial values after patching
            this.additionalInfoInitialValues['emirates_id_number'] = this.emiratesIds[0].value;
            
            this.accountsUserForm.get('emirates_id_number')?.disable();
          } else {
            // If no Emirates IDs, enable the field for editing
            this.accountsUserForm.get('emirates_id_number')?.enable();
          }
        })
        .catch((error) => {
          console.error('Error fetching Emirates IDs:', error);
          this.emiratesIds = [];
          this.showEmiratesDropdown = false;
          // Enable the field if there's an error
          this.accountsUserForm.get('emirates_id_number')?.enable();
        });
    }
  }

  updateLead() {
    // console.log('::>>', this.accountsUserForm.value);
    //console.log(this.loggedInUserRole);

    if (
      this.loggedInUserRole.toLowerCase().trim() == 'agent'.toLowerCase().trim()
    ) {
      this.updateAddinfo = true;
    } else {
      this.updateAddinfo = false;
    }
    console.log(this.accountsUserForm);

    // this.accountsUserForm.patchValue({
    //   // last_paid_date: this._datePipe.transform(
    //   //   this.accountsUserForm.value.last_paid_date,
    //   //   'yyyy-MM-dd'
    //   // ),
    //   withdraw_date: this._datePipe.transform(
    //     this.accountsUserForm.value.withdraw_date,
    //     'yyyy-MM-dd'
    //   ),
    //   date_of_woff: this._datePipe.transform(
    //     this.accountsUserForm.value.date_of_woff,
    //     'yyyy-MM-dd'
    //   ),
    //   date_of_birth: this._datePipe.transform(
    //     this.accountsUserForm.value.date_of_birth,
    //     'yyyy-MM-dd'
    //   ),
    // });

    this.accountsUserForm.patchValue({
      withdraw_date: this.isValidDate(this.accountsUserForm.value.withdraw_date)
        ? this._datePipe.transform(
            this.accountsUserForm.value.withdraw_date,
            'yyyy-MM-dd'
          )
        : null,
      date_of_woff: this.isValidDate(this.accountsUserForm.value.date_of_woff)
        ? this._datePipe.transform(
            this.accountsUserForm.value.date_of_woff,
            'yyyy-MM-dd'
          )
        : null,
      date_of_birth: this.isValidDate(this.accountsUserForm.value.date_of_birth)
        ? this._datePipe.transform(
            this.accountsUserForm.value.date_of_birth,
            'yyyy-MM-dd'
          )
        : null,
      due_since_date: this.isValidDate(this.accountsUserForm.value.due_since_date)
        ? this._datePipe.transform(
            this.accountsUserForm.value.due_since_date,
            'yyyy-MM-dd'
          )
        : null,
    });
    
    if (this.updateAddinfo) {
      // Prepare form data for submission
      const formData = { ...this.accountsUserForm.value };
      
      // Handle Emirates ID based on whether dropdown is shown or not
      if (this.showEmiratesDropdown) {
        // If dropdown is shown, use the selected Emirates ID from dropdown
        formData.emirates_id_number = formData.selected_emirates_id;
        delete formData.selected_emirates_id; // Remove the dropdown field from submission
      } else {
        // If dropdown is not shown, use the original Emirates ID field
        // Re-enable the field temporarily to get its value
        this.accountsUserForm.get('emirates_id_number')?.enable();
        formData.emirates_id_number = this.accountsUserForm.get('emirates_id_number')?.value;
        // Disable it again if it was disabled
        if (this.emiratesIds.length === 1) {
          this.accountsUserForm.get('emirates_id_number')?.disable();
        }
      }
      
      console.log('::>>', formData);
      this._sunshineApi
        .updateLeads(formData)
        .then((res: any) => {
          //console.log('put_details:::', res);
          this.openSnackBar(res.message);
          
          // Reset the change flag after successful update
          this.hasChange = false;
          
          // Update initial values to current values after successful update
          this.updateAdditionalInfoInitialValues();
          
          this.fetchLeadByLeadId(
            this.loggedInUserId,
            this.leadId,
            this.companyId
          );
          // Refresh Emirates IDs after successful update
          this.fetchEmiratesIds();
        })
        .catch((error) => {
          //console.log('put_details:::', error);
          this.openSnackBar(error);
        });
    } else {
      //console.log('logged in user not an agent');
    }
  }

  // Method to refresh Emirates IDs - can be called from parent components
  refreshEmiratesIds() {
    this.fetchEmiratesIds();
  }

  // Method to update initial values for Additional Information fields
  updateAdditionalInfoInitialValues() {
    this.additionalInfoInitialValues = {};
    this.additionalInfoFields.forEach(field => {
      this.additionalInfoInitialValues[field] = this.accountsUserForm.get(field)?.value;
    });
  }

  // Method to prevent Emirates ID selection change
  onEmiratesIdSelectionChange(event: any) {
    // Prevent selection change by resetting to the original value
    const latestEmiratesId = this.emiratesIds[0]; // First one is the latest
    this.accountsUserForm.patchValue({
      selected_emirates_id: latestEmiratesId.value
    });
  }
  isValidDate(date: string | null): boolean {
    if (!date || date === '0000-00-00' || date === '0000-00-00 00:00:00') {
      return false;
    }
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
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
