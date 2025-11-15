import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, map, startWith, tap } from 'rxjs';
import { CustomFunctionsService } from 'src/app/sunshine-services/custom-functions.service';
import { SunshineInternalService } from 'src/app/sunshine-services/sunshine-internal.service';
import { Location } from '@angular/common';
import * as moment from 'moment';

interface BankInfo {
  bank_name: string;
  lead_id: string;
  company_id: string;
}

interface AccountDetailField {
  label: string;
  key: string;
  format?: 'date' | 'currency';
}

interface TracingHistoryColumn {
  label: string;
  keys: string[];
  format?: 'date';
}

interface ExecutionCivilFormValue {
  requestStatus: string | null;
  requestDate: Date | null;
  notRequestedReason: string;
}
@Component({
  selector: 'app-view-acc-mgt',
  templateUrl: './view-acc-mgt.component.html',
  styleUrls: ['./view-acc-mgt.component.css'],
})
export class ViewAccMgtComponent implements OnInit {
  leadResById: any[] = [];
  leadId: number = 0;
  assignedByControl!: FormControl;
  assignedByFilteredOptions!: Observable<any[]>;
  assignedToControl!: FormControl;
  assignedToFilteredOptions!: Observable<any[]>;
  allUsersArr: any[] = [];
  leadStatusArr: any[] = [];
  accountsUserForm: any;
  loggedInUserId: any;
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  durationInSeconds: number = 5;
  updateAccountEmailNotif: any = {};
  isDisabled: boolean = true;
  appUserId: any;

