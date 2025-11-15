import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  inject,
  OnDestroy,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Observable, map, startWith, filter, Subscription } from 'rxjs';
import { CustomFunctionsService } from 'src/app/sunshine-services/custom-functions.service';
import { SunshineInternalService } from 'src/app/sunshine-services/sunshine-internal.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { DatePipe } from '@angular/common';
import { LocationServiceService } from 'src/app/sunshine-services/location-service.service';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { ScrollService } from 'src/app/sunshine-services/scroll.service';

export interface Modules {
  module_id: Number;
  module_name: String;
  module_desc: String;
  module_bit: Number;
  route_name: String;
  module_icon: String;
  module_alias: String;
  module_type: String;
  module_group: String;
  module_group_sort_order: Number;
  module_sort_order: Number;
  reporting_to?: String;
}

@Component({
  selector: 'app-usr-view-mgt',
  templateUrl: './usr-view-mgt.component.html',
  styleUrls: ['./usr-view-mgt.component.css'],
})
export class UsrViewMgtComponent implements OnInit, AfterViewInit, OnDestroy {
  userForm: any;
  userCompanyForm: any;
  panelOpenState = false;
  step = 0;
  modules: Modules[] = [];
  listFilteredModule: Modules[] = [];
  selectPrivileges = new FormControl('');
  privilegesList: any[] = [];
  selectedPrivArr: any = [];
  displayedAccHoldersColumns: string[] = [
    'module_id',
    'module_alias',
    'module_type',
    'role_dropdown',
    'active_inactive',
    'actions',
  ];
  dataSource: any;
  myDataArray: any[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  resultsLength: number = 0;
  privilege_bit: number = 1;
  selecetedUserURC: any = [];

  selectedRole: string = '';
  rolesList: any;
  privArr: Array<number> = [];

  urc: any = {};
  companyId: any;
  userId: any;
  app_user_id: any;
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  durationInSeconds = 5;

  showProgressBar: boolean = false;
  userSaveProg: boolean = false;
  profileURL: string = '';
  userStatus: number = 0;
  roleId: any;

  reportingToUsers: any = [];
  allUsersData: any = [];

  roleControl = new FormControl(null, [Validators.required]);
  rolesList1: { role_name: string; role_id: number }[] = [];
  filteredRoles!: Observable<{ role_name: string; role_id: string }[]>;

  reportingControl = new FormControl(null, [Validators.required]);
  reportingUsers: { user_id: string; full_name: string }[] = [];
  filterdReportingUsers!: Observable<{ user_id: number; full_name: string }[]>;

  @ViewChild('search') searchTextBox!: ElementRef;

  selectFormControl = new FormControl();
  searchTextboxControl = new FormControl(null);
  selectedValues: any = [];
  allCompany: { company_name: string; company_id: number }[] = [];
  filteredCompany!: Observable<{ company_name: string; company_id: number }[]>;
  // userId: any = 0;

  updateCompanies: any = [];
  compTypeId: any;
  countries: any[] = [];
  states: any[] = [];
  cities: string[] = [];

  selectedCountry: string = '';
  selectedState: string = '';
  selectedCity: string = '';
  isManagePrivilegeDisabled: boolean = false;
  previousRoleName: string = '';
  isRoleOnlyUpdate: number = 0;

  selectedPrivilegesMap: { [moduleId: number]: number[] } = {};
  changedModulesMap: { [moduleId: number]: boolean } = {};
  activeUsers: any[] = [];
  deactivatedUsers: any[] = [];
  selectedReportingUserIsDeactivated: boolean = false;
  private routerSubscription: Subscription;

  // Add properties for change detection
  originalFormValues: any = {};
  originalRoleValue: string = '';
  originalReportingValue: string = '';
  originalSelectedValues: any[] = [];
  hasFormChanges: boolean = true; // Initialize to true so save button is disabled initially

  constructor(
    private _router: Router,
    private _aR: ActivatedRoute,
    private _sunshineApi: SunshineInternalService,
    private _customFn: CustomFunctionsService,
    private _snackBar: MatSnackBar,
    private _fb: FormBuilder,
    private _datePipe: DatePipe,
    private locationService: LocationServiceService,
    private dialog: MatDialog,
    private scrollService: ScrollService
  ) {
    this.userForm = new FormGroup({
      user_id: new FormControl(null),
      designation: new FormControl(null),
      first_name: new FormControl(null),
      last_name: new FormControl(null),
      email_address: new FormControl(null),
      password: new FormControl(null),
      is_admin: new FormControl(null),
      is_admin_display: new FormControl(null),
      display_active_date: new FormControl(null),
      phone: new FormControl(null),
      otp: new FormControl(null),
      mac_address: new FormControl(null),
      allowed_ip: new FormControl(null),
      last_login: new FormControl(null),
      last_login_ip_address: new FormControl(null),
      role_name: new FormControl(null),
      company_code: new FormControl(null),
      image_url: new FormControl(null),
      reporting_to_id: new FormControl(null, [Validators.required]),
      country: new FormControl(null),
      state: new FormControl(null),
      city: new FormControl(null),
      status: new FormControl(null),
      created_id: new FormControl(null),
      created_dtm: new FormControl(null),
      modified_id: new FormControl(null),
      modified_dtm: new FormControl(null),
    });

    this.userCompanyForm = this._fb.group({
      company: this._fb.array([]),
    });

    // Subscribe to router events to scroll to top on navigation
    this.routerSubscription = this._router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.scrollToTop();
      });
  }

  ngOnInit(): void {
    // Scroll to top of the page when component initializes
    this.scrollToTop();
    this.getAllUsers();
    let userDetails: any = sessionStorage.getItem('userDetails');
    let parsedUsrDetails = JSON.parse(userDetails);
    this.app_user_id = parsedUsrDetails.user_id;
    this.getAllModules();
    this.getAllPrivileges();
    this.fetchAllRoles();
    this.getAllComapanyType();
    this.dataSource = new MatTableDataSource(this.myDataArray);
    this.countries = this.locationService.getCountries();
    this.userForm.valueChanges.subscribe(() => {
      this.checkIfReportingUserIsDeactivated();
      this.checkFormChanges();
    });
    
    // Subscribe to role control changes
    this.roleControl.valueChanges.subscribe(() => {
      this.checkFormChanges();
    });
    
    // Subscribe to reporting control changes
    this.reportingControl.valueChanges.subscribe(() => {
      this.checkFormChanges();
    });
    
    // Subscribe to company selection changes
    this.selectFormControl.valueChanges.subscribe(() => {
      this.checkFormChanges();
    });
  }

  ngOnDestroy(): void {
    // Clean up subscription
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  onCountryChange(event: any) {
    //console.log(event.value);
    let countryEvent = event.value;
    this.selectedCountry = countryEvent;
    this.states = this.locationService.getStatesByCountry(countryEvent);
    this.cities = [];
    this.userForm.patchValue({
      country: this.selectedCountry,
    });
  }

  onStateChange(event: any) {
    //console.log(event.value);
    let stateEvent = event.value;
    this.selectedState = stateEvent;
    this.cities = this.locationService.getCitiesByState(
      this.selectedCountry,
      this.selectedState
    );

    this.userForm.patchValue({
      state: this.selectedState,
    });
  }
  onCityChange(event: any) {
    //console.log(event.value);
    let cityEvent = event.value;
    this.selectedCity = cityEvent;
    //console.log('Selected City:', this.selectedCity);
    this.userForm.patchValue({
      city: this.selectedCity,
    });
    // Add any additional logic needed when the city is changed
  }
  getUserCompany(): Promise<void> {
    // ////console.log('fbjdbsfj')
    let params = {
      user_id: this.userId,
    };

    return this._sunshineApi
      .fectchUserCompany(params)
      .then((res: any) => {
        let response = res.data[0];
        ////console.log('get users company', response);

        let filter = response.filter((comp: any) => {
          return comp.status === 1;
        });

        if (filter.length > 0) {
          this.selectedValues = filter;
          this.selectFormControl.patchValue(response);
          // Store original company selection for change detection
          this.originalSelectedValues = [...filter];
          // ////console.log("getUserCompany-->", response);
          this.setSelectedValues();
        }
        
        // Note: We'll initialize change detection after all data is loaded
        // in the Promise.all callback
      })
      .catch((err) => {
        ////console.log(err);
        throw err; // Re-throw to maintain promise rejection
      });
  }
  // isCompanySelected(companyName: string): boolean {
  //   return this.selectFormControl.value && this.selectFormControl.value.includes(companyName);
  // }

  // onCheckboxChange(event: any, comp: any) {

  // }

  getAllCompany() {
    this._sunshineApi
      .fetchAllCompany()
      .then((res: any) => {
        let resData = res.data;
        ////console.log(resData);
        let customerCompany = resData.filter((comp: any) => {
          return comp.company_type_id == parseInt(this.compTypeId);
        });
        ////console.log(customerCompany.length);
        this.allCompany = customerCompany;
        ////console.log('  this.allCompany-->', this.allCompany);
        this.filteredCompany = this.searchTextboxControl.valueChanges.pipe(
          startWith(''),
          map((name) => this._companyFilter(name || ''))
        );
      })
      .catch((error) => {
        this.showProgressBar = false;
        ////console.error(error);
      });
  }
  getAllComapanyType() {
    this._sunshineApi.fetchAllCompanyType().then((res: any) => {
      ////console.log(res);
      if (res.errorCode == 0) {
        let companyTypes = res.data;
        let findId = companyTypes.find((comp: any) => {
          return comp.company_type_name.toLowerCase().trim() == 'customer';
        });
        this.compTypeId = findId.company_type_id;
        this.getAllCompany();
        ////console.log(this.compTypeId);
      }
    });
  }

  fetchAllRoles() {
    if (!sessionStorage.getItem('roles')) {
      this._sunshineApi
        .fetchRoles()
        .then((rolesRes: any) => {
          ////console.log('userIdRes', userIdRes.data[0][0]);
          let resData = rolesRes.data[0];
          this.rolesList1 = resData;
          //////console.log(resData);
          sessionStorage.setItem('roles', JSON.stringify(resData));
        })
        .catch((error) => {
          ////console.error('getAllRoles', error);
        });
    } else {
      let sessRoles: any = sessionStorage.getItem('roles');
      let parsedSessRoles = JSON.parse(sessRoles);
      this.rolesList1 = parsedSessRoles;
      //////console.log('this.selectedRole', this.selectedRole);
    }
    this.filteredRoles = this.roleControl.valueChanges.pipe(
      startWith(''),
      map((value: any) => this._roleFilter(value || ''))
    );
  }

  getAllUsers() {
    this._sunshineApi
      .fetchAllUsers()
      .then((res: any) => {
        let resData = res.data[0];
        
        // Add full_name field to all users
        resData = resData.map((user: any) => ({
          ...user,
          full_name: `${user.first_name} ${user.last_name}`
        }));
        
        this.activeUsers = resData.filter((user: any) => user.status !== 0);
        this.deactivatedUsers = resData.filter((user: any) => user.status === 0);
        this.allUsersData = this.activeUsers;
        this.captureRouteParams();
        this.checkIfReportingUserIsDeactivated();
      })
      .catch((error) => {
        // this.showProgressBar = false;
        ////console.error(error);
      });
    // this.tableTxt = `User Management`;
  }

  ngAfterViewInit(): void {
    this.paginator.page.subscribe(() => {
      this.resetChangesOnNavigation();
    });
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    // Additional scroll to top after view is initialized for better reliability
    this.scrollToTop();
  }
  resetChangesOnNavigation(): void {
    this.initializeSelectedPrivileges(); // Reset checkboxes to original state

    this.changedModulesMap = {}; // Clear the "changed" tracking

    // If needed, reset URC object (optional)
    this.urc = {
      privilege_list: '',
      status: 0,
      company_id: this.companyId,
      user_id: this.userId,
      module_id: 0,
      role_id: this.roleId,
      app_user_id: this.app_user_id,
    };
  }

  captureRouteParams() {
    let usrParams = this._aR.snapshot.params;

    let usrId = parseInt(usrParams['userId']);
    console.log('usrId-snapshot :', usrId);
    this.companyId = 1;
    this.userId = usrId;
    // this.urc.company_id = this.companyId;
    // this.urc.user_id = this.userId;
    
    // Load user data and company data, then initialize change detection
    Promise.all([
      this.getUserById(usrId),
      this.getUserCompany()
    ]).then(() => {
      // Initialize change detection after all data is loaded
      this.initializeChangeDetection();
    });
    
    this.getAllURCDetailsofUser(usrId);
    this.getCompanyByUserId(usrId);
  }

  getUserById(_id: number): Promise<void> {
    let userBody = {
      user_id: _id,
      first_name: null,
      last_name: null,
      email_address: null,
      phone: null,
      mac_address: null,
    };
    console.log('received-usrId', _id);

    return this._sunshineApi
      .fetchUserById(userBody)
      .then((userIdRes: any) => {
        let resData = userIdRes.data[0][0];
        console.log('User data received:', resData);

        this.onCountryChange({ value: resData.country });
        this.onStateChange({ value: resData.state });

        // Update form values including role_name
        this.userForm.patchValue({
          user_id: resData.user_id,
          designation: resData.designation,
          first_name: resData.first_name,
          last_name: resData.last_name,
          email_address: resData.email_address,
          is_admin: resData.is_admin,
          is_admin_display: resData.is_admin_display,
          display_active_date: resData.display_active_date,
          phone: resData.phone,
          mac_address: resData.mac_address,
          allowed_ip: resData.allowed_ip,
          last_login: this._datePipe.transform(
            resData.last_login,
            'yyyy-MM-dd hh:mm:ss'
          ),
          last_login_ip_address: resData.last_login_ip_address,
          role_name: resData.role_name,
          company_code: resData.company_code,
          image_url: resData.image_url,
          status: resData.status,
          otp: resData.otp,
          password: resData.password,
          reporting_to_id: resData.reporting_to_id,
          country: resData.country,
          state: resData.state,
          city: resData.city,
        });

        // Store original form values for change detection
        this.originalFormValues = { ...this.userForm.value };

        // Set role control value
        if (resData.role_name) {
          this.roleControl.patchValue(resData.role_name);
          console.log(resData.role_name);
          this.previousRoleName = resData.role_name;
          this.selectedRole = resData.role_name;
          this.originalRoleValue = resData.role_name;

          // Get role ID and trigger role-related updates
          const foundRole = this.rolesList1.find(
            (role: any) =>
              role.role_name.toLowerCase() === resData.role_name.toLowerCase()
          );
          if (foundRole) {
            this.roleId = foundRole.role_id;
            this.listReportingUsers(resData.role_name);
          }
        } else {
          console.warn('No role_name found in user data');
        }

        // Set reporting user information
        if (resData.reporting_to_id) {
          // First check in active users
          let repUser = this.activeUsers.find(
            (user: any) => user.user_id === resData.reporting_to_id
          );
          
          // If not found in active users, check in deactivated users
          if (!repUser) {
            repUser = this.deactivatedUsers.find(
              (user: any) => user.user_id === resData.reporting_to_id
            );
            if (repUser) {
              this.reportingControl.patchValue(repUser.full_name as any);
              this.originalReportingValue = repUser.full_name as any;
              this.selectedReportingUserIsDeactivated = true;
              
              // Update the reporting information in the modules data
              this.myDataArray = this.myDataArray.map((module) => ({
                ...module,
                reporting_to: repUser.full_name as any,
              }));
              this.dataSource.data = this.myDataArray;
            }
          } else {
            this.reportingControl.patchValue(repUser.full_name);
            this.originalReportingValue = repUser.full_name;
            this.selectedReportingUserIsDeactivated = false;
            
            // Update the reporting information in the modules data
            this.myDataArray = this.myDataArray.map((module) => ({
              ...module,
              reporting_to: repUser.full_name as any,
            }));
            this.dataSource.data = this.myDataArray;
          }
        }

        this.profileURL = resData.image_url;
        this.userStatus = resData.status;
        this.getAllRoles(this.selectedRole);

        if (!this.selectedRole) {
          this.openSnackBar(
            `'${this.userForm.value.first_name} ${this.userForm.value.last_name}' is not associated to any role `
          );
        }

        // Note: We'll initialize change detection after all data is loaded
        // in the Promise.all callback
      })
      .catch((error) => {
        console.error('Error fetching user by ID:', error);
        this.openSnackBar('Failed to fetch user details');
        throw error; // Re-throw to maintain promise rejection
      });
  }

  // Method to check if any form fields have changed
  checkFormChanges(): void {
    // Check if form values have changed
    const currentFormValues = this.userForm.value;
    const formChanged = Object.keys(this.originalFormValues).some(key => {
      const currentValue = currentFormValues[key];
      const originalValue = this.originalFormValues[key];
      return currentValue !== originalValue;
    });

    // Check if role has changed
    const currentRole = this.roleControl.value || '';
    const roleChanged = currentRole !== this.originalRoleValue;

    // Check if reporting has changed
    const currentReporting = this.reportingControl.value || '';
    const reportingChanged = currentReporting !== this.originalReportingValue;

    // Check if company selection has changed
    const currentSelectedValues = this.selectFormControl.value || [];
    const companyChanged = this.hasCompanySelectionChanged(currentSelectedValues, this.originalSelectedValues);

    // Update the hasFormChanges flag
    const previousHasFormChanges = this.hasFormChanges;
    this.hasFormChanges = formChanged || roleChanged || reportingChanged || companyChanged;
    
    // Log changes for debugging
    if (this.hasFormChanges !== previousHasFormChanges) {
      console.log('Form changes detected:', {
        formChanged,
        roleChanged,
        reportingChanged,
        companyChanged,
        hasFormChanges: this.hasFormChanges
      });
    }
  }

  // Helper method to check if company selection has changed
  hasCompanySelectionChanged(current: any[], original: any[]): boolean {
    // Handle null/undefined cases
    if (!current && !original) return false;
    if (!current || !original) return true;
    
    if (current.length !== original.length) {
      return true;
    }
    
    const currentIds = current.map(comp => comp?.company_id).filter(id => id !== undefined).sort();
    const originalIds = original.map(comp => comp?.company_id).filter(id => id !== undefined).sort();
    
    return !currentIds.every((id, index) => id === originalIds[index]);
  }

  // Method to initialize change detection after data is loaded
  initializeChangeDetection(): void {
    // Store original form values
    this.originalFormValues = { ...this.userForm.value };
    this.originalRoleValue = this.roleControl.value || '';
    this.originalReportingValue = this.reportingControl.value || '';
    this.originalSelectedValues = [...(this.selectFormControl.value || [])];
    
    // Now that we have captured all original values, set hasFormChanges to false
    // This will enable the save button only when actual changes are detected
    this.hasFormChanges = false;
    
    console.log('Change detection initialized. Original values captured:', {
      formValues: this.originalFormValues,
      roleValue: this.originalRoleValue,
      reportingValue: this.originalReportingValue,
      selectedValues: this.originalSelectedValues
    });
  }

  // Method to reset change detection after successful save
  resetChangeDetection(): void {
    this.originalFormValues = { ...this.userForm.value };
    this.originalRoleValue = this.roleControl.value || '';
    this.originalReportingValue = this.reportingControl.value || '';
    this.originalSelectedValues = [...(this.selectFormControl.value || [])];
    this.hasFormChanges = false;
  }

  getAllModules() {
    this.showProgressBar = true;
    this.displayedAccHoldersColumns = [
      'module_id',
      'module_alias',
      'module_type',
      'role_dropdown',
      'active_inactive',
      'actions',
    ];
    this._sunshineApi
      .fetchModules()
      .then((res: any) => {
        let modulesRes = res.data[0];
        this.modules = modulesRes;
        this.listFilteredModule = modulesRes.filter(
          (module: any) => module.module_type == 'list'
        );
        this.myDataArray = modulesRes;
        //console.log('all-modules::', modulesRes);
        this.dataSource = new MatTableDataSource(this.myDataArray);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.resultsLength = this.myDataArray.length;
        this.showProgressBar = false;
      })
      .catch((error) => {
        //////console.log(error);
        this.showProgressBar = false;
        this.modules = [];
        this.openSnackBar('Failed to fetch all modules');
      });
  }

  getAllRoles(currUsrRoleName: string) {
    if (!sessionStorage.getItem('roles')) {
      ////console.log('yes');
      this._sunshineApi
        .fetchRoles()
        .then((rolesRes: any) => {
          // //////console.log('userIdRes', userIdRes.data[0][0]);
          let resData = rolesRes.data[0];
          //////console.log(resData);
          sessionStorage.setItem('roles', JSON.stringify(resData));
        })
        .catch((error) => {
          ////console.error('user-by-id-err', error);
        });
    } else {
      // ////console.log('no');
      let sessRoles: any = sessionStorage.getItem('roles');
      let parsedSessRoles = JSON.parse(sessRoles);
      this.rolesList = parsedSessRoles;
      //console.log('this.selectedRole', this.selectedRole);
      const Role = this.rolesList.find(
        (role: any) =>
          role.role_name.toLowerCase().trim() ==
          currUsrRoleName.toLowerCase().trim()
      );

      if (Role) {
        let foundRoleId = Role.role_id;
        this.roleId = foundRoleId;
        //console.log(this.roleId);
      }
    }
  }

  // isPrivilegeSelected(privilegeBit: any, moduleId: any): any {
  //   // ////console.log(this.selecetedUserURC)
  //   let isPrivilegeSelected = this.selecetedUserURC.some((mod: any) => {
  //     if (mod.privilege_bit != '') {
  //       return (
  //         mod.module_id == moduleId &&
  //         (parseInt(privilegeBit) & parseInt(mod.privilege_mask)) !== 0
  //       );
  //     }
  //     return false;
  //   });

  //   return isPrivilegeSelected;
  // }

  isPrivilegeSelected(privBit: number, modId: number): boolean {
    const selectedBits = this.selectedPrivilegesMap[modId];
    return selectedBits ? selectedBits.includes(privBit) : false;
  }

  isStatusActive(moduleId: number): any {
    let mod = this.selecetedUserURC.find(
      (mod: any) => mod.module_id == moduleId
    );
    // ////console.log(moduleId)
    // //////console.log('mod', mod);

    return mod ? mod.status : null;
  }

  getAllPrivileges() {
    if (sessionStorage.getItem('privileges')) {
      let sessionPrivileges: any = sessionStorage.getItem('privileges');
      let parsedSessionPrivileges = JSON.parse(sessionPrivileges);
      this.privilegesList = parsedSessionPrivileges;
      // //////console.log('sess-priv', this.privilegesList);
    } else {
      this._sunshineApi
        .fetchAllPrivileges()
        .then((res: any) => {
          //////console.log('privilege-res', res);
          let resData = res.data[0];
          this.privilegesList = resData;
        })
        .catch((error) => {
          //////console.log('privilege-err', error);
        });
    }
  }

  generateUniqueNumbersStringFromArray(selectedPrivArr: any[]): string {
    //////console.log(selectedPrivArr);

    const privilegeIds = selectedPrivArr.map(
      (privilege: any) => privilege.privilege_bit
    );
    const uniquePrivilegeIds = Array.from(new Set(privilegeIds));
    return uniquePrivilegeIds.join(',');
  }

  // privilegeChange(event: any, privBit: number, modId: number, module: any) {
  //   let privChecked = event.checked;
  //   this.urc.role_id = this.roleId;
  //   if (this.privArr.length > 0) {
  //     if (privChecked) {
  //       this.privArr.push(privBit);
  //     } else {
  //       let findIndex = this.privArr.indexOf(privBit);
  //       this.privArr.splice(findIndex, 1);
  //     }
  //   } else {
  //     const module = this.selecetedUserURC.find(
  //       (module: any) => module.module_id === modId
  //     );

  //     if (module) {
  //       this.privArr = module.privilege_bit.split(',').map(Number);
  //       if (privChecked) {
  //         this.privArr.push(privBit);
  //       } else {
  //         let findIndex = this.privArr.indexOf(privBit);
  //         this.privArr.splice(findIndex, 1);
  //       }
  //     } else {
  //       if (privChecked) {
  //         this.privArr.push(privBit);
  //       } else {
  //         let findIndex = this.privArr.indexOf(privBit);
  //         this.privArr.splice(findIndex, 1);
  //       }
  //     }
  //   }

  //   if (this.privArr.length > 0) {
  //     this.urc.privilege_list = this.privArr
  //       .filter((bit, index, self) => bit)
  //       .join(',');
  //     this.urc.status = 1;
  //   } else {
  //     this.urc.privilege_list = '';
  //     this.urc.status = 0;
  //   }

  //   this.urc.company_id = this.companyId;
  //   this.urc.user_id = this.userId;
  //   this.urc.module_id = modId;
  //   this.urc.role_id = this.roleId;

  //   this.urc.app_user_id = this.app_user_id;
  // }

  // privilegeChange(event: any, privBit: number, modId: number, module: any) {
  //   let privChecked = event.checked;

  //   // Initialize current selection if not exists
  //   if (!this.selectedPrivilegesMap[modId]) {
  //     const existingModule = this.selecetedUserURC.find(
  //       (mod: any) => mod.module_id === modId
  //     );
  //     if (existingModule) {
  //       this.selectedPrivilegesMap[modId] = existingModule.privilege_bit
  //         .split(',')
  //         .map(Number)
  //         .filter((x:any) => !isNaN(x));
  //     } else {
  //       this.selectedPrivilegesMap[modId] = [];
  //     }
  //   }

  //   let privArr = this.selectedPrivilegesMap[modId];

  //   if (privChecked) {
  //     if (!privArr.includes(privBit)) {
  //       privArr.push(privBit);
  //     }
  //   } else {
  //     const index = privArr.indexOf(privBit);
  //     if (index > -1) {
  //       privArr.splice(index, 1);
  //     }
  //   }

  //   // Compare with original
  //     const originalModule = this.selecetedUserURC.find(
  //       (m: any) => m.module_id === modId
  //     );
  //     const originalBits =
  //       originalModule?.privilege_bit
  //     ?.split(',')
  //     .map(Number)
  //     .filter((x:any) => !isNaN(x)) || [];

  //   const currentBits = [...privArr].sort();
  //   const originalSorted = [...originalBits].sort();

  //   const hasChanged =
  //     currentBits.length !== originalSorted.length ||
  //     !currentBits.every((val, i) => val === originalSorted[i]);

  //   this.changedModulesMap[modId] = hasChanged;

  //   // Optional: update urc object if needed
  //   this.urc.privilege_list = privArr.join(',');
  //   this.urc.status = privArr.length > 0 ? 1 : 0;
  //   this.urc.company_id = this.companyId;
  //   this.urc.user_id = this.userId;
  //   this.urc.module_id = modId;
  //   this.urc.role_id = this.roleId;
  //   this.urc.app_user_id = this.app_user_id;
  // }

  privilegeChange(event: any, privBit: number, modId: number, module: any) {
    const privChecked = event.checked;

    if (!this.selectedPrivilegesMap[modId]) {
      const existingModule = this.selecetedUserURC.find(
        (mod: any) => mod.module_id === modId
      );
      this.selectedPrivilegesMap[modId] = existingModule
        ? existingModule.privilege_bit
            .split(',')
            .map(Number)
            .filter((x: any) => !isNaN(x))
        : [];
    }

    const privArr = this.selectedPrivilegesMap[modId];

    if (privChecked && !privArr.includes(privBit)) {
      privArr.push(privBit);
    } else if (!privChecked) {
      const index = privArr.indexOf(privBit);
      if (index > -1) {
        privArr.splice(index, 1);
      }
    }

    // Check if privilege list changed from original
    const originalModule = this.selecetedUserURC.find(
      (m: any) => m.module_id === modId
    );
    const originalBits =
      originalModule?.privilege_bit
        ?.split(',')
        .map(Number)
        .filter((x: any) => !isNaN(x)) || [];

    const currentBits = [...privArr].sort();
    const originalSorted = [...originalBits].sort();

    const hasChanged =
      currentBits.length !== originalSorted.length ||
      !currentBits.every((val, i) => val === originalSorted[i]);

    this.changedModulesMap[modId] = hasChanged;
  }

  hasAnyPrivilegeSelected(moduleId: number): boolean {
    const selected = this.selectedPrivilegesMap[moduleId] || [];
    return selected.length > 0;
  }

  initializeSelectedPrivileges(modId?: number) {
    if (modId != null) {
      const mod = this.selecetedUserURC.find((m: any) => m.module_id === modId);
      if (mod && mod.privilege_bit) {
        const bits = mod.privilege_bit
          .split(',')
          .map(Number)
          .filter((x: any) => !isNaN(x));
        this.selectedPrivilegesMap[modId] = bits;
      }
    } else {
      this.selectedPrivilegesMap = {};
      this.selecetedUserURC.forEach((mod: any) => {
        if (mod.privilege_bit) {
          const bits = mod.privilege_bit
            .split(',')
            .map(Number)
            .filter((x: any) => !isNaN(x));
          this.selectedPrivilegesMap[mod.module_id] = bits;
        }
      });
    }
  }

  // privilegeChange(event: any, privBit: number, modId: number, module: any) {
  //   const privChecked = event.checked;
  //   this.urc.role_id = this.roleId;
  //   console.log(privChecked);

  //   // Find module in selected user URC
  //   let selectedModule = this.selecetedUserURC.find(
  //     (mod: any) => mod.module_id === modId
  //   );

  //   // Initialize privilege array from module or create a new Set
  //   let privSet = new Set<number>(
  //     selectedModule ? selectedModule.privilege_bit.split(',').map(Number) : []
  //   );
  //   console.log(privSet);

  //   // Add or remove privilege bit
  //   privChecked ? privSet.add(privBit) : privSet.delete(privBit);
  //   console.log(privSet);

  //   // Convert set back to a comma-separated string
  //   this.urc.privilege_list =
  //     privSet.size > 0 ? Array.from(privSet).join(',') : '';
  //   this.urc.status = privSet.size > 0 ? 1 : 0;
  //   console.log(this.urc.privilege_list);

  //   // Update URC object
  //   this.urc.company_id = this.companyId;
  //   this.urc.user_id = this.userId;
  //   this.urc.module_id = modId;
  //   this.urc.app_user_id = this.app_user_id;
  // }

  // switchModStatus(event: any, moduleId: number, i: number) {
  //   let modStatusChecked = event.checked;
  //   modStatusChecked == true
  //     ? ((this.urc.module_id = moduleId),
  //       (this.urc.status = 1),
  //       console.log('trueee1:::', this.urc))
  //     : ((this.urc.module_id = moduleId),
  //       (this.urc.status = 0),
  //       console.log('trueee2:::', this.urc));

  //   let module = this.selecetedUserURC.find(
  //     (module: any) => module.module_id === moduleId
  //   );

  //   if (module && modStatusChecked == false) {
  //     this.urc.user_id = this.userId;
  //     this.urc.module_id = moduleId;
  //     this.urc.status = 0;
  //     this.urc.app_user_id = this.app_user_id;
  //     this.urc.privilege_list = module.privilege_bit;
  //     // this.urc.privilege_list = null;
  //     this.urc.role_id = this.roleId;
  //     this.urc.company_id = this.companyId;

  //     ////console.log(module)
  //     console.log('falseeeeeee:::', this.urc);
  //   } else {
  //     // this.openSnackBar(
  //     //   `Please assign privileges before the module is set as ACTIVE`
  //     // );
  //     // event.source.checked = false;
  //     return;
  //   }
  // }

  //** FIX:17-Feb-2025(Kishore): "Active" check-uncheck, privileges uncehck and check applied
  switchModStatus(event: any, moduleId: number, i: number) {
    let modStatusChecked = event.checked;
    console.log(modStatusChecked);

    this.urc.module_id = moduleId;
    this.urc.status = modStatusChecked ? 1 : 0;

    let module = this.selecetedUserURC.find(
      (module: any) => module.module_id === moduleId
    );

    if (module && !modStatusChecked) {
      console.log(modStatusChecked);

      // Uncheck all privilege checkboxes by clearing their privilege list
      this.urc.privilege_list = module.privilege_bit;
      // this.urc.privilege_list = null;
      module.privilege_bit = ''; // Reset stored privileges
      this.privArr = []; // Clear selected privilege array
      this.urc.user_id = this.userId;
      this.urc.app_user_id = this.app_user_id;
      this.urc.role_id = this.roleId;
      this.urc.company_id = this.companyId;

      console.log('Module deactivated, privileges cleared:', this.urc);
    } else if (!module) {
      // If no module is found, return to prevent further execution
      return;
    }
  }

  saveURC(event: Event, i: number, row: any) {
    const modId = row.module_id;
    const privArr = this.selectedPrivilegesMap[modId] || [];

    this.urc = {
      privilege_list: privArr.join(','),
      status: privArr.length > 0 ? 1 : 0,
      company_id: this.companyId,
      user_id: this.userId,
      module_id: modId,
      role_id: this.roleId,
      app_user_id: this.app_user_id,
      group_list: null,
      is_role_only_update: this.isRoleOnlyUpdate,
    };

    console.log('Saving payload:', this.urc);
    // this.urc.group_list = null;
    // this.urc.role_id = this.roleId;
    // this.urc.is_role_only_update = this.isRoleOnlyUpdate;

    this.urc.privilege_list =
      this.urc.privilege_list && this.urc.privilege_list.trim().length
        ? this.urc.privilege_list
        : '0';
    console.log(this.urc);
    let nullSafetyCheck = this.checkNullKeys(this.urc);
    console.log('nullSafetyCheck', nullSafetyCheck);
    console.log('this.urc-->', this.urc);

    if (nullSafetyCheck.status == true) {
      this.showProgressBar = true;
      this._sunshineApi
        .postNewURC(this.urc)
        .then((res: any) => {
          ////console.log('save-urc', res);
          let resData = res;
          this.showProgressBar = false;
          this.openSnackBar('Privilege(s) Updated');
          this.getAllURCDetailsofUser(this.urc.user_id);

          // this.privArr = [];
          // //////console.log('urc-obj-after-save', this.urc);
        })
        .catch((error) => {
          this.showProgressBar = false;
          console.log(
            'nullSafetyCheck-api-call-err:::',
            error.response.data.data
          );
          this.openSnackBar(error.response.data.data.sqlMessage);
        });
    } else {
      this.openSnackBar(nullSafetyCheck.msg);
    }
  }

  // 03-Jan-2025(Manjula): written helper function to handle failed urc request
  saveURCbyUserId(
    existingURC: any[],
    roleId: number,
    isRoleOnlyUpdate: number
  ) {
    this.showProgressBar = true; // Start the progress bar

    if (isRoleOnlyUpdate === 1) {
      const updatedURC = {
        role_id: roleId,
        app_user_id: this.app_user_id,
        is_role_only_update: isRoleOnlyUpdate,
        user_id: this.userId,
      };
      this._sunshineApi
        .postNewURC(updatedURC)
        .then((res: any) => {
          // console.log('isRoleOnlyUpdate-res:::', res);
          this.openSnackBar(`Role update successful`);
          this.showProgressBar = false; // Start the progress bar
          this.step = 0;
          this.isManagePrivilegeDisabled = false;

          // Refresh user data to ensure role_name is updated
          this.getUserById(this.userId).catch((error) => {
            console.error('Error refreshing user data:', error);
          });
        })
        .catch((error: any) => {
          // console.log('isRoleOnlyUpdate-error:::', error);
          this.openSnackBar(`Role update failed`);
          this.showProgressBar = false; // Start the progress bar
          this.step = 1;
          this.isManagePrivilegeDisabled = true;
        });
    }
    //  else if (isRoleOnlyUpdate === 0) {
    //   const totalURCRequests = existingURC.length;
    //   let completedURCRequests = 0;
    //   let failedURCRequests = 0;
    //   let failedUrcData: any = [];
    //   console.log(totalURCRequests, existingURC);

    //   for (let i = 0; i < existingURC.length; i++) {
    //     const urc = existingURC[i];

    //     // Rename 'privilege_bit' to 'privilege_list'
    //     const { privilege_bit, ...rest } = urc;
    //     const updatedURC = {
    //       ...rest,
    //       privilege_list: privilege_bit,
    //       role_id: roleId,
    //       app_user_id: this.app_user_id,
    //       is_role_only_update: isRoleOnlyUpdate,
    //     };
    //     console.log('updatedURC:::', updatedURC.status);

    //     // Send the updated URC to the API
    //     this._sunshineApi
    //       .postNewURC(updatedURC)
    //       .then((res: any) => {
    //         console.log(`Data updated successfully for item ${i}`, res);
    //         completedURCRequests++;

    //         // Check if all requests are completed
    //         if (completedURCRequests + failedURCRequests === totalURCRequests) {
    //           this.finalizeURCUpdate(failedURCRequests, failedUrcData, roleId);
    //         }
    //       })
    //       .catch((error: any) => {
    //         console.error(`Failed to update data for item ${i}`, error);
    //         this.openSnackBar(`Failed to update privileges for item ${i}`);
    //         failedURCRequests++;
    //         failedUrcData.push(existingURC[i]);

    //         // Check if all requests are completed
    //         if (completedURCRequests + failedURCRequests === totalURCRequests) {
    //           this.finalizeURCUpdate(failedURCRequests, failedUrcData, roleId);
    //         }
    //       });
    //   }
    // }
  }

  // Helper function to handle finalization
  finalizeURCUpdate(failedURCRequests: number, data: any, roleId: any) {
    console.log('failed-urc-requests::', failedURCRequests);

    this.showProgressBar = false; // Stop the progress bar

    if (failedURCRequests === 0) {
      this.openSnackBar('All privileges updated successfully for updated role');
      this.getAllURCDetailsofUser(this.userId); // Refresh the data
      //03-Jan-2025(Kishore): make user by id api call to patch updated roleControl
      this.getUserById(this.userId).catch((error) => {
        console.error('Error refreshing user data:', error);
      }); // Refresh the data
    } else {
      this.openSnackBar(
        `${failedURCRequests} privilege(s) failed to update. Please try again.`
      );
      // this.saveURCbyUserId(data, roleId);
    }

    // Reset the variables
    this.urc = {};
    this.privArr = [];
  }

  checkNullKeys(obj: any): any {
    //////console.log(obj);
    const expectedKeys = [
      'user_id',
      'role_id',
      'company_id',
      'module_id',
      'privilege_list',
      'group_list',
      'status',
    ];

    for (const key of expectedKeys) {
      if (!(key in obj)) {
        this.openSnackBar(`Key '${key}' is not present in the object`);
        // return `Key '${key}' is not present in the object`;
        return {
          status: false,
          msg: `Key '${key}' is not present in the object`,
        };
      }

      if (
        obj[key] === null &&
        key !== 'group_list' &&
        key !== 'privilege_list' &&
        key !== 'status'
      ) {
        this.openSnackBar(`Key '${key}' cannot be null`);
        // return `Key '${key}' is null`;
        return {
          status: false,
          msg: `Key '${key}' is null`,
        };
      }
    }
    return {
      status: true,
      msg: `Thumbs up!`,
    };
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getAllURCDetailsofUser(userId: any) {
    this.showProgressBar = true;
    let urcBody = {
      user_role_company_id: null,
      user_id: userId,
      role_id: null,
      company_id: null,
    };
    // this.urc.user_id = userId;
    // this.urc.app_user_id = userId;
    this._sunshineApi
      .fetchURC(urcBody)
      .then((urcRes: any) => {
        let resData = urcRes.data.data[0];
        this.selecetedUserURC = resData;
        console.log('this.selecetedUserURC-->', this.selecetedUserURC);
        // Reset checkboxes to match latest saved data
        this.initializeSelectedPrivileges(this.urc.module_id);

        //Only reset changedModulesMap for the saved row
        const savedModuleId = this.urc.module_id; // or row.module_id
        this.changedModulesMap[savedModuleId] = false;

        //  Optional: Reset form object
        this.urc = {
          privilege_list: '',
          status: 0,
          company_id: this.companyId,
          user_id: userId,
          module_id: 0,
          role_id: this.roleId,
          app_user_id: this.app_user_id,
        };

        this.showProgressBar = false;
        // //////console.log('urc-res-', resData);
      })
      .catch((error) => {
        this.showProgressBar = false;
        ////console.error('urc-err', error.response);
        this.openSnackBar(error.response);
      });
  }

  getCompanyByUserId(userId: any) {
    //////console.log(userId);
    let params = { user_id: userId };
    this._sunshineApi
      .fetchCompany(params)
      .then((companyRes: any) => {
        let resData = companyRes.data[0];
        //////console.log(resData);
        // typeof resData !== undefined? this.companyId=resData.companyId:
        if (resData.length > 0) {
          this.companyId = resData[0]['company_id'];
          // //////console.log(this.companyId);
          // this.urc.company_id = this.companyId;
        } else {
          this.openSnackBar(
            `'${this.userForm.value.first_name} ${this.userForm.value.last_name}' is not associated with any company`
          );
        }
      })
      .catch((error) => {
        // ////console.error(error);
        this.openSnackBar(error);
      });
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, 'Close', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: this.durationInSeconds * 1000,
    });
    // this._snackBar.open(message);
  }
  saveUserDetails() {
    this.userSaveProg = true;

    // Make sure we have the role ID before saving
    if (!this.roleId && this.selectedRole) {
      const selectedRoleObj = this.rolesList1.find(
        (role: any) =>
          role.role_name.toLowerCase() === this.selectedRole.toLowerCase()
      );

      if (selectedRoleObj) {
        this.roleId = selectedRoleObj.role_id;
        console.log('Found role ID for saving:', this.roleId);
      }
    }

    let updateUserBody = {
      app_user_id: this.app_user_id,
      user_id: this.userForm.value.user_id,
      designation: this.userForm.value.designation,
      first_name: this.userForm.value.first_name,
      last_name: this.userForm.value.last_name,
      email_address: this.userForm.value.email_address,
      password: this.userForm.value.password,
      phone: this.userForm.value.phone,
      otp: this.userForm.value.otp,
      mac_address: this.userForm.value.mac_address,
      allowed_ip: this.userForm.value.allowed_ip,
      last_login: this.userForm.value.last_login,
      last_login_ip_address: this.userForm.value.last_login_ip_address,
      is_admin: this.userForm.value.is_admin,
      image_url: this.userForm.value.image_url,
      reporting_to_id: this.userForm.value.reporting_to_id,
      country: this.userForm.value.country,
      state: this.userForm.value.state,
      city: this.userForm.value.city,
      status: 1,
      role_id: this.roleId, // Add role_id to the update request
      role_name: this.selectedRole, // Add role_name to the update request
    };
    console.log('updateUserBody', updateUserBody);

    if (this.userForm.valid && this.selectFormControl.value.length > 0) {
      this.patchCompanyIds(this.selectFormControl.value);
      if (this.updateCompanies.length > 0) {
        this.updateCompanies.forEach((comp: any) => {
          this.editUserComapany(comp);
        });
      }

      this._sunshineApi
        .editUser(updateUserBody)
        .then((res: any) => {
          this.userSaveProg = false;
          this.openSnackBar(res.message);

          // Reset change detection after successful save
          this.resetChangeDetection();

          // Update the user's role in the database
          if (this.roleId && this.selectedRole) {
            this.saveURCbyUserId(
              this.selecetedUserURC,
              this.roleId,
              this.isRoleOnlyUpdate
            );
          }
        })
        .catch((error) => {
          this.userSaveProg = false;
          this.openSnackBar(error);
        });
    } else {
      this.userForm.markAllAsTouched();
      this.selectFormControl.setErrors({ required: true });
    }
  }
  deActivateUser() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        userName: `${this.userForm.value.first_name} ${this.userForm.value.last_name}`,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.userSaveProg = true;
        let updateUserBody = {
          app_user_id: this.app_user_id,
          user_id: this.userForm.value.user_id,
          designation: this.userForm.value.designation,
          first_name: this.userForm.value.first_name,
          last_name: this.userForm.value.last_name,
          email_address: this.userForm.value.email_address,
          password: this.userForm.value.password,
          phone: this.userForm.value.phone,
          otp: this.userForm.value.otp,
          mac_address: this.userForm.value.mac_address,
          allowed_ip: this.userForm.value.allowed_ip,
          last_login: this.userForm.value.last_login,
          last_login_ip_address: this.userForm.value.last_login_ip_address,
          is_admin: this.userForm.value.is_admin,
          image_url: this.userForm.value.image_url,
          status: 0,
        };

        this._sunshineApi
          .editUser(updateUserBody)
          .then((res: any) => {
            this.userSaveProg = false;
            this.openSnackBar(
              `'${updateUserBody.first_name} ${updateUserBody.last_name}' Deactivated`
            );

            // Update the user status in the current component
            this.userStatus = 0;

            // Navigate back to user management list
            this._router.navigate(['/user-management']);
          })
          .catch((error) => {
            this.userSaveProg = false;
            this.openSnackBar(
              `Failed to deactivate '${updateUserBody.first_name} ${updateUserBody.last_name}'`
            );
          });
      }
    });
  }
  ActivateUser() {
    this.userSaveProg = true;
    //////console.log('activate-userForm:::', this.userForm.value);
    let updateUserBody = {
      app_user_id: this.app_user_id,
      user_id: this.userForm.value.user_id,
      designation: null,
      first_name: this.userForm.value.first_name,
      last_name: this.userForm.value.last_name,
      email_address: this.userForm.value.email_address,
      password: this.userForm.value.password,
      phone: this.userForm.value.phone,
      otp: this.userForm.value.otp,
      mac_address: this.userForm.value.mac_address,
      allowed_ip: this.userForm.value.allowed_ip,
      last_login: this.userForm.value.last_login,
      last_login_ip_address: this.userForm.value.last_login_ip_address,
      is_admin: this.userForm.value.is_admin,
      image_url: this.userForm.value.image_url,
      status: 1,
    };

    //////console.log('activate-body', updateUserBody);
    // this._sunshineApi

    this._sunshineApi
      .editUser(updateUserBody)
      .then((res: any) => {
        this.userSaveProg = false;
        this.openSnackBar(
          `'${updateUserBody.first_name} ${updateUserBody.last_name}' Activated`
        );

        // Update the user status in the current component
        this.userStatus = 1;

        this._router.navigate(['/user-management']);
      })
      .catch((error) => {
        this.userSaveProg = false;
        this.openSnackBar(
          `Failed to activate '${updateUserBody.first_name} ${updateUserBody.last_name}'`
        );
      });
  }

  private _companyFilter(value: string) {
    const filterValue = value.toLowerCase();
    this.setSelectedValues();
    this.selectFormControl.patchValue(this.selectedValues);
    
    // Trigger change detection after patching values
    setTimeout(() => {
      this.checkFormChanges();
    }, 0);
    
    // Filter out companies that are already selected
    return this.allCompany.filter((option) =>
      option.company_name.toLowerCase().includes(filterValue) &&
      !this.selectedValues.some((selected: any) => selected.company_id === option.company_id)
    );
  }

  selectionChange(event: any): void {
    ////console.log('selectionChange-->', event);
    if (event.isUserInput) {
      if (event.source.selected) {
        // Add to selectedValues if not already present
        const exists = this.selectedValues.some((company: any) => company.company_id === event.source.value.company_id);
        if (!exists) {
          this.selectedValues.push(event.source.value);
        }
      } else {
        // Remove from selectedValues if deselected
        const index = this.selectedValues.findIndex((company: any) => company.company_id === event.source.value.company_id);
        if (index >= 0) {
          this.selectedValues.splice(index, 1);
        }
      }
      // Refresh filteredCompany observable
      this.filteredCompany = this.searchTextboxControl.valueChanges.pipe(
        startWith(''),
        map((name) => this._companyFilter(name || ''))
      );
      
      // Trigger change detection
      this.checkFormChanges();
    }
  }
  cancelCompany(comp: any) {
    ////console.log(comp);
    ////console.log(this.selectedValues);
    const index = this.selectedValues.findIndex(
      (company: any) => company.company_id === comp.company_id
    );
    ////console.log(index);
    if (index >= 0) {
      this.selectedValues.splice(index, 1);
    }

    if (comp.user_company_id) {
      this.updateCompanies.push({
        app_user_id: this.app_user_id,
        user_company_id: comp.user_company_id,
        status: 0,
      });
    }

    // Refresh filteredCompany observable so the removed bank reappears in the dropdown
    this.filteredCompany = this.searchTextboxControl.valueChanges.pipe(
      startWith(''),
      map((name) => this._companyFilter(name || ''))
    );
    
    // Trigger change detection
    this.checkFormChanges();
  }

  openedChange(isOpened: boolean): void {
    this.searchTextboxControl.patchValue(null);
    if (isOpened) {
      this.searchTextBox.nativeElement.focus();
    }
  }

  clearSearch(event: MouseEvent): void {
    event.stopPropagation();
    this.searchTextboxControl.patchValue(null);
  }

  setSelectedValues(): void {
    const values = this.selectFormControl.value;
    ////console.log('setSelectedValues-->', values);

    if (values) {
      values.forEach((value: any) => {
        const hasCompany = this.selectedValues.some(
          (company: any) => company.company_id === value.company_id
        );
        if (!hasCompany) {
          this.selectedValues.push(value);
          ////console.log('Company with company_id  exists in the array.');
        } else {
          ////console.log('Company with company_id  does not exist in the array.');
        }
        // if (!this.selectedValues.includes(value)) {
        //   this.selectedValues.push(value);
        // }
      });
    }
  }

  private _roleFilter(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.rolesList1.filter((option: any) =>
      option.role_name.toLowerCase().includes(filterValue)
    );
  }
  private _reportingFilter(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.reportingUsers.filter((option) =>
      option.full_name.toLowerCase().includes(filterValue)
    );
  }
  // selectUserRole(event: any) {
  //   //////console.log('role-name-change-', event.value);
  //   let roleChangeValue = event.value;
  //   if (roleChangeValue == 'ADMIN') {
  //     this.userForm.patchValue({
  //       designation: roleChangeValue,
  //       is_admin: 1,
  //     });
  //   } else {
  //     this.userForm.patchValue({
  //       designation: roleChangeValue,
  //       is_admin: 0,
  //     });
  //   }
  // }
  onDesignationSelect(event: any) {
    // //console.log('onRoleSelected-->', event.option.value);
    let selDesig = event.option.value.trim();
    this.reportingUsers = [];
    // //console.log('onRoleChange>>>>', selDesig);
    // console.log('role-control.value', this.roleControl.value);
    // let selDesig = event.value.role_name;
    this.selectedRole = selDesig;

    // Find the role ID for the selected role
    const selectedRoleObj = this.rolesList1.find(
      (role: any) => role.role_name.toLowerCase() === selDesig.toLowerCase()
    );

    if (selectedRoleObj) {
      this.roleId = selectedRoleObj.role_id;
      console.log('Selected role ID:', this.roleId);
    }

    this.getAllRoles(this.selectedRole);
    this.validateRoles(this.previousRoleName, this.selectedRole);
    selDesig.toLowerCase() == 'ADMIN'.toLowerCase()
      ? this.userForm.patchValue({
          is_admin: 1,
          // designation: selDesig
        })
      : this.userForm.patchValue({
          is_admin: 0,
          // designation: selDesig
        });

    // Update the role_name in the form
    this.userForm.patchValue({
      role_name: selDesig,
    });

    this.listReportingUsers(selDesig);
    
    // Trigger change detection
    this.checkFormChanges();
  }

  validateRoles(previousRoleName: string, selectedRoleName: string): void {
    previousRoleName !== selectedRoleName
      ? ((this.step = 1),
        (this.isManagePrivilegeDisabled = true),
        (this.isRoleOnlyUpdate = 1))
      : ((this.step = 0),
        (this.isManagePrivilegeDisabled = false),
        (this.isRoleOnlyUpdate = 0));
  }

  listReportingUsers(selDesig: any) {
    //console.log(selDesig);

    const selectedRole: any = this.rolesList1.find(
      (role: any) =>
        `${role.role_name}`.toLowerCase() === selDesig.toLowerCase()
    );
    //console.log(selectedRole);
    //console.log('selectedRole.role_id-->', selectedRole.role_id);
    if (selectedRole && selectedRole.role_id) {
      //console.log('selectedRole.role_id-->', selectedRole.role_name);

      //03-01-2025(Manjula):ADDED ROLE Mapping
      const reportingRolesMap: { [key: string]: string } = {
        AGENT: 'TEAM LEAD',
        'TEAM LEAD': 'TEAM MANAGER',
        'TEAM MANAGER': 'SENIOR MANAGER',
        'SENIOR MANAGER': 'ADMIN',
        'IT MANAGER': 'ADMIN',
        ADMIN: 'ADMIN',
        'FIELD AGENT': 'TEAM LEAD',
      };

      if (reportingRolesMap[selDesig]) {
        const reportingRole: any = this.rolesList1.find(
          (role: any) => role.role_name === reportingRolesMap[selDesig]
        );
        //console.log(reportingRole);
        this.getReportingTousers(reportingRole.role_name);
      }
    }
    // //console.log(this.userForm.value);
  }

  onReportingSelect(event: any) {
    ////console.log('onReportingSelect-->', event.option.value);
    let reportingUser = event.option.value.trim();
    const selectedReportedUser = this.reportingUsers.find(
      (user: any) =>
        `${user.full_name}`.toLowerCase().trim() ===
        reportingUser.toLowerCase().trim()
    );
    ////console.log(selectedReportedUser);
    if (selectedReportedUser) {
      this.userForm.patchValue({
        reporting_to_id: selectedReportedUser.user_id,
      });
      this.checkIfReportingUserIsDeactivated();
    }

    ////console.log(this.userForm.value);
    
    // Trigger change detection
    this.checkFormChanges();
  }

  getReportingTousers(userRole: any) {
    // //console.log(userRole);
    // //console.log(this.allUsersData);
    this.reportingUsers = this.activeUsers.filter((user: any) => {
      return user.role_name?.toLowerCase() === userRole.toLowerCase();
    });
    // //console.log('gsvdgvsgvg', this.reportingUsers);
    if (this.reportingUsers.length > 0) {
      this.filterdReportingUsers = this.reportingControl.valueChanges.pipe(
        startWith(''),
        map((value) => this._reportingFilter(value || ''))
      );
      // //console.log(this.filterdReportingUsers);
    } else {
      this.reportingUsers = this.activeUsers.filter((user: any) => {
        return user.role_name.toLowerCase() === 'admin'.toLowerCase();
      });
      this.filterdReportingUsers = this.reportingControl.valueChanges.pipe(
        startWith(''),
        map((value) => this._reportingFilter(value || ''))
      );
      // //console.log(this.filterdReportingUsers);
    }
    //console.log('reportingUsers-->', this.reportingUsers);
  }
  clearRoleSelection() {
    this.roleControl.setValue(null);
    this.reportingControl.setValue(null);
    this.selectedReportingUserIsDeactivated = false;

    this.reportingUsers = [];
    this.filterdReportingUsers = this.reportingControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._reportingFilter(value || ''))
    );
    
    // Trigger change detection
    this.checkFormChanges();
  }
  clearReportingSelection() {
    this.reportingControl.setValue(null);
    this.selectedReportingUserIsDeactivated = false;
    
    // Trigger change detection
    this.checkFormChanges();
  }

  createCompanyForm(): FormGroup {
    return this._fb.group({
      app_user_id: [null],
      user_id: [null],
      company_id: [null],
    });
  }

  get company(): FormArray {
    return this.userCompanyForm.get('company') as FormArray;
  }

  patchCompanyIds(companies: any[]): void {
    // const companyForm = this.createCompanyForm();
    companies.forEach((company) => {
      ////console.log(company);
      if (!company.user_company_id) {
        const companyForm = this.createCompanyForm();
        const companyId = company.company_id;
        // Assuming you want to patch the form for each company id

        companyForm.patchValue({
          company_id: companyId,
          app_user_id: this.app_user_id,
          user_id: this.userId,
        });
        // Perform any further operations needed with the patched form
        // ////console.log(companyForm);
        this.company.push(companyForm);
      }
    });
    if (this.company.value.length > 0) {
      this.company.value.forEach((comp: any) => {
        this.createUserCompany(comp);
      });
    }

    ////console.log(this.company.value);
  }

  createUserCompany(comp: any) {
    if (comp) {
      this._sunshineApi
        .postUserCompany(comp)
        .then((res: any) => {
          ////console.log(res);
        })
        .catch((err) => {
          ////console.log(err);
        });
    }
  }

  editUserComapany(comp: any) {
    this._sunshineApi
      .editUserCompany(comp)
      .then((res: any) => {
        ////console.log(res);
      })
      .catch((err) => {
        ////console.log(err);
      });
  }

  goBack() {
    // Navigate back to user management list while preserving pagination state
    this._router.navigate(['/user-management']);
  }

  checkIfReportingUserIsDeactivated() {
    const reportingToId = this.userForm.value.reporting_to_id;
    this.selectedReportingUserIsDeactivated = !!this.deactivatedUsers.find(
      (user: any) => user.user_id === reportingToId
    );
  }

  showDeactivatedUserWarning() {
     this._snackBar.open('Warning: The selected Reporting To user has been deactivated/deleted from the platform.', 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
    this.scrollToTop();
  }

  // Method to scroll to top of the page
  scrollToTop(): void {
    this.scrollService.scrollToTop();
  }
}
