import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { map, Observable, startWith } from 'rxjs';
import { CustomFunctionsService } from 'src/app/sunshine-services/custom-functions.service';
import { SunshineInternalService } from 'src/app/sunshine-services/sunshine-internal.service';

@Component({
  selector: 'app-targets-dialog',
  templateUrl: './targets-dialog.component.html',
  styleUrls: ['./targets-dialog.component.css'],
})
export class TargetsDialogComponent implements OnInit {
  dialogTitle: string = '';
  dialogText: string = '';
  targetsForm: any;
  showProgressBar: boolean = false;
  dialogData: any;
  isAgent: boolean = false;
  isTeamLead: boolean = false;

  adminControl = new FormControl();
  adminFilteredOptions!: Observable<any[]>;
  seniorMgrControl = new FormControl();
  seniorMgrFilteredOptions!: Observable<any[]>;
  teamMgrControl = new FormControl();
  teamMgrFilteredOptions!: Observable<any[]>;
  teamLeadsControl = new FormControl();
  teamLeadsFilteredOptions!: Observable<any[]>;
  agentsControl = new FormControl();
  agentsFilteredOptions!: Observable<any[]>;
  targetAssignedControl = new FormControl();
  targetAssignedFilteredOptions!: Observable<any[]>;
  adminsArr: any[] = [];
  srMgrArr: any[] = [];
  tmMgrArr: any[] = [];
  tmLdArr: any[] = [];
  agentArr: any[] = [];

  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  durationInSeconds = 5;