  createPrivilegeName: string = 'CREATE';
  uploadPrivilegeName: string = 'UPLOAD';
  readPrivilegeName: string = 'READ';
  editPrivilegeName: string = 'EDIT';
  moduleName: string = 'ACCOUNT_MANAGEMENT';
  isCreatePrivilegedModule: any;
  isUploadPrivilegedModule: any;
  isReadPrivilegedModule: any;
  isEditPrivilegedModule: any;
  allUsersCopy: any[] = [];
  banksList: any[] = [];
  step = 0;
  showProgressBar: boolean = false;
  loggedInUserRole: string = '';
  assignDisabled: boolean = false;
  leadStatusTypeChange: any;
  accMGTSnapshotURL: string = '';
  companyArr: any[] = [];
  deactivatedUsers: any[] = [];
  executionStatusOptions: string[] = ['Requested', 'Not-Requested'];
  executionForm: FormGroup = new FormGroup({
    requestStatus: new FormControl(null, Validators.required),
    requestDate: new FormControl(null),
    notRequestedReason: new FormControl('', Validators.maxLength(500)),
  });
  executionSaving = false;
  private executionInitialValue: ExecutionCivilFormValue | null = null;
  accountDetailColumns: AccountDetailField[][] = [
    [
      { label: 'Account no / Agreement No. / CRN No.', key: 'account_number' },
      { label: 'Overdue Amount', key: 'overdue', format: 'currency' },
      { label: 'GHRC Offer 2', key: 'ghrc_offer_2' },
      { label: 'Product Type', key: 'product_type' },
      { label: 'Passport No.', key: 'passport_number' },
      { label: 'GHRC Offer 3', key: 'ghrc_offer_3' },
      { label: 'Product Account', key: 'product_account_number' },
      { label: 'Date of Birth', key: 'date_of_birth', format: 'date' },
      { label: 'Withdraw Date', key: 'withdraw_date', format: 'date' },
    ],
    [
      { label: 'Agreement ID', key: 'agreement_id' },
      { label: 'Emirates ID Number', key: 'emirates_id_number' },
      { label: 'Home Country Address', key: 'home_country_address' },
      { label: 'FINWARE AC No.', key: 'finware_acno1' },
      { label: 'Allocation Status', key: 'allocation_status' },
      { label: 'Cust ID - Relationship No.', key: 'customer_id' },
      { label: 'SME Account Name', key: 'sme_account_name' },
      { label: 'Customer Name', key: 'customer_name' },
      { label: 'Mobile Number', key: 'mobile_number' },
    ],
    [
      { label: 'Credit Limit', key: 'credit_limit', format: 'currency' },
      { label: 'POS Amount', key: 'pos_amount', format: 'currency' },
      { label: 'Fresh / Stab', key: 'fresh_stab' },
      { label: 'Cycle Statement', key: 'cycle_statement' },
      { label: 'BKT Status', key: 'bucket_status' },
      { label: 'Card Auth', key: 'card_auth' },
      { label: 'DPD_R', key: 'dpd_r' },
      { label: 'Mindue Manual', key: 'mindue_manual' },
      { label: 'Minimum Payment', key: 'minimum_payment', format: 'currency' },
    ],
    [
      { label: 'Monthly Income', key: 'monthly_income', format: 'currency' },
      { label: 'Employer Details', key: 'employer_details' },
      { label: 'Designation', key: 'designation' },
      { label: 'Company Contact', key: 'company_contact' },
      { label: 'Company Name', key: 'company_name' },
      { label: 'Branch Name', key: 'branch_name' },
      { label: 'Banker Name', key: 'banker_name' },
      { label: 'Last Payment Amount', key: 'last_payment_amount', format: 'currency' },
      { label: 'Last Payment Date', key: 'last_payment_date', format: 'date' },
    ],
    [
      { label: 'Last Month Paid Unpaid', key: 'last_month_paid_unpaid', format: 'currency' },
      { label: 'Last Usage Date', key: 'last_usage_date', format: 'date' },
      { label: 'DPD Strn', key: 'dpd_strn' },
      { label: 'PLI Status', key: 'pli_status' },
      { label: 'Execution Status', key: 'execution_status' },
      { label: 'Vintage', key: 'vintage' },
      { label: 'Date of WO/FF', key: 'date_of_woff', format: 'date' },
      { label: 'DCORE ID', key: 'dcore_id' },
      { label: 'Lead Status', key: 'lead_status_type_name' },
    ],
  ];
  sectionNavItems = [
    { id: 'tracing', icon: 'search', label: 'Tracing' },
    { id: 'feedback-disposition', icon: 'fact_check', label: 'Feedback & Disposition' },
    { id: 'field-feedback', icon: 'forum', label: 'Field Feedback' },
    { id: 'execution', icon: 'gavel', label: 'Execution & Civil' },
    { id: 'documents', icon: 'folder', label: 'Documents' },
  ];
  activePanel: string | null = null;
  accountGridRows: AccountDetailField[][] = [];
  tracingHistoryColumns: TracingHistoryColumn[] = [
    { label: 'Updated By', keys: ['updated_by_full_name', 'modified_by_full_name', 'created_by_full_name'] },
    { label: 'Updated Date', keys: ['updated_dtm', 'modified_dtm', 'created_dtm'], format: 'date' },
    { label: 'Visa Status', keys: ['visa_status'] },
    { label: 'New Visa PP No.', keys: ['new_visa_passport_no', 'new_visa_pp_no', 'visa_passport_no'] },
    { label: 'Visa Cancelled Date', keys: ['visa_cancelled_date'], format: 'date' },
    { label: 'New File Number', keys: ['new_file_number', 'visa_file_number'] },
    { label: 'Visa Emirates', keys: ['visa_emirates'] },
    { label: 'New Company Name in Visa', keys: ['new_company_name_in_visa', 'company_name_in_visa'] },
    { label: 'Designation in Visa', keys: ['designation_in_visa'] },
    { label: 'New Contact No. in Visa', keys: ['new_contact_no_in_visa', 'contact_number_in_visa'] },
    { label: 'Visa Emirates ID', keys: ['visa_emirates_id'] },
    { label: 'Unified Number', keys: ['unified_number'] },
    { label: 'MOL Status', keys: ['mol_status'] },
    { label: 'New MOL Passport No.', keys: ['new_mol_passport_no', 'mol_passport_no'] },
    { label: 'MOL Expiry Date', keys: ['mol_expiry_date'], format: 'date' },
    { label: 'MOL Work Permit No.', keys: ['mol_work_permit_no'] },
    { label: 'Salary in MOL', keys: ['salary_in_mol'] },
    { label: 'New Company Name in MOL', keys: ['new_company_name_in_mol', 'company_name_in_mol'] },
    { label: 'Tracing Source Type', keys: ['tracing_source_type_name'] },
    { label: 'Traced Details', keys: ['traced_details'] },
    { label: 'Customer Employment Status', keys: ['customer_employment_status'] },
    { label: 'Company Employment Type', keys: ['company_employment_type'] },
    { label: 'Other Contact Name', keys: ['other_contact_name'] },
    { label: 'Relationship', keys: ['relationship'] },
    { label: 'Other Contact No.', keys: ['other_contact_number', 'other_contact_no'] },
  ];
  finalRemarkColumns: TracingHistoryColumn[] = [
    { label: 'Updated By', keys: ['updated_by_full_name', 'modified_by_full_name', 'created_by_full_name'] },
    { label: 'Updated Date', keys: ['updated_dtm', 'modified_dtm', 'created_dtm'], format: 'date' },
    { label: 'Contactable/Non-Contactable', keys: ['contactable_non_contactable'] },
    { label: 'Disposition Stage', keys: ['disposition_stage'] },
    { label: 'Disposition Code', keys: ['disposition_code'] },
    { label: 'Remarks', keys: ['final_remark', 'traced_details'] },
    { label: 'Amount', keys: ['collection_amount'] },
    { label: 'Date', keys: ['collection_date'], format: 'date' },
    { label: 'Current Location', keys: ['current_location'] },
    { label: 'Mode of Contact', keys: ['collection_mode_of_contact'] },
    { label: 'Phone No.', keys: ['collection_phone'] },
    { label: 'Email', keys: ['collection_email'] },
    { label: 'Field Remarks', keys: ['field_feedback'] },
    { label: 'Requested/Not Requested', keys: ['collection_requested_flag'] },
    { label: 'Requested Date', keys: ['collection_requested_date'], format: 'date' },
    { label: 'Reason for Not Requested', keys: ['collection_not_requested_reason'] },
    { label: 'Documents', keys: ['collection_documents'] },
  ];
  tracingHistoryData: any[] = [];
  finalRemarkData: any[] = [];
  tracingHistoryLoading = false;
  tracingHistoryError = '';
  constructor(
    private _router: Router,
    private _aR: ActivatedRoute,
    private _sunshineApi: SunshineInternalService,
    private customFn: CustomFunctionsService,
    private _snackBar: MatSnackBar,
    private location: Location
  ) {
    this.accountsUserForm = new FormGroup({
      app_user_id: new FormControl(null),
      father_name: new FormControl(null),
      mother_name: new FormControl(null),
      spouse_name: new FormControl(null),
      date_of_birth: new FormControl(null),
      customer_id: new FormControl([null, [Validators.pattern('^[0-9]*$')]]),
      emirates_id_number: new FormControl(null),
      passport_number: new FormControl(null),
      nationality: new FormControl(null),
      // email_id: new FormControl(null),
      // mobile_number: new FormControl([null, [Validators.pattern('^[0-9]*$')]]),
      // home_country_number: new FormControl([
      //   null,
      //   [Validators.pattern('^[0-9]*$')],
      // ]),
      // home_country_address: new FormControl(null),
      // city: new FormControl(null),
      // pincode: new FormControl([null, [Validators.pattern('^[0-9]*$')]]),
      // state: new FormControl(null),
      employer_details: new FormControl(null),
      designation: new FormControl(null),
      company_contact: new FormControl(null),
      business_name: new FormControl(null),
      banker_name: new FormControl(null),
      account_number: new FormControl([null, [Validators.pattern('^[0-9]*$')]]),
      product_type: new FormControl(null),
      product_account_number: new FormControl([
        null,
        [Validators.pattern('^[0-9]*$')],
      ]),
      pli_status: new FormControl(null),
      execution_status: new FormControl(null),
      overdue: new FormControl(null),
      // last_paid_amount: new FormControl(null),
      // last_paid_date: new FormControl(null),
      // ghrc_offer_1: new FormControl(null),
      // ghrc_offer_2: new FormControl(null),
      // ghrc_offer_3: new FormControl(null),
      withdraw_date: new FormControl(null),
      // minimum_payment: new FormControl(null),
      // total_outstanding_amount: new FormControl(null),
      // principal_outstanding_amount: new FormControl(null),
      // credit_limit: new FormControl(null),
      bucket_status: new FormControl(null),
      vintage: new FormControl(null),
      date_of_woff: new FormControl(null),
      allocation_status: new FormControl(null),
      agreement_id: new FormControl([null, [Validators.pattern('^[0-9]*$')]]),
      assigned_to_full_name: new FormControl(null),
      assigned_by_full_name: new FormControl(null),
      company_id: new FormControl(null),
      lead_status_type_id: new FormControl(null),
      template_type_id: new FormControl(null),
      assigned_by: new FormControl(null),
      assigned_to: new FormControl(null),
      customer_name: new FormControl(null),
      lead_status_type_name: new FormControl(null),
      company_name: new FormControl(null),
      // visa_status: new FormControl(null),
      // mol_status: new FormControl(null),
      is_visit_required: new FormControl(null),
      settlement_status: new FormControl(null),
      senior_manager_id: new FormControl(null),
      team_manager_id: new FormControl(null),
    });

    this.assignedByControl = this.accountsUserForm.get(
      'assigned_by_full_name'
    ) as FormControl;
    this.assignedToControl = this.accountsUserForm.get(
      'assigned_to_full_name'
    ) as FormControl;
  }

