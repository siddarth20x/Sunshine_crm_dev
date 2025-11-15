import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { SunshineInternalService } from 'src/app/sunshine-services/sunshine-internal.service';
import { Observable, from, of } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { CustomFunctionsService } from 'src/app/sunshine-services/custom-functions.service';
import { ContactDialogComponent } from '../contact-dialog/contact-dialog.component';
import { AddressDialogComponent } from '../address-dialog/address-dialog.component';
import { VisaCheckDialogComponent } from '../visa-check-dialog/visa-check-dialog.component';
import { MolCheckDialogComponent } from '../mol-check-dialog/mol-check-dialog.component';
import { WebTracingDialogComponent } from '../web-tracing-dialog/web-tracing-dialog.component';
import { TracingDetailsDialogComponent } from '../tracing-details-dialog/tracing-details-dialog.component';
import { LocationServiceService } from 'src/app/sunshine-services/location-service.service';
import { NotificationService } from '../../shared/services/notification.service';
@Component({
  selector: 'app-tasks-dialog',
  templateUrl: './tasks-dialog.component.html',
  styleUrls: ['./tasks-dialog.component.css'],
})
export class TasksDialogComponent implements OnInit {
  dialogTitle: string = '';
  dialogText: string = '';
  @Output() submitClicked = new EventEmitter<any>();
  tasksForm: any;
  showProgressBar: boolean = false;
  allUsersArr: any[] = [];
  dispositionArr: any = [];
  stageNameArr: any[] = [];
  statusArr: any[] = [];
  dispCodeArr: any[] = [];
  dialogData: any = {};
  selectedStatus: string = '';
  taskTypeArr: any[] = [];
  hideDocUpldSelector: boolean = false;
  taskStatusTypeArr: any;
  file!: File;

  assignedByControl = new FormControl({value: '', disabled: true});
  assignedByFilteredOptions!: Observable<any[]>;
  assignedToControl = new FormControl();
  assignedToFilteredOptions!: Observable<any[]>;
  dispositionStatusControl = new FormControl();
  dispositionStatusFilteredOptions!: Observable<any[]>;
  

  newTaskObj: any = {};
  loggedInUserId: any;

  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  durationInSeconds = 5;

  showNotes: boolean = false;
  disableCreateTaskBtn: boolean = false;
  disableUpdateTaskBtn: boolean = false;
  editTaskObj: any = {};
  notesArr: any[] = [];

  // Add property to track if target date was manually changed
  targetDateChanged: boolean = false;

  items = ['', 'View Notes'];
  expandedIndex = 0;
  downloadURL: string | undefined;
  notesDisabled: boolean = true;
  createTaskEmailNotif: any = {};

  contactMode: Array<string> = ['CALL', 'MESSAGE', 'EMAIL', 'VISIT'];

  createPrivilegeName: string = 'CREATE';
  uploadPrivilegeName: string = 'UPLOAD';
  readPrivilegeName: string = 'READ';
  editPrivilegeName: string = 'EDIT';
  moduleName: string = 'TASKS';
  isCreatePrivilegedModule: any;
  isUploadPrivilegedModule: any;
  isReadPrivilegedModule: any;
  isEditPrivilegedModule: any;

  allUsersCopy: any[] = [];
  banksList: string = 'No Multiple Banks';
  selectedContactMode: string = '';
  hideContactAddress: boolean = false;
  nonPrelimTask: boolean = true;
  deactivatedUsers: any[] = []; // Add this property to track deactivated users

  notessContent: string = '';
  docUrlDisable: boolean = true;
  docUploadDisable: boolean = true;

  errorMessage: string[] = [];
  taskType: any;
  stageArr: any[] = [];
  countries: any[] = [];
  states: any[] = [];
  cities: string[] = [];

  selectedCountry: string = '';
  selectedState: string = '';
  selectedCity: string = '';
  leadId: any;
  isContactable: any;
  loggedInUserRole: any;
  companyId: any; // Add property to store company_id

  // Add loading state for contactable dropdown
  isLoadingContactableData: boolean = false;

  // Add a structure to track which details are present
  detailsStatus = {
    contact: false,
    visa: false,
    tracing: false,
    webTracing: false,
    email: false,
    address: false,
    phone: false
  };

  // Add property to track which specific detail was just updated
  lastUpdatedDetail: string = '';

  // Add the contactableChanged property to the class
  contactableChanged: boolean = false;

  // Add a flag to control the display of the mode of contact required message
  showModeOfContactMessage: boolean = false;

  // Add property to track if disposition fields should be enabled
  dispositionFieldsEnabled: boolean = false;

  // Add properties for task status and disposition status filtering
  validCompletedDispositionStatuses: string[] = ['SETTLEMENT', 'SETTLEMENT ', 'DECEASED'];
  filteredTaskStatusTypeArr: any[] = [];
  filteredStatusArr: any[] = [];

  // Method to check if task status field should be enabled
  isTaskStatusEnabled(): boolean {
    const dispositionStatus = this.tasksForm.get('stage_status_name')?.value;
    return dispositionStatus && dispositionStatus.trim() !== '';
  }

  // Method to filter task status options based on disposition status
  filterTaskStatusOptions() {
    const currentDispositionStatus = this.tasksForm.get('stage_status_name')?.value;
    
    if (!this.taskStatusTypeArr || this.taskStatusTypeArr.length === 0) {
      this.filteredTaskStatusTypeArr = [];
      return;
    }
    
    // First, filter to show only the 4 required task statuses: PENDING, IN PROGRESS, COMPLETED, RE WORK
    const allowedTaskStatuses = ['PENDING', 'IN PROGRESS', 'COMPLETED', 'RE WORK'];
    let baseFilteredArray = this.taskStatusTypeArr.filter((status: any) => 
      allowedTaskStatuses.includes(status.task_status_type_name)
    );
    
    if (currentDispositionStatus) {
      // If disposition status is valid for COMPLETED, show PENDING, COMPLETED, RE WORK (exclude IN PROGRESS)
      if (this.validCompletedDispositionStatuses.includes(currentDispositionStatus)) {
        this.filteredTaskStatusTypeArr = baseFilteredArray.filter((status: any) => 
          status.task_status_type_name !== 'IN PROGRESS'
        );
        
        // If IN PROGRESS was previously selected, change it to COMPLETED
        const currentTaskStatus = this.tasksForm.get('task_status_type_name')?.value;
        if (currentTaskStatus === 'IN PROGRESS') {
          this.tasksForm.patchValue({
            task_status_type_name: 'COMPLETED'
          });
          // Update the task objects with COMPLETED status
          const completedTaskStatusId = this.taskStatusTypeArr.find((status: any) => 
            status.task_status_type_name === 'COMPLETED'
          )?.task_status_type_id;
          if (completedTaskStatusId) {
            this.newTaskObj.task_status_type_id = completedTaskStatusId;
            this.editTaskObj.task_status_type_id = completedTaskStatusId;
            this.createTaskEmailNotif.task_status_type_name = 'COMPLETED';
          }
        }
      } else {
        // If disposition status is not settled/closed/deceased, show PENDING, IN PROGRESS, RE WORK (exclude COMPLETED)
        this.filteredTaskStatusTypeArr = baseFilteredArray.filter((status: any) => 
          status.task_status_type_name !== 'COMPLETED'
        );
      }
    } else {
      // If no disposition status selected, show PENDING, IN PROGRESS, RE WORK (exclude COMPLETED)
      this.filteredTaskStatusTypeArr = baseFilteredArray.filter((status: any) => 
        status.task_status_type_name !== 'COMPLETED'
      );
    }
  }

  // Method to filter disposition status options based on task status
  filterDispositionStatusOptions() {
    const currentTaskStatus = this.tasksForm.get('task_status_type_name')?.value;
    const currentDispositionStatus = this.tasksForm.get('stage_status_name')?.value;
    
    if (currentTaskStatus === 'COMPLETED') {
      // If task status is COMPLETED, only show valid disposition statuses
      this.filteredStatusArr = this.statusArr.filter((status: any) => 
        this.validCompletedDispositionStatuses.includes(status.stage_status_name)
      );
      
      // If current disposition status is not valid for COMPLETED, clear it
      if (currentDispositionStatus && !this.validCompletedDispositionStatuses.includes(currentDispositionStatus)) {
        this.tasksForm.patchValue({
          stage_status_name: null,
          stage_status_code: null
        });
        this.dispCodeArr = [];
      }
    } else {
      // Show all disposition status options
      this.filteredStatusArr = [...this.statusArr];
    }
  }