  createPrivilegeName: string = 'CREATE';
  // uploadPrivilegeName: string = 'UPLOAD';
  readPrivilegeName: string = 'READ';
  editPrivilegeName: string = 'EDIT';
  moduleName: string = 'TARGETS';
  isCreatePrivilegedModule: any;
  // isUploadPrivilegedModule: any;
  isReadPrivilegedModule: any;
  isEditPrivilegedModule: any;
  userId: any;
  targetAssignedArr: any[] = [];
  isAdminOrManager: boolean = false;
  deactivatedUsers: any[] = [];
  initialFormValues: any = null;
  hasFormChanges: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<TargetsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _sunshineApi: SunshineInternalService,
    private _snackBar: MatSnackBar,
    private customFn: CustomFunctionsService,
    private _datePipe: DatePipe
  ) {
    this.targetsForm = new FormGroup({
      app_user_id: new FormControl(null, [Validators.required]),
      target_id: new FormControl(null),
      admin_id: new FormControl(null, [Validators.required]),
      admin_full_name: new FormControl(null, [Validators.required]),
      senior_manager_id: new FormControl(null),
      senior_manager_full_name: new FormControl(null),
      team_manager_id: new FormControl(null),
      team_manager_full_name: new FormControl(null),
      team_lead_id: new FormControl(null),
      team_lead_full_name: new FormControl(null),
      agent_id: new FormControl(null),
      agent_full_name: new FormControl(null),
      target_amount: new FormControl(null, [Validators.required]),
      target_assigned_by: new FormControl(null, [Validators.required]),
      target_assigned_by_full_name: new FormControl(null, [
        Validators.required,
      ]),
      working_days: new FormControl(null, [Validators.required]),
      achieved_target: new FormControl(null),
      from_date: new FormControl(null, [Validators.required]),
      to_date: new FormControl(null, [Validators.required]),
      status: new FormControl(null),
      created_by: new FormControl(null),
      created_by_full_name: new FormControl(null),
    });
  }

  ngOnInit(): void {
    let userDetails: any = sessionStorage.getItem('userDetails');
    let parsedUsrDetails = JSON.parse(userDetails);
    const userRole = parsedUsrDetails.role_name;

    // Set role-based flags
    this.isAgent = userRole === 'AGENT';
    this.isTeamLead = userRole === 'TEAM LEAD';

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

    this.getAllUsers();

    this.userId = parsedUsrDetails.user_id;

    // Check if user is Admin, Senior Manager, or Team Manager
    this.isAdminOrManager = this.isUserAdminOrManager(parsedUsrDetails);

    // Set created_by fields with logged in user details
    this.targetsForm.patchValue({
      app_user_id: this.userId,
      created_by: this.userId,
      created_by_full_name: parsedUsrDetails.full_name
    });

    // Update the valueChanges subscriptions in ngOnInit()
    this.targetsForm.get('admin_full_name').valueChanges.subscribe((value: any) => {
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        this.targetsForm.patchValue({
          admin_id: null,
          admin_full_name: null
        }, { emitEvent: false });
      }
    });

    this.targetsForm.get('senior_manager_full_name').valueChanges.subscribe((value: any) => {
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        this.targetsForm.patchValue({
          senior_manager_id: null,
          senior_manager_full_name: null
        }, { emitEvent: false });
      }
    });

    this.targetsForm.get('team_manager_full_name').valueChanges.subscribe((value: any) => {
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        this.targetsForm.patchValue({
          team_manager_id: null,
          team_manager_full_name: null
        }, { emitEvent: false });
      }
    });

    this.targetsForm.get('team_lead_full_name').valueChanges.subscribe((value: any) => {
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        this.targetsForm.patchValue({
          team_lead_id: null,
          team_lead_full_name: null
        }, { emitEvent: false });
      }
    });

    this.targetsForm.get('agent_full_name').valueChanges.subscribe((value: any) => {
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        this.targetsForm.patchValue({
          agent_id: null,
          agent_full_name: null
        }, { emitEvent: false });
      }
    });

    this.targetsForm.get('target_assigned_by_full_name').valueChanges.subscribe((value: any) => {
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        this.targetsForm.patchValue({
          target_assigned_by: null,
          target_assigned_by_full_name: null
        }, { emitEvent: false });
      }
    });

    // Call receiveInjectedData to populate form with dialog data
    this.receiveInjectedData();
  }

  getAllUsers() {
    this.showProgressBar = true;
    this._sunshineApi
      .fetchAllUsers()
      .then((res: any) => {
        let resData = res.data[0];
        
        // Store deactivated users first
        this.deactivatedUsers = resData.filter((user: any) => user.status === 0);
        
        // Filter out deactivated users (status === 0) from all arrays
        this.adminsArr = resData.filter(
          (role: any) => role.role_name == 'ADMIN' && role.status !== 0
        );
        // console.log(this.adminsArr);
        this.srMgrArr = resData.filter(
          (role: any) => role.role_name == 'SENIOR MANAGER' && role.status !== 0
        );
        this.tmMgrArr = resData.filter(
          (role: any) => role.role_name == 'TEAM MANAGER' && role.status !== 0
        );
        this.tmLdArr = resData.filter(
          (role: any) => role.role_name == 'TEAM LEAD' && role.status !== 0
        );
        this.agentArr = resData.filter(
          (role: any) => role.role_name == 'AGENT' && role.status !== 0
        );

        // Combine admins, senior managers, and team managers for the admin field (only active users)
        this.targetAssignedArr = [...this.adminsArr, ...this.srMgrArr, ...this.tmMgrArr];

        // sessionStorage.setItem(
        //   'taskAllUsers',
        //   JSON.stringify(this.allUsersArr)
        // );
        //! Filter admins
        this.adminFilteredOptions = this.adminControl.valueChanges.pipe(
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
              ? this._filterAdmins(fullName)
              : this.targetAssignedArr.slice();
            // console.log('Filtered results:', filteredResults);
            return filteredResults;
          })
        );

        //! Filter senior managers
        this.seniorMgrFilteredOptions = this.seniorMgrControl.valueChanges.pipe(
          startWith(''),
          map((value) => {
            const stringValue =
              typeof value === 'string' ? value : value.full_name;
            return stringValue;
          }),
          map((fullName) => {
            const filteredResults = fullName
              ? this._filtersrmgr(fullName)
              : this.srMgrArr.slice();
            return filteredResults;
          })
        );

        //! Filter team managers
        this.teamMgrFilteredOptions = this.teamMgrControl.valueChanges.pipe(
          startWith(''),
          map((value) => {
            const stringValue =
              typeof value === 'string' ? value : value.full_name;
            return stringValue;
          }),
          map((fullName) => {
            const filteredResults = fullName
              ? this._filtertmmgr(fullName)
              : this.tmMgrArr.slice();
            return filteredResults;
          })
        );

        //! Filter team leads
        this.teamLeadsFilteredOptions = this.teamLeadsControl.valueChanges.pipe(
          startWith(''),
          map((value) => {
            const stringValue =
              typeof value === 'string' ? value : value.full_name;
            return stringValue;
          }),
          map((fullName) => {
            const filteredResults = fullName
              ? this._filtertmld(fullName)
              : this.tmLdArr.slice();
            return filteredResults;
          })
        );

        //! Filter agents
        this.agentsFilteredOptions = this.agentsControl.valueChanges.pipe(
          startWith(''),
          map((value) => {
            const stringValue =
              typeof value === 'string' ? value : value.full_name;
            return stringValue;
          }),
          map((fullName) => {
            const filteredResults = fullName
              ? this._filtersagent(fullName)
              : this.agentArr.slice();
            return filteredResults;
          })
        );

        //! Filter target assigned by
        this.targetAssignedFilteredOptions = this.targetAssignedControl.valueChanges.pipe(
          startWith(''),
          map((value) => {
            const stringValue =
              typeof value === 'string' ? value : value.full_name;
            return stringValue;
          }),
          map((fullName) => {
            const filteredResults = fullName
              ? this._filterTargetAssignedBy(fullName)
              : this.targetAssignedArr.slice();
            return filteredResults;
          })
        );

        this.showProgressBar = false;
        
        // Call receiveInjectedData after users are loaded to ensure proper form population
        this.receiveInjectedData();
      })
      .catch((error) => {
        this.showProgressBar = false;
        console.error('Error fetching users:', error);
        this.openSnackBar('Error fetching users: ' + error.message);
      });
  }
  private _filterAdmins(role: string): any[] {
    const filterValue = role.toLowerCase();
    return this.targetAssignedArr.filter((option) =>
      option.full_name.toLowerCase().includes(filterValue)
    );
  }
  private _filtersrmgr(fullName: string): any[] {
    const filterValue = fullName.toLowerCase();
    return this.srMgrArr.filter((option) =>
      option.full_name.toLowerCase().includes(filterValue)
    );
  }
  private _filtertmmgr(fullName: string): any[] {
    const filterValue = fullName.toLowerCase();
    return this.tmMgrArr.filter((option) =>
      option.full_name.toLowerCase().includes(filterValue)
    );
  }
  private _filtertmld(fullName: string): any[] {
    const filterValue = fullName.toLowerCase();
    return this.tmLdArr.filter((option) =>
      option.full_name.toLowerCase().includes(filterValue)
    );
  }
  private _filtersagent(fullName: string): any[] {
    const filterValue = fullName.toLowerCase();
    return this.agentArr.filter((option) =>
      option.full_name.toLowerCase().includes(filterValue)
    );
  }

  private _filterTargetAssignedBy(fullName: string): any[] {
    const filterValue = fullName.toLowerCase();
    return this.targetAssignedArr.filter((option) =>
      option.full_name.toLowerCase().includes(filterValue)
    );
  }

  receiveInjectedData() {
    this.dialogTitle = this.data.dialogTitle;
    this.dialogText = this.data.dialogText;
    this.dialogData = this.data.dialogData;
    console.log(this.dialogTitle, this.dialogData);

    // Get current user details
    let userDetails: any = sessionStorage.getItem('userDetails');
    let parsedUsrDetails = JSON.parse(userDetails);
    const userRole = parsedUsrDetails.role_name;

    if (this.dialogData != undefined) {
      // For Team Leads - show all fields but only enable working_days and achieved_target
      if (userRole === 'TEAM LEAD') {
        // Patch all values from dialogData to show complete information
        const formData = {
          app_user_id: this.dialogData.app_user_id || null,
          target_id: this.dialogData.target_id || null,
          admin_id: this.dialogData.admin_id || null,
          admin_full_name: this.dialogData.admin_full_name || null,
          agent_id: this.dialogData.agent_id || null,
          agent_full_name: this.dialogData.agent_full_name || null,
          team_lead_id: this.dialogData.team_lead_id || null,
          team_lead_full_name: this.dialogData.team_lead_full_name || null,
          senior_manager_id: this.dialogData.senior_manager_id || null,
          senior_manager_full_name: this.dialogData.senior_manager_full_name || null,
          team_manager_id: this.dialogData.team_manager_id || null,
          team_manager_full_name: this.dialogData.team_manager_full_name || null,
          target_amount: this.dialogData.target_amount || null,
          target_assigned_by: this.dialogData.target_assigned_by || null,
          target_assigned_by_full_name: this.dialogData.target_assigned_by_full_name || null,
          working_days: this.dialogData.working_days || null,
          achieved_target: this.dialogData.achieved_target || null,
          from_date: this.dialogData.from_date ? this.dialogData.from_date.split('T')[0] : null,
          to_date: this.dialogData.to_date ? this.dialogData.to_date.split('T')[0] : null,
          status: this.dialogData.status || null,
          created_by: this.dialogData.created_by || null,
          created_by_full_name: this.dialogData.created_by_full_name || null
        };
        
        console.log('Patching form with data for Team Lead:', formData);
        this.targetsForm.patchValue(formData);
        
        // Also update the autocomplete controls - set to empty string if null
        this.adminControl.setValue(formData.admin_full_name || '');
        this.seniorMgrControl.setValue(formData.senior_manager_full_name || '');
        this.teamMgrControl.setValue(formData.team_manager_full_name || '');
        this.teamLeadsControl.setValue(formData.team_lead_full_name || '');
        this.agentsControl.setValue(formData.agent_full_name || '');
        this.targetAssignedControl.setValue(formData.target_assigned_by_full_name || '');
      }
      // For Agents - show all fields but disabled
      else if (userRole === 'AGENT') {
        this.targetsForm.patchValue({
          ...this.dialogData,
          // Ensure numeric fields are properly handled
          target_amount: this.dialogData.target_amount || null,
          achieved_target: this.dialogData.achieved_target || null,
          working_days: this.dialogData.working_days || null
        });
      }
      // For Admin, Senior Manager, or Team Manager - show all fields
      else if (this.isAdminOrManager) {
        // Patch values directly from dialogData, ensuring proper handling of null/empty values
        const formData = {
          app_user_id: this.dialogData.app_user_id || null,
          target_id: this.dialogData.target_id || null,
          admin_id: this.dialogData.admin_id || null,
          admin_full_name: this.dialogData.admin_full_name || null,
          agent_id: this.dialogData.agent_id || null,
          agent_full_name: this.dialogData.agent_full_name || null,
          team_lead_id: this.dialogData.team_lead_id || null,
          team_lead_full_name: this.dialogData.team_lead_full_name || null,
          senior_manager_id: this.dialogData.senior_manager_id || null,
          senior_manager_full_name: this.dialogData.senior_manager_full_name || null,
          team_manager_id: this.dialogData.team_manager_id || null,
          team_manager_full_name: this.dialogData.team_manager_full_name || null,
          target_amount: this.dialogData.target_amount || null,
          target_assigned_by: this.dialogData.target_assigned_by || null,
          target_assigned_by_full_name: this.dialogData.target_assigned_by_full_name || null,
          working_days: this.dialogData.working_days || null,
          achieved_target: this.dialogData.achieved_target || null,
          from_date: this.dialogData.from_date ? this.dialogData.from_date.split('T')[0] : null,
          to_date: this.dialogData.to_date ? this.dialogData.to_date.split('T')[0] : null,
          status: this.dialogData.status || null,
          created_by: this.dialogData.created_by || null,
          created_by_full_name: this.dialogData.created_by_full_name || null
        };
        
        console.log('Patching form with data:', formData);
        this.targetsForm.patchValue(formData);
        
        // Also update the autocomplete controls - set to empty string if null
        this.adminControl.setValue(formData.admin_full_name || '');
        this.seniorMgrControl.setValue(formData.senior_manager_full_name || '');
        this.teamMgrControl.setValue(formData.team_manager_full_name || '');
        this.teamLeadsControl.setValue(formData.team_lead_full_name || '');
        this.agentsControl.setValue(formData.agent_full_name || '');
        this.targetAssignedControl.setValue(formData.target_assigned_by_full_name || '');
      }
    }

    if (this.dialogTitle === 'Assign New Target') {
      // When creating a new target, disable the achieved_target field
      this.targetsForm.controls['achieved_target'].disable();
    } else {
      // For Team Leads - disable all fields except working_days and achieved_target
      if (userRole === 'TEAM LEAD') {
        // Disable all fields except working_days and achieved_target
        this.targetsForm.controls['admin_id'].disable();
        this.targetsForm.controls['admin_full_name'].disable();
        this.targetsForm.controls['agent_id'].disable();
        this.targetsForm.controls['agent_full_name'].disable();
        this.targetsForm.controls['team_lead_id'].disable();
        this.targetsForm.controls['team_lead_full_name'].disable();
        this.targetsForm.controls['senior_manager_id'].disable();
        this.targetsForm.controls['senior_manager_full_name'].disable();
        this.targetsForm.controls['team_manager_id'].disable();
        this.targetsForm.controls['team_manager_full_name'].disable();
        this.targetsForm.controls['target_assigned_by'].disable();
        this.targetsForm.controls['target_assigned_by_full_name'].disable();
        this.targetsForm.controls['target_amount'].disable();
        this.targetsForm.controls['from_date'].disable();
        this.targetsForm.controls['to_date'].disable();
        this.targetsForm.controls['status'].disable();
        this.targetsForm.controls['created_by'].disable();
        this.targetsForm.controls['created_by_full_name'].disable();

        // Enable only these fields for Team Lead
        this.targetsForm.controls['working_days'].enable();
        this.targetsForm.controls['achieved_target'].enable();
      }
      // For Agents - disable all fields
      else if (userRole === 'AGENT') {
        Object.keys(this.targetsForm.controls).forEach(key => {
          this.targetsForm.controls[key].disable();
        });
      }
      // For Admin, Senior Manager, or Team Manager - all fields remain enabled
      else if (this.isAdminOrManager) {
        // All fields remain enabled by default
      }
    }
    
    // Ensure autocomplete controls are properly updated after form patching
    if (this.dialogData) {
      setTimeout(() => {
        this.adminControl.setValue(this.targetsForm.get('admin_full_name')?.value || '');
        this.seniorMgrControl.setValue(this.targetsForm.get('senior_manager_full_name')?.value || '');
        this.teamMgrControl.setValue(this.targetsForm.get('team_manager_full_name')?.value || '');
        this.teamLeadsControl.setValue(this.targetsForm.get('team_lead_full_name')?.value || '');
        this.agentsControl.setValue(this.targetsForm.get('agent_full_name')?.value || '');
        this.targetAssignedControl.setValue(this.targetsForm.get('target_assigned_by_full_name')?.value || '');
      }, 100);
    }

    // Store initial form values for change detection (only for edit mode)
    if (this.dialogTitle !== 'Assign New Target' && this.dialogData) {
      // Use setTimeout to ensure form is fully populated before storing initial values
      setTimeout(() => {
        this.storeInitialFormValues();
        this.setupFormChangeDetection();
      }, 200);
    }
  }

  // Store initial form values for change detection
  storeInitialFormValues() {
    this.initialFormValues = {
      admin_full_name: this.targetsForm.get('admin_full_name')?.value,
      senior_manager_full_name: this.targetsForm.get('senior_manager_full_name')?.value,
      team_manager_full_name: this.targetsForm.get('team_manager_full_name')?.value,
      team_lead_full_name: this.targetsForm.get('team_lead_full_name')?.value,
      agent_full_name: this.targetsForm.get('agent_full_name')?.value,
      target_amount: this.targetsForm.get('target_amount')?.value,
      from_date: this.targetsForm.get('from_date')?.value,
      to_date: this.targetsForm.get('to_date')?.value,
      working_days: this.targetsForm.get('working_days')?.value,
      achieved_target: this.targetsForm.get('achieved_target')?.value
    };
  }

  // Setup form change detection
  setupFormChangeDetection() {
    // Monitor changes to all relevant fields
    const fieldsToMonitor = [
      'admin_full_name',
      'senior_manager_full_name', 
      'team_manager_full_name',
      'team_lead_full_name',
      'agent_full_name',
      'target_amount',
      'from_date',
      'to_date',
      'working_days',
      'achieved_target'
    ];

    fieldsToMonitor.forEach(fieldName => {
      this.targetsForm.get(fieldName)?.valueChanges.subscribe(() => {
        this.checkFormChanges();
      });
    });
  }

  // Check if any changes have been made to the form
  checkFormChanges() {
    if (!this.initialFormValues) {
      this.hasFormChanges = false;
      return;
    }

    const currentValues: any = {
      admin_full_name: this.targetsForm.get('admin_full_name')?.value,
      senior_manager_full_name: this.targetsForm.get('senior_manager_full_name')?.value,
      team_manager_full_name: this.targetsForm.get('team_manager_full_name')?.value,
      team_lead_full_name: this.targetsForm.get('team_lead_full_name')?.value,
      agent_full_name: this.targetsForm.get('agent_full_name')?.value,
      target_amount: this.targetsForm.get('target_amount')?.value,
      from_date: this.targetsForm.get('from_date')?.value,
      to_date: this.targetsForm.get('to_date')?.value,
      working_days: this.targetsForm.get('working_days')?.value,
      achieved_target: this.targetsForm.get('achieved_target')?.value
    };

    // Compare current values with initial values
    this.hasFormChanges = Object.keys(this.initialFormValues).some(key => {
      const initialValue = this.initialFormValues[key];
      const currentValue = currentValues[key];
      
      // Handle null/undefined comparisons
      if (initialValue === null && currentValue === null) return false;
      if (initialValue === null || currentValue === null) return true;
      
      // Handle date comparisons
      if (key === 'from_date' || key === 'to_date') {
        const initialDate = initialValue ? new Date(initialValue).toISOString().split('T')[0] : null;
        const currentDate = currentValue ? new Date(currentValue).toISOString().split('T')[0] : null;
        return initialDate !== currentDate;
      }
      
      // Handle string/number comparisons
      return initialValue !== currentValue;
    });
  }

  assignedDateHandler(event: any) {
    let inputDate = event.value._i;
    this.targetsForm.patchValue({
      from_date: this._datePipe.transform(
        this.targetsForm.value.from_date,
        'yyyy-MM-dd'
      ),
    });
    console.log(this.targetsForm.value);
    this.validateDates();
    this.checkFormChanges();
  }
  targetDateHandler(event: any) {
    let inputDate = event.value._i;
    this.targetsForm.patchValue({
      to_date: this._datePipe.transform(
        this.targetsForm.value.to_date,
        'yyyy-MM-dd'
      ),
    });

    console.log(this.targetsForm.value);
    this.validateDates();
    this.checkFormChanges();
  }
  validateDates() {
    const fromDate = new Date(this.targetsForm.value.from_date);
    const toDate = new Date(this.targetsForm.value.to_date);

    const differenceInTime = toDate.getTime() - fromDate.getTime();
    const differenceInDays = differenceInTime / (1000 * 3600 * 24);

    if (toDate <= fromDate) {
      // Display error message or handle the error
      this.openSnackBar('To date cannot be less than from date');
      this.targetsForm.get('to_date').setErrors({ invalidDateRange: true });
      this.targetsForm.patchValue({ to_date: '', working_days: null });
    } else {
      this.targetsForm.get('to_date').setErrors(null);
      this.targetsForm.patchValue({
        to_date: this._datePipe.transform(
          this.targetsForm.value.to_date,
          'yyyy-MM-dd'
        ),
        working_days: differenceInDays,
      });
    }
    console.log(
      'Number of days between from_date and to_date:',
      differenceInDays
    );
    // this.targetsForm.patchValue({ working_days: differenceInDays });
    this.checkFormChanges();
  }
 adminHandler(value: any) {
  if (!value || typeof value === 'string' && value.trim() === '') {
    this.targetsForm.patchValue({
      admin_id: null,
      admin_full_name: null,
      target_assigned_by: null,
      target_assigned_by_full_name: null,
    }, { emitEvent: false });
    this.adminControl.setValue('');
    this.checkFormChanges();
    return;
  }

  const user = this.targetAssignedArr.find((user: any) => user.full_name === value);
  
  if (user) {
    const { user_id, full_name } = user;
    this.targetsForm.patchValue({
      admin_id: user_id,
      admin_full_name: full_name,
      target_assigned_by_full_name: full_name,
      target_assigned_by: user_id,
    }, { emitEvent: false });
    this.checkFormChanges();
  } else {
    this.targetsForm.patchValue({
      admin_id: null,
      admin_full_name: null,
      target_assigned_by_full_name: null,
      target_assigned_by: null,
    }, { emitEvent: false });
    this.checkFormChanges();
  }
}

  handleInput(event: Event, control: FormControl) {
    const input = event.target as HTMLInputElement;
    control.setValue(input.value);
  }

 seniorMgrHandler(value: any) {
  if (!value || typeof value === 'string' && value.trim() === '') {
    this.targetsForm.patchValue({
      senior_manager_id: null,
      senior_manager_full_name: null,
    }, { emitEvent: false });
    this.seniorMgrControl.setValue('');
    this.checkFormChanges();
    return;
  }

  const user = this.srMgrArr.find((user: any) => user.full_name === value);
  
  if (user) {
    const { user_id, full_name } = user;
    this.targetsForm.patchValue({
      senior_manager_id: user_id,
      senior_manager_full_name: full_name,
    }, { emitEvent: false });
    this.checkFormChanges();
  } else {
    this.targetsForm.patchValue({
      senior_manager_id: null,
      senior_manager_full_name: null,
    }, { emitEvent: false });
    this.checkFormChanges();
  }
}