  ngOnInit(): void {
    // Get user role from session storage
    let ssUserById: any = sessionStorage.getItem('userDetails');
    let parsedUserById = JSON.parse(ssUserById);
    this.loggedInUserId = parsedUserById.user_id;
    this.loggedInUserRole = parsedUserById.role_name;

    // Initialize autocomplete functionality
    this.assignedByFilteredOptions = this.assignedByControl.valueChanges.pipe(
      startWith(''),
      map((value) => {
        if (typeof value === 'string') return value;
        if (value && typeof value === 'object' && 'full_name' in value) {
          return (value as any).full_name;
        }
        return '';
      }),
      map((fullName) => {
        if (typeof fullName === 'string') {
          return fullName
            ? this._filterAssignedBy(fullName)
            : this.allUsersArr.slice();
        }
        return this.allUsersArr.slice();
      })
    );

    this.assignedToFilteredOptions = this.assignedToControl.valueChanges.pipe(
      startWith(''),
      map((value) => {
        if (typeof value === 'string') return value;
        if (value && typeof value === 'object' && 'full_name' in value) {
          return (value as any).full_name;
        }
        return '';
      }),
      map((fullName) => {
        if (typeof fullName === 'string') {
          return fullName
            ? this._filterAssignedTo(fullName)
            : this.allUsersArr.slice();
        }
        return this.allUsersArr.slice();
      })
    );

    // Disable form controls for agents
    if (this.isAgent()) {
      this.accountsUserForm.get('assigned_by_full_name')?.disable();
      this.accountsUserForm.get('assigned_to_full_name')?.disable();
      this.accountsUserForm.get('withdraw_date')?.disable();
    }

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

    this.getAllUsers();
    this.getAllLeadStatusType();

    this.loggedInUserRole === 'TEAM MANAGER'
      ? (this.assignDisabled = true)
      : (this.assignDisabled = false);
    this.captureRouteParams();

    let acMgtUrl: any = sessionStorage.getItem('ac-mgt-url');
    let decodedUrl = decodeURIComponent(acMgtUrl || '');
    this.accMGTSnapshotURL = decodedUrl;

    // Subscribe to form value changes
    this.accountsUserForm.valueChanges.subscribe(() => {
      // For non-agent roles, enable save button when form is dirty
      if (this.accountsUserForm.dirty && this.loggedInUserRole !== 'AGENT') {
        this.isDisabled = false;
      }
      // For agents, the save button is only enabled in the changeStatus method
    });

    this.buildAccountGrid();
  }

  get hasLeadData(): boolean {
    return Array.isArray(this.leadResById) && this.leadResById.length > 0;
  }

  get customerName(): string {
    return this.hasLeadData ? this.leadResById[0].customer_name || '--' : '--';
  }

  get bankName(): string {
    return this.hasLeadData ? this.leadResById[0].company_name || '--' : '--';
  }

  get leadStatusLabel(): string {
    return this.hasLeadData ? this.leadResById[0].lead_status_type_name || 'Status unavailable' : 'Status unavailable';
  }

  get assignedToDisplay(): string {
    const formValue = this.accountsUserForm?.getRawValue?.();
    return formValue && formValue.assigned_to_full_name ? formValue.assigned_to_full_name : 'Not assigned';
  }

  get assignedByDisplay(): string {
    const formValue = this.accountsUserForm?.getRawValue?.();
    return formValue && formValue.assigned_by_full_name ? formValue.assigned_by_full_name : 'Not assigned';
  }

  get actionRequiredBanner(): string | null {
    if (!this.hasLeadData) {
      return null;
    }

    const followUps = Number(this.leadResById[0]?.followups_today_count);
    if (!Number.isNaN(followUps) && followUps > 0) {
      const label = followUps === 1 ? 'follow-up' : 'follow-ups';
      return `Action required: ${followUps} ${label} scheduled for today`;
    }

    const actionNote = this.leadResById[0]?.action_required_note;
    return actionNote && actionNote.trim().length ? actionNote : null;
  }

  getDetailValue(field: AccountDetailField): string {
    if (!this.hasLeadData) {
      return '--';
    }

    const rawValue = this.leadResById[0]?.[field.key];

    if (rawValue === null || rawValue === undefined || rawValue === '') {
      return '--';
    }

    if (field.format === 'date') {
      return this.formatDate(rawValue);
    }

    if (field.format === 'currency') {
      return this.formatCurrency(rawValue);
    }

    return String(rawValue);
  }

  buildAccountGrid() {
    const flatFields = this.accountDetailColumns.flat();
    const columnsPerRow = 3;
    const rows: AccountDetailField[][] = [];

    for (let i = 0; i < flatFields.length; i += columnsPerRow) {
      rows.push(flatFields.slice(i, i + columnsPerRow));
    }

    this.accountGridRows = rows;
  }

  loadTracingHistory(leadId: number) {
    if (!leadId) {
      this.tracingHistoryData = [];
      this.finalRemarkData = [];
      return;
    }

    const params = {
      web_tracing_details_id: null,
      lead_id: leadId,
      tracing_source_type_id: null,
    };

    this.tracingHistoryLoading = true;
    this.tracingHistoryError = '';

    this._sunshineApi
      .fetchWebTracingDetails(params)
      .then((res: any) => {
        const resData = Array.isArray(res?.data?.[0]) ? res.data[0] : [];
        this.tracingHistoryData = resData;
        this.finalRemarkData = resData;
      })
      .catch((error) => {
        console.error('Tracing history fetch error:', error);
        this.tracingHistoryError =
          error?.message || 'Unable to load tracing history at the moment.';
        this.tracingHistoryData = [];
        this.finalRemarkData = [];
      })
      .finally(() => {
        this.tracingHistoryLoading = false;
      });
  }

  setActivePanel(panelId: string) {
    this.activePanel = this.activePanel === panelId ? null : panelId;
  }

  getPanelTitle(panelId: string): string {
    const panel = this.sectionNavItems.find((item) => item.id === panelId);
    return panel ? panel.label : '';
  }

  tracingHistoryTrackBy(index: number, row: any): any {
    return row?.web_tracing_details_id ?? row?.tracing_details_id ?? index;
  }

  getTracingDisplay(row: any, column: TracingHistoryColumn): string {
    if (!row) {
      return '--';
    }

    const rawValue = column.keys
      .map((key) => row?.[key])
      .find((value) => value !== undefined && value !== null && value !== '');

    if (rawValue === undefined || rawValue === null || rawValue === '') {
      return '--';
    }

    if (column.format === 'date') {
      return this.formatDate(rawValue);
    }

    return String(rawValue);
  }

  goBack() {
    const storedUrl = sessionStorage.getItem('ac-mgt-url');
    if (storedUrl && storedUrl.includes('/account-management')) {
      this._router.navigateByUrl(storedUrl).catch((err) => {
        console.error(err);
        this.location.back();
      });
    } else {
      this.location.back();
    }
  }
  getAllUsers() {
    // this.showProgressBar = true;
    this._sunshineApi
      .fetchAllUsers()
      .then((res: any) => {
        let resData = res.data[0];
        // console.log(resData);
        
        // Store deactivated users for warning messages
        this.deactivatedUsers = resData.filter((user: any) => user.status === 0);
        
        const filteredUsers = resData.filter(
          (user: any) => user.role_name !== 'SUPERUSER' && user.status === 1
        );
        this.allUsersCopy = filteredUsers;
        this.allUsersArr = filteredUsers;

        // Reinitialize autocomplete after users are loaded
        this.initializeAutocomplete();

        // this.showProgressBar = false;
      })
      .catch((error) => {
        // this.showProgressBar = false;
        console.error('1-error', error);
      });
  }