  docUploadInProgress: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<TasksDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _sunshineApi: SunshineInternalService,
    private _snackBar: MatSnackBar,
    private customFn: CustomFunctionsService,
    public contactsDialog: MatDialog,
    public addressDialog: MatDialog,
    private locationService: LocationServiceService,
    private notificationService: NotificationService
  ) {
    this.tasksForm = new FormGroup({
      assigned_by_full_name: new FormControl({value: null, disabled: true}, [Validators.required]),
      assigned_to_full_name: new FormControl(null, [Validators.required]),
      stage: new FormControl(null),
      stage_status: new FormControl(null),
      stage_status_name: new FormControl(null),
      stage_status_code: new FormControl(null),
      assigned_dtm: new FormControl(null),
      target_dtm: new FormControl(null),
      notes: new FormControl(null),
      task_type_name: new FormControl(null, [Validators.required]),
      task_status_type_name: new FormControl(null),
      mode_of_contact: new FormControl(null),
      document_url: new FormControl(null),
      country: new FormControl(null),
      state: new FormControl(null),
    });
  }

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

    // Get user role from session storage
    const userDetails = sessionStorage.getItem('userDetails');
    if (userDetails) {
      const parsedUserDetails = JSON.parse(userDetails);
      this.loggedInUserRole = parsedUserDetails.role_name;
    }

    this.getAllDispositions();
    this.getAllUsers();
    this.getAllTaskTypes();
    this.getAllTaskStatusTypes();
    
    // Backup mechanism to ensure contactable dropdown always has data
    setTimeout(() => {
      if (this.stageArr.length === 0) {
        console.log('Backup: Setting fallback contactable data in ngOnInit');
        this.setFallbackContactableData();
      }
    }, 3000);
    this.getUserSessionDetails();
    this.getLeadSessionDetails();
    this.countries = this.locationService.getCountries();

    // Remove the disabling of form controls for agents
    // if (this.loggedInUserRole === 'AGENT') {
    //   this.tasksForm.get('assigned_by_full_name')?.disable();
    //   this.tasksForm.get('assigned_to_full_name')?.disable();
    //   this.assignedByControl.disable();
    //   this.assignedToControl.disable();
    // }

    this.assignedByFilteredOptions = this.assignedByControl.valueChanges.pipe(
      startWith(''),
      map((value) => (typeof value === 'string' ? value : (value && typeof value === 'object' && 'full_name' in value) ? (value as any).full_name : '')),
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

    // Initialize disableCreateTaskBtn to true for edit mode
    if (this.dialogData && this.dialogData.task_id) {
      this.disableCreateTaskBtn = true;
    }

    // Initialize disposition fields as disabled
    this.dispositionFieldsEnabled = false;

    // Initialize filtered arrays
    this.filteredTaskStatusTypeArr = this.taskStatusTypeArr || [];
    this.filteredStatusArr = this.statusArr || [];
    
    // Apply initial filtering if form has existing values
    setTimeout(() => {
      this.filterTaskStatusOptions();
      this.filterDispositionStatusOptions();
    }, 100);

    // If editing existing task and stage is already selected, enable disposition fields
    if (this.dialogData && this.dialogData.stage) {
      this.dispositionFieldsEnabled = true;
    }

    // this.dispositionStatusFilteredOptions =
    //   this.dispositionStatusControl.valueChanges.pipe(
    //     startWith(''),
    //     map((value) =>
    //       typeof value === 'string' ? value : value.stage_status
    //     ),
    //     map((statusDisp) =>
    //       statusDisp
    //         ? this._filterDispositionStatus(statusDisp)
    //         : this.dispositionArr.slice()
    //     )
    //   );

    this.tasksForm.get('target_dtm')?.valueChanges.subscribe((value: string | null) => {
      if (value) {
        const targetDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        targetDate.setHours(0, 0, 0, 0);

        // Only disable target date for agents when it's set to current date
        if (this.loggedInUserRole === 'AGENT' && targetDate.getTime() === today.getTime()) {
          this.tasksForm.get('target_date')?.disable();
        } else {
          this.tasksForm.get('target_date')?.enable();
        }
      }
    });

    // Subscribe to form value changes
    this.tasksForm.valueChanges.subscribe(() => {
      if (!this.dialogTitle.includes('Create')) {
        // Recompute button state on any change instead of enabling unconditionally
        this.updateTaskButtonState();
      }
    });
  }
  onCountryChange(event: any) {
    let countryEvent = event.value;
    this.selectedCountry = countryEvent;
    console.log(this.selectedCountry);
    this.states = this.locationService.getStatesByCountry(countryEvent);
    this.cities = [];
    console.log(this.allUsersCopy);
    this.allUsersArr = this.allUsersCopy.filter(
      (usr) => usr.country == countryEvent
    );
    console.log(this.allUsersArr);
    this.assignedByFilteredOptions = this.assignedByControl.valueChanges.pipe(
      startWith(''),
      map((value) => (typeof value === 'string' ? value : (value && typeof value === 'object' && 'full_name' in value) ? (value as any).full_name : '')),
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

    // Update form value
    this.tasksForm.patchValue({ country: countryEvent });
  }

  onStateChange(event: any) {
    let stateEvent = event.value;
    this.selectedState = stateEvent;
    console.log(this.selectedState);
    this.cities = this.locationService.getCitiesByState(
      this.selectedCountry,
      this.selectedState
    );
    console.log(this.allUsersCopy);
    this.allUsersArr = this.allUsersCopy.filter(
      (usr) => usr.state == stateEvent
    );
    console.log(this.allUsersArr);
    this.assignedByFilteredOptions = this.assignedByControl.valueChanges.pipe(
      startWith(''),
      map((value) => (typeof value === 'string' ? value : (value && typeof value === 'object' && 'full_name' in value) ? (value as any).full_name : '')),
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

    // Update form value
    this.tasksForm.patchValue({ state: stateEvent });
  }
  // onCityChange(event: any) {
  //   console.log(event.value);
  //   let cityEvent = event.value;
  //   this.selectedCity = cityEvent;
  //   console.log('Selected City:', this.selectedCity);

  //   // Add any additional logic needed when the city is changed
  // }
  private _filterDispositionStatus(value: string) {
    console.log(value);
    return this.statusArr.filter((option: any) =>
      option.stage_status.toLowerCase().includes(value.toLowerCase())
    );
  }

  validateTargetDate(control: any) {
    const assignedDate = this.tasksForm.get('assigned_dtm').value;
    const targetDate = control.value;
    if (assignedDate && targetDate) {
      return assignedDate < targetDate ? null : { invalidTargetDate: true };
    }
    return null;
  }

  getUserSessionDetails() {
    let usrDetails: any = sessionStorage.getItem('userDetails');
    let parsedUsrDetails = JSON.parse(usrDetails);
    this.loggedInUserId = parsedUsrDetails.user_id;
    this.newTaskObj.app_user_id = this.loggedInUserId;
    this.editTaskObj.app_user_id = this.loggedInUserId;
    console.log('User session details loaded - loggedInUserId:', this.loggedInUserId);
  }

  getLeadSessionDetails() {
    let leadIdResponse: any = sessionStorage.getItem('leadByIdResp');
    let parsedLeadIdSession: any[] = JSON.parse(leadIdResponse);
    this.leadId = parsedLeadIdSession[0].lead_id;
    // console.log(this.leadId);
  }

  getAllUsers() {
    this.showProgressBar = true;
    this._sunshineApi
      .fetchAllUsers()
      .then((res: any) => {
        let resData = res.data[0];
        
        // Store deactivated users for warning messages
        this.deactivatedUsers = resData.filter((user: any) => user.status === 0);
        
        const filteredUsers = resData.filter(
          (user: any) => user.role_name !== 'SUPERUSER' && user.status !== 0
        );
        this.allUsersCopy = filteredUsers;
        this.allUsersArr = filteredUsers;
        // console.log(this.allUsersArr);
        sessionStorage.setItem(
          'taskAllUsers',
          JSON.stringify(this.allUsersArr)
        );
        // this.splitMultipleBanks();
        this.assignedByFilteredOptions =
          this.assignedByControl.valueChanges.pipe(
            startWith(''),
            map((value) =>
              typeof value === 'string' ? value : (value && typeof value === 'object' && 'full_name' in value) ? (value as any).full_name : ''
            ),
            map((fullName) =>
              fullName
                ? this._filterAssignedBy(fullName)
                : this.allUsersArr.slice()
            )
          );

        this.assignedToFilteredOptions =
          this.assignedToControl.valueChanges.pipe(
            startWith(''),
            map((value) =>
              typeof value === 'string' ? value : value.full_name
            ),
            map((fullName) =>
              fullName
                ? this._filterAssignedTo(fullName)
                : this.allUsersArr.slice()
            )
          );
        this.showProgressBar = false;
      })
      .catch((error) => {
        this.showProgressBar = false;
        console.error(error);
      });
  }

  splitMultipleBanks() {
    let leadIdResponse: any = sessionStorage.getItem('leadByIdResp');
    if (!leadIdResponse) {
      console.error('No lead id reponse session found in sessionStorage.');
      this.allUsersArr = this.allUsersCopy;
      return;
    }
    let parsedLeadIdSession: any[];
    let multipleBankList: string = '';
    let bankName: string = '';
    try {
      parsedLeadIdSession = JSON.parse(leadIdResponse);
      multipleBankList = parsedLeadIdSession[0].multiple_banks_list;
      bankName = parsedLeadIdSession[0].company_name;
      this.leadId = parsedLeadIdSession[0].lead_id;
      console.log(this.leadId);
    } catch (error) {
      console.error('Error parsing lead id session:', error);
      this.allUsersArr = this.allUsersCopy;
      return;
    }
    if (multipleBankList !== null) {
      let splitBanks = multipleBankList.split(',');
      // console.log(bankName, '>>>>', splitBanks);
      if (!splitBanks.includes(bankName)) {
        this.allUsersArr = this.allUsersCopy;
        return;
      }
    }

    let companySession = sessionStorage.getItem('company');
    if (!companySession) {
      console.error('No company session found in sessionStorage.');
      this.allUsersArr = this.allUsersCopy;
      return;
    }

    let parsedCompanySession: any[];
    try {
      parsedCompanySession = JSON.parse(companySession);
    } catch (error) {
      console.error('Error parsing company session:', error);
      this.allUsersArr = this.allUsersCopy;
      return;
    }

    let foundBank = parsedCompanySession.find(
      (bank: any) => bank.company_name === bankName
    );

    if (!foundBank) {
      console.error('Bank not found with name:', bankName);
      this.allUsersArr = this.allUsersCopy;
      return;
    }

    let companyIdsToSearch = [String(foundBank.company_id)];
    // console.log(this.allUsersArr);
    this.allUsersArr = this.allUsersArr.filter((user: any) => {
      if (user.company_id_list) {
        const companyIds = user.company_id_list
          .split(',')
          .map((id: string) => id.trim());
        return companyIds.some((id: string) => companyIdsToSearch.includes(id));
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
        const stringValue = typeof value === 'string' ? value : (value && typeof value === 'object' && 'full_name' in value) ? (value as any).full_name : '';
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
        console.log('Assigned To Filtered results:', filteredResults);
        return filteredResults;
      })
    );
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

  /**
   * Get users based on hierarchy for assigned to dropdown
   * Hierarchy: Admin → Senior Manager → Team Manager → Team Leader → Agent
   * Only shows subordinates, not peers
   */
  private getUsersForAssignedTo(loggedInUser: any): any[] {
    console.log('=== GET USERS FOR ASSIGNED TO DEBUG ===');
    console.log('loggedInUser:', loggedInUser);
    
    // Get users from sessionStorage instead of allUsersArr
    let taskUsr: any = sessionStorage.getItem('taskAllUsers');
    let allUsers: any[] = [];
    
    if (taskUsr) {
      allUsers = JSON.parse(taskUsr);
    }
    
    console.log('Total users available:', allUsers.length);

    if (!loggedInUser) {
      console.log('No logged-in user, returning all users');
      return allUsers;
    }

    const loggedInRole = loggedInUser.role_name;
    const loggedInUserId = loggedInUser.user_id;
    
    console.log('Logged-in user role:', loggedInRole, 'User ID:', loggedInUserId);

    let filteredUsers: any[] = [];

    switch (loggedInRole) {
      case 'ADMIN':
        // Admin can see all users
        console.log('Role: ADMIN - returning all users');
        filteredUsers = allUsers;
        break;

      case 'SENIOR MANAGER':
        // Senior Manager can see all users under them (Team Managers, Team Leaders, Agents)
        // but not other Senior Managers or Admins
        console.log('Role: SENIOR MANAGER - getting subordinates only');
        filteredUsers = this.getSubordinatesForSeniorManager(loggedInUserId, allUsers);
        break;

      case 'TEAM MANAGER':
        // Team Manager can see all users under them (Team Leaders, Agents)
        // but not other Team Managers, Senior Managers, or Admins
        console.log('Role: TEAM MANAGER - getting subordinates only');
        filteredUsers = this.getSubordinatesForTeamManager(loggedInUserId, allUsers);
        break;

      case 'TEAM LEAD':
      case 'TEAM LEADER':
        // Team Leader can only see agents under them (not other team leaders)
        console.log('Role: TEAM LEAD/TEAM LEADER - getting subordinates only');
        filteredUsers = this.getSubordinatesForTeamLeader(loggedInUserId, allUsers);
        break;

      case 'AGENT':
        // Agents cannot assign tasks to anyone (disabled field)
        console.log('Role: AGENT - returning empty array (field disabled)');
        filteredUsers = [];
        break;

      default:
        // Default to showing all users
        console.log('Role: DEFAULT - returning all users');
        filteredUsers = allUsers;
        break;
    }

    console.log('Filtered users count:', filteredUsers.length);
    console.log('Filtered users roles:', filteredUsers.map(u => u.role_name));
    console.log('=== END GET USERS FOR ASSIGNED TO DEBUG ===');
    
    return filteredUsers;
  }

  /**
   * Get subordinates for Senior Manager (excludes other Senior Managers and Admins)
   */
  private getSubordinatesForSeniorManager(seniorManagerId: number, allUsers?: any[]): any[] {
    console.log('=== GET SUBORDINATES FOR SENIOR MANAGER DEBUG ===');
    console.log('seniorManagerId:', seniorManagerId);
    
    const usersToSearch = allUsers || this.allUsersArr;
    
    // Get all users under this senior manager
    const allUnderManager = this.getAllUsersUnderManager(seniorManagerId, usersToSearch);
    console.log('All users under senior manager:', allUnderManager.length);
    console.log('Roles under senior manager:', allUnderManager.map(u => u.role_name));
    
    // Filter out Senior Managers and Admins (only show Team Managers, Team Leaders, Agents)
    const subordinates = allUnderManager.filter(user => 
      user.role_name !== 'SENIOR MANAGER' && 
      user.role_name !== 'ADMIN'
    );
    
    console.log('Filtered subordinates:', subordinates.length);
    console.log('Subordinate roles:', subordinates.map(u => u.role_name));
    console.log('=== END GET SUBORDINATES FOR SENIOR MANAGER DEBUG ===');
    
    return subordinates;
  }

  /**
   * Get subordinates for Team Manager (excludes other Team Managers, Senior Managers, and Admins)
   */
  private getSubordinatesForTeamManager(teamManagerId: number, allUsers?: any[]): any[] {
    const usersToSearch = allUsers || this.allUsersArr;
    
    // Get all users under this team manager
    const allUnderManager = this.getAllUsersUnderManager(teamManagerId, usersToSearch);
    
    // Filter out Team Managers, Senior Managers, and Admins (only show Team Leaders, Agents)
    const subordinates = allUnderManager.filter(user => 
      user.role_name !== 'TEAM MANAGER' && 
      user.role_name !== 'SENIOR MANAGER' && 
      user.role_name !== 'ADMIN'
    );
    
    return subordinates;
  }

  /**
   * Get all users under a specific manager (recursive)
   */
  private getAllUsersUnderManager(managerId: number, allUsers?: any[]): any[] {
    console.log('=== GET ALL USERS UNDER MANAGER DEBUG ===');
    console.log('managerId:', managerId);
    
    const usersToSearch = allUsers || this.allUsersArr;
    console.log('usersToSearch count:', usersToSearch.length);
    
    // Show sample of users to check reporting_to_id values
    console.log('Sample users with reporting_to_id:', usersToSearch.slice(0, 5).map(u => ({ 
      id: u.user_id, 
      name: u.full_name, 
      role: u.role_name, 
      reporting_to: u.reporting_to_id 
    })));
    
    const directReports = usersToSearch.filter(user => user.reporting_to_id === managerId);
    console.log('Direct reports found:', directReports.length);
    console.log('Direct reports:', directReports.map(u => ({ 
      id: u.user_id, 
      name: u.full_name, 
      role: u.role_name, 
      reporting_to: u.reporting_to_id 
    })));
    
    let allUnderManager = [...directReports];

    // Recursively get users under each direct report
    directReports.forEach(report => {
      console.log(`Getting users under ${report.full_name} (ID: ${report.user_id})`);
      const subReports = this.getAllUsersUnderManager(report.user_id, usersToSearch);
      console.log(`Users under ${report.full_name}:`, subReports.length);
      allUnderManager = [...allUnderManager, ...subReports];
    });

    console.log('Total users under manager:', allUnderManager.length);
    console.log('All users under manager:', allUnderManager.map(u => ({ 
      id: u.user_id, 
      name: u.full_name, 
      role: u.role_name, 
      reporting_to: u.reporting_to_id 
    })));
    console.log('=== END GET ALL USERS UNDER MANAGER DEBUG ===');

    return allUnderManager;
  }

  /**
   * Get subordinates for Team Leader (excludes other Team Leaders, Team Managers, Senior Managers, and Admins)
   */
  private getSubordinatesForTeamLeader(teamLeaderId: number, allUsers?: any[]): any[] {
    const usersToSearch = allUsers || this.allUsersArr;
    
    // Get all users under this team leader
    const allUnderManager = this.getAllUsersUnderManager(teamLeaderId, usersToSearch);
    
    // Filter out Team Leaders, Team Managers, Senior Managers, and Admins (only show Agents)
    const subordinates = allUnderManager.filter(user => 
      user.role_name !== 'TEAM LEAD' && 
      user.role_name !== 'TEAM LEADER' && 
      user.role_name !== 'TEAM MANAGER' && 
      user.role_name !== 'SENIOR MANAGER' && 
      user.role_name !== 'ADMIN'
    );
    
    return subordinates;
  }

  /**
   * Get agents under a specific team leader (only agents, not other team leaders)
   * @deprecated - Use getSubordinatesForTeamLeader for consistent hierarchy filtering
   */
  private getAgentsUnderTeamLeader(teamLeaderId: number, allUsers?: any[]): any[] {
    const usersToSearch = allUsers || this.allUsersArr;
    const teamLeader = usersToSearch.find(user => user.user_id === teamLeaderId);
    
    if (!teamLeader) {
      return [];
    }

    // Get only agents directly reporting to this team leader
    const agentsUnderTeamLeader = usersToSearch.filter(user => 
      user.reporting_to_id === teamLeaderId && 
      user.role_name === 'AGENT'
    );
    
    return agentsUnderTeamLeader;
  }

  /**
   * Get teammates for Team Leader (other Team Leaders and Agents in the same team)
   * @deprecated - Use getAgentsUnderTeamLeader for showing only subordinates
   */
  private getTeammates(teamLeaderId: number, allUsers?: any[]): any[] {
    
    const usersToSearch = allUsers || this.allUsersArr;
    const teamLeader = usersToSearch.find(user => user.user_id === teamLeaderId);

    
    if (!teamLeader) {
      return [];
    }

    // Get the team manager of this team leader
    const teamManager = usersToSearch.find(user => user.user_id === teamLeader.reporting_to_id);

    
    if (!teamManager) {

      return [];
    }

    // Get all users under the same team manager
    const teammates = this.getAllUsersUnderManager(teamManager.user_id, usersToSearch);

    return teammates;
  }

  /**
   * Get peers for Agent (other Agents reporting to the same Team Leader)
   */
  private getPeers(agentId: number, allUsers?: any[]): any[] {

    
    const usersToSearch = allUsers || this.allUsersArr;
    const agent = usersToSearch.find(user => user.user_id === agentId);

    
    if (!agent) {

      return [];
    }

    // Get the team leader of this agent
    const teamLeader = usersToSearch.find(user => user.user_id === agent.reporting_to_id);

    
    if (!teamLeader) {

      return [];
    }

    // Get all agents under the same team leader
    const peers = usersToSearch.filter(user => 
      user.reporting_to_id === teamLeader.user_id && 
      (user.role_name === 'AGENT' || user.role_name === 'TEAM LEADER' || user.role_name === 'TEAM LEAD')
    );
    

    return peers;
  }

  /**
   * Check if assigned to field should be disabled based on logged-in user's role
   */
  isAssignedToFieldDisabled(): boolean {
    try {
      const userDetails = sessionStorage.getItem('userDetails');
      if (userDetails) {
        const loggedInUser = JSON.parse(userDetails);
        return loggedInUser.role_name === 'AGENT';
      }
    } catch (error) {
      console.error('Error parsing logged-in user details:', error);
    }
    return false;
  }


  /**
   * Update assigned to dropdown options based on hierarchy
   */
  private updateAssignedToOptions(assignedByUser: any) {
    console.log('=== UPDATE ASSIGNED TO OPTIONS DEBUG ===');
    console.log('assignedByUser parameter:', assignedByUser);
    
    // Check if assigned to field should be disabled for agents
    if (this.isAssignedToFieldDisabled()) {
      this.assignedToControl.disable();
      this.assignedToFilteredOptions = of([]);
      return;
    } else {
      this.assignedToControl.enable();
    }
    
    // Get logged-in user details for hierarchy filtering
    let loggedInUser: any = null;
    try {
      const userDetails = sessionStorage.getItem('userDetails');
      console.log('Raw userDetails from sessionStorage:', userDetails);
      
      if (userDetails && userDetails !== 'null' && userDetails !== 'undefined') {
        loggedInUser = JSON.parse(userDetails);
        console.log('Parsed loggedInUser:', loggedInUser);
      } else {
        console.log('userDetails is null, undefined, or empty');
      }
    } catch (error) {
      console.error('Error parsing logged-in user details:', error);
      console.log('Raw userDetails that caused error:', sessionStorage.getItem('userDetails'));
    }
    
    // Get filtered users based on logged-in user's hierarchy (not assignedByUser)
    const filteredUsers = this.getUsersForAssignedTo(loggedInUser);
    console.log('Final filteredUsers for dropdown:', filteredUsers.length);
    console.log('Final filteredUsers names:', filteredUsers.map(u => u.full_name));
    
    // Update the assigned to filtered options
    this.assignedToFilteredOptions = this.assignedToControl.valueChanges.pipe(
      startWith(''),
      map((value) => (typeof value === 'string' ? value : (value && typeof value === 'object' && 'full_name' in value) ? (value as any).full_name : '')),
      map((fullName) => {
        const result = fullName ? this._filterAssignedToFromList(fullName, filteredUsers) : filteredUsers.slice();
        console.log('Dropdown filtering result for:', fullName, '->', result.length, 'users');
        return result;
      })
    );

    // Clear the current assigned to selection if it's not in the filtered list
    const currentAssignedTo = this.tasksForm.get('assigned_to_full_name')?.value;

    
    if (currentAssignedTo) {
      const isCurrentUserInFilteredList = filteredUsers.some(user => user.full_name === currentAssignedTo);
      
      if (!isCurrentUserInFilteredList) {
        this.tasksForm.patchValue({
          assigned_to_full_name: ''
        });
        this.assignedToControl.setValue('');
      }
    }
    
    console.log('=== END UPDATE ASSIGNED TO OPTIONS DEBUG ===');
  }

  /**
   * Filter assigned to users from a specific list
   */
  private _filterAssignedToFromList(fullName: string, userList: any[]): any[] {
    console.log('=== FILTER ASSIGNED TO FROM LIST DEBUG ===');
    console.log('fullName:', fullName);
    console.log('userList length:', userList.length);
    console.log('userList names:', userList.map(u => u.full_name));
    
    const filterValue = fullName.toLowerCase();
    const result = userList.filter((option) =>
      option.full_name.toLowerCase().includes(filterValue)
    );
    
    console.log('filterValue:', filterValue);
    console.log('filtered result:', result.length);
    console.log('filtered names:', result.map(u => u.full_name));
    console.log('=== END FILTER ASSIGNED TO FROM LIST DEBUG ===');
    
    return result;
  }
  receiveInjectedData() {
    this.dialogTitle = this.data.dialogTitle;
    this.dialogText = this.data.dialogText;
    this.dialogData = this.data.dialogData;



    // Initialize target date change tracking
    this.targetDateChanged = false;

    // Ensure leadId is set for both new and existing tasks
    if (this.dialogData && this.dialogData.lead_id) {
      this.leadId = this.dialogData.lead_id;
    } else if (this.data && this.data.leadId) {
      this.leadId = this.data.leadId;
    }

    // Set company_id from data or session storage
    if (this.data && this.data.company_id) {
      this.companyId = this.data.company_id;

    } else {
      // Try to get company_id from session storage
      try {
        const leadIdResponse = sessionStorage.getItem('leadByIdResp');
        if (leadIdResponse) {
          const parsedLeadIdSession = JSON.parse(leadIdResponse);
          if (parsedLeadIdSession[0] && parsedLeadIdSession[0].company_id) {
            this.companyId = parsedLeadIdSession[0].company_id;

          } else {
            console.warn('No company_id found in leadByIdResp session');
          }
        } else {
          console.warn('No leadByIdResp session found');
        }
      } catch (e) {
        console.error('Error getting company_id from session:', e);
      }
    }

    // If this is an existing task, ensure we check for appropriate details based on type
    if (this.dialogData && this.dialogData.task_id) {
      // Only check for details on initial load, but don't show notifications yet
      // The contactableChanged flag will be used to determine when to show notifications
      if (this.dialogData.stage === 'NON CONTACTED') {
        // Check web tracing status for non-contacted tasks
        this.checkWebTracingDetailsQuietly(this.leadId);
      } else if (this.dialogData.stage === 'CONTACTED') {
        // Check all required details for contacted tasks
        this.checkContactedDetailsQuietly(this.leadId);
      }
    }

    // Initialize contactableChanged flag to false (no changes yet)
    this.contactableChanged = false;

    this.newTaskObj.lead_id = this.leadId;
    this.createTaskEmailNotif.lead_id = this.leadId;

    console.log('Lead ID set to:', this.leadId);

    // // // console.log('new-task-obj::', this.newTaskObj);
    // // // console.log(this.dialogData.task_type_name);
    // console.log(this.dialogTitle);
    // console.log(this.dialogData);
    if (this.dialogData != undefined) {
      this.patchStage(this.dialogData.stage_status);
      this.patchStageStatusName(this.dialogData.stage_status_name);
      this.patchStageStatusCode(this.dialogData.stage_status_code);
      this.tasksForm.patchValue({
        task_id: this.dialogData.task_id,
        assigned_by_full_name: this.dialogData.assigned_by_full_name,
        assigned_to_full_name: this.dialogData.assigned_to_full_name,
        stage: this.dialogData.stage,
        stage_status: this.dialogData.stage_status,
        stage_status_name: this.dialogData.stage_status_name,
        stage_status_code: this.dialogData.stage_status_code,
        assigned_dtm: this.dialogData.assigned_dtm,
        target_dtm: this.dialogData.target_dtm,
        task_type_name: this.dialogData.task_type_name,
        task_status_type_name: this.dialogData.task_status_type_name,
        mode_of_contact: this.dialogData.mode_of_contact,
      });

      // Enable disposition fields if stage is already selected
      if (this.dialogData.stage) {
        this.dispositionFieldsEnabled = true;
      }
      this.taskType = this.dialogData.task_type_name;

      this.editTaskObj.lead_id = this.data.dialogData.lead_id;
      this.editTaskObj.task_id = this.data.dialogData.task_id;
      this.editTaskObj.disposition_code_id =
        this.data.dialogData.disposition_code_id;
      this.editTaskObj.task_type_id = this.data.dialogData.task_type_id;
      this.editTaskObj.task_status_type_id =
        this.data.dialogData.task_status_type_id;
      this.editTaskObj.assigned_by = this.data.dialogData.assigned_by;
      this.editTaskObj.assigned_dtm =
        this.data.dialogData.assigned_dtm?.split('T')[0];
      this.editTaskObj.assigned_to = this.data.dialogData.assigned_to;
      this.editTaskObj.target_dtm =
        this.data.dialogData.target_dtm?.split('T')[0];
      this.editTaskObj.document_url = this.data.dialogData.document_url;
      this.editTaskObj.mode_of_contact = this.data.dialogData.mode_of_contact;

      // // console.log('edit-task-obj-dialog-ngoninit::', this.editTaskObj);
      this.getNotesByTaskId(this.data.dialogData.task_id);
      if (this.dialogData.assigned_by_full_name) {
        let ss: any = sessionStorage.getItem('taskAllUsers');
        let pss = JSON.parse(ss);
        const user = pss.find(
          (user: any) =>
            user.full_name === this.dialogData.assigned_by_full_name
        );
        console.log(user);

        // If the previously assigned user is deactivated, show warning
        if (user && user.status === 0) {
          this.openSnackBar('Warning: Assigned By user is deactivated');
        }

        if (user) {
          const { user_id, full_name, email_address } = user;

          this.newTaskObj.assigned_by = user_id;
          this.editTaskObj.assigned_by = user_id;
          this.createTaskEmailNotif = {
            ...this.createTaskEmailNotif,
            assigned_by_full_name: full_name,
            assigned_by_email: email_address,
            assigned_by_id: user_id,
          };
          console.log('assigned-by:::ss::', this.createTaskEmailNotif);

          this.tasksForm.patchValue({
            assigned_by_full_name: full_name,
          });

          // Update assigned to dropdown based on logged-in user's hierarchy
          this.updateAssignedToOptions(null);
        }
      }

      if (this.dialogData.assigned_to_full_name) {
        let ss: any = sessionStorage.getItem('taskAllUsers');
        let pss = JSON.parse(ss);
        const user = pss.find(
          (user: any) =>
            user.full_name === this.dialogData.assigned_to_full_name
        );
        console.log(user);

        // If the previously assigned user is deactivated, show warning
        if (user && user.status === 0) {
          this.openSnackBar('Warning: Assigned To user is deactivated');
        }

        if (user) {
          const { user_id, full_name, email_address } = user;

          this.newTaskObj.assigned_to = user_id;
          this.editTaskObj.assigned_to = user_id;
          this.createTaskEmailNotif = {
            ...this.createTaskEmailNotif,
            assigned_to_full_name: full_name,
            assigned_to_email: email_address,
            assigned_to_id: user_id,
          };
          console.log('assigned-to:::ss::', this.createTaskEmailNotif);

          this.tasksForm.patchValue({ assigned_to_full_name: full_name });
        }
      }
      this.createTaskEmailNotif.disposition_stage =
        this.dialogData.stage_status;
      this.createTaskEmailNotif.disposition_status =
        this.dialogData.stage_status_name;
      this.createTaskEmailNotif.disposition_code =
        this.dialogData.stage_status_code;
      this.createTaskEmailNotif.task_type_name = this.dialogData.task_type_name;
      this.createTaskEmailNotif.task_status_type_name =
        this.dialogData.task_status_type_name;
      this.createTaskEmailNotif.mode_of_contact =
        this.dialogData.mode_of_contact;

      this.createTaskEmailNotif = {
        ...this.createTaskEmailNotif,
        assigned_by_full_name: this.dialogData.assigned_by_full_name,
        // assigned_by_email: this.dialogData.assigned_by_email,
        assigned_by_id: this.dialogData.assigned_by,
        assigned_to_full_name: this.dialogData.assigned_to_full_name,
        // assigned_to_email: this.dialogData.assigned_to_email,
        assigned_to_id: this.dialogData.assigned_to,
      };
      this.createTaskEmailNotif.assigned_dtm =
        this.dialogData.assigned_dtm?.split('T')[0];
      this.createTaskEmailNotif.target_dtm =
        this.dialogData.target_dtm?.split('T')[0];
      this.createTaskEmailNotif.document_url =
        this.data.dialogData.document_url;
      // console.log(
      //   'his.createTaskEmailNotif:::::>>>>',
      //   this.createTaskEmailNotif
      // );

      // Populate country and state for field visit tasks
      if (this.dialogData.task_type_name === 'FIELD VISIT' && this.dialogData.assigned_to_full_name) {
        this.populateFieldVisitLocation();
      }

      // this.dispositionStatusFilteredOptions =
      //   this.dispositionStatusControl.valueChanges.pipe(
      //     startWith(''),
      //     map((value) =>
      //       typeof value === 'string' ? value : value.stage_status
      //     ),
      //     map((statusDisp) =>
      //       statusDisp
      //         ? this._filterDispositionStatus(statusDisp)
      //         : this.dispositionArr.slice()
      //     )
      //   );
    } else {
      //! for create new task, if logged in user is agent then patch assigned by and assigned to with agent(logged in user)
      let usrDetails: any = sessionStorage.getItem('userDetails');
      let parsedUsrDetails = JSON.parse(usrDetails);
      this.loggedInUserRole = parsedUsrDetails.role_name;
      if (this.loggedInUserRole === 'AGENT') {
        console.log('agent-create-task::::', parsedUsrDetails);
        this.tasksForm.patchValue({
          assigned_by_full_name: parsedUsrDetails.full_name,
          assigned_to_full_name: parsedUsrDetails.full_name,
        });
        console.log('agent-assigned-by-fn-call');
        this.assignedByHandler(this.tasksForm.value.assigned_by_full_name);
        console.log('agent-assigned-to-fn-call');
        this.assignedToHandler(this.tasksForm.value.assigned_to_full_name);
      } else {
        console.log('not-agent-create-task::::', parsedUsrDetails);
        this.tasksForm.patchValue({
          assigned_by_full_name: parsedUsrDetails.full_name,
        });
        console.log('not-agent-assigned-by-fn-call');
        this.assignedByHandler(this.tasksForm.value.assigned_by_full_name);

        // The assignedByHandler will handle hierarchy filtering
        // No need for additional filtering here as it's handled in assignedByHandler

        // Debug output for the filtered options
        // console.log(this.assignedToControl);
      }
    }
    if (this.tasksForm.value.task_type_name == 'PRELIMINARY CHECKS') {
      // this.hideContactAddress = true;
      this.nonPrelimTask = true;
    } else {
      // this.hideContactAddress = false;
      this.nonPrelimTask = false;
    }
    this.tasksForm.value.stage_status === 'RIGHT PARTY CONTACT'
      ? this.tasksForm
        .get('mode_of_contact')
        ?.setValidators(Validators.required)
      : this.tasksForm.get('mode_of_contact')?.clearValidators();
  }

  downloadDocFromStorage(docUrl: string) {
    if (!docUrl) {
      this.openSnackBar('No document URL available');
      return;
    }

    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = docUrl;
    link.style.display = 'none';
    
    // Add to document, click it, and remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  getAllDispositions() {
    console.log('Fetching dispositions...');
    this.isLoadingContactableData = true;
    
    this._sunshineApi
      .fetchDispositionTypes()
      .then((res: any) => {
        console.log('Dispositions API response:', res);
        let resData = res.data[0];
        this.dispositionArr = resData;
        console.log('Dispositions loaded, count:', this.dispositionArr.length);

        if (this.dispositionArr.length > 0) {
          this.receiveInjectedData();
        } else {
          console.warn('No disposition data found in API response');
          // Set fallback data to prevent dropdown from being empty
          this.setFallbackContactableData();
        }

        // Set stageArr with unique stage values - improved logic
        this.populateStageArr(resData);
        console.log('Stage array populated:', this.stageArr);
        this.isLoadingContactableData = false;
        
        // Ensure dropdown is ready after data is loaded
        this.ensureContactableDropdownReady();
      })
      .catch((error) => {
        console.error('Error fetching dispositions:', error);
        this.isLoadingContactableData = false;
        // Set fallback data to prevent dropdown from being empty
        this.setFallbackContactableData();
        // Automatically retry after a short delay
        setTimeout(() => {
          if (this.stageArr.length === 0) {
            console.log('Auto-retrying disposition data load...');
            this.getAllDispositions();
          }
        }, 2000);
      });

    // Initialize assigned to dropdown based on logged-in user's hierarchy
    this.updateAssignedToOptions(null);
  }

  // New method to populate stageArr with better error handling
  private populateStageArr(resData: any[]) {
    try {
      if (!resData || !Array.isArray(resData) || resData.length === 0) {
        console.warn('Invalid or empty disposition data received');
        this.setFallbackContactableData();
        return;
      }

      // Extract unique stages with proper error handling
      const stageMap = new Map();
      resData.forEach((item: any) => {
        if (item && item.stage && typeof item.stage === 'string') {
          stageMap.set(item.stage, item);
        }
      });

      this.stageArr = Array.from(stageMap.values());
      
      // Ensure we have at least the basic options
      if (this.stageArr.length === 0) {
        console.warn('No valid stages found in disposition data');
        this.setFallbackContactableData();
      }
    } catch (error) {
      console.error('Error populating stage array:', error);
      this.setFallbackContactableData();
    }
  }

  // New method to set fallback data when API fails
  private setFallbackContactableData() {
    console.log('Setting fallback contactable data');
    this.stageArr = [
      { stage: 'CONTACTED' },
      { stage: 'NON CONTACTED' }
    ];
  }

  // Method to retry loading contactable data (simplified)
  retryLoadContactableData(event: Event) {
    event.stopPropagation(); // Prevent dropdown from closing
    console.log('Retrying to load contactable data...');
    this.getAllDispositions();
  }

  // Method to ensure contactable dropdown is ready
  private ensureContactableDropdownReady() {
    // If stageArr is empty after a reasonable time, set fallback data
    setTimeout(() => {
      if (this.stageArr.length === 0 && !this.isLoadingContactableData) {
        console.log('Contactable dropdown data not loaded, setting fallback');
        this.setFallbackContactableData();
      }
    }, 1500); // Reduced wait time for faster response
  }

  // patchStage(stage: any) {
  //   console.log(stage);
  //   let selectedStage = stage;
  //   console.log(this.dispositionArr);
  //   this.stageNameArr = this.dispositionArr.filter((status: any) => {
  //     // console.log(status);
  //     if (status.stage_status == selectedStage) {
  //       // console.log(this.statusArr);
  //       return status.stage_status;
  //     }
  //   });
  // }
  patchStage(stageStatus: any) {
    console.log(stageStatus);

    // Find the stage that corresponds to the given stageStatus
    const selectedStage = this.dispositionArr.find(
      (status: any) => status.stage_status === stageStatus
    )?.stage;

    if (!selectedStage) {
      console.warn(`Stage not found for : ${stageStatus}`);
      this.stageNameArr = [];
      return;
    }

    console.log(this.dispositionArr);

    // Filter and ensure unique stage statuses for the identified stage
    const uniqueStatuses = new Set();
    this.stageNameArr = this.dispositionArr.filter((status: any) => {
      if (
        status.stage === selectedStage &&
        !uniqueStatuses.has(status.stage_status)
      ) {
        uniqueStatuses.add(status.stage_status);
        return true;
      }
      return false;
    });

    console.log('Filtered stageNameArr:', this.stageNameArr);
  }

  // patchStageStatusName(stage: any) {
  //   console.log(stage);
  //   let selectedStage = stage;
  //   // //// // console.log(stage)
  //   // this.statusArr = this.dispositionArr.filter((status: any) => {
  //   //   // //// // console.log(status);
  //   //   if (status.stage == selectedStage) {
  //   //     // //// // console.log(this.statusArr);
  //   //     return status.stage_status_name;
  //   //   }
  //   // });

  //   this.statusArr = this.dispositionArr.filter((status: any) => {
  //     status.stage_status === selectedStage;
  //     return status.stage_status_name;
  //   });
  //   console.log(this.statusArr);

  patchStageStatusName(stage: any) {
    console.log(stage);
    let selectedStageStatus = this.dispositionArr.find(
      (status: any) => status.stage_status_name === stage
    )?.stage_status;

    // let selectedStageStatus = stage;

    this.statusArr = this.dispositionArr.filter((status: any) => {
      if (status.stage_status === selectedStageStatus) {
        return status.stage_status_name;
      }
    });
    this.filteredStatusArr = [...this.statusArr];
  }

  patchStageStatusCode(stats: any) {
    console.log(stats);

    this.dispCodeArr = this.dispositionArr.filter((status: any) => {
      if (status.stage_status_code == stats) {
        return status.stage_status_code;
      }
    });
  }
  validateEnteriesByTaskId(taskId: number, stage: string): Promise<any> {
    this.showProgressBar = true;
    let tasksCheckBody = {
      task_id: taskId,
      stage: stage,
    };

    return new Promise((resolve, reject) => {
      this._sunshineApi.checkEnteriesByTaskId(tasksCheckBody)
        .then((res: any) => {
          this.showProgressBar = false;
          resolve(res.data[0]['@occ']);
        })
        .catch((error) => {
          this.showProgressBar = false;
          this.openSnackBar(error.response?.data?.message || 'Error checking entries');
          reject(error);
        });
    });
  }
  // contactableHandler(event: any, taskId: number) {
  //   let selectedStage = event.value;
  //   // let contactChecks: any = { contact_flag: 0, visa_flag: 0, tracing_flag: 0 };
  //   // let nonContactChecks: any = { web_trace_flag: 0 };
  //   // this.isContactable = selectedStage;
  //   if (taskId && selectedStage) {
  //     let taskIdCheck: number = this.validateEnteriesByTaskId(
  //       this.dialogData.task_id,
  //       selectedStage
  //     );
  //     if (this.taskType !== 'FIELD VISIT') {
  //       if (selectedStage === 'CONTACTED') {
  //         // sessionStorage.setItem('c_check', JSON.stringify(contactChecks));
  //         if (
  //           taskIdCheck == null ||
  //           (taskIdCheck == undefined && taskIdCheck !== 3)
  //         ) {
  //           console.log('CONTACTED', taskIdCheck, typeof taskIdCheck);
  //           this.openSnackBar(
  //             `Add / Update of Contact, Visa, Tracing Details are mandatory`
  //           );
  //           this.disableCreateTaskBtn = true;
  //         }
  //       } else {
  //         if (
  //           taskIdCheck == null ||
  //           (taskIdCheck == undefined && taskIdCheck !== 1)
  //         ) {
  //           // sessionStorage.setItem('nc_check', JSON.stringify(nonContactChecks));
  //           console.log('NON-CONTACTED', taskIdCheck, typeof taskIdCheck);
  //           this.openSnackBar(
  //             `Add / Update of Web Tracing Details are mandatory`
  //           );
  //           this.disableCreateTaskBtn = true;
  //         }
  //       }
  //     }
  //   }

  //   // Filter dispositionArr based on selectedStage and remove duplicates by stage_status
  //   this.stageNameArr = [
  //     ...new Map(
  //       this.dispositionArr
  //         .filter((item: any) => item.stage === selectedStage)
  //         .map((item: any) => [item['stage_status'], item])
  //     ).values(),
  //   ];

  //   this.createTaskEmailNotif.contactable = selectedStage;
  // }

  contactableHandler(event: any) {
    if (!event || !event.value) {
      console.warn('Invalid event or value in contactableHandler');
      return;
    }

    const selectedStage = event.value;
    console.log('Selected stage:', selectedStage);
    
    // Mark form as dirty to track changes
    this.tasksForm.markAsDirty();
    
    // Enable disposition fields only when Contactable/Non-contactable is selected
    if (selectedStage && selectedStage.trim() !== '') {
      this.dispositionFieldsEnabled = true;
    } else {
      this.dispositionFieldsEnabled = false;
    }
    
    // Reset details status when stage changes
    this.detailsStatus = {
      contact: false,
      visa: false,
      tracing: false,
      webTracing: false,
      email: false,
      address: false,
      phone: false
    };

    // Check required details based on stage
    if (selectedStage === 'CONTACTED') {
      this.checkContactedDetails(this.leadId);
    } else if (selectedStage === 'NON CONTACTED') {
      this.checkWebTracingDetails(this.leadId);
    }

    // Filter dispositionArr based on selectedStage with error handling
    try {
      if (this.dispositionArr && Array.isArray(this.dispositionArr)) {
        this.stageNameArr = [
          ...new Map(
            this.dispositionArr
              .filter((item: any) => item && item.stage === selectedStage)
              .map((item: any) => [item['stage_status'], item])
          ).values(),
        ];
      } else {
        console.warn('dispositionArr is not available or not an array');
        this.stageNameArr = [];
      }
    } catch (error) {
      console.error('Error filtering dispositionArr:', error);
      this.stageNameArr = [];
    }

    // Update notification object
    this.createTaskEmailNotif.contactable = selectedStage;
    
    // Disable update button until all disposition fields are filled
    this.disableCreateTaskBtn = true;
    
    // Clear stage_status_name and stage_status_code when stage changes
    this.tasksForm.patchValue({
      stage_status_name: null,
      stage_status_code: null
    });

    // Clear disposition arrays when stage changes
    this.statusArr = [];
    this.dispCodeArr = [];
    this.filteredStatusArr = [];

    // Update button state
    this.updateTaskButtonStateByDispositionFields();
  }

  // Add a method to check which specific details already exist for a lead
  checkExistingDetails(leadId: number) {
    this.showProgressBar = true;

    // Reset status
    this.detailsStatus = {
      contact: false,
      visa: false,
      tracing: false,
      webTracing: false,
      email: false,
      address: false,
      phone: false
    };

    let allChecksCompleted = 0;
    const totalChecks = 7; // contact, visa, tracing, webTracing, email, address, phone

const checkAllCompleted = () => {
  allChecksCompleted++;
  if (allChecksCompleted === totalChecks) {
    console.log('All checks completed, final detailsStatus:', JSON.stringify(this.detailsStatus));
    this.showProgressBar = false;
    
    // Call updateTaskButtonState to handle the button state and messages
    this.updateTaskButtonState();
  }
};


    // Check for contact details
    const contactParams = {
      lead_id: leadId,
      display_latest: 1
    };

    this._sunshineApi.fetchLeadContacts(contactParams)
      .then((res: any) => {
        const contactData = res.data[0];
        console.log('Contact Data Response:', contactData);
        this.detailsStatus.contact = (contactData && contactData.length > 0);
        console.log('Contact Status Updated:', this.detailsStatus.contact);
        checkAllCompleted();
      })
      .catch((error: any) => {
        console.error('Error checking contact details:', error);
        checkAllCompleted();
      });

    // Check for visa details
    const visaParams = {
      lead_id: leadId
    };

    this._sunshineApi.getVisaCheckByLead(visaParams)
      .then((res: any) => {
        const visaData = res.data[0];
        console.log('Visa Data Response:', visaData);
        this.detailsStatus.visa = (visaData && visaData.length > 0);
        console.log('Visa Status Updated:', this.detailsStatus.visa);
        checkAllCompleted();
      })
      .catch((error: any) => {
        console.error('Error checking visa details:', error);
        checkAllCompleted();
      });

    // Check for tracing details
    const tracingParams = {
      lead_id: leadId
    };

    this._sunshineApi.fetchTracingDetails(tracingParams)
      .then((res: any) => {
        const tracingData = res.data[0];
        console.log('Tracing Data Response:', tracingData);

        // More flexible check for data
        let hasTracingData = false;
        if (Array.isArray(tracingData) && tracingData.length > 0) {
          hasTracingData = true;
        } else if (tracingData && typeof tracingData === 'object' && Object.keys(tracingData).length > 0) {
          hasTracingData = true;
        } else if (tracingData && typeof tracingData !== 'object') {
          hasTracingData = true;
        }

        this.detailsStatus.tracing = hasTracingData;
        console.log('Tracing Status Updated:', this.detailsStatus.tracing);
        checkAllCompleted();
      })
      .catch((error: any) => {
        console.error('Error checking tracing details:', error);
        checkAllCompleted();
      });

    // Check for web tracing details
    const webTracingParams = {
      lead_id: leadId
    };

    this._sunshineApi.fetchWebTracingDetails(webTracingParams)
      .then((res: any) => {
        const webTracingData = res.data[0];
        console.log('Web Tracing API Response:', res);
        console.log('Web Tracing Data Structure:', webTracingData);

        // More flexible check for data presence
        let hasWebTracingData = false;

        if (Array.isArray(webTracingData) && webTracingData.length > 0) {
          // If it's an array with items
          hasWebTracingData = true;
        } else if (webTracingData && typeof webTracingData === 'object' && Object.keys(webTracingData).length > 0) {
          // If it's a non-empty object
          hasWebTracingData = true;
        } else if (webTracingData && typeof webTracingData !== 'object') {
          // If it's a scalar value (like a string or number)
          hasWebTracingData = true;
        }

        // Update the status
        this.detailsStatus.webTracing = hasWebTracingData;
        console.log('Web Tracing Status Updated:', this.detailsStatus.webTracing);
        checkAllCompleted();
      })
      .catch((error: any) => {
        console.error('Error checking web tracing details:', error);
        checkAllCompleted();
      });

    // Check for email details (from contact details)
    this._sunshineApi.fetchLeadContacts(contactParams)
      .then((res: any) => {
        const contactData = res.data[0];
        // Check if any contact has a valid email
        this.detailsStatus.email = contactData && contactData.length > 0 && 
          contactData.some((contact: any) => contact.email && contact.email.trim() !== '');
        checkAllCompleted();
      })
      .catch((error: any) => {
        console.error('Error checking email details:', error);
        checkAllCompleted();
      });

    // Check for phone details (from contact details)
    this._sunshineApi.fetchLeadContacts(contactParams)
      .then((res: any) => {
        const contactData = res.data[0];
        // Check if any contact has a valid phone number
        this.detailsStatus.phone = contactData && contactData.length > 0 && 
          contactData.some((contact: any) => contact.phone && contact.phone.trim() !== '');
        checkAllCompleted();
      })
      .catch((error: any) => {
        console.error('Error checking phone details:', error);
        checkAllCompleted();
      });

    // Check for address details
    const addressParams = {
      lead_id: leadId
    };

    this._sunshineApi.fetchLeadAddress(addressParams)
      .then((res: any) => {
        const addressData = res.data[0];
        this.detailsStatus.address = (addressData && addressData.length > 0);
        checkAllCompleted();
      })
      .catch((error: any) => {
        console.error('Error checking address details:', error);
        checkAllCompleted();
      });
  }

  // Add method to validate mode of contact requirements
  validateModeOfContactRequirements(modeOfContact: string): { isValid: boolean; missingField: string } {
    if (!modeOfContact) {
      return { isValid: false, missingField: 'Mode of Contact' };
    }

    switch (modeOfContact) {
      case 'CALL':
        return { 
          isValid: this.detailsStatus.contact && this.detailsStatus.phone, 
          missingField: this.detailsStatus.contact ? 'Phone Number' : 'Contact Details' 
        };
      case 'MESSAGE':
        return { 
          isValid: this.detailsStatus.contact && this.detailsStatus.phone, 
          missingField: this.detailsStatus.contact ? 'Phone Number' : 'Contact Details' 
        };
      case 'EMAIL':
        return { 
          isValid: this.detailsStatus.email, 
          missingField: 'Email ID' 
        };
      case 'VISIT':
        return { 
          isValid: this.detailsStatus.address, 
          missingField: 'Address' 
        };
      default:
        return { isValid: true, missingField: '' };
    }
  }

  // Add method to get required fields for a specific mode
  getRequiredFieldsForMode(modeOfContact: string): string[] {
    switch (modeOfContact) {
      case 'CALL':
        return ['contact', 'phone'];
      case 'MESSAGE':
        return ['contact', 'phone'];
      case 'EMAIL':
        return ['email'];
      case 'VISIT':
        return ['address'];
      default:
        return [];
    }
  }

  updateTaskButtonState() {
    const stage = this.tasksForm.get('stage')?.value;
    const modeOfContact = this.tasksForm.get('mode_of_contact')?.value;
    const isFieldVisit = this.taskType === 'FIELD VISIT';
    const isCreateTaskMode = this.dialogTitle === 'Create New Task';
    const actionWord = isCreateTaskMode ? 'create' : 'update';

    // For DOCUMENT UPLOAD, require document_url
    if (this.taskType === 'DOCUMENT UPLOAD') {
      if (!this.tasksForm.value.document_url) {
        this.disableCreateTaskBtn = true;
        return;
      }
    }

    // Only apply detailed checks if in create mode
    if (isCreateTaskMode) {
      // For CONTACTED stage
      if (stage === 'CONTACTED' && !isFieldVisit) {
        // Check mode-specific requirements
        const modeValidation = this.validateModeOfContactRequirements(modeOfContact);
        
        if (modeValidation.isValid && this.detailsStatus.contact && this.detailsStatus.visa && this.detailsStatus.tracing) {
          console.log('All required details for CONTACTED are present, enabling button');
          this.disableCreateTaskBtn = false;
          this.openSnackBar(`All required details are present. You can ${actionWord} the task.`);
        } else {
          console.log('Missing some required details for CONTACTED, disabling button');
          this.disableCreateTaskBtn = true;
          const missingDetails = [];
          if (!modeValidation.isValid) missingDetails.push(modeValidation.missingField);
          if (!this.detailsStatus.contact) missingDetails.push('Contact');
          if (!this.detailsStatus.visa) missingDetails.push('Visa');
          if (!this.detailsStatus.tracing) missingDetails.push('Tracing');
          this.openSnackBar(`Missing details: ${missingDetails.join(', ')}. Please add them to proceed.`);
        }
      } else if (stage === 'NON CONTACTED' && !isFieldVisit) {
        if (this.detailsStatus.webTracing) {
          console.log('Web Tracing Details are present, enabling button');
          this.disableCreateTaskBtn = false;
          this.openSnackBar(`Web Tracing Details are present. You can ${actionWord} the task.`);
        } else {
          console.log('Web Tracing Details are missing, disabling button');
          this.disableCreateTaskBtn = true;
          this.openSnackBar('Web Tracing Details are required. Please add them to proceed.');
        }
      } else {
        console.log('No specific stage validation required, enabling button');
        this.disableCreateTaskBtn = false;
      }
    } else {
      // In update mode, strictly enforce required details based on stage
      if (stage === 'CONTACTED' && !isFieldVisit) {
        // Only enable when Contact, Visa, Tracing are present
        const hasAll = this.detailsStatus.contact && this.detailsStatus.visa && this.detailsStatus.tracing;
        this.disableCreateTaskBtn = !hasAll;
      } else if (stage === 'NON CONTACTED' && !isFieldVisit) {
        // Only enable when Web Tracing is present
        this.disableCreateTaskBtn = !this.detailsStatus.webTracing;
      } else {
        // Other stages fall back to dirtiness/changes
        this.disableCreateTaskBtn = !(this.tasksForm.dirty || this.contactableChanged);
      }

      // Show appropriate message based on what was just updated
      if (stage === 'CONTACTED') {
        if (this.lastUpdatedDetail) {
          // Show specific message for the detail that was just updated
          let detailName = '';
          switch (this.lastUpdatedDetail) {
            case 'contact':
              detailName = 'Contact';
              break;
            case 'visa':
              detailName = 'Visa Check';
              break;
            case 'tracing':
              detailName = 'Tracing Details';
              break;
            case 'email':
              detailName = 'Email ID';
              break;
            case 'address':
              detailName = 'Address';
              break;
            default:
              detailName = this.lastUpdatedDetail;
          }
          this.openSnackBar(`${detailName} updated successfully. You can now update the task.`);
          this.lastUpdatedDetail = ''; // Reset after showing message
        } else if (this.detailsStatus.contact || this.detailsStatus.visa || this.detailsStatus.tracing) {
          // Fallback: show message for all present details (for backward compatibility)
          const updatedDetails = [];
          if (this.detailsStatus.contact) updatedDetails.push('Contact');
          if (this.detailsStatus.visa) updatedDetails.push('Visa Check');
          if (this.detailsStatus.tracing) updatedDetails.push('Tracing');
          this.openSnackBar(`${updatedDetails.join(', ')} details updated successfully. You can now update the task.`);
        }
      } else if (stage === 'NON CONTACTED') {
        if (this.lastUpdatedDetail === 'webTracing') {
          this.openSnackBar('Web Tracing details updated successfully. You can now update the task.');
          this.lastUpdatedDetail = ''; // Reset after showing message
        } else if (this.detailsStatus.webTracing) {
          this.openSnackBar('Web Tracing details updated successfully. You can now update the task.');
        }
      }
    }
  }

  // Helper method to comprehensively check all contacted details
  checkContactedDetails(leadId: number) {
    this.showProgressBar = true;
    let checksCompleted = 0;
    const totalChecks = 4; // contact, visa, tracing, phone

    // Function to check if all checks have completed
    const checkCompletion = () => {
      checksCompleted++;
      if (checksCompleted === totalChecks) {
        this.showProgressBar = false;
        // For CONTACTED, only enable if all disposition fields are filled
        const stage = this.tasksForm.get('stage')?.value;
        if (stage === 'CONTACTED') {
          const stageField = this.tasksForm.get('stage')?.value;
          const statusField = this.tasksForm.get('stage_status_name')?.value;
          const codeField = this.tasksForm.get('stage_status_code')?.value;
          if (stageField && statusField && codeField) {
            this.disableCreateTaskBtn = false;
            // Optionally: this.openSnackBar('All required fields are present. You can update the task.');
          } else {
            this.disableCreateTaskBtn = true;
            // Optionally: this.openSnackBar('Please fill all disposition fields (Stage, Status, Code) to enable update Task.');
          }
        } else {
          this.updateTaskButtonStateByDispositionFields();
        }
        console.log('Contacted Details Status:', {
          contact: this.detailsStatus.contact,
          visa: this.detailsStatus.visa,
          tracing: this.detailsStatus.tracing,
          phone: this.detailsStatus.phone
        });
      }
    };

    // Check for contact details
    const contactParams = {
      lead_id: leadId,
      display_latest: 1
    };

    this._sunshineApi.fetchLeadContacts(contactParams)
      .then((res: any) => {
        const contactData = res.data[0];
        this.detailsStatus.contact = (contactData && contactData.length > 0);
        checkCompletion();
      })
      .catch((error: any) => {
        console.error('Error checking contact details:', error);
        checkCompletion();
      });

    // Check for visa details
    const visaParams = {
      lead_id: leadId,
      display_latest: 1
    };

    this._sunshineApi.getVisaCheckByLead(visaParams)
      .then((res: any) => {
        const visaData = res.data[0];
        this.detailsStatus.visa = (visaData && visaData.length > 0);
        checkCompletion();
      })
      .catch((error: any) => {
        console.error('Error checking visa details:', error);
        checkCompletion();
      });

    // Check for tracing details
    const tracingParams = {
      lead_id: leadId,
      display_latest: 1
    };

    this._sunshineApi.fetchTracingDetails(tracingParams)
      .then((res: any) => {
        const tracingData = res.data[0];
        this.detailsStatus.tracing = (tracingData && tracingData.length > 0);
        checkCompletion();
      })
      .catch((error: any) => {
        console.error('Error checking tracing details:', error);
        checkCompletion();
      });

    // Check for phone details (from contact details)
    this._sunshineApi.fetchLeadContacts(contactParams)
      .then((res: any) => {
        const contactData = res.data[0];
        // Check if any contact has a valid phone number
        this.detailsStatus.phone = contactData && contactData.length > 0 && 
          contactData.some((contact: any) => contact.phone && contact.phone.trim() !== '');
        checkCompletion();
      })
      .catch((error: any) => {
        console.error('Error checking phone details:', error);
        checkCompletion();
      });
  }

  // Helper method to check only web tracing details
  checkWebTracingDetails(leadId: number) {
    this.showProgressBar = true;

    const webTracingParams = {
      lead_id: leadId
    };

    this._sunshineApi.fetchWebTracingDetails(webTracingParams)
      .then((res: any) => {
        const webTracingData = res.data[0];
        console.log('Web Tracing API Response:', res);
        console.log('Web Tracing Data Structure:', webTracingData);

        // More flexible check for data presence
        let hasWebTracingData = false;

        if (Array.isArray(webTracingData) && webTracingData.length > 0) {
          // If it's an array with items
          hasWebTracingData = true;
        } else if (webTracingData && typeof webTracingData === 'object' && Object.keys(webTracingData).length > 0) {
          // If it's a non-empty object
          hasWebTracingData = true;
        } else if (webTracingData && typeof webTracingData !== 'object') {
          // If it's a scalar value (like a string or number)
          hasWebTracingData = true;
        }

        // Update the status
        this.detailsStatus.webTracing = hasWebTracingData;
        console.log('Web Tracing Status Updated:', this.detailsStatus.webTracing);

        this.showProgressBar = false;

        // Force button update even if contactableChanged is false
        const stage = this.tasksForm.get('stage')?.value;
        const isCreateMode = this.dialogTitle === 'Create New Task';
        const actionWord = isCreateMode ? 'create' : 'update';
        if (stage === 'NON CONTACTED') {
          console.log('Stage is NON CONTACTED, forcing button update');
          // Force button state
          if (hasWebTracingData) {
            // Check if all disposition fields are filled
            const stageField = this.tasksForm.get('stage')?.value;
            const statusField = this.tasksForm.get('stage_status_name')?.value;
            const codeField = this.tasksForm.get('stage_status_code')?.value;
            if (stageField && statusField && codeField) {
              this.disableCreateTaskBtn = false;
              this.openSnackBar(`Web Tracing Details are present. You can ${actionWord} the task.`);
            } else {
              this.disableCreateTaskBtn = true;
              this.openSnackBar('Please fill all disposition fields (Stage, Status, Code) to enable update Task.');
            }
          } else {
            console.log('No web tracing data found, disabling button');
            this.disableCreateTaskBtn = true;
            this.openSnackBar('Web Tracing Details are required. Please add them.');
          }
        } else {
          // Run normal update for other stages
          this.updateTaskButtonState();
        }
      })
      .catch((error: any) => {
        console.error('Error checking web tracing details:', error);
        this.showProgressBar = false;
        // Continue with disabled button
        this.disableCreateTaskBtn = true;
      });
  }

  // Update helper methods to check specific missing details
  checkRequiredDetailsForContactable() {
    if (!this.dialogData?.task_id) {
      // For new tasks, just check existing details
      const missingDetails = [];
      if (!this.detailsStatus.contact) missingDetails.push('Contact');
      if (!this.detailsStatus.visa) missingDetails.push('Visa');
      if (!this.detailsStatus.tracing) missingDetails.push('Tracing');

      if (missingDetails.length > 0) {
        this.disableCreateTaskBtn = true;
        this.openSnackBar(`Missing details for Contacted task: ${missingDetails.join(', ')}`);
      } else {
        this.disableCreateTaskBtn = false;
        this.openSnackBar('All required details for Contacted task are already present');
      }
      return;
    }

    this.showProgressBar = true;
    let tasksCheckBody = {
      task_id: this.dialogData.task_id,
      stage: 'CONTACTED'
    };

    this._sunshineApi.checkEnteriesByTaskId(tasksCheckBody)
      .then((res: any) => {
        this.showProgressBar = false;
        const validationResult = res.data[0]['@occ'];

        if (validationResult === 3) {
          // All required details are present
          this.disableCreateTaskBtn = false;
          this.openSnackBar('All required details have been provided. You can update the task now.');
        } else {
          // Some details are still missing - identify which ones
          const missingDetails = [];
          if (!this.detailsStatus.contact) missingDetails.push('Contact');
          if (!this.detailsStatus.visa) missingDetails.push('Visa');
          if (!this.detailsStatus.tracing) missingDetails.push('Tracing');

          this.disableCreateTaskBtn = true;
          this.openSnackBar(`Missing details: ${missingDetails.join(', ')}`);
        }
      })
      .catch((error) => {
        this.showProgressBar = false;
        this.openSnackBar('Error checking required details');
      });
  }

  checkRequiredDetailsForNonContactable() {
    if (!this.dialogData?.task_id) {
      // For new tasks, just check if web tracing exists
      if (!this.detailsStatus.webTracing) {
        this.disableCreateTaskBtn = true;
        this.openSnackBar('Web Tracing Details are required for Non-Contactable tasks');
      } else {
        this.disableCreateTaskBtn = false;
        this.openSnackBar('Web Tracing Details are already present');
      }
      return;
    }

    this.showProgressBar = true;
    let tasksCheckBody = {
      task_id: this.dialogData.task_id,
      stage: 'NON CONTACTED'
    };

    this._sunshineApi.checkEnteriesByTaskId(tasksCheckBody)
      .then((res: any) => {
        this.showProgressBar = false;
        const validationResult = res.data[0]['@occ'];

        if (validationResult === 1) {
          // Web tracing details are present
          this.disableCreateTaskBtn = false;
          this.openSnackBar('Web Tracing Details have been provided. You can update the task now.');
        } else {
          // Web tracing details are missing
          this.disableCreateTaskBtn = true;
          this.openSnackBar('Web Tracing Details are required for Non-Contactable tasks');
        }
      })
      .catch((error) => {
        this.showProgressBar = false;
        this.openSnackBar('Error checking required details');
      });
  }

  stageSelecetHandler(event: any) {
    let selectedStageStatus = event.value;
    console.log(selectedStageStatus);

    // Set validation for mode_of_contact when RIGHT PARTY CONTACT is selected
    selectedStageStatus === 'RIGHT PARTY CONTACT'
      ? this.tasksForm
        .get('mode_of_contact')
        ?.setValidators(Validators.required)
      : this.tasksForm.get('mode_of_contact')?.clearValidators();

    // Clear stage_status_name and stage_status_code when stage_status changes
    this.tasksForm.patchValue({
      stage_status_name: null,
      stage_status_code: null
    });

    // Filter status options based on selected stage status
    this.statusArr = this.dispositionArr.filter(
      (status: any) => status.stage_status === selectedStageStatus
    );
    this.filteredStatusArr = [...this.statusArr];

    this.createTaskEmailNotif.disposition_stage = selectedStageStatus;

    this.disableCreateTaskBtn = true;

    // ADD THIS LINE:
    this.updateTaskButtonStateByDispositionFields();
  }

  statusSelectHandler(event: any) {
    let selectedStatus = event.value;
    this.dispCodeArr = this.dispositionArr.filter(
      (status: any) => status.stage_status_name === selectedStatus
    );
    
    // Keep statusArr with all available options for the current stage, not just the selected one
    // This ensures that when task status changes, we have all options available for filtering
    const currentStage = this.tasksForm.get('stage')?.value;
    if (currentStage) {
      this.statusArr = this.dispositionArr.filter(
        (status: any) => status.stage === currentStage
      );
    }
    
    this.filteredStatusArr = [...this.statusArr];
    this.tasksForm.patchValue({
      stage_status_code: this.dispCodeArr[0]['stage_status_code'],
    });
    console.log(this.dispCodeArr);
    let codeId = this.dispCodeArr[0]['disposition_code_id'];
    this.newTaskObj.disposition_code_id = codeId;
    this.editTaskObj.disposition_code_id = codeId;
    this.createTaskEmailNotif.disposition_status =
      this.dispCodeArr[0].stage_status_name;
    this.createTaskEmailNotif.disposition_code =
      this.dispCodeArr[0].stage_status_code;

    // Filter task status options based on selected disposition status
    this.filterTaskStatusOptions();

    // Now that all disposition fields are filled, check if we can enable the button
    const stage = this.tasksForm.get('stage')?.value;
    if (stage === 'CONTACTED') {
      if (this.detailsStatus.contact && this.detailsStatus.visa && this.detailsStatus.tracing) {
        this.disableCreateTaskBtn = false;
      } else {
        const missingDetails = [];
        if (!this.detailsStatus.contact) missingDetails.push('Contact Details');
        if (!this.detailsStatus.visa) missingDetails.push('Visa Check');
        if (!this.detailsStatus.tracing) missingDetails.push('Tracing Details');
        this.openSnackBar(`Please complete the following required fields:\n${missingDetails.join('\n')}`);
      }
    } else if (stage === 'NON CONTACTED') {
      if (this.detailsStatus.webTracing) {
        this.disableCreateTaskBtn = false;
      } else {
        this.openSnackBar('Web Tracing Details are required for Non-Contactable tasks');
      }
    } else {
      this.disableCreateTaskBtn = false;
    }
  }

  dispCodeSelectHandler(event: any) {
    let selectedDispoCode = event.value;
    // console.log(selectedDispoCode);
    this.createTaskEmailNotif.disposition_code = selectedDispoCode;

    // Filter task status options based on selected disposition code
    this.filterTaskStatusOptions();

    // Only check already-fetched detailsStatus and update button state
    const stage = this.tasksForm.get('stage')?.value;
    if (stage === 'CONTACTED') {
      if (!this.detailsStatus.contact || !this.detailsStatus.visa || !this.detailsStatus.tracing) {
        this.disableCreateTaskBtn = true;
        const missingDetails = [];
        if (!this.detailsStatus.contact) missingDetails.push('Contact Details');
        if (!this.detailsStatus.visa) missingDetails.push('Visa Check');
        if (!this.detailsStatus.tracing) missingDetails.push('Tracing Details');
        this.openSnackBar(`Please complete the following required fields:\n${missingDetails.join('\n')}`);
      } else {
        this.disableCreateTaskBtn = false;
      }
    } else if (stage === 'NON CONTACTED') {
      if (!this.detailsStatus.webTracing) {
        this.disableCreateTaskBtn = true;
        this.openSnackBar('Web Tracing Details are required for Non-Contactable tasks');
      } else {
        this.disableCreateTaskBtn = false;
      }
    } else {
      this.disableCreateTaskBtn = false;
    }
  }

  getAllTaskTypes() {
    this._sunshineApi
      .fetchTaskTypes()
      .then((res: any) => {
        let resData = res.data[0];
        // Conditionally filter out "PRELIMINARY CHECKS" only when creating a new task
        // Check both this.dialogTitle and this.data.dialogTitle to handle timing issues
        const isCreateMode = this.dialogTitle === 'Create New Task' || 
                           (this.data && this.data.dialogTitle === 'Create New Task');
        
        if (isCreateMode) {
          this.taskTypeArr = resData.filter(
            (tt:any) => tt.task_type_name !== 'PRELIMINARY CHECKS'
          );
        } else {
          this.taskTypeArr = resData;
        }
        // sessionStorage.setItem('taskType', JSON.stringify(resData));
      })
      .catch((error) => console.error(error));
  }

  taskTypeHandler(event: any) {
    let taskType = event.value;
    this.taskType = taskType;
    console.log('task-type:::', taskType);
    let taskTypeId = this.taskTypeArr.filter((id: any) => {
      if (id.task_type_name === taskType) {
        return id.task_type_id;
      }
    });

    if (taskType !== 'DOCUMENT UPLOAD') {
      this.hideDocUpldSelector = false;
      this.docUrlDisable = false;
      this.docUploadDisable = false;
    } else {
      this.hideDocUpldSelector = true;
      // Only disable document URL and upload if there's no existing document URL
      if (!this.tasksForm.value.document_url) {
        this.docUrlDisable = true;
        this.docUploadDisable = true;
      } else {
        this.docUrlDisable = false;
        this.docUploadDisable = true;
      }
    }
    let ttId = taskTypeId[0]['task_type_id'];
    this.newTaskObj.task_type_id = ttId;
    this.editTaskObj.task_type_id = ttId;
    this.createTaskEmailNotif.task_type_name = taskTypeId[0].task_type_name;

    this.updateButtonForDocumentUploadTask();
    if (taskType !== 'DOCUMENT UPLOAD') {
      this.updateTaskButtonState();
    }
  }


  getAllTaskStatusTypes() {
    this._sunshineApi
      .fetchTaskStatusTypes()
      .then((res: any) => {
        let resData = res.data[0];
        this.taskStatusTypeArr = resData;
        // Apply filtering when task status types are loaded
        this.filterTaskStatusOptions();
      })
      .catch((error) => console.error(error));
  }

  taskStatusTypeHandler(event: any) {
    let taskStatusType = event.value;
    // // console.log(taskStatusType);
    let taskStatusId = this.taskStatusTypeArr.filter((id: any) => {
      if (id.task_status_type_name === taskStatusType) {
        return id.task_status_type_id;
      }
    });
    // // console.log('"="="=', taskStatusId[0]['task_status_type_id']);
    let ttsId = taskStatusId[0]['task_status_type_id'];
    this.newTaskObj.task_status_type_id = ttsId;
    this.editTaskObj.task_status_type_id = ttsId;
    this.createTaskEmailNotif.task_status_type_name = taskStatusType;

    // Filter disposition status options based on selected task status
    this.filterDispositionStatusOptions();

    // Ensure target date is preserved when status changes
    if (!this.targetDateChanged) {
      const originalTargetDate = this.data.dialogData.target_dtm?.split('T')[0];
      const eodTargetDate = this.data.dialogData.eod_target_dtm?.split(' ')[0];
      
      // If eod_target_dtm is available and different from target_dtm, use eod_target_dtm date
      if (eodTargetDate && eodTargetDate !== originalTargetDate) {
        this.editTaskObj.target_dtm = eodTargetDate;
        console.log('Status change: Using eod_target_dtm date (corrected):', eodTargetDate);
      } else {
        this.editTaskObj.target_dtm = originalTargetDate;
        console.log('Status change: Using original target date:', originalTargetDate);
      }
    }

    // // console.log(`edit-task-obj-task_status_type_id::`, this.editTaskObj);
  }
  assignedDateHandler(event: any) {
    let inputDate = event.value._i;
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    this.newTaskObj.assigned_dtm = `${inputDate.year}-${inputDate.month + 1}-${inputDate.date} ${hours}:${minutes}:${seconds}`;
    this.editTaskObj.assigned_dtm = `${inputDate.year}-${inputDate.month + 1}-${inputDate.date} ${hours}:${minutes}:${seconds}`;
    this.createTaskEmailNotif.assigned_dtm = `${inputDate.year}-${inputDate.month + 1}-${inputDate.date} ${hours}:${minutes}:${seconds}`;
    console.log('assigned-date:::', this.newTaskObj.assigned_dtm);
  }
  assignedByHandler(value: any) {
    let taskUsr: any = sessionStorage.getItem('taskAllUsers');
    let parsedUsers = JSON.parse(taskUsr);

    console.log('=== ASSIGNED BY HANDLER DEBUG ===');
    console.log('Selected value:', value);
    console.log('All users from sessionStorage:', parsedUsers);
    
    const user = parsedUsers.find((user: any) => user.full_name === value);
    console.log('Found user:', user);

    if (!user) {
      console.log('ERROR: User not found');
      this.openSnackBar('Assigned By not found');
      return;
    }

    // Check if user is deactivated
    if (user.status === 0) {
      console.log('ERROR: User is deactivated');
      this.openSnackBar('Cannot select deactivated user');
      this.tasksForm.patchValue({
        assigned_by_full_name: '',
      });
      return;
    }

    const { user_id, full_name, email_address, role_name } = user;
    console.log('User details - ID:', user_id, 'Name:', full_name, 'Role:', role_name);

    // Mark form as dirty
    this.tasksForm.markAsDirty();

    this.newTaskObj.assigned_by = user_id;
    this.editTaskObj.assigned_by = user_id;
    this.createTaskEmailNotif = {
      ...this.createTaskEmailNotif,
      assigned_by_full_name: full_name,
      assigned_by_email: email_address,
      assigned_by_id: user_id,
    };

    this.tasksForm.patchValue({
      assigned_by_full_name: full_name,
    });

    // Update assigned to dropdown based on logged-in user's hierarchy
    console.log('Calling updateAssignedToOptions with logged-in user hierarchy');
    this.updateAssignedToOptions(null);

    this.updateButtonForDocumentUploadTask();
    if (this.taskType !== 'DOCUMENT UPLOAD') {
      this.updateTaskButtonState();
    }
    console.log('=== END ASSIGNED BY HANDLER DEBUG ===');
  }

  assignedToHandler(value: any) {
    let taskUsr: any = sessionStorage.getItem('taskAllUsers');
    let parsedUsers = JSON.parse(taskUsr);

    console.log(value);
    const user = parsedUsers.find((user: any) => user.full_name === value);

    if (!user) {
      this.openSnackBar('Assigned To not found');
      return;
    }

    // Check if user is deactivated
    if (user.status === 0) {
      this.openSnackBar('Cannot select deactivated user');
      this.tasksForm.patchValue({
        assigned_to_full_name: '',
      });
      return;
    }

    const { user_id, full_name, email_address } = user;

    // Mark form as dirty
    this.tasksForm.markAsDirty();

    this.newTaskObj.assigned_to = user_id;
    this.editTaskObj.assigned_to = user_id;
    this.createTaskEmailNotif = {
      ...this.createTaskEmailNotif,
      assigned_to_full_name: full_name,
      assigned_to_email: email_address,
      assigned_to_id: user_id,
    };

    this.tasksForm.patchValue({ assigned_to_full_name: full_name });

    // For field visit tasks, populate country and state based on assigned user's location
    if (this.taskType === 'FIELD VISIT' && user.country) {
      this.selectedCountry = user.country;
      this.tasksForm.patchValue({ country: user.country });
      
      // Load states for the selected country
      this.states = this.locationService.getStatesByCountry(user.country);
      
      // If user has state information, set it as well
      if (user.state) {
        this.selectedState = user.state;
        this.tasksForm.patchValue({ state: user.state });
      }
      
      console.log('Field visit location populated for assigned user:', {
        country: user.country,
        state: user.state
      });
    }

    this.updateButtonForDocumentUploadTask();
    if (this.taskType !== 'DOCUMENT UPLOAD') {
      this.updateTaskButtonState();
    }
  }

  targetDateHandler(event: { value: any }) {
    const selectedMoment = event.value;
    
    if (!selectedMoment || typeof selectedMoment.toDate !== 'function') return;

    // Convert Moment to native JS Date
    const selectedDate = selectedMoment.toDate();

    // Create a date string in YYYY-MM-DD format to preserve the exact date without timezone issues
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    
    // Use the date only format to avoid timezone conversion issues
    const formattedDate = `${year}-${month}-${day}`;

    this.newTaskObj.target_dtm = formattedDate;
    this.editTaskObj.target_dtm = formattedDate;
    this.createTaskEmailNotif.target_dtm = formattedDate;

    // Mark that target date has been manually changed
    this.targetDateChanged = true;

    console.log('target-date (date only):', formattedDate);

    // For agents: handle target date field enable/disable based on date
    if (this.loggedInUserRole === 'AGENT') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);

      // Enable target date field only for future dates
      if (selectedDate.getTime() > today.getTime()) {
        this.tasksForm.get('target_dtm')?.enable();
      } else {
        this.tasksForm.get('target_dtm')?.disable();
      }
    }

    this.tasksForm.markAsDirty();
    this.disableCreateTaskBtn = false;
  }

  attachFile(event: any) {
    this.file = event.target.files[0];
    this.docUrlDisable = false;
    this.docUploadDisable = false;

    //// // console.log(this.file);
  }

  uploadFileToBucket() {
    this.showProgressBar = true;
    let fd: FormData = new FormData();
    fd.append('files', this.file, this.file.name);
    
    if (fd) {
      this._sunshineApi
        .uploadTaskDocs(fd)
        .then((res: any) => {
          let resData = res.data;
          console.log('Upload response:', resData);
          
          // Get the URL from either mediaLink or url property
          const mediaLink = resData.data.files[0].mediaLink || resData.data.files[0].url;
          
          if (!mediaLink) {
            throw new Error('No URL received from server');
          }
          
          // Update all relevant objects with the document URL
          this.newTaskObj.document_url = mediaLink;
          this.editTaskObj.document_url = mediaLink;
          this.createTaskEmailNotif.document_url = mediaLink;

          // Update the form
          this.tasksForm.patchValue({
            document_url: mediaLink,
          });

          this.openSnackBar(resData.msg);
          this.docUrlDisable = false;
          this.docUploadDisable = true;
          this.showProgressBar = false;
          this.disableCreateTaskBtn = false;

          this.updateButtonForDocumentUploadTask();
        })
        .catch((error) => {
          this.openSnackBar(error.message || 'Failed to upload file');
          this.showProgressBar = false;
          console.error('file-upload-server-err:::', error);
        });
    }
  }

  selectContactMode(event: any) {
    let contactMode = event.value;
    
    // Hide the message once a mode is selected
    if (this.tasksForm.get('stage')?.value === 'CONTACTED' && contactMode) {
      this.showModeOfContactMessage = false;
    }
    this.newTaskObj.mode_of_contact = contactMode;
    this.editTaskObj.mode_of_contact = contactMode;
    this.createTaskEmailNotif.mode_of_contact = contactMode;
    this.selectedContactMode = contactMode;

    // Mark form as dirty to track changes
    this.tasksForm.markAsDirty();

    // Trigger validation based on mode of contact
    this.updateTaskButtonState();
  }
 // Utility function to fetch customer name by leadId or product_account_no
  private async fetchCustomerName(leadId: any, productAccountNo?: any): Promise<string> {
    const params: any = {};
    
    // Always include required parameters for the API
    if (this.loggedInUserId) {
      params.app_user_id = this.loggedInUserId;
    } else {
      console.warn('loggedInUserId not available for fetchCustomerName');
    }
    
    // Use the stored company_id property
    if (this.companyId) {
      params.company_id = this.companyId;
    } else {
      console.warn('companyId not available for fetchCustomerName');
    }
    
    if (leadId) params.lead_id = leadId;
    if (productAccountNo) params.product_account_no = productAccountNo;
    
    console.log('fetchCustomerName params:', params);
    
    try {
      const res: any = await this._sunshineApi.fetchLeadsBySearchParams(params);
      const leads = res.data[0];
      if (leads && leads.length > 0) {
        return leads[0].customer_name || '';
      }
    } catch (e) {
      console.error('Error fetching customer name:', e);
      // fallback
    }
    return '';
  }

  async createNewTask() {
    console.log('new-task-obj-before-create::::::::>>>>>>', this.newTaskObj);
    console.log('Form values:', this.tasksForm.value);
    console.log('Document URL from form:', this.tasksForm.get('document_url')?.value);
    console.log('Document URL from newTaskObj:', this.newTaskObj.document_url);


    // Ensure document_url is properly set from form
    if (this.tasksForm.get('document_url')?.value) {
      this.newTaskObj.document_url = this.tasksForm.get('document_url')?.value;
    }

    const nullSafetyCheck = this.checkNullKeys(this.newTaskObj);
    if (!nullSafetyCheck.status) {
      this.openSnackBar(nullSafetyCheck.msg);
      this.showProgressBar = false;
      this.disableCreateTaskBtn = true;
      return;
    }
    // console.log('Assigned By:', this.newTaskObj.assigned_by);
    // console.log('Assigned To:', this.newTaskObj.assigned_to);
    // console.log('Task Type:', this.taskType);
    // if (
    //   (this.newTaskObj.assigned_by === this.newTaskObj.assigned_to &&
    //     this.taskType == 'CALL REMINDER') ||
    //   (this.newTaskObj.assigned_by === this.newTaskObj.assigned_to &&
    //     this.taskType == 'FOLLOW UP')
    // ) {
    //   console.log('Assigned By and Assigned To cannot be same');
    //   this.openSnackBar('Assigned By and Assigned To cannot be same');
    //   this.showProgressBar = false;
    //   this.disableCreateTaskBtn = true;
    //   return;
    // }

    try {
      const res: any = await this._sunshineApi.postNewTask(this.newTaskObj);
      this.showProgressBar = false;
      this.dialogRef.close({
        message: `Task Created`,
        create: 1,
        leadId: this.newTaskObj.lead_id,
      });
      this.openSnackBar(res.message);
      
      // Refresh sidebar status after successful task creation
      await this.notificationService.refreshSidebarStatus();

      // if (this.newTaskObj.assigned_by !== this.newTaskObj.assigned_to) {
      // if (this.createTaskEmailNotif.assigned_by_id) {
      //   console.log(this.createTaskEmailNotif.assigned_by_id);
      //   this.createAssignedByTaskNotif(this.createTaskEmailNotif);
      //   this.emailCreateTaskAssignedBy(this.createTaskEmailNotif, 'New Task');
      // }

      if (this.createTaskEmailNotif.assigned_to_id) {
        // console.log(this.createTaskEmailNotif.assigned_to_id);

        this.createAssignedToTaskNotif(this.createTaskEmailNotif);
        this.emailCreateTaskAssignedTo(this.createTaskEmailNotif, 'New Task');
      }
      // }
      // else {
      //   console.log(this.createTaskEmailNotif.assigned_by_id);
      //   this.createAssignedByTaskNotif(this.createTaskEmailNotif);
      //   this.emailCreateTaskAssignedBy(this.createTaskEmailNotif, 'New Task');
      // }

      // this.emailCreateTaskAssignedBy(this.createTaskEmailNotif);
      // this.emailCreateTaskAssignedTo(this.createTaskEmailNotif);
      // this.createAssignedByTaskNotif(this.createTaskEmailNotif);
      // this.createAssignedToTaskNotif(this.createTaskEmailNotif);
    } catch (error) {
      console.error('task-create-err::', error);
      this.showProgressBar = false;
      this.disableCreateTaskBtn = true;
      this.dialogRef.close({
        message: `Task Creation Failed`,
        create: 0,
        leadId: this.newTaskObj.lead_id,
      });
      this.openSnackBar('Failed to create task. Please try again later.');
    }
  }


 checkNullKeys(obj: any): any {
    // Additional check for document_url if task_type_name is DOCUMENT UPLOAD
    if (obj.task_type_name === 'DOCUMENT UPLOAD') {
      if (obj.document_url == null || obj.document_url == '') {
        this.openSnackBar(
          `Please upload document for task type DOCUMENT UPLOAD`
        );
        this.disableCreateTaskBtn = true;
        return {
          status: false,
          msg: `Please upload document for task type DOCUMENT UPLOAD`,
        };
      }
    }
    // // console.log(obj);
    const expectedKeys = [
      'app_user_id',
      'task_type_id',
      'lead_id',
      // 'document_url',
      'assigned_by',
      // 'assigned_to',
      // 'disposition_code_id',
      // 'assigned_dtm',
      // 'target_dtm',
      'task_status_type_id',
    ];

    for (const key of expectedKeys) {
      if (!(key in obj)) {
        this.openSnackBar(`Key '${key}' is not present in the object`);
        // return `Key '${key}' is not present in the object`;
        this.disableCreateTaskBtn = true;
        return {
          status: false,
          msg: `Key '${key}' is not present in the object`,
        };
      }

      if (obj[key] === null) {
        this.openSnackBar(`Key '${key}' cannot be null`);
        // return `Key '${key}' is null`;
        this.disableCreateTaskBtn = true;

        return {
          status: false,
          msg: `Key '${key}' is null`,
        };
      }

      if (obj[key] === '') {
        this.openSnackBar(`Key '${key}' cannot be empty string`);
        // return `Key '${key}' is null`;
        this.disableCreateTaskBtn = true;

        return {
          status: false,
          msg: `Key '${key}' is null`,
        };
      }
    }

    this.disableCreateTaskBtn = false;

    return {
      status: true,
      msg: `Thumbs up!`,
    };
  }
  openSnackBar(message: string) {
    this._snackBar.open(message, 'Okay', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: this.durationInSeconds * 1000,
    });
  }
  emailCreateTaskAssignedBy(assignee: any, action: string) {
    console.log('task::::', action, assignee);
    let emailBody = `
      Hi ${assignee.assigned_by_full_name === undefined ||
        assignee.assigned_by_full_name === null
        ? ''
        : assignee.assigned_by_full_name
      },
      <br><br>
      ${action} assigned to ${assignee.assigned_to_full_name}:
      <ul>
        <li><strong>Lead Id:</strong> ${assignee.lead_id === undefined || assignee.lead_id === null
        ? ''
        : assignee.lead_id
      }</li>
        <li><strong>Task Type:</strong> ${assignee.task_type_name === undefined || null
        ? ''
        : assignee.task_type_name
      }</li>
        <li><strong>Assigned To:</strong> ${assignee.assigned_to_full_name === undefined ||
        assignee.assigned_to_full_name === null
        ? ''
        : assignee.assigned_to_full_name
      }</li>
        <li><strong>Disposition Stage:</strong> ${assignee.disposition_stage === undefined ||
        assignee.disposition_stage === null
        ? ''
        : assignee.disposition_stage
      }</li>
        <li><strong>Disposition Status:</strong> ${assignee.disposition_status === undefined ||
        assignee.disposition_status === null
        ? ''
        : assignee.disposition_status
      }</li>
        <li><strong>Disposition Code:</strong> ${assignee.disposition_code === undefined ||
        assignee.disposition_code === null
        ? ''
        : assignee.disposition_code
      }</li>
        <li><strong>Assigned Date:</strong> ${assignee.assigned_dtm === undefined || assignee.assigned_dtm === null
        ? ''
        : assignee.assigned_dtm
      }</li>
        <li><strong>Target Date:</strong> ${assignee.target_dtm === undefined || assignee.target_dtm === null
        ? ''
        : assignee.target_dtm
      }</li>
        <li><strong>Task Status:</strong> ${assignee.task_status_type_name === undefined ||
        assignee.task_status_type_name === null
        ? ''
        : assignee.task_status_type_name
      }</li>
      </ul>
      <br>
      Thank you,<br>
      Team Sunshine Solutions Pvt. Ltd.<br>
      This automated mail was sent by Sunshine Solutions Pvt. Ltd. Please do not reply directly to this email.
      For questions or assistance, please get in touch with info@mailers.codeswift.in.
    `;

    let receiverEmailId = assignee.assigned_by_email;
    let emailSubject = `${action} - "${assignee.task_type_name}"`;

    let finalEmail = {
      to: receiverEmailId,
      subject: emailSubject,
      emailBody: emailBody,
    };

    this._sunshineApi
      .sendEmail(finalEmail)
      .then((res: any) => {
        console.log('task-create-email-res::::', res);
        this.openSnackBar(res.message);
        console.log(
          `Email sent for ${action} to: ${assignee.assigned_by_email}`
        );
      })
      .catch((error) => {
        this.openSnackBar(error);
      });
  }
  emailCreateTaskAssignedTo(assignee: any, action: string) {
    console.log('task::::', action, assignee);
    let emailBody = `
      Hi ${assignee.assigned_to_full_name === undefined ||
        assignee.assigned_to_full_name === null
        ? ''
        : assignee.assigned_to_full_name
      },
      <br><br>
      ${action} assigned to you by ${assignee.assigned_by_full_name === undefined ||
        assignee.assigned_by_full_name === null
        ? ''
        : assignee.assigned_by_full_name
      }:
      <ul>
        <li><strong>Lead Id:</strong> ${assignee.lead_id === undefined || assignee.lead_id === null
        ? ''
        : assignee.lead_id
      }</li>
        <li><strong>Task Type:</strong> ${assignee.task_type_name === undefined ||
        assignee.task_type_name === null
        ? ''
        : assignee.task_type_name
      }</li>
        <li><strong>Assigned By:</strong> ${assignee.assigned_by_full_name === undefined ||
        assignee.assigned_by_full_name === null
        ? ''
        : assignee.assigned_by_full_name
      }</li>
        <li><strong>Disposition Stage:</strong> ${assignee.disposition_stage === undefined ||
        assignee.disposition_stage === null
        ? ''
        : assignee.disposition_stage
      }</li>
        <li><strong>Disposition Status:</strong> ${assignee.disposition_status === undefined ||
        assignee.disposition_status === null
        ? ''
        : assignee.disposition_status
      }</li>
        <li><strong>Disposition Code:</strong> ${assignee.disposition_code === undefined ||
        assignee.disposition_code === null
        ? ''
        : assignee.disposition_code
      }</li>
        <li><strong>Assigned Date:</strong> ${assignee.assigned_dtm === undefined || assignee.assigned_dtm === null
        ? ''
        : assignee.assigned_dtm
      }</li>
        <li><strong>Target Date:</strong> ${assignee.target_dtm === undefined || assignee.target_dtm === null
        ? ''
        : assignee.target_dtm
      }</li>
        <li><strong>Task Status:</strong> ${assignee.task_status_type_name === undefined ||
        assignee.task_status_type_name === null
        ? ''
        : assignee.task_status_type_name
      }</li>
      </ul>
      <br>
      Thank you,<br>
      Team Sunshine Solutions Pvt. Ltd.<br>
      This automated mail was sent by Sunshine Solutions Pvt. Ltd. Please do not reply directly to this email.
      For questions or assistance, please get in touch with info@mailers.codeswift.in.
    `;

    let receiverEmailId = assignee.assigned_to_email;
    let emailSubject = `${action} - "${assignee.task_type_name}"`;

    let finalEmail = {
      to: receiverEmailId,
      subject: emailSubject,
      emailBody: emailBody,
    };

    this._sunshineApi
      .sendEmail(finalEmail)
      .then((res: any) => {
        console.log('task-create-email-res::::', res);
        this.openSnackBar(res.message);
        console.log(
          `Email sent for ${action} to: ${assignee.assigned_to_email}`
        );
      })
      .catch((error) => {
        this.openSnackBar(error);
      });
  }
  createAssignedToTaskNotif(notif: any) {
    let notifType: any = sessionStorage.getItem('notifType');
    let parsedNotifType = JSON.parse(notifType);

    let createUsrNotifObj = {
      user_id: notif.assigned_to_id,
      notification_type_id: parsedNotifType[5].notification_type_id,
      notification_name: parsedNotifType[5].notification_type_name,
      notification_message: `${parsedNotifType[5].notification_type_description} as ${notif.assigned_to_full_name}`,
      notification_effective_from: this.getCurrentTimestamp(),
      notification_effective_to: null,
      notification_lifespan_days: null,
      notification_publish_flag: 1,
      acknowledgment_required: 1,
      notification_acknowledged_on: null,
      app_user_id: this.loggedInUserId,
    };

    console.log('------>', createUsrNotifObj);

    this._sunshineApi
      .postNewUserNotification(createUsrNotifObj)
      .then((res: any) => {
        console.log('ac-update-app-notif-res;:::', res);
        this.openSnackBar(res.message);
      })
      .catch((error) => {
        console.error('create-use-notif-err::::', error);
        this.openSnackBar(error.response.message);
      });
  }
  createAssignedByTaskNotif(notif: any) {
    let notifType: any = sessionStorage.getItem('notifType');
    let parsedNotifType = JSON.parse(notifType);

    let createUsrNotifObj = {
      user_id: notif.assigned_by_id,
      notification_type_id: parsedNotifType[4].notification_type_id,
      notification_name: parsedNotifType[4].notification_type_name,
      notification_message: `${parsedNotifType[4].notification_type_description} as ${notif.assigned_by_full_name}`,
      notification_effective_from: this.getCurrentTimestamp(),
      notification_effective_to: null,
      notification_lifespan_days: null,
      notification_publish_flag: 1,
      acknowledgment_required: 1,
      notification_acknowledged_on: null,
      app_user_id: this.loggedInUserId,
    };

    console.log('------>', createUsrNotifObj);

    this._sunshineApi
      .postNewUserNotification(createUsrNotifObj)
      .then((res: any) => {
        console.log('ac-update-app-notif-res;:::', res);
        this.openSnackBar(res.message);
      })
      .catch((error) => {
        console.error('create-use-notif-err::::', error);
        this.openSnackBar(error.response.message);
      });
  }
  updateAssignedToTaskNotif(notif: any) {
    let notifType: any = sessionStorage.getItem('notifType');
    let parsedNotifType = JSON.parse(notifType);

    let createUsrNotifObj = {
      user_id: notif.assigned_to_id,
      notification_type_id: parsedNotifType[7].notification_type_id,
      notification_name: parsedNotifType[7].notification_type_name,
      notification_message: `${parsedNotifType[7].notification_type_description} as ${notif.assigned_to_full_name}`,
      notification_effective_from: this.getCurrentTimestamp(),
      notification_effective_to: null,
      notification_lifespan_days: null,
      notification_publish_flag: 1,
      acknowledgment_required: 1,
      notification_acknowledged_on: null,
      app_user_id: this.loggedInUserId,
    };

    console.log('------>', createUsrNotifObj);

    this._sunshineApi
      .postNewUserNotification(createUsrNotifObj)
      .then((res: any) => {
        console.log('ac-update-app-notif-res;:::', res);
        this.openSnackBar(res.message);
      })
      .catch((error) => {
        console.error('create-use-notif-err::::', error);
        this.openSnackBar(error.response.message);
      });
  }
  updateAssignedByTaskNotif(notif: any) {
    let notifType: any = sessionStorage.getItem('notifType');
    let parsedNotifType = JSON.parse(notifType);

    let createUsrNotifObj = {
      user_id: notif.assigned_by_id,
      notification_type_id: parsedNotifType[6].notification_type_id,
      notification_name: parsedNotifType[6].notification_type_name,
      notification_message: `${parsedNotifType[6].notification_type_description} as ${notif.assigned_by_full_name}`,
      notification_effective_from: this.getCurrentTimestamp(),
      notification_effective_to: null,
      notification_lifespan_days: null,
      notification_publish_flag: 1,
      acknowledgment_required: 1,
      notification_acknowledged_on: null,
      app_user_id: this.loggedInUserId,
    };

    console.log('------>', createUsrNotifObj);

    this._sunshineApi
      .postNewUserNotification(createUsrNotifObj)
      .then((res: any) => {
        console.log('ac-update-app-notif-res;:::', res);
        this.openSnackBar(res.message);
      })
      .catch((error) => {
        console.error('create-use-notif-err::::', error);
        this.openSnackBar(error.response.message);
      });
  }
  createAssignedToNoteNotif(notif: any) {
    let notifType: any = sessionStorage.getItem('notifType');
    let parsedNotifType = JSON.parse(notifType);

    let createUsrNotifObj = {
      user_id: notif.assigned_to_id,
      notification_type_id: parsedNotifType[8].notification_type_id,
      notification_name: parsedNotifType[8].notification_type_name,
      notification_message: `${parsedNotifType[8].notification_type_description} as ${notif.assigned_to_full_name}`,
      notification_effective_from: this.getCurrentTimestamp(),
      notification_effective_to: null,
      notification_lifespan_days: null,
      notification_publish_flag: 1,
      acknowledgment_required: 1,
      notification_acknowledged_on: null,
      app_user_id: this.loggedInUserId,
    };

    console.log('------>', createUsrNotifObj);

    this._sunshineApi
      .postNewUserNotification(createUsrNotifObj)
      .then((res: any) => {
        console.log('ac-update-app-notif-res;:::', res);
        this.openSnackBar(res.message);
      })
      .catch((error) => {
        console.error('create-use-notif-err::::', error);
        this.openSnackBar(error.response.message);
      });
  }
  updateAssignedToNoteNotif(notif: any) {
    let notifType: any = sessionStorage.getItem('notifType');
    let parsedNotifType = JSON.parse(notifType);

    let createUsrNotifObj = {
      user_id: notif.assigned_to_id,
      notification_type_id: parsedNotifType[9].notification_type_id,
      notification_name: parsedNotifType[9].notification_type_name,
      notification_message: `${parsedNotifType[9].notification_type_description} as ${notif.assigned_to_full_name}`,
      notification_effective_from: this.getCurrentTimestamp(),
      notification_effective_to: null,
      notification_lifespan_days: null,
      notification_publish_flag: 1,
      acknowledgment_required: 1,
      notification_acknowledged_on: null,
      app_user_id: this.loggedInUserId,
    };

    console.log('------>', createUsrNotifObj);

    this._sunshineApi
      .postNewUserNotification(createUsrNotifObj)
      .then((res: any) => {
        console.log('ac-update-app-notif-res;:::', res);
        this.openSnackBar(res.message);
      })
      .catch((error) => {
        console.error('create-use-notif-err::::', error);
        this.openSnackBar(error.response.message);
      });
  }
  createAssignedByNoteNotif(notif: any) {
    let notifType: any = sessionStorage.getItem('notifType');
    let parsedNotifType = JSON.parse(notifType);

    let createUsrNotifObj = {
      user_id: notif.assigned_by_id,
      notification_type_id: parsedNotifType[8].notification_type_id,
      notification_name: parsedNotifType[8].notification_type_name,
      notification_message: `${parsedNotifType[8].notification_type_description} as ${notif.assigned_by_full_name}`,
      notification_effective_from: this.getCurrentTimestamp(),
      notification_effective_to: null,
      notification_lifespan_days: null,
      notification_publish_flag: 1,
      acknowledgment_required: 1,
      notification_acknowledged_on: null,
      app_user_id: this.loggedInUserId,
    };

    console.log('------>', createUsrNotifObj);

    this._sunshineApi
      .postNewUserNotification(createUsrNotifObj)
      .then((res: any) => {
        console.log('ac-update-app-notif-res;:::', res);
        this.openSnackBar(res.message);
      })
      .catch((error) => {
        console.error('create-use-notif-err::::', error);
        this.openSnackBar(error.response.message);
      });
  }
  updateAssignedByNoteNotif(notif: any) {
    let notifType: any = sessionStorage.getItem('notifType');
    let parsedNotifType = JSON.parse(notifType);

    let createUsrNotifObj = {
      user_id: notif.assigned_by_id,
      notification_type_id: parsedNotifType[9].notification_type_id,
      notification_name: parsedNotifType[9].notification_type_name,
      notification_message: `${parsedNotifType[9].notification_type_description} as ${notif.assigned_by_full_name}`,
      notification_effective_from: this.getCurrentTimestamp(),
      notification_effective_to: null,
      notification_lifespan_days: null,
      notification_publish_flag: 1,
      acknowledgment_required: 1,
      notification_acknowledged_on: null,
      app_user_id: this.loggedInUserId,
    };

    console.log('------>', createUsrNotifObj);

    this._sunshineApi
      .postNewUserNotification(createUsrNotifObj)
      .then((res: any) => {
        console.log('ac-update-app-notif-res;:::', res);
        this.openSnackBar(res.message);
      })
      .catch((error) => {
        console.error('create-use-notif-err::::', error);
        this.openSnackBar(error.response.message);
      });
  }
  emailCreateNoteAssignedBy(assignee: any, action: string, note: any) {
    console.log('new-task::::', assignee);
    let emailBody = `
      Hi ${assignee.assigned_by_full_name === undefined ||
        assignee.assigned_by_full_name === null
        ? ''
        : assignee.assigned_by_full_name
      },
      <br><br>
      ${action} on below task:
      <ul>
        <li><strong>Lead Id:</strong> ${assignee.lead_id === undefined || assignee.lead_id === null
        ? ''
        : assignee.lead_id
      }</li>
        <li><strong>Task Type:</strong> ${assignee.task_type_name === undefined ||
        assignee.task_type_name === null
        ? ''
        : assignee.task_type_name
      }</li>
        <li><strong>Assigned To:</strong> ${assignee.assigned_to_full_name === undefined ||
        assignee.assigned_to_full_name === null
        ? ''
        : assignee.assigned_to_full_name
      }</li>
        <li><strong>Disposition Stage:</strong> ${assignee.disposition_stage === undefined ||
        assignee.disposition_stage === null
        ? ''
        : assignee.disposition_stage
      }</li>
        <li><strong>Disposition Status:</strong> ${assignee.disposition_status === undefined ||
        assignee.disposition_status === null
        ? ''
        : assignee.disposition_status
      }</li>
        <li><strong>Disposition Code:</strong> ${assignee.disposition_code === undefined ||
        assignee.disposition_code === null
        ? ''
        : assignee.disposition_code
      }</li>
        <li><strong>Assigned Date:</strong> ${assignee.assigned_dtm === undefined || assignee.assigned_dtm === null
        ? ''
        : assignee.assigned_dtm
      }</li>
        <li><strong>Target Date:</strong> ${assignee.target_dtm === undefined || assignee.target_dtm === null
        ? ''
        : assignee.target_dtm
      }</li>
        <li><strong>Task Status:</strong> ${assignee.task_status_type_name === undefined ||
        assignee.task_status_type_name === null
        ? ''
        : assignee.task_status_type_name
      }</li>
      </ul>
      <br>
      <ul>
        <li><strong>Note:</strong> ${note === undefined || note === null ? '' : note
      }</li>
      </ul>
      <br>
      Thank you,<br>
      Team Sunshine Solutions Pvt. Ltd.<br>
      This automated mail was sent by Sunshine Solutions Pvt. Ltd. Please do not reply directly to this email.
      For questions or assistance, please get in touch with info@mailers.codeswift.in.
    `;

    let receiverEmailId = assignee.assigned_by_email;
    let emailSubject = `${action} - "${assignee.task_type_name}"`;

    let finalEmail = {
      to: receiverEmailId,
      subject: emailSubject,
      emailBody: emailBody,
    };

    this._sunshineApi
      .sendEmail(finalEmail)
      .then((res: any) => {
        console.log('task-create-email-res::::', res);
        this.openSnackBar(res.message);
        console.log(
          `Email sent for new task to: ${assignee.assigned_by_email}`
        );
      })
      .catch((error) => {
        this.openSnackBar(error);
      });
  }
  emailCreateNoteAssignedTo(assignee: any, action: string, note: any) {
    console.log('new-task::::', assignee);
    let emailBody = `
    Hi ${assignee.assigned_by_full_name},
    <br><br>
    ${action} on below task:
    <ul>
      <li><strong>Lead Id:</strong> ${assignee.lead_id}</li>
      <li><strong>Task Type:</strong> ${assignee.task_type_name}</li>
      <li><strong>Assigned To:</strong> ${assignee.assigned_to_full_name}</li>
      <li><strong>Disposition Stage:</strong> ${assignee.disposition_stage}</li>
      <li><strong>Disposition Status:</strong> ${assignee.disposition_status}</li>
      <li><strong>Disposition Code:</strong> ${assignee.disposition_code}</li>
      <li><strong>Assigned Date:</strong> ${assignee.assigned_dtm}</li>
      <li><strong>Target Date:</strong> ${assignee.target_dtm}</li>
      <li><strong>Task Status:</strong> ${assignee.task_status_type_name}</li>
    </ul>
    <br>
    <ul>
      <li><strong>Note:</strong> ${note}</li>
    </ul>
    <br>
    Thank you,<br>
    Team Sunshine Solutions Pvt. Ltd.<br>
    This automated mail was sent by Sunshine Solutions Pvt. Ltd. Please do not reply directly to this email.
    For questions or assistance, please get in touch with info@mailers.codeswift.in.
  `;

    let receiverEmailId = assignee.assigned_to_email;
    let emailSubject = `${action} - "${assignee.task_type_name}"`;

    let finalEmail = {
      to: receiverEmailId,
      subject: emailSubject,
      emailBody: emailBody,
    };

    this._sunshineApi
      .sendEmail(finalEmail)
      .then((res: any) => {
        console.log('task-create-email-res::::', res);
        this.openSnackBar(res.message);
        console.log(
          `Email sent for new task to: ${assignee.assigned_to_email}`
        );
      })
      .catch((error) => {
        this.openSnackBar(error);
      });
  }

  getCurrentTimestamp() {
    // Create a date for IST time (UTC+5:30)
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
    const istTime = new Date(now.getTime() + (istOffset - now.getTimezoneOffset() * 60 * 1000));

    const year = istTime.getFullYear();
    const month = String(istTime.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const day = String(istTime.getDate()).padStart(2, '0');

    const hours = String(istTime.getHours()).padStart(2, '0');
    const minutes = String(istTime.getMinutes()).padStart(2, '0');
    const seconds = String(istTime.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  async updateTask(data: any) {
    console.log('update-task-dialogData:::', data);
    this.showProgressBar = true;


    console.log('edit-new-task-obj::::::::>>>>>>', this.editTaskObj);
    const nullSafetyCheck = this.checkNullKeys(this.editTaskObj);
    if (!nullSafetyCheck.status) {
      this.openSnackBar(nullSafetyCheck.msg);
      this.showProgressBar = false;
      this.disableCreateTaskBtn = true;
      return;
    }

    // Preserve the original target date from dialog data to prevent timezone conversion issues
    // Only use the edited target date if the user has actually changed it
    const originalTargetDate = this.data.dialogData.target_dtm?.split('T')[0];
    
    // Check if there's a discrepancy between target_dtm and eod_target_dtm
    // eod_target_dtm represents the intended end-of-day target date
    const eodTargetDate = this.data.dialogData.eod_target_dtm?.split(' ')[0];
    
    console.log('Target date debugging:', {
      originalTargetDate,
      eodTargetDate,
      currentTargetDate: this.editTaskObj.target_dtm,
      targetDateChanged: this.targetDateChanged,
      originalDialogData: this.data.dialogData.target_dtm,
      eodTargetDtm: this.data.dialogData.eod_target_dtm
    });

    // If the target date hasn't been changed by the user, use the correct date
    if (!this.targetDateChanged) {
      // If eod_target_dtm is available and different from target_dtm, use eod_target_dtm date
      if (eodTargetDate && eodTargetDate !== originalTargetDate) {
        this.editTaskObj.target_dtm = eodTargetDate;
        console.log('Using eod_target_dtm date (corrected):', eodTargetDate);
      } else {
        this.editTaskObj.target_dtm = originalTargetDate;
        console.log('Using original target date:', originalTargetDate);
      }
    }

    // Fetch and attach customer name before updating the task
    this.editTaskObj.customer_name = await this.fetchCustomerName(this.editTaskObj.lead_id, this.editTaskObj.product_account_no);

    try {
      console.log('Final editTaskObj being sent to backend:', {
        task_id: this.editTaskObj.task_id,
        target_dtm: this.editTaskObj.target_dtm,
        task_status_type_id: this.editTaskObj.task_status_type_id,
        targetDateChanged: this.targetDateChanged
      });
      
      const res: any = await this._sunshineApi.editTaskByTaskId(
        this.editTaskObj
      );
      this.showProgressBar = false;
      this.dialogRef.close({
        message: `Task Updated`,
        update: 1,
        taskId: this.editTaskObj.task_id,
        leadId: this.editTaskObj.lead_id,
      });

      if (this.createTaskEmailNotif.assigned_to_id) {
        console.log(this.createTaskEmailNotif.assigned_to_id);
        this.updateAssignedToTaskNotif(this.createTaskEmailNotif);
        if (
          this.createTaskEmailNotif.disposition_code === 'PAID' ||
          this.createTaskEmailNotif.disposition_code === 'PTP' ||
          this.createTaskEmailNotif.disposition_code === 'PART PAYMENT'
        ) {
          this.emailCreateTaskAssignedTo(
            this.createTaskEmailNotif,
            'Task Updated'
          );
        }
      }

      this.openSnackBar(res.message);
      
      // Refresh sidebar status after successful task update
      await this.notificationService.refreshSidebarStatus();
      
      // Trigger dashboard counts refresh to update touched/untouched status
      this.notificationService.triggerDashboardRefresh();
    } catch (error) {
      console.error('task-edit-err::', error);
      this.showProgressBar = false;
      this.disableCreateTaskBtn = true;
      this.dialogRef.close({
        message: `Task Update Failed`,
        update: 0,
        taskId: this.editTaskObj.task_id,
        leadId: this.editTaskObj.lead_id,
      });
      this.openSnackBar('Failed to update task. Please try again later.');
    }

    // After task update, reset the contactableChanged flag
    this.contactableChanged = false;
  }

  cancelTask() {
    this.dialogRef.close({ message: `Task Cancelled`, cancel: 1 });
  }

  getNotesByTaskId(taskId: number) {
    this.showProgressBar = true;
    console.log(taskId);

    let params = { note_id: null, task_id: taskId };
    this._sunshineApi
      .fetchAllNotes(params)
      .then((res: any) => {
        this.showProgressBar = false;
        this.notesArr = res.data[0];
        console.log('::::::::notes-get', res.data[0]);
        if (this.notesArr.length > 0) {
          this.openSnackBar(res.message);
        } else {
          // this.openSnackBar(`No Notes Found`);
        }
      })
      .catch((error) => {
        this.showProgressBar = false;
        this.openSnackBar(error);
      });
  }

  addNewNote() {
    this.notesArr.push({
      app_user_id: this.loggedInUserId,
      task_id: this.dialogData.task_id,
      note: '',
      isNoteDisabled: true,
      isEdited: false,
    });
  }
  deleteNote(note: any, i: number) {
    if (this.notesArr[i]['note'] === '') {
      // this.openSnackBar(`Empty notes cannot be created`);
      // this.notesArr[i]['isNoteDisabled'] = true;
      this.notesArr.splice(i, 1);
      return;
    } else {
      note.status = 0;
      (note.app_user_id = this.loggedInUserId), delete note.created_id;
      delete note.created_dtm;
      delete note.modified_id;
      delete note.modified_dtm;
      delete note.task_id;
      delete note.isNoteDisabled;
      console.log('Deleting note:', note);
      this.showProgressBar = true;
      // let notesParam = {};
      this._sunshineApi
        .editNoteByNoteId(note)
        .then((res: any) => {
          this.dialogRef.close();
          this.showProgressBar = false;
          this.openSnackBar(`Note Deleted Successfully`);
        })
        .catch((error) => {
          this.showProgressBar = false;
          console.error(error);
          this.openSnackBar(`Failed to delete note`);
        });
    }
  }

  validateDigits(event: any, index: number) {
    const inputValue = event.target.value;
    const digitCount = inputValue.replace(/[^0-9]/g, '').length;

    if (digitCount >= 7) {
      this.errorMessage[index] = 'You cannot enter more than 7 digits.';
      // Prevent further input by resetting to previous value (up to 7 digits)
      const truncatedValue = inputValue
        .split('')
        .filter((char: any, i: number, arr: any) => {
          return (
            arr
              .slice(0, i + 1)
              .join('')
              .replace(/[^0-9]/g, '').length <= 7
          );
        })
        .join('');
      event.target.value = truncatedValue;
      this.notesArr[index].note = truncatedValue; // Update the note object
    } else {
      this.errorMessage[index] = '';
      this.notesArr[index].note = inputValue; // Update the note object
    }
  }
  typeNotes(event: any, i: number) {
    let noteTxt = event.target.value;
    if (noteTxt !== '') {
      // this.notesDisabled = false;
      this.notesArr[i]['note'] = noteTxt;
      this.notesArr[i]['isNoteDisabled'] = false;
      this.notesArr[i]['isEdited'] = true;
    } else {
      // this.notesDisabled = true;
      this.notesArr[i]['isNoteDisabled'] = true;
      this.notesArr[i]['isEdited'] = false;
    }

    console.log('txt::', this.notesArr);
  }
  async saveNote(noteId: number | undefined, note: any, i: number) {
    const isEmptyNote = this.notesArr[i].note === '';

    if (isEmptyNote) {
      this.openSnackBar(`Empty notes cannot be created`);
      this.notesArr[i].isNoteDisabled = true;
      return;
    }

    try {
      if (noteId === undefined) {
        console.log('Creating new note:', note);
        delete note.isNoteDisabled;
        this.notesArr[i].isNoteDisabled = false;
        this.notesArr[i]['isEdited'] = false;

        this.openSnackBar(`CREATE NEW NOTE`);
        this.showProgressBar = true;
        const res = await this._sunshineApi.createNewNote(note);
        // this.dialogRef.close();
        this.showProgressBar = false;
        this.openSnackBar(res.message);
        // if (this.createTaskEmailNotif.assigned_to_id) {
        //   this.createAssignedToNoteNotif(this.createTaskEmailNotif);
        //   this.emailCreateNoteAssignedTo(
        //     this.createTaskEmailNotif,
        //     'New Note added',
        //     this.notesArr[i]['note']
        //   );
        // }
        // Enable update task button after adding note
        this.disableCreateTaskBtn = false;
        // this.tasksForm.markAsDirty();
      } else {
        console.log('Editing note:', noteId, note);
        this.notesArr[i].isNoteDisabled = false;
        this.notesArr[i]['isEdited'] = false;

        this.openSnackBar(`UPDATE NOTE`);
        note.app_user_id = this.loggedInUserId;
        delete note.created_id;
        delete note.created_dtm;
        delete note.modified_id;
        delete note.modified_dtm;
        delete note.task_id;
        delete note.isNoteDisabled;
        this.showProgressBar = true;
        const res = await this._sunshineApi.editNoteByNoteId(note);
        // this.dialogRef.close();
        this.showProgressBar = false;
        this.openSnackBar(res.message);
        // if (this.createTaskEmailNotif.assigned_to_id) {
        //   this.updateAssignedToNoteNotif(this.createTaskEmailNotif);
        //   this.emailCreateNoteAssignedTo(
        //     this.createTaskEmailNotif,
        //     'Note(s) Updated',
        //     this.notesArr[i]['note']
        //   );
        // }
        // Enable update task button after updating note
        this.disableCreateTaskBtn = false;
        // this.tasksForm.markAsDirty();
      }
    } catch (error) {
      this.showProgressBar = false;
      console.error('An error occurred:', error);

      if (error instanceof HttpErrorResponse) {
        // Handle HTTP errors
        this.openSnackBar(
          'Failed to create or update note. Please try again later.'
        );
      } else if (error instanceof Error) {
        // Handle other types of errors
        this.openSnackBar(
          'An unexpected error occurred. Please try again later.'
        );
      } else {
        // Handle other types of errors
        this.openSnackBar('An unknown error occurred. Please try again later.');
      }
    }
  }

  getAllContacts(leadId: number) {
    const leadParams = {
      lead_id: leadId,
      display_latest: 1,
    };

    this._sunshineApi
      .fetchLeadContacts(leadParams)
      .then((res: any) => {
        const resData = res.data[0];
        // console.log('fetchLeadContacts-->', res.data[0]);
        return resData;
      })
      .catch((error) => {
        this.showProgressBar = false;
        console.error(error);
      });
  }
  openContactDialog(leadId: number) {
    this.disableCreateTaskBtn = false; // Enable Update Task as soon as dialog opens
    let contactData: any;

    const leadParams = {
      lead_id: leadId,
      display_latest: 1,
    };

    this.showProgressBar = true;
    this._sunshineApi
      .fetchLeadContacts(leadParams)
      .then((res: any) => {
        this.showProgressBar = false;
        contactData = res.data[0];

        const currentModeOfContact = this.tasksForm.get('mode_of_contact')?.value || 
                                   this.dialogData?.mode_of_contact || 
                                   this.selectedContactMode;

        const dialogData =
          Array.isArray(contactData) && contactData.length > 0
            ? {
              lead_id: leadId,
              contact_mode_list: currentModeOfContact,
              app_user_id: this.loggedInUserId,
              customer_name: contactData[0].customer_name,
              email: contactData[0].email,
              phone: contactData[0].phone,
              phone_ext: contactData[0].phone_ext,
              alternate_phone: contactData[0].alternate_phone,
              is_primary: contactData[0].is_primary,
              task_id: this.dialogData?.task_id || null,
              // Add mode-specific requirements
              required_fields: this.getRequiredFieldsForMode(currentModeOfContact),
            }
            : {
              lead_id: leadId,
              contact_mode_list: currentModeOfContact,
              app_user_id: this.loggedInUserId,
              task_id: this.dialogData?.task_id || null,
              // Add mode-specific requirements
              required_fields: this.getRequiredFieldsForMode(currentModeOfContact),
            };

        const dialogRef = this.contactsDialog.open(ContactDialogComponent, {
          data: {
            dialogTitle: 'Contact Details',
            dialogText: 'Enter contact information',
            dialogData: dialogData,
          },
        });

        dialogRef.afterClosed().subscribe((result: any) => {
          console.log(`Create Contact Dialog result::::`, result);
          if (result && result.create == 1) {
            this.lastUpdatedDetail = 'contact';
            this.checkExistingDetails(leadId);
            this.disableCreateTaskBtn = false;
            this.contactableChanged = true;
            this.tasksForm.markAsDirty();
          }
        });
      })
      .catch((error) => {
        this.showProgressBar = false;
        console.error(error);
        this.openSnackBar('Failed to fetch contact data');
      });
  }
  openAddressDialog(leadId: number) {
    this.disableCreateTaskBtn = false;
    const dialogRef = this.addressDialog.open(AddressDialogComponent, {
      data: {
        dialogTitle: 'New address',
        dialogText: `This is test address data`,
        dialogData: {
          lead_id: leadId,
          app_user_id: this.loggedInUserId,
          task_id: this.dialogData?.task_id || null,
          contact_mode_list: this.tasksForm.get('mode_of_contact')?.value || this.selectedContactMode
        }
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result && result.create == 1) {
        this.disableCreateTaskBtn = false;
        this.contactableChanged = true;
        this.tasksForm.markAsDirty();
      }
    });
  }

  openVisaCheckDialog(leadId: number) {
    this.disableCreateTaskBtn = false;
    const dialogRef = this.addressDialog.open(VisaCheckDialogComponent, {
      data: {
        dialogTitle: 'Visa Check',
        dialogText: `Enter visa details`,
        dialogData: {
          lead_id: leadId,
          app_user_id: this.loggedInUserId,
          task_id: this.dialogData?.task_id || null
        }
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result && result.create == 1) {
        this.lastUpdatedDetail = 'visa';
        this.checkExistingDetails(leadId);
        this.disableCreateTaskBtn = false;
        this.contactableChanged = true;
        this.tasksForm.markAsDirty();
        
        // If Emirates ID was updated, refresh the account details
        if (result.emiratesIdUpdated) {
          // Emit an event to refresh account details in parent component
          this.submitClicked.emit({
            action: 'refreshAccountDetails',
            leadId: leadId
          });
        }
      }
    });
  }
  openMOLCheckDialog(leadId: number) {
    this.disableCreateTaskBtn = false;
    const dialogRef = this.addressDialog.open(MolCheckDialogComponent, {
      data: {
        dialogTitle: 'New MOL Check',
        dialogText: `This is test MOL data`,
        dialogData: {
          lead_id: leadId,
          app_user_id: this.loggedInUserId,
          task_id: this.dialogData?.task_id || null,
          contact_mode_list: this.dialogData?.mode_of_contact || this.selectedContactMode,
        },
      },
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result && result.create == 1) {
        this.disableCreateTaskBtn = false;
        this.contactableChanged = true;
        this.tasksForm.markAsDirty();
      }
    });
  }

  openWebTracingDialog(leadId: number) {
    this.disableCreateTaskBtn = false;
    this.disableCreateTaskBtn = true;

    const dialogRef = this.addressDialog.open(WebTracingDialogComponent, {
      height: 'auto',
      width: '500px',
      data: {
        dialogTitle: 'Web Tracing',
        dialogText: `Enter web tracing information`,
        dialogData: {
          lead_id: leadId,
          app_user_id: this.loggedInUserId,
          task_id: this.dialogData?.task_id || null,
        },
      },
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      console.log('Web Tracing Dialog Result:', result);
      if (result && result.create == 1) {
        this.lastUpdatedDetail = 'webTracing';
        this.contactableChanged = true;
        console.log('Web Tracing was added, setting contactableChanged to true');

        this.detailsStatus.webTracing = true;

        console.log('Rechecking existing details after web tracing save');
        this.checkExistingDetails(leadId);
        if (this.dialogData && this.dialogData.task_id) {
          this.disableCreateTaskBtn = false;
          this.tasksForm.markAsDirty();
        }
      }
    });
  }

  openTracingDetailsDialog(leadId: number) {
    this.disableCreateTaskBtn = false;
    const dialogRef = this.addressDialog.open(TracingDetailsDialogComponent, {
      data: {
        dialogTitle: 'Tracing Details',
        dialogText: `Enter tracing details`,
        dialogData: {
          lead_id: leadId,
          app_user_id: this.loggedInUserId,
          task_id: this.dialogData?.task_id || null
        }
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result && result.create == 1) {
        this.lastUpdatedDetail = 'tracing';
        this.checkExistingDetails(leadId);
        this.disableCreateTaskBtn = false;
        this.contactableChanged = true;
        this.tasksForm.markAsDirty();
      }
    });
  }

  canEditTargetDate(targetDate: string): boolean {
    if (!targetDate) return true; // Allow editing if no target date is set

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const targetDateTime = new Date(targetDate);
    targetDateTime.setHours(0, 0, 0, 0);

    // For agents: only allow editing future dates
    if (this.loggedInUserRole === 'AGENT') {
      return targetDateTime > today;
    }

    // For other roles: allow editing past and future dates
    return true;
  }

  // Add helper methods to revalidate task details
  // checkRequiredDetailsForContactable() {
  //   if (!this.dialogData?.task_id) return;

  //   this.showProgressBar = true;
  //   let tasksCheckBody = {
  //     task_id: this.dialogData.task_id,
  //     stage: 'CONTACTED'
  //   };

  //   this._sunshineApi.checkEnteriesByTaskId(tasksCheckBody)
  //     .then((res: any) => {
  //       this.showProgressBar = false;
  //       const validationResult = res.data[0]['@occ'];

  //       if (validationResult === 3) {
  //         // All required details are present
  //         this.disableCreateTaskBtn = false;
  //         this.openSnackBar('All required details have been provided. You can update the task now.');
  //       } else {
  //         // Some details are still missing
  //         this.disableCreateTaskBtn = true;
  //         this.openSnackBar('Contact, Visa, and Tracing Details are all required for Contactable tasks');
  //       }
  //     })
  //     .catch((error) => {
  //       this.showProgressBar = false;
  //       this.openSnackBar('Error checking required details');
  //     });
  // }

  // checkRequiredDetailsForNonContactable() {
  //   if (!this.dialogData?.task_id) return;

  //   this.showProgressBar = true;
  //   const tasksCheckBody = {
  //     task_id: this.dialogData.task_id,
  //     stage: 'NON CONTACTED'
  //   };

  //   this._sunshineApi.checkEnteriesByTaskId(tasksCheckBody)
  //     .then((res: any) => {
  //       this.showProgressBar = false;
  //       const validationResult = res.data[0]['@occ'];

  //       if (validationResult === 1) {
  //         // Web tracing details are present
  //         this.disableCreateTaskBtn = false;
  //         this.openSnackBar('Web Tracing Details have been provided. You can update the task now.');
  //       } else {
  //         // Web tracing details are missing
  //         this.disableCreateTaskBtn = true;
  //         this.openSnackBar('Web Tracing Details are required for Non-Contactable tasks');
  //       }
  //     })
  //     .catch((error) => {
  //       this.showProgressBar = false;
  //       this.openSnackBar('Error checking required details');
  //     });
  // }

  // Add a method to check all requirements
  checkAllRequirementsAndUpdateButton() {
    const formValue = this.tasksForm.value;
    const isEditMode = this.dialogData && this.dialogData.task_id;
    
    // Basic form validation
    const hasRequiredFields = formValue.assigned_by_full_name && 
                            formValue.assigned_to_full_name && 
                            formValue.task_type_name &&
                            formValue.assigned_dtm &&
                            formValue.target_dtm;

    // Document upload specific validation
    const hasValidDocumentUpload = formValue.task_type_name !== 'DOCUMENT UPLOAD' || 
                                 (formValue.task_type_name === 'DOCUMENT UPLOAD' && 
                                  (formValue.document_url || this.file));

    // Contactable/Non-contactable validation
    const hasValidStage = formValue.stage && formValue.stage_status;
    
    // For contacted tasks, check required details and mode-specific requirements
    const modeValidation = formValue.stage === 'CONTACTED' ? 
      this.validateModeOfContactRequirements(formValue.mode_of_contact) : 
      { isValid: true, missingField: '' };
    
    const hasValidContactedDetails = formValue.stage !== 'CONTACTED' || 
                                   (formValue.stage === 'CONTACTED' && 
                                    modeValidation.isValid &&
                                    this.detailsStatus.contact && 
                                    this.detailsStatus.visa && 
                                    this.detailsStatus.tracing);

    // For non-contacted tasks, check web tracing
    const hasValidNonContactedDetails = formValue.stage !== 'NON CONTACTED' || 
                                      (formValue.stage === 'NON CONTACTED' && 
                                       this.detailsStatus.webTracing);

    // Update button states
    if (isEditMode) {
      this.disableUpdateTaskBtn = !(hasRequiredFields && 
                                   hasValidDocumentUpload && 
                                   hasValidStage && 
                                   hasValidContactedDetails && 
                                   hasValidNonContactedDetails);
    } else {
      this.disableCreateTaskBtn = !(hasRequiredFields && 
                                   hasValidDocumentUpload && 
                                   hasValidStage && 
                                   hasValidContactedDetails && 
                                   hasValidNonContactedDetails);
    }
  }

  // Quiet version that doesn't update the UI
  checkWebTracingDetailsQuietly(leadId: number) {
    const webTracingParams = {
      lead_id: leadId
    };

    this._sunshineApi.fetchWebTracingDetails(webTracingParams)
      .then((res: any) => {
        const webTracingData = res.data[0];
        // Make sure to check if there's actual data
        this.detailsStatus.webTracing = Array.isArray(webTracingData) && webTracingData.length > 0;
        console.log('Web Tracing Check (Quietly):', this.detailsStatus.webTracing);

        // Don't update UI or show messages
      })
      .catch((error: any) => {
        console.error('Error checking web tracing details:', error);
      });
  }

  // Quiet version that doesn't update the UI
  checkContactedDetailsQuietly(leadId: number) {
    let checksCompleted = 0;
    const totalChecks = 4; // contact, visa, tracing, phone

    // Function to check if all checks have completed
    const checkCompletion = () => {
      checksCompleted++;
      if (checksCompleted === totalChecks) {
        console.log('Contacted Details Status (Quietly):',
          {
            contact: this.detailsStatus.contact,
            visa: this.detailsStatus.visa,
            tracing: this.detailsStatus.tracing,
            phone: this.detailsStatus.phone
          });
        // Don't update UI or show messages
      }
    };

    // Check for contact details
    const contactParams = {
      lead_id: leadId,
      display_latest: 1
    };

    this._sunshineApi.fetchLeadContacts(contactParams)
      .then((res: any) => {
        const contactData = res.data[0];
        this.detailsStatus.contact = (contactData && contactData.length > 0);
        checkCompletion();
      })
      .catch((error: any) => {
        console.error('Error checking contact details:', error);
        checkCompletion();
      });

    // Check for visa details
    const visaParams = {
      lead_id: leadId
    };

    this._sunshineApi.getVisaCheckByLead(visaParams)
      .then((res: any) => {
        const visaData = res.data[0];
        this.detailsStatus.visa = (visaData && visaData.length > 0);
        checkCompletion();
      })
      .catch((error: any) => {
        console.error('Error checking visa details:', error);
        checkCompletion();
      });

    // Check for tracing details
    const tracingParams = {
      lead_id: leadId
    };

    this._sunshineApi.fetchTracingDetails(tracingParams)
      .then((res: any) => {
        const tracingData = res.data[0];
        this.detailsStatus.tracing = (tracingData && tracingData.length > 0);
        checkCompletion();
      })
      .catch((error: any) => {
        console.error('Error checking tracing details:', error);
        checkCompletion();
      });

    // Check for phone details (from contact details)
    this._sunshineApi.fetchLeadContacts(contactParams)
      .then((res: any) => {
        const contactData = res.data[0];
        // Check if any contact has a valid phone number
        this.detailsStatus.phone = contactData && contactData.length > 0 && 
          contactData.some((contact: any) => contact.phone && contact.phone.trim() !== '');
        checkCompletion();
      })
      .catch((error: any) => {
        console.error('Error checking phone details:', error);
        checkCompletion();
      });
  }

  // Add a feedback change handler if not present
  onFeedbackChange(event: any) {
    this.tasksForm.markAsDirty();
    // Re-evaluate button state against contactable/non-contactable validators
    this.updateTaskButtonState();
  }

  private updateTaskButtonStateByDispositionFields() {
    const stageField = this.tasksForm.get('stage')?.value;
    const statusField = this.tasksForm.get('stage_status_name')?.value;
    const codeField = this.tasksForm.get('stage_status_code')?.value;
    // First, require all three disposition fields
    if (!(stageField && statusField && codeField)) {
      this.disableCreateTaskBtn = true;
      return;
    }

    // Then, enforce required details based on stage (non-DOCUMENT UPLOAD)
    const isFieldVisit = this.taskType === 'FIELD VISIT';
    if (this.taskType !== 'DOCUMENT UPLOAD') {
      if (stageField === 'CONTACTED' && !isFieldVisit) {
        this.disableCreateTaskBtn = !(this.detailsStatus.contact && this.detailsStatus.visa && this.detailsStatus.tracing);
        return;
      }
      if (stageField === 'NON CONTACTED' && !isFieldVisit) {
        this.disableCreateTaskBtn = !this.detailsStatus.webTracing;
        return;
      }
    }

    // Otherwise enable
    this.disableCreateTaskBtn = false;
  }

  // Helper to enable button for document upload task only when all required fields are present
  private updateButtonForDocumentUploadTask() {
    if (this.taskType === 'DOCUMENT UPLOAD') {
      // For document upload tasks, we need both assigned by/assigned to and document URL
      const hasAssignedBy = this.tasksForm.value.assigned_by_full_name;
      const hasAssignedTo = this.tasksForm.value.assigned_to_full_name;
      const hasDocumentUrl = this.tasksForm.value.document_url;

      // If we have all required fields, enable the button
      if (hasAssignedBy && hasAssignedTo && hasDocumentUrl) {
        this.disableCreateTaskBtn = false;
      } else {
        this.disableCreateTaskBtn = true;
      }

      // If form is dirty (any field changed), enable the button
      if (this.tasksForm.dirty) {
        this.disableCreateTaskBtn = false;
      }
    }
  }

  // Populate country and state for field visit tasks
  private populateFieldVisitLocation() {
    if (!this.dialogData.assigned_to_full_name) {
      return;
    }

    // Get user details from session storage
    let taskUsr: any = sessionStorage.getItem('taskAllUsers');
    if (!taskUsr) {
      console.warn('No user data found in session storage');
      return;
    }

    let parsedUsers = JSON.parse(taskUsr);
    const assignedUser = parsedUsers.find((user: any) => 
      user.full_name === this.dialogData.assigned_to_full_name
    );

    if (assignedUser && assignedUser.country) {
      // Set the country
      this.selectedCountry = assignedUser.country;
      this.tasksForm.patchValue({ country: assignedUser.country });
      
      // Load states for the selected country
      this.states = this.locationService.getStatesByCountry(assignedUser.country);
      
      // If user has state information, set it as well
      if (assignedUser.state) {
        this.selectedState = assignedUser.state;
        this.tasksForm.patchValue({ state: assignedUser.state });
      }
      
      console.log('Field visit location populated:', {
        country: assignedUser.country,
        state: assignedUser.state
      });
    } else {
      console.warn('Assigned user not found or missing location data:', this.dialogData.assigned_to_full_name);
    }
  }

  // Add method to check if a user is deactivated
  isUserDeactivated(fullName: string): boolean {
    return this.deactivatedUsers.some(user => user.full_name === fullName);
  }

  // Add method to show warning when deactivated user icon is clicked
  showDeactivatedUserWarning(field: string) {
    let message = `Warning: The selected ${field} user has been deactivated/deleted from the platform.`;
    this._snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}