teamMgrHandler(value: any) {
  if (!value || typeof value === 'string' && value.trim() === '') {
    this.targetsForm.patchValue({
      team_manager_id: null,
      team_manager_full_name: null,
    }, { emitEvent: false });
    this.teamMgrControl.setValue('');
    this.checkFormChanges();
    return;
  }

  const user = this.tmMgrArr.find((user: any) => user.full_name === value);
  
  if (user) {
    const { user_id, full_name } = user;
    this.targetsForm.patchValue({
      team_manager_id: user_id,
      team_manager_full_name: full_name,
    }, { emitEvent: false });
    this.checkFormChanges();
  } else {
    this.targetsForm.patchValue({
      team_manager_id: null,
      team_manager_full_name: null,
    }, { emitEvent: false });
    this.checkFormChanges();
  }
}
 teamLeadHandler(value: any) {
  if (!value || typeof value === 'string' && value.trim() === '') {
    this.targetsForm.patchValue({
      team_lead_id: null,
      team_lead_full_name: null,
    }, { emitEvent: false });
    this.teamLeadsControl.setValue('');
    this.checkFormChanges();
    return;
  }

  const user = this.tmLdArr.find((user: any) => user.full_name === value);
  
  if (user) {
    const { user_id, full_name } = user;
    this.targetsForm.patchValue({
      team_lead_id: user_id,
      team_lead_full_name: full_name,
    }, { emitEvent: false });
    this.checkFormChanges();
  } else {
    this.targetsForm.patchValue({
      team_lead_id: null,
      team_lead_full_name: null,
    }, { emitEvent: false });
    this.checkFormChanges();
  }
}
  agentsHandler(value: any) {
  if (!value || typeof value === 'string' && value.trim() === '') {
    this.targetsForm.patchValue({
      agent_id: null,
      agent_full_name: null,
    }, { emitEvent: false });
    this.agentsControl.setValue('');
    this.checkFormChanges();
    return;
  }

  const user = this.agentArr.find((user: any) => user.full_name === value);
  
  if (user) {
    const { user_id, full_name } = user;
    this.targetsForm.patchValue({
      agent_id: user_id,
      agent_full_name: full_name,
    }, { emitEvent: false });
    this.checkFormChanges();
  } else {
    this.targetsForm.patchValue({
      agent_id: null,
      agent_full_name: null,
    }, { emitEvent: false });
    this.checkFormChanges();
  }
}
 targetAssignedByHandler(value: any) {
  if (!value || typeof value === 'string' && value.trim() === '') {
    this.targetsForm.patchValue({
      target_assigned_by: null,
      target_assigned_by_full_name: null,
    }, { emitEvent: false });
    this.targetAssignedControl.setValue('');
    return;
  }

  const user = this.targetAssignedArr.find((user: any) => user.full_name === value);
  
  if (user) {
    const { user_id, full_name } = user;
    this.targetsForm.patchValue({
      target_assigned_by: user_id,
      target_assigned_by_full_name: full_name,
    }, { emitEvent: false });
  } else {
    this.targetsForm.patchValue({
      target_assigned_by: null,
      target_assigned_by_full_name: null,
    }, { emitEvent: false });
  }
}
  createNewTrget() {
    console.log('create-target-payload:::', this.targetsForm.value);

    // Validate that at least one role is selected if assigned by is filled
    if (this.hasRoleValidationError()) {
      this.openSnackBar('Error: At least one role (Senior Manager, Team Manager, Team Lead, or Agent) should be selected to assign target.');
      return;
    }

    // Get current user details
    let userDetails: any = sessionStorage.getItem('userDetails');
    let parsedUsrDetails = JSON.parse(userDetails);

    // Get the selected assigned by user details
    const assignedByUser = this.targetAssignedArr.find(
      (user: any) => user.user_id === this.targetsForm.value.target_assigned_by
    );

    if (!assignedByUser) {
      this.openSnackBar('Error: Assigned by user not found');
      return;
    }

    // Set created_by fields with the logged-in user details
    const payload = {
      ...this.targetsForm.value,
      // Set created_by to the logged-in user who is creating the target
      created_by: parsedUsrDetails.user_id,
      created_by_full_name: parsedUsrDetails.full_name, // This ensures the creator's name is set
      // Ensure the target is associated with the current user's hierarchy
      app_user_id: parsedUsrDetails.user_id,
      status: 1, // Ensure status is set to active
      // Ensure created_id is set to the current user's ID for proper tracking
      created_id: parsedUsrDetails.user_id
    };

    // For team managers and above, ensure they can create targets for their team
    if (this.isUserAdminOrManager(parsedUsrDetails)) {
      // Set team manager details if team_manager_id is provided
      if (this.targetsForm.value.team_manager_id) {
        payload.team_manager_id = this.targetsForm.value.team_manager_id;
        payload.team_manager_full_name = this.targetsForm.value.team_manager_full_name;
      } else {
        payload.team_manager_id = null;
        payload.team_manager_full_name = null;
      }
      
      // Set senior manager details if senior_manager_id is provided
      if (this.targetsForm.value.senior_manager_id) {
        payload.senior_manager_id = this.targetsForm.value.senior_manager_id;
        payload.senior_manager_full_name = this.targetsForm.value.senior_manager_full_name;
      } else {
        payload.senior_manager_id = null;
        payload.senior_manager_full_name = null;
      }
      
      // Set team lead details if team_lead_id is provided
      if (this.targetsForm.value.team_lead_id) {
        payload.team_lead_id = this.targetsForm.value.team_lead_id;
        payload.team_lead_full_name = this.targetsForm.value.team_lead_full_name;
      } else {
        payload.team_lead_id = null;
        payload.team_lead_full_name = null;
      }
      
      // Set agent details if agent_id is provided
      if (this.targetsForm.value.agent_id) {
        payload.agent_id = this.targetsForm.value.agent_id;
        payload.agent_full_name = this.targetsForm.value.agent_full_name;
      } else {
        payload.agent_id = null;
        payload.agent_full_name = null;
      }
    }

    // Ensure all required fields are properly set
    if (!payload.target_amount || payload.target_amount <= 0) {
      this.openSnackBar('Error: Target amount is required and must be greater than 0');
      return;
    }

    if (!payload.from_date || !payload.to_date) {
      this.openSnackBar('Error: From date and To date are required');
      return;
    }

    console.log('Final target creation payload:', payload);

    this._sunshineApi
      .postNewTarget(payload)
      .then((res: any) => {
        console.log('target-create-res::', res.data);
        this.openSnackBar('Target created successfully');
        this.dialogRef.close({
          create: 1,
        });
      })
      .catch((error: any) => {
        console.log('target-create-error::', error);
        this.openSnackBar('Error creating target: ' + error.message);
        this.dialogRef.close({
          create: 0,
        });
      });
  }
  cancelTarget() {
    this.dialogRef.close({
      calcelled: 1,
    });
  }
  updateTarget(_dialogData: any) {
    console.log('_dialogData:::', _dialogData);
    
    // Validate that at least one role is selected if assigned by is filled
    if (this.hasRoleValidationError()) {
      this.openSnackBar('Error: At least one role (Senior Manager, Team Manager, Team Lead, or Agent) should be selected to assign target.');
      return;
    }
    
    // Get current user details for app_user_id
    let userDetails: any = sessionStorage.getItem('userDetails');
    let parsedUsrDetails = JSON.parse(userDetails);
    
    // Get form values - use getRawValue() to get values even from disabled controls
    const formValues = this.targetsForm.getRawValue();
    console.log('update-target-payload:::', formValues);
  
    // Create a clean payload with the target_id for update
    const payload: any = { 
      app_user_id: parsedUsrDetails.user_id,
      target_id: formValues.target_id,
      admin_id: formValues.admin_id,
      admin_full_name: formValues.admin_full_name,
      senior_manager_id: formValues.senior_manager_id,
      senior_manager_full_name: formValues.senior_manager_full_name,
      team_manager_id: formValues.team_manager_id,
      team_manager_full_name: formValues.team_manager_full_name,
      team_lead_id: formValues.team_lead_id,
      team_lead_full_name: formValues.team_lead_full_name,
      agent_id: formValues.agent_id,
      agent_full_name: formValues.agent_full_name,
      target_amount: formValues.target_amount,
      target_assigned_by: formValues.target_assigned_by,
      target_assigned_by_full_name: formValues.target_assigned_by_full_name,
      working_days: formValues.working_days,
      achieved_target: formValues.achieved_target,
      from_date: formValues.from_date,
      to_date: formValues.to_date,
      // Use in_status instead of status to match backend expectation
      in_status: formValues.status !== 0 ? 1 : 0
    };
    
    // Handle role fields - if full_name is empty or null, clear the corresponding id and name
    const roleFields = [
      { id: 'admin_id', name: 'admin_full_name' },
      { id: 'senior_manager_id', name: 'senior_manager_full_name' },
      { id: 'team_manager_id', name: 'team_manager_full_name' },
      { id: 'team_lead_id', name: 'team_lead_full_name' },
      { id: 'agent_id', name: 'agent_full_name' },
      { id: 'target_assigned_by', name: 'target_assigned_by_full_name' }
    ];
  
    roleFields.forEach(field => {
      // Check if the field is empty, null, or just whitespace
      if (!formValues[field.name] || (typeof formValues[field.name] === 'string' && formValues[field.name].trim() === '')) {
        payload[field.id] = null;
      }
    });
  
    // Handle numeric fields - ensure they are properly formatted
    if (payload.target_amount !== null && payload.target_amount !== undefined) {
      payload.target_amount = Number(payload.target_amount) || 0;
    }
    
    if (payload.achieved_target !== null && payload.achieved_target !== undefined) {
      payload.achieved_target = Number(payload.achieved_target) || 0;
    }
    
    if (payload.working_days !== null && payload.working_days !== undefined) {
      payload.working_days = Number(payload.working_days) || 0;
    }
  
    // Ensure we're not sending any undefined values
    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined) {
        payload[key] = null;
      }
    });
  
    // Ensure empty string values are converted to null
    Object.keys(payload).forEach(key => {
      if (typeof payload[key] === 'string' && payload[key].trim() === '') {
        payload[key] = null;
      }
    });

    // Ensure target_id is preserved and not null
    if (!payload.target_id) {
      this.openSnackBar('Error: Target ID is missing. Cannot update target.');
      return;
    }

    // Ensure in_status is properly set
    if (payload.in_status === null || payload.in_status === undefined) {
      payload.in_status = 1; // Default to active
    }
  
    console.log('Final update payload:', payload);
  
    this._sunshineApi
      .editTargets(payload)
      .then((res: any) => {
        console.log('target-edit-res::', res.data);
        this.openSnackBar('Target updated successfully');
        this.dialogRef.close({
          update: 1,
        });
      })
      .catch((error: any) => {
        console.error('target-edit-error::', error);
        this.openSnackBar('Error updating target: ' + error.message);
        this.dialogRef.close({
          update: 0,
        });
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

  // Add this new method to check if user is Admin, Senior Manager, or Team Manager
  isUserAdminOrManager(userDetails: any): boolean {
    const userRole = userDetails.role_name;
    return userRole === 'ADMIN' || userRole === 'SENIOR MANAGER' || userRole === 'TEAM MANAGER';
  }

  isUserDeactivated(fullName: string): boolean {
    return this.deactivatedUsers.some(user => user.full_name === fullName);
  }

  openDeactivatedUserMessage(role: string) {
    this._snackBar.open(
      `Warning: The selected ${role} user has been deactivated/removed from the platform.`,
      'Close',
      {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      }
    );
  }

  // Method to check if form is valid for Team Leads (only working_days and achieved_target matter)
  isFormValidForTeamLead(): boolean {
    if (!this.isTeamLead) {
      return this.targetsForm.valid;
    }
    
    // For Team Leads, only check working_days and achieved_target
    const workingDays = this.targetsForm.get('working_days');
    const achievedTarget = this.targetsForm.get('achieved_target');
    
    return workingDays && achievedTarget && 
           (workingDays.valid || workingDays.value !== null) && 
           (achievedTarget.valid || achievedTarget.value !== null);
  }

  // Method to check if at least one role is selected (SM, TM, TL, Agent)
  isAtLeastOneRoleSelected(): boolean {
    const seniorManager = this.targetsForm.get('senior_manager_full_name')?.value;
    const teamManager = this.targetsForm.get('team_manager_full_name')?.value;
    const teamLead = this.targetsForm.get('team_lead_full_name')?.value;
    const agent = this.targetsForm.get('agent_full_name')?.value;
    
    // Check if any of the role fields have a value (not null, undefined, or empty string)
    return !!(seniorManager && seniorManager.trim()) || 
           !!(teamManager && teamManager.trim()) || 
           !!(teamLead && teamLead.trim()) || 
           !!(agent && agent.trim());
  }

  // Method to check if assigned by is filled but no roles are selected
  hasRoleValidationError(): boolean {
    // Skip validation for Team Leads since they can only edit working_days and achieved_target
    // Skip validation for Agents since they cannot edit targets
    if (this.isTeamLead || this.isAgent) {
      return false;
    }
    
    const assignedBy = this.targetsForm.get('admin_full_name')?.value;
    // If assigned by is filled, then at least one role should be selected
    return !!(assignedBy && assignedBy.trim()) && !this.isAtLeastOneRoleSelected();
  }
}