  // Helper method to initialize autocomplete
  private initializeAutocomplete() {
    // Ensure form is initialized
    if (!this.accountsUserForm) {
      console.error('Form not initialized yet');
      return;
    }

    // Set up assigned by filter with proper typing
    this.assignedByFilteredOptions = this.assignedByControl.valueChanges.pipe(
      startWith(''),
      map((value) => {
        if (value === null || value === undefined) return '';
        return typeof value === 'string'
          ? value
          : (value as any).full_name || '';
      }),
      map((fullName) => {
        if (!fullName) {
          return this.allUsersArr.slice();
        }

        const filterValue = String(fullName).toLowerCase();
        console.log('Filtering assigned by with:', filterValue);

        return this.allUsersArr.filter((user) =>
          user.full_name.toLowerCase().includes(filterValue)
        );
      })
    );

    // Set up assigned to filter with proper typing
    this.assignedToFilteredOptions = this.assignedToControl.valueChanges.pipe(
      startWith(''),
      map((value) => {
        if (value === null || value === undefined) return '';
        return typeof value === 'string'
          ? value
          : (value as any).full_name || '';
      }),
      map((fullName) => {
        if (!fullName) {
          return this.allUsersArr.slice();
        }

        const filterValue = String(fullName).toLowerCase();
        console.log('Filtering assigned to with:', filterValue);

        return this.allUsersArr.filter((user) =>
          user.full_name.toLowerCase().includes(filterValue)
        );
      })
    );
  }

  captureRouteParams() {
    let usrParams = this._aR.snapshot.params;
    let lead_id = parseInt(usrParams['leadId']);
    let company_id = parseInt(usrParams['companyId']);
    ////console.log('lead_id-snapshot :', lead_id);
    // this.companyId = 1;
    this.leadId = lead_id;
    this.fetchLeadByLeadId(lead_id, company_id);
  }

  fetchLeadByLeadId(leadId: number, companyId: any) {
    //console.log(this.loggedInUserId);
    this.showProgressBar = true;
    let leadParams = {
      app_user_id: this.loggedInUserId,
      lead_id: leadId,
      company_id: companyId,
      lead_status_type_id: null,
      assigned_by: null,
      assigned_to: null,
      account_number: null,
      product_type: null,
      product_account_number: null,
    };

    // console.log(leadParams);
    this._sunshineApi
      .fetchAllLeads(leadParams)
      .then((res: any) => {
        let resData = res.data[0];

        //console.log(resData);
        this.leadResById = resData;
        console.log('leadResById::', this.leadResById);
        // this.getUserCompany(resData[0].company_id);
        // console.log(resData[0].multiple_banks_list);
        // this.banksList = resData[0].multiple_banks_list;
        this.banksList = this.parseMultipleBanksList(this.leadResById);
        console.log('banksList:::>>>', this.banksList);
        this.loadTracingHistory(leadId);
        if (resData) {
          this.showProgressBar = false;
          this.patchForm(resData);
        }
        // this.splitMultipleBanks(
        //   resData[0].multiple_banks_list,
        //   resData[0].company_name
        // );
        // sessionStorage.setItem('leadByIdResp', JSON.stringify(resData));
      })
      .catch((error) => {
        console.error('2-error', error);
        this.showProgressBar = false;
        this.openSnackBar(error.message);
      });
  }

  parseMultipleBanksList(dataArray: any[]): BankInfo[] {
    // Ensure we're only working with active users
    this.allUsersArr = this.allUsersCopy.filter(
      (user: any) => user.status === 1
    );

    this.assignedByFilteredOptions = this.assignedByControl.valueChanges.pipe(
      startWith(''),
      //   tap((value) =>
      //     console.log('Initial value:', value)
      // ),
      map((value) => {
        const stringValue = typeof value === 'string' ? value : value.full_name;
        // console.log('Mapped value:', stringValue);
        return stringValue;
      }),
      map((fullName) => {
        const filteredResults = fullName
          ? this._filterAssignedBy(fullName)
          : this.allUsersArr.slice();
        // console.log('Filtered results:', filteredResults);
        return filteredResults;
      })
    );
    // console.log(this.assignedByFilteredOptions);
    this.assignedToFilteredOptions = this.assignedToControl.valueChanges.pipe(
      startWith(''),
      // tap((value) => console.log('Assigned To Initial value:', value)),
      map((value) => {
        const stringValue = typeof value === 'string' ? value : value.full_name;
        // console.log('Assigned To Mapped value:', stringValue);
        return stringValue;
      }),
      map((fullName) => {
        const filteredResults = fullName
          ? this._filterAssignedTo(fullName)
          : this.allUsersArr.slice();
        // console.log('Assigned To Filtered results:', filteredResults);
        return filteredResults;
      })
    );

    // console.log(dataArray);
    let ssCompany: any = sessionStorage.getItem('company');
    this.companyArr = JSON.parse(ssCompany);
    // console.log(this.companyArr);

    const result: BankInfo[] = [];

    dataArray.forEach((data) => {
      const multipleBanksList = data.multiple_banks_list;

      if (multipleBanksList) {
        const banks = multipleBanksList.split(',');

        banks.forEach(
          (bank: {
            trim: () => {
              (): any;
              new (): any;
              split: { (arg0: string): [any, any]; new (): any };
            };
          }) => {
            const [bank_name, lead_id] = bank.trim().split(':');

            // Find the company_id from this.companyArr based on bank_name
            const company = this.companyArr.find(
              (comp: any) => comp.company_name === bank_name.trim()
            );
            // console.log(company);
            // Push the result with bank_name, lead_id, and company_id
            result.push({
              bank_name: bank_name.trim(),
              lead_id: lead_id.trim(),
              company_id: company ? company.company_id : null, // Add company_id if found
            });
          }
        );
      }
    });

    return result;
  }
  splitMultipleBanks(multipleBankList: string, bankName: string) {
    console.log(multipleBankList, bankName);
    if (multipleBankList !== null) {
      let splitBanks = multipleBankList.split(',');

      if (!splitBanks.includes(bankName)) {
        // Use only active users from allUsersCopy
        this.allUsersArr = this.allUsersCopy.filter(
          (user: any) => user.status === 1
        );
        return;
      }

      let companySession = sessionStorage.getItem('company');
      if (!companySession) {
        console.error('No company session found in sessionStorage.');
        // Use only active users from allUsersCopy
        this.allUsersArr = this.allUsersCopy.filter(
          (user: any) => user.status === 1
        );
        return;
      }

      let parsedCompanySession: any[];
      try {
        parsedCompanySession = JSON.parse(companySession);
      } catch (error) {
        console.error('Error parsing company session:', error);
        // Use only active users from allUsersCopy
        this.allUsersArr = this.allUsersCopy.filter(
          (user: any) => user.status === 1
        );
        return;
      }

      let foundBank = parsedCompanySession.find(
        (bank: any) => bank.company_name === bankName
      );

      if (!foundBank) {
        console.error('Bank not found with name:', bankName);
        // Use only active users from allUsersCopy
        this.allUsersArr = this.allUsersCopy.filter(
          (user: any) => user.status === 1
        );
        return;
      }

      let companyIdsToSearch = [String(foundBank.company_id)];

      // Filter active users only and then by company
      this.allUsersArr = this.allUsersCopy
        .filter((user: any) => user.status === 1)
        .filter((user: any) => {
          if (user.company_id_list) {
            const companyIds = user.company_id_list
              .split(',')
              .map((id: string) => id.trim());
            return companyIds.some((id: string) =>
              companyIdsToSearch.includes(id)
            );
          }
          return false;
        });
      // console.log(this.allUsersArr);

      this.assignedByFilteredOptions = this.assignedByControl.valueChanges.pipe(
        startWith(''),
        //   tap((value) =>
        //     console.log('Initial value:', value)
        // ),
        map((value) => {
          const stringValue =
            typeof value === 'string' ? value : value.full_name;
          // console.log('Mapped value:', stringValue);
          return stringValue;
        }),
        map((fullName) => {
          const filteredResults = fullName
            ? this._filterAssignedBy(fullName)
            : this.allUsersArr.slice();
          // console.log('Filtered results:', filteredResults);
          return filteredResults;
        })
      );
      // console.log(this.assignedByFilteredOptions);
      this.assignedToFilteredOptions = this.assignedToControl.valueChanges.pipe(
        startWith(''),
        // tap((value) => console.log('Assigned To Initial value:', value)),
        map((value) => {
          const stringValue =
            typeof value === 'string' ? value : value.full_name;
          // console.log('Assigned To Mapped value:', stringValue);
          return stringValue;
        }),
        map((fullName) => {
          const filteredResults = fullName
            ? this._filterAssignedTo(fullName)
            : this.allUsersArr.slice();
          // console.log('Assigned To Filtered results:', filteredResults);
          return filteredResults;
        })
      );
    }
  }

  private _filterAssignedBy(fullName: string): any[] {
    const filterValue = fullName.toLowerCase();
    return this.allUsersArr.filter((option) =>
      option.full_name.toLowerCase().includes(filterValue)
    );
  }

  private _filterAssignedTo(fullName: string): any[] {
    const filterValue = fullName.toLowerCase();
    return this.allUsersArr.filter((option) =>
      option.full_name.toLowerCase().includes(filterValue)
    );
  }

  patchForm(leadData: any) {
    // console.log(leadData[0]);

    this.accountsUserForm.patchValue(
      {
        assigned_to_full_name: leadData[0].assigned_to_full_name,
        assigned_by_full_name: leadData[0].assigned_by_full_name,
        app_user_id: this.loggedInUserId,
        father_name: leadData[0].father_name,
        mother_name: leadData[0].mother_name,
        spouse_name: leadData[0].spouse_name,
        date_of_birth: leadData[0].date_of_birth
          ? leadData[0].date_of_birth.split('T')[0]
          : null,
        customer_id: leadData[0].customer_id,
        emirates_id_number: leadData[0].emirates_id_number,
        passport_number: leadData[0].passport_number,
        nationality: leadData[0].nationality,
        // email_id: leadData[0].email_id,
        // mobile_number: leadData[0].mobile_number,
        // home_country_number: leadData[0].home_country_number,
        // home_country_address: leadData[0].home_country_address,
        // city: leadData[0].city,
        // pincode: leadData[0].pincode,
        // state: leadData[0].state,
        employer_details: leadData[0].employer_details,
        designation: leadData[0].designation,
        company_contact: leadData[0].company_contact,
        business_name: leadData[0].business_name,
        banker_name: leadData[0].banker_name,
        account_number: leadData[0].account_number,
        product_type: leadData[0].product_type,
        product_account_number: leadData[0].product_account_number,
        pli_status: leadData[0].pli_status,
        execution_status: leadData[0].execution_status,
        overdue: leadData[0].overdue,
        // withdraw_date: !this.isAgent() && leadData[0].withdraw_date
        withdraw_date: leadData[0].withdraw_date
          ? // last_paid_amount: leadData[0].last_paid_amount,
            // last_paid_date: leadData[0].last_paid_date
            // ? leadData[0].last_paid_date.split('T')[0]
            // : null,
            // ghrc_offer_1: leadData[0].ghrc_offer_1,
            // ghrc_offer_2: leadData[0].ghrc_offer_2,
            // ghrc_offer_3: leadData[0].ghrc_offer_3,
            leadData[0].withdraw_date.split('T')[0]
          : null,
        // minimum_payment: leadData[0].minimum_payment,
        // total_outstanding_amount: leadData[0].total_outstanding_amount,
        // principal_outstanding_amount: leadData[0].principal_outstanding_amount,
        // credit_limit: leadData[0].credit_limit,
        bucket_status: leadData[0].bucket_status,
        vintage: leadData[0].vintage,
        date_of_woff: leadData[0].date_of_woff
          ? leadData[0].date_of_woff.split('T')[0]
          : null,
        allocation_status: leadData[0].allocation_status,
        agreement_id: leadData[0].agreement_id,
        company_id: leadData[0].company_id,
        lead_status_type_id: leadData[0].lead_status_type_id,
        template_type_id: leadData[0].template_type_id,
        assigned_by: leadData[0].assigned_by,
        assigned_to: leadData[0].assigned_to,
        customer_name: leadData[0].customer_name,
        lead_status_type_name: leadData[0].lead_status_type_name,
        company_name: leadData[0].company_name,
        is_visit_required: leadData[0].is_visit_required,
        settlement_status: leadData[0].settlement_status,
        senior_manager_id: leadData[0].senior_manager_id,
        team_manager_id: leadData[0].team_manager_id,
      },
      { emitEvent: false }
    );

    this.updateAccountEmailNotif.lead_status_type_name =
      this.accountsUserForm.value.lead_status_type_name;

    this.updateAccountEmailNotif.customer_name =
      this.accountsUserForm.value.customer_name;
    this.updateAccountEmailNotif.account_number =
      this.accountsUserForm.value.account_number;

    this.updateAccountEmailNotif.assigned_by_full_name =
      this.accountsUserForm.value.assigned_by_full_name;

    this.updateAccountEmailNotif.assigned_by_id =
      this.accountsUserForm.value.assigned_by;

    this.updateAccountEmailNotif.assigned_to_full_name =
      this.accountsUserForm.value.assigned_to_full_name;

    this.updateAccountEmailNotif.assigned_to_id =
      this.accountsUserForm.value.assigned_to;

    this.updateAccountEmailNotif.company_name =
      this.accountsUserForm.value.company_name;

    const executionStatus =
      leadData[0].collection_requested_flag ??
      null;
    const executionRequestedDate = this.parseExecutionDate(
      leadData[0].collection_requested_date
    );
    const executionReason =
      leadData[0].collection_not_requested_reason?.trim() || '';

    this.executionForm.patchValue(
      {
        requestStatus: executionStatus,
        requestDate: executionRequestedDate,
        notRequestedReason: executionReason,
      },
      { emitEvent: false }
    );
    this.onExecutionStatusChange(executionStatus, { preserveInputs: true });
    this.executionForm.markAsPristine();
    this.executionInitialValue = {
      requestStatus: executionStatus,
      requestDate: executionRequestedDate,
      notRequestedReason: executionReason,
    };

    let assignedByEmail = this.filterEmails(leadData[0].assigned_by);
    this.updateAccountEmailNotif.assigned_by_email =
      assignedByEmail?.email_address || '';

    let assignedToEmail = this.filterEmails(leadData[0].assigned_to);
    this.updateAccountEmailNotif.assigned_to_email =
      assignedToEmail?.email_address || '';

    // Reset form dirty state and disable save button after patching
    this.accountsUserForm.markAsPristine();
    this.isDisabled = true;
  }

  filterEmails(userId: number) {
    // console.log(userId);
    return this.allUsersArr.find((user: any) => user.user_id === userId);
  }

  assignedByHandler(value: any) {
    const user = this.allUsersArr.find((id: any) => id.full_name === value);

    if (!user) {
      this.openSnackBar('User not found');
      return;
    }

    const assignById = user.user_id;
    this.accountsUserForm.patchValue({
      assigned_by: assignById,
    });

    this.updateAccountEmailNotif = {
      ...this.updateAccountEmailNotif,
      assigned_by_full_name: user.full_name,
      assigned_by_email: user?.email_address || '',
      assigned_by_id: assignById,
    };

    //console.log(this.updateAccountEmailNotif);
    this.isDisabled = false;
  }

  assignedToHandler(value: any) {
    // Prevent handler logic for AGENT role
    if (this.isAgent()) {
      return;
    }

    const user = this.allUsersArr.find((id: any) => id.full_name === value);

    if (!user) {
      this.openSnackBar('User not found');
      return;
    }

    const assignToId = user.user_id;

    if (this.leadResById?.[0]?.assigned_to === assignToId) {
      this.openSnackBar('Account is already assigned to the selected user');
      return;
    }

    this.accountsUserForm.patchValue({
      assigned_to: assignToId,
    });

    if (this.accountsUserForm.value.assigned_by === assignToId) {
      this.accountsUserForm.patchValue({
        assigned_to_full_name: '',
      });
      this.openSnackBar('Assigned By and Assigned To cannot be same');
      this.isDisabled = true;
    } else {
      this.updateAccountEmailNotif = {
        ...this.updateAccountEmailNotif,
        assigned_to_full_name: user.full_name,
        assigned_to_email: user?.email_address || '',
        assigned_to_id: assignToId,
      };
      // //console.log(this.updateAccountEmailNotif);
      this.isDisabled = false;
      this.updateLead();
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

  getAllLeadStatusType() {
    let leadStatusParams = { lead_status_type_id: null };
    this._sunshineApi
      .fetchAllLeadStatusTypes(leadStatusParams)
      .then((res: any) => {
        this.leadStatusArr = res.data[0];
      })
      .catch((error) => {
        // console.error(error);
      });
  }
  // Then add this helper method to your component class
  isAgent(): boolean {
    return this.loggedInUserRole === 'AGENT';
  }

  // Update the changeStatus method to be more concise
  changeStatus(event: any) {
    const statusChange = event.value;
    this.leadStatusTypeChange = statusChange;

    const selectedStatus = this.leadStatusArr.find(
      (status) => status.lead_status_type_name === statusChange
    );

    if (selectedStatus) {
      this.accountsUserForm.patchValue({
        lead_status_type_id: selectedStatus.lead_status_type_id,
      });

      this.updateAccountEmailNotif.lead_status_type_name =
        selectedStatus.lead_status_type_name;

      // Enable save button ONLY for Agents when status changes
      if (this.isAgent()) {
        this.isDisabled = false;
      }
    }

    console.log(this.updateAccountEmailNotif);
  }
  updateLead() {

    // //console.log('Notification Data:', this.updateAccountEmailNotif);
    const withdrawDate = this.accountsUserForm.get('withdraw_date')?.value;
    if (withdrawDate && moment.isMoment(withdrawDate)) {
      const formattedDate = withdrawDate.format('YYYY-MM-DD'); // e.g., "2025-05-29"
      this.accountsUserForm.get('withdraw_date')?.setValue(formattedDate);
    }
    // console.log('UPDATE Form Value:', this.accountsUserForm.value);
    this._sunshineApi
      .updateLeads(this.accountsUserForm.value)
      .then((res: any) => {
        // //console.log('Update Response:', res);
        this.openSnackBar(res.message);
        if (this.leadStatusTypeChange !== 'REASSIGNMENT REQUEST') {
          if (this.updateAccountEmailNotif.assigned_by_id) {
            // //console.log(this.updateAccountEmailNotif.assigned_by_id);
            this.createAssignedByNotification(this.updateAccountEmailNotif);
            this.sendAssignedByEmailAcUpdate(this.updateAccountEmailNotif);
          }

          if (this.updateAccountEmailNotif.assigned_to_id) {
            // //console.log(this.updateAccountEmailNotif.assigned_to_id);

            this.createAssignedToNotification(this.updateAccountEmailNotif);
            this.sendAssignedToEmailAcUpdate(this.updateAccountEmailNotif);
          }
        } else {
          const user = this.allUsersArr.filter((id: any) => {
            return id.role_name === 'ADMIN';
          });
          console.log(user);
          for (const element of user) {
            this.updateAccountEmailNotif.admin_email = element.email_address;
            this.updateAccountEmailNotif.admin_full_name = element.full_name;
            this.sendAdminEmailAcUpdate(this.updateAccountEmailNotif);
            this.createAssignedByNotification(this.updateAccountEmailNotif);
          }
        }

        // Check if assigned_by or assigned_to was changed
        const initialAssignedBy = this.leadResById[0]?.assigned_by;
        const initialAssignedTo = this.leadResById[0]?.assigned_to;
        const newAssignedBy = this.accountsUserForm.value.assigned_by;
        const newAssignedTo = this.accountsUserForm.value.assigned_to;

        const assignmentChanged =
          initialAssignedBy !== newAssignedBy || initialAssignedTo !== newAssignedTo;

        if (assignmentChanged) {
          // Account was reassigned; keep user on the same page but refresh data
          this.openSnackBar('Account successfully reassigned.');
          this.captureRouteParams();
        } else {
          // No assignment change, just refresh the account details
          this.captureRouteParams();
        }
      })
      .catch((error) => {
        console.error('Update Error:', error);
        this.openSnackBar(error);
      });

    // Reset form state after successful update
    this.accountsUserForm.markAsPristine();
    this.isDisabled = true;
  }
  sendAdminEmailAcUpdate(acupdate: any) {
    //console.log('ac-update-assigned-by::::', acupdate);
    let emailBody = `
      Hi ${
        acupdate.admin_full_name === undefined ||
        acupdate.admin_full_name === null
          ? ''
          : acupdate.admin_full_name
      },
      <br><br>
      Re-assignment Request for Account No.: ${
        acupdate.account_number === undefined ||
        acupdate.account_number === null
          ? ''
          : acupdate.account_number
      }:
      <ul>
        <li><strong>Account Number:</strong> ${
          acupdate.account_number === undefined ||
          acupdate.account_number === null
            ? ''
            : acupdate.account_number
        }</li>
        <li><strong>Customer Name:</strong> ${
          acupdate.customer_name === undefined ||
          acupdate.customer_name === null
            ? ''
            : acupdate.customer_name
        }</li>
        <li><strong>Bank Name:</strong> ${
          acupdate.company_name === undefined || acupdate.company_name === null
            ? ''
            : acupdate.company_name
        }</li>
         <li><strong>Assigned By:</strong> ${
           acupdate.assigned_by_full_name === undefined ||
           acupdate.assigned_by_full_name === null
             ? ''
             : acupdate.assigned_by_full_name
         }</li>
        <li><strong>Assigned To:</strong> ${
          acupdate.assigned_to_full_name === undefined ||
          acupdate.assigned_to_full_name === null
            ? ''
            : acupdate.assigned_to_full_name
        }</li>
        <li><strong>Account Current Status:</strong> ${
          acupdate.lead_status_type_name === undefined ||
          acupdate.lead_status_type_name === null
            ? ''
            : acupdate.lead_status_type_name
        }</li>
      </ul>
      <br>
      Thank you,<br>
      Team Sunshine Solutions Pvt. Ltd.<br>
      This automated mail was sent by Sunshine Solutions Pvt. Ltd. Please do not reply directly to this email.
      For questions or assistance, please get in touch with info@mailers.codeswift.in.
    `;

    let receiverEmailId = acupdate.admin_email;
    let emailSubject = `Account Re-assignment Request on Account No "${acupdate.account_number}"`;

    let finalEmail = {
      to: receiverEmailId,
      subject: emailSubject,
      emailBody: emailBody,
    };

    this._sunshineApi
      .sendEmail(finalEmail)
      .then((res: any) => {
        //console.log('ac-update-email-res::::', res);
        this.openSnackBar(res.message);
        // //console.log(
        //   `Email sent for account re-assignment to: ${acupdate.assigned_by_email}`
        // );
      })
      .catch((error) => {
        this.openSnackBar(error);
      });
  }
  sendAssignedByEmailAcUpdate(acupdate: any) {
    //console.log('ac-update-assigned-by::::', acupdate);
    let emailBody = `
      Hi ${
        acupdate.assigned_by_full_name === undefined ||
        acupdate.assigned_by_full_name === null
          ? ''
          : acupdate.assigned_by_full_name
      },
      <br><br>
      Account Details has been updated for Account No.: ${
        acupdate.account_number === undefined ||
        acupdate.account_number === null
          ? ''
          : acupdate.account_number
      }:
      <ul>
        <li><strong>Account Number:</strong> ${
          acupdate.account_number === undefined ||
          acupdate.account_number === null
            ? ''
            : acupdate.account_number
        }</li>
        <li><strong>Customer Name:</strong> ${
          acupdate.customer_name === undefined ||
          acupdate.customer_name === null
            ? ''
            : acupdate.customer_name
        }</li>
        <li><strong>Bank Name:</strong> ${
          acupdate.company_name === undefined || acupdate.company_name === null
            ? ''
            : acupdate.company_name
        }</li>
        <li><strong>Assigned To:</strong> ${
          acupdate.assigned_to_full_name === undefined ||
          acupdate.assigned_to_full_name === null
            ? ''
            : acupdate.assigned_to_full_name
        }</li>
        <li><strong>Account Current Status:</strong> ${
          acupdate.lead_status_type_name === undefined ||
          acupdate.lead_status_type_name === null
            ? ''
            : acupdate.lead_status_type_name
        }</li>
      </ul>
      <br>
      Thank you,<br>
      Team Sunshine Solutions Pvt. Ltd.<br>
      This automated mail was sent by Sunshine Solutions Pvt. Ltd. Please do not reply directly to this email.
      For questions or assistance, please get in touch with info@mailers.codeswift.in.
    `;

    let receiverEmailId = acupdate.assigned_by_email;
    let emailSubject = `Account Re-assignment on Account No "${acupdate.account_number}"`;

    let finalEmail = {
      to: receiverEmailId,
      subject: emailSubject,
      emailBody: emailBody,
    };

    this._sunshineApi
      .sendEmail(finalEmail)
      .then((res: any) => {
        //console.log('ac-update-email-res::::', res);
        this.openSnackBar(res.message);
        // //console.log(
        //   `Email sent for account re-assignment to: ${acupdate.assigned_by_email}`
        // );
      })
      .catch((error) => {
        this.openSnackBar(error);
      });
  }
  sendAssignedToEmailAcUpdate(acupdate: any) {
    //console.log('ac-update-assigned-to::::', acupdate);
    let emailBody = `
      Hi ${
        acupdate.assigned_to_full_name === undefined ||
        acupdate.assigned_to_full_name === null
          ? ''
          : acupdate.assigned_to_full_name
      },
      <br><br>
      Account Details has been updated for Account No.: ${
        acupdate.account_number === undefined ||
        acupdate.account_number === null
          ? ''
          : acupdate.account_number
      }:
      <ul>
        <li><strong>Account Number:</strong> ${
          acupdate.account_number === undefined ||
          acupdate.account_number === null
            ? ''
            : acupdate.account_number
        }</li>
        <li><strong>Customer Name:</strong> ${
          acupdate.customer_name === undefined ||
          acupdate.customer_name === null
            ? ''
            : acupdate.customer_name
        }</li>
        <li><strong>Bank Name:</strong> ${
          acupdate.company_name === undefined || acupdate.company_name === null
            ? ''
            : acupdate.company_name
        }</li>
        <li><strong>Assigned By:</strong> ${
          acupdate.assigned_by_full_name === undefined ||
          acupdate.assigned_by_full_name === null
            ? ''
            : acupdate.assigned_by_full_name
        }</li>
        <li><strong>Account Current Status:</strong> ${
          acupdate.lead_status_type_name === undefined ||
          acupdate.lead_status_type_name === null
            ? ''
            : acupdate.lead_status_type_name
        }</li>
      </ul>
      <br>
      Thank you,<br>
      Team Sunshine Solutions Pvt. Ltd.<br>
      This automated mail was sent by Sunshine Solutions Pvt. Ltd. Please do not reply directly to this email.
      For questions or assistance, please get in touch with info@mailers.codeswift.in.
    `;

    let receiverEmailId = acupdate.assigned_to_email;
    let emailSubject = `Account Re-assignment on Account No "${acupdate.account_number}"`;

    let finalEmail = {
      to: receiverEmailId,
      subject: emailSubject,
      emailBody: emailBody,
    };

    this._sunshineApi
      .sendEmail(finalEmail)
      .then((res: any) => {
        // //console.log('task-create-email-res::::', res);
        this.openSnackBar(res.message);
        // //console.log(
        //   `Email sent for account re-assignment to: ${acupdate.assigned_to_email}`
        // );
      })
      .catch((error) => {
        this.openSnackBar(error);
      });
  }

  createAssignedToNotification(notif: any) {
    let notifType: any = sessionStorage.getItem('notifType');
    let parsedNotifType = JSON.parse(notifType);
    // //console.log(parsedNotifType[2]);
    // //console.log(notif.assigned_by_id);

    let createUsrNotifObj = {
      user_id: notif.assigned_to_id,
      notification_type_id: parsedNotifType[3].notification_type_id,
      notification_name: parsedNotifType[3].notification_type_name,
      notification_message: `${parsedNotifType[3].notification_type_description} as ${notif.assigned_to_full_name}`,
      notification_effective_from: this.getCurrentTimestamp(),
      notification_effective_to: null,
      notification_lifespan_days: null,
      notification_publish_flag: 1,
      acknowledgment_required: 1,
      notification_acknowledged_on: null,
      app_user_id: this.loggedInUserId,
    };

    // //console.log('------>', createUsrNotifObj);

    this._sunshineApi
      .postNewUserNotification(createUsrNotifObj)
      .then((res: any) => {
        // //console.log('ac-update-app-notif-res;:::', res);
        this.openSnackBar(res.message);
      })
      .catch((error) => {
        // console.error('create-use-notif-err::::', error);
        // this.openSnackBar(error.response.message);
      });
  }
  createAssignedByNotification(notif: any) {
    let notifType: any = sessionStorage.getItem('notifType');
    let parsedNotifType = JSON.parse(notifType);
    // //console.log(parsedNotifType[2]);
    // //console.log(notif.assigned_by_id);

    let createUsrNotifObj = {
      user_id: notif.assigned_by_id,
      notification_type_id: parsedNotifType[2].notification_type_id,
      notification_name: parsedNotifType[2].notification_type_name,
      notification_message: `${parsedNotifType[2].notification_type_description} as ${notif.assigned_by_full_name}`,
      notification_effective_from: this.getCurrentTimestamp(),
      notification_effective_to: null,
      notification_lifespan_days: null,
      notification_publish_flag: 1,
      acknowledgment_required: 1,
      notification_acknowledged_on: null,
      app_user_id: this.loggedInUserId,
    };

    // //console.log('------>', createUsrNotifObj);

    this._sunshineApi
      .postNewUserNotification(createUsrNotifObj)
      .then((res: any) => {
        // //console.log('ac-update-app-notif-res;:::', res);
        this.openSnackBar(res.message);
      })
      .catch((error) => {
        // console.error('create-use-notif-err::::', error);
        // this.openSnackBar(error.response.message);
      });
  }
  getCurrentTimestamp() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const day = String(now.getDate()).padStart(2, '0');

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
  getColorClass(leadStatusTypeId: number): string {
    switch (leadStatusTypeId) {
      case 1:
        return 'status-pink'; // pending
      case 2:
        return 'status-yellow'; // in-progress
      case 3:
        return 'status-green'; //completed
      case 4:
        return 'status-blue'; //deferred
      case 5:
        return 'status-red'; // cancelled
      default:
        return 'status-default'; // Assuming 'status-default' is a CSS class for default color
    }
  }

  // Add method to check if a user is deactivated
  isUserDeactivated(fullName: string): boolean {
    return this.deactivatedUsers.some(user => user.full_name === fullName);
  }

  showDeactivatedUserWarning(field: string) {
    let message = `Warning: The selected ${field} user has been deactivated/deleted from the platform.`;
    this._snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  onExecutionStatusChange(
    status: string | null,
    options: { preserveInputs?: boolean } = {}
  ) {
    const { preserveInputs = false } = options;
    const requestDateControl = this.executionForm.get('requestDate');
    const reasonControl = this.executionForm.get('notRequestedReason');

    if (status === 'Requested') {
      requestDateControl?.setValidators([Validators.required]);
      reasonControl?.setValidators([Validators.maxLength(500)]);
      if (!preserveInputs) {
        reasonControl?.setValue('');
      }
    } else if (status === 'Not-Requested') {
      requestDateControl?.clearValidators();
      reasonControl?.setValidators([Validators.required, Validators.maxLength(500)]);
      if (!preserveInputs) {
        requestDateControl?.setValue(null);
      }
    } else {
      requestDateControl?.clearValidators();
      reasonControl?.setValidators([Validators.maxLength(500)]);
    }

    requestDateControl?.updateValueAndValidity({ emitEvent: false });
    reasonControl?.updateValueAndValidity({ emitEvent: false });
  }

  onExecutionCancel() {
    if (this.executionInitialValue) {
      this.executionForm.reset(
        {
          requestStatus: this.executionInitialValue.requestStatus,
          requestDate: this.executionInitialValue.requestDate,
          notRequestedReason: this.executionInitialValue.notRequestedReason,
        },
        { emitEvent: false }
      );
      this.onExecutionStatusChange(this.executionInitialValue.requestStatus, {
        preserveInputs: true,
      });
      this.executionForm.markAsPristine();
      this.executionForm.markAsUntouched();
    } else {
      this.executionForm.reset(undefined, { emitEvent: false });
    }
  }

  onExecutionSave() {
    if (this.executionForm.invalid) {
      this.executionForm.markAllAsTouched();
      return;
    }

    this.executionSaving = true;
    const formValue = this.executionForm.value;
    const payload = {
      requestedFlag: formValue.requestStatus,
      requestedDate: formValue.requestDate
        ? moment(formValue.requestDate).format('YYYY-MM-DD')
        : null,
      notRequestedReason: formValue.notRequestedReason?.trim() || null,
      leadId: this.leadId,
      companyId: this.accountsUserForm?.value?.company_id || null,
    };

    console.log('Execution & Civil payload (pending API integration):', payload);
    this.executionInitialValue = {
      requestStatus: formValue.requestStatus,
      requestDate: formValue.requestDate,
      notRequestedReason: formValue.notRequestedReason,
    };
    setTimeout(() => {
      this.executionSaving = false;
      this.executionForm.markAsPristine();
    }, 300);
  }

  private parseExecutionDate(dateString: string | null): Date | null {
    if (!dateString) {
      return null;
    }
    const parsed = new Date(dateString);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  private formatDate(value: any): string {
    if (!value) {
      return '--';
    }

    const date = moment(value);

    if (date.isValid()) {
      return date.format('DD MMM YYYY');
    }

    if (typeof value === 'string' && value.includes('T')) {
      return value.split('T')[0];
    }

    return String(value);
  }

  private formatCurrency(value: any): string {
    const numericValue =
      typeof value === 'string' ? Number(value.replace(/,/g, '')) : Number(value);

    if (Number.isNaN(numericValue)) {
      return String(value);
    }

    return numericValue.toLocaleString('en-IN');
  }
}
