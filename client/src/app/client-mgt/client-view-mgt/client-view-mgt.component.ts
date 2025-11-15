import { AfterViewInit, Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
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
import { filter, Subscription } from 'rxjs';
import { CustomFunctionsService } from 'src/app/sunshine-services/custom-functions.service';
import { SunshineInternalService } from 'src/app/sunshine-services/sunshine-internal.service';
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
}

@Component({
  selector: 'app-client-view-mgt',
  templateUrl: './client-view-mgt.component.html',
  styleUrls: ['./client-view-mgt.component.css'],
})
export class ClientViewMgtComponent implements OnInit, OnDestroy {
  companyForm: any;
  companyContactForm: any;
  companyLocationForm: any;
  clientAddressForm: any;
  companyTypes: any = [];
  contactDeptTypes: any = [];
  locationTypes: any = [];
  addressTypes: any = [];
  userId: any;
  allRoles: any = [];
  urcfilterdbyManagerRole: any = [];
  urcfilterdbyLeadRole: any = [];
  urcfilterdbyManagerRole1: any = [];
  urcfilterdbyLeadRole1: any = [];
  urcfilterdbyAdminRole: any = [];
  adminId: any;
  teamManagerId: any;
  teamLeadeId: any;

  // Add properties to track form changes
  originalCompanyData: any = {};
  originalContactData: any[] = [];
  originalLocationData: any[] = [];
  isCompanyFormChanged: boolean = false;
  isContactFormChanged: boolean[] = [];
  isLocationFormChanged: boolean[] = [];

  panelOpenState = false;
  step = 0;
  modules: Modules[] = [];
  listFilteredModule: Modules[] = [];
  selectPrivileges = new FormControl('');
  privilegesList: any[] = [];
  selectedPrivArr: any = [];
  displayedclientHoldersColumns: string[] = [];
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

  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  durationInSeconds = 5;

  showProgressBar: boolean = false;
  userSaveProg: boolean = false;
  profileURL: string = '';
  userStatus: number = 0;
  roleId: any;

  companTypes: any = [];

  allNotificationType: any = [];
  managerAssign_notification_type: any;
  LeadAssign_notification_type: any;
  app_user_id: any;
  leadDetails: any;
  managerDetails: any;
  currentAssignedTeamManagerId: any;
  currentAssignedTeamLeaderId: any;
  seniorManagerId: any;
  urcfilterdbySeniorManagerRole: any[] = [];
  urcfilterdbySeniorManagerRole1: any[] = [];
  seniorManagerDetails: any;
  currentAssignedSeniorManagerId: any;
  deactivatedUsers: any[] = [];
  isLoadingUsers: boolean = false;
  activeUsers: any[] = []; // Store all active users for filtering
  private routerSubscription: Subscription;

  constructor(
    private _router: Router,
    private _aR: ActivatedRoute,
    private _sunshineApi: SunshineInternalService,
    private _customFn: CustomFunctionsService,
    private _snackBar: MatSnackBar,
    private fb: FormBuilder,
    private scrollService: ScrollService
  ) {
    // Subscribe to router events to scroll to top on navigation
    this.routerSubscription = this._router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.scrollToTop();
      });
    this.companyForm = new FormGroup({
      company_id: new FormControl(null),
      app_user_id: new FormControl(null),
      company_type_id: new FormControl(4, [Validators.required]),
      company_type_name: new FormControl(
        { value: 'CUSTOMER', disabled: true },
        [Validators.required]
      ),
      company_name: new FormControl(null, [Validators.required]),
      company_code: new FormControl(null, [Validators.required]),
      company_desc: new FormControl(null, [Validators.required]),
      company_logo_url: new FormControl(null),
      website: new FormControl(null, [Validators.pattern('https?://.+')]),
      country: new FormControl(null, [Validators.required]),
      region: new FormControl(null, [Validators.required]),
      senior_manager_id: new FormControl(null, [Validators.required]),
      team_manager_id: new FormControl(null, [Validators.required]),
      team_lead_id: new FormControl(null, [Validators.required]),
      account_no: new FormControl(null),
      iban_no: new FormControl(null),
      swift_code: new FormControl(null),
      status: new FormControl(1),
    });

    // this.companyContactForm = new FormGroup({
    //   app_user_id: new FormControl(null),
    //   company_id: new FormControl(null),
    //   contact_dept_type_id: new FormControl(null, [Validators.required]),
    //   contact_mode_list: new FormControl(null, [Validators.required]),
    //   designation: new FormControl(null),
    //   salutation: new FormControl(null, [Validators.required]),
    //   first_name: new FormControl(null, [Validators.required]),
    //   last_name: new FormControl(null, [Validators.required]),
    //   email_address: new FormControl(null, [Validators.required]),
    //   phone: new FormControl(null, [Validators.required, Validators.pattern('^[0-9]{10}$')]),
    //   phone_ext: new FormControl(null),
    //   alternate_phone: new FormControl(null),
    //   fax: new FormControl(null)
    // })
    this.companyContactForm = this.fb.group({
      contacts: this.fb.array([]), // FormArray to hold dynamic contact forms
    });

    this.companyLocationForm = this.fb.group({
      locations: this.fb.array([]), // FormArray to hold dynamic location forms
    });

    // this.companyLocationForm = new FormGroup({
    //   app_user_id: new FormControl(),
    //   company_id: new FormControl(),
    //   location_name: new FormControl(null, [Validators.required]),
    //   location_type_id: new FormControl(null, [Validators.required]),
    //   location_code: new FormControl(null),
    //   address_name: new FormControl(null, [Validators.required]),
    //   address_type_id: new FormControl(null, [Validators.required]),
    //   address_line_1: new FormControl(null, [Validators.required]),
    //   address_line_2: new FormControl(null),
    //   address_line_3: new FormControl(null),
    //   city: new FormControl(null, [Validators.required]),
    //   state: new FormControl(null, [Validators.required]),
    //   country: new FormControl(null, [Validators.required]),
    //   zipcode: new FormControl(null, [Validators.required]),

    // })
  }
  ngOnInit(): void {
    // Scroll to top of the page when component initializes
    this.scrollToTop();
    
    this.captureRouteParams();
    this.dataSource = new MatTableDataSource(this.myDataArray);

    this.getAllComapanyType();
    this.getContactDeptType();
    this.getLocationType();
    this.getAllAddressType();

    let rolesList = sessionStorage.getItem('roles');
    if (rolesList && sessionStorage.getItem('roles')) {
      this.allRoles = JSON.parse(rolesList);
      // console.log(this.allRoles);
      this.filterRoles();
    } else {
      this.getAllRoles();
    }

    let userDetails: any = sessionStorage.getItem('userDetails');
    let parsedUsrDetails = JSON.parse(userDetails);
    this.userId = parsedUsrDetails.user_id;

    this.companyForm.patchValue({
      app_user_id: this.userId,
    });

    this.getNotificationTypes();
  }

  // Method to check if company form has changes
  checkCompanyFormChanges() {
    if (Object.keys(this.originalCompanyData).length > 0) {
      const currentValue = this.companyForm.value;
      this.isCompanyFormChanged = JSON.stringify(currentValue) !== JSON.stringify(this.originalCompanyData);
      console.log('Company form changed:', this.isCompanyFormChanged);
    }
  }

  // Method to check if contact form has changes
  checkContactFormChanges() {
    if (this.originalContactData.length > 0) {
      const currentContacts = this.companyContactForm.value.contacts;
      this.isContactFormChanged = currentContacts.map((contact: any, index: number) => {
        if (index < this.originalContactData.length) {
          return JSON.stringify(contact) !== JSON.stringify(this.originalContactData[index]);
        }
        return false;
      });
      console.log('Contact forms changed:', this.isContactFormChanged);
    }
  }

  // Method to check if location form has changes
  checkLocationFormChanges() {
    if (this.originalLocationData.length > 0) {
      const currentLocations = this.companyLocationForm.value.locations;
      this.isLocationFormChanged = currentLocations.map((location: any, index: number) => {
        if (index < this.originalLocationData.length) {
          return JSON.stringify(location) !== JSON.stringify(this.originalLocationData[index]);
        }
        return false;
      });
      console.log('Location forms changed:', this.isLocationFormChanged);
    }
  }

  // Method to save original form data
  saveOriginalFormData() {
    // Save original company data
    this.originalCompanyData = JSON.parse(JSON.stringify(this.companyForm.value));
    
    // Save original contact data
    this.originalContactData = JSON.parse(JSON.stringify(this.companyContactForm.value.contacts));
    
    // Save original location data
    this.originalLocationData = JSON.parse(JSON.stringify(this.companyLocationForm.value.locations));
    
    // Reset change flags
    this.isCompanyFormChanged = false;
    this.isContactFormChanged = new Array(this.originalContactData.length).fill(false);
    this.isLocationFormChanged = new Array(this.originalLocationData.length).fill(false);
  }

  // Method to scroll to top of the page
  scrollToTop(): void {
    this.scrollService.scrollToTop();
  }

  ngOnDestroy(): void {
    // Clean up subscription
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  isUserDeactivated(fullName: string): boolean {
    return this.deactivatedUsers.some(user => user.full_name === fullName);
  }

  getUserFullName(userId: number): string {
    if (!userId) return '';
    
    // Check in all user arrays including deactivated users
    const allUsers = [
      ...this.urcfilterdbyLeadRole,
      ...this.urcfilterdbyManagerRole,
      ...this.urcfilterdbySeniorManagerRole,
      ...this.urcfilterdbyAdminRole,
      ...this.deactivatedUsers
    ];
    
    const user = allUsers.find(u => u.user_id === userId);
    return user ? user.full_name : '';
  }
  getAllRoles() {
    this._sunshineApi
      .fetchRoles()
      .then((rolesRes: any) => {
        // console.log('userIdRes', userIdRes.data[0][0]);
        let resData = rolesRes.data[0];
        console.log(resData);
        this.allRoles = resData;
        this.filterRoles();
        sessionStorage.setItem('roles', JSON.stringify(resData));
      })
      .catch((error) => {
        console.error('user-by-id-err', error);
      });
  }
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    // Additional scroll to top after view is initialized for better reliability
    this.scrollToTop();
  }

  captureRouteParams() {
    let usrParams = this._aR.snapshot.params;
    let companyId = parseInt(usrParams['companyId']);
    // console.log('usrId-snapshot :', usrId);
    this.companyId = companyId;
    // this.userId = usrId;
    // this.urc.company_id = this.companyId;
    // this.urc.user_id = this.userId;
    this.getCompanyById(this.companyId);
    this.getContactById(this.companyId);
    this.getLocationById(this.companyId);
  }

  getCompanyById(_id: number) {
    this.userSaveProg = true;
    // this.displayedclientHoldersColumns = [
    //   'company_id',
    //   'company_name',
    //   'company_type_id',
    //   'company_code',
    //   'company_desc',
    //   'actions',
    // ];
    console.log('received-usrId', _id);
    let userBody = {
      company_id: _id,
      company_name: null,
      user_id: null,
    };

    this._sunshineApi
      .fetchCompany(userBody)
      .then((companyIdRes: any) => {
        // console.log(companyIdRes);
        let resData = companyIdRes.data[0][0];
        console.log('getCompanyById', resData);
        this.currentAssignedTeamLeaderId = resData.team_lead_id;
        this.currentAssignedTeamManagerId = resData.team_manager_id;
        this.currentAssignedSeniorManagerId = resData.senior_manager_id;

        this.companyForm.patchValue({
          company_id: resData.company_id,
          app_user_id: this.userId,
          company_type_id: resData.company_type_id,
          company_code: resData.company_code,
          company_name: resData.company_name,
          company_desc: resData.company_desc,
          company_logo_url: resData.company_logo_url,
          website: resData.website ? resData.website.toLowerCase() : null,
          country: resData.country,
          region: resData.region,
          senior_manager_id: resData.senior_manager_id,
          team_manager_id: resData.team_manager_id,
          team_lead_id: resData.team_lead_id,
          account_no: resData.account_no,
          iban_no: resData.iban_no,
          swift_code: resData.swift_code,
        });
        console.log(this.companyForm.value);
        this.userSaveProg = false;
        
        // Save original company form data after patching
        this.originalCompanyData = JSON.parse(JSON.stringify(this.companyForm.value));
        this.isCompanyFormChanged = false;
        
        // Set up company form change detection
        this.companyForm.valueChanges.subscribe(() => {
          this.checkCompanyFormChanges();
        });
        
        // this.profileURL = resData.company_logo_url;
        // this.selectedRole = resData.designation;
        // this.userStatus = resData.status;
        // console.log('this.selectedRole', this.selectedRole);

        if (
          typeof this.selectedRole !== null ||
          typeof this.selectedRole !== undefined
        ) {
          // this.openSnackBar(
          //   `'${this.companyForm.value.first_name} ${this.companyForm.value.last_name}' is not associated to any role `
          // );
        }
        
        // this.getAllRoles(this.selectedRole);
      })
      .catch((error) => {
        console.error('company-by-id-err', error);
        this.userSaveProg = false;
      });
  }

  // Getter for the contacts FormArray
  get contacts(): FormArray {
    return this.companyContactForm.get('contacts') as FormArray;
  }

  // Getter for the locations FormArray
  get locations(): FormArray {
    return this.companyLocationForm.get('locations') as FormArray;
  }

  toUpperCase(event: Event): void {
    const input = event.target as HTMLInputElement;
    const uppercasedValue = input.value.toUpperCase();
    this.companyLocationForm
      .get('location_name')
      ?.setValue(uppercasedValue, { emitEvent: false });
  }

  // Method to create a new contact FormGroup
  createContactForm(): FormGroup {
    return this.fb.group({
      app_user_id: [null],
      contact_id: [null],
      company_id: [null],
      contact_dept_type_id: [null, [Validators.required]],
      contact_mode_list: [null, [Validators.required]],
      designation: [null],
      salutation: [null, [Validators.required]],
      first_name: [null, [Validators.required]],
      last_name: [null, [Validators.required]],
      email_address: [null, [Validators.required]],
      phone: [null, [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      phone_ext: [null],
      alternate_phone: [null],
      fax: [null],
      status: [null],
    });
  }
  patchContactForm(response: any[]): void {
    response.forEach((contact: any) => {
      const contactForm = this.createContactForm();
      contactForm.patchValue({
        contact_id: contact.contact_id,
        app_user_id: this.userId,
        company_id: contact.company_id,
        contact_dept_type_id: contact.contact_dept_type_id,
        contact_mode_list: contact.contact_mode_list,
        designation: contact.designation,
        salutation: contact.salutation,
        first_name: contact.first_name,
        last_name: contact.last_name,
        email_address: contact.email,
        phone: contact.phone,
        phone_ext: contact.phone_ext,
        alternate_phone: contact.alternate_phone,
        fax: null,
        status: null,
      });
      this.contacts.push(contactForm);
    });
    console.log(this.contacts);
    
    // Save original contact data after patching
    this.originalContactData = JSON.parse(JSON.stringify(this.companyContactForm.value.contacts));
    this.isContactFormChanged = new Array(this.originalContactData.length).fill(false);
    
    // Set up contact form change detection
    this.companyContactForm.valueChanges.subscribe(() => {
      this.checkContactFormChanges();
    });
  }
  createLocationForm(): FormGroup {
    return this.fb.group({
      app_user_id: [null],
      location_id: [null],
      company_id: [null],
      location_name: [null, [Validators.required]],
      location_type_id: [null, [Validators.required]],
      location_code: [null],
      address_name: [null, [Validators.required]],
      address_type_id: [null, [Validators.required]],
      address_line_1: [null, [Validators.required]],
      address_line_2: [null],
      address_line_3: [null],
      city: [null, [Validators.required]],
      state: [null, [Validators.required]],
      country: [null, [Validators.required]],
      zipcode: [null, [Validators.required]],
    });
  }
  patchLocationForm(response: any[]): void {
    response.forEach((location: any) => {
      const locationForm = this.createLocationForm();
      locationForm.patchValue({
        app_user_id: this.userId,
        location_id: location.location_id,
        company_id: location.company_id,
        location_name: location.location_name,
        location_type_id: location.location_type_id,
        location_code: location.location_code,
        address_name: location.address_name,
        address_type_id: location.address_type_id,
        address_line_1: location.address_line_1,
        address_line_2: location.address_line_2,
        address_line_3: location.user_id,
        city: location.city,
        state: location.state,
        country: location.country,
        zipcode: location.zipcode,
      });
      this.locations.push(locationForm);
    });
    console.log(this.contacts);
    
    // Save original location data after patching
    this.originalLocationData = JSON.parse(JSON.stringify(this.companyLocationForm.value.locations));
    this.isLocationFormChanged = new Array(this.originalLocationData.length).fill(false);
    
    // Set up location form change detection
    this.companyLocationForm.valueChanges.subscribe(() => {
      this.checkLocationFormChanges();
    });
  }
  getContactById(_id: number) {
    let param = { company_id: _id };

    // let param = {
    //   "contact_id": null,
    //   "company_id": _id,
    //   "contact_dept_type_id": null,
    //   "contact_dept_type_name": null,
    //   "contact_mode_list": null,
    //   "designation": null,
    //   "salutation": null,
    //   "first_name": null,
    //   "last_name": null,
    //   "email": null,
    //   "phone": null,
    //   "phone_ext": null,
    //   "alternate_phone": null,
    //   "fax": null,

    // };

    this._sunshineApi
      .fetchContactByCompanyId(param)
      .then((res: any) => {
        let resData = res.data[0];
        // console.log(resData);
        if (resData.length > 0) {
          this.patchContactForm(resData);
        } else {
          let createContactForm = [
            {
              contact_id: null,
              app_user_id: this.userId,
              company_id: this.companyId,
              contact_dept_type_id: null,
              contact_mode_list: null,
              designation: null,
              salutation: null,
              first_name: null,
              last_name: null,
              email_address: null,
              phone: null,
              phone_ext: null,
              alternate_phone: null,
              fax: null,
            },
          ];
          this.patchContactForm(createContactForm);
        }
        // console.log('getContactById', resData);
      })
      .catch((error) => {
        console.error('getContactById', error);
      });
  }

  getLocationById(_id: number) {
    let param = {
      company_id: _id,
      // location_id:null,
      // address_id:null
    };

    this._sunshineApi
      .fetchLocationByCompanyId(param)
      .then((res: any) => {
        let resData = res.data[0];
        if (resData.length > 0) {
          this.patchLocationForm(resData);

          // this.companyLocationForm.patchValue({
          //   app_user_id: this.userId,
          //   company_id: resData.company_id,
          //   location_name: resData.location_name,
          //   location_type_id: resData.location_type_id,
          //   location_code: resData.location_code,
          //   address_name: resData.address_name,
          //   address_type_id: resData.address_type_id,
          //   address_line_1: resData.address_line_1,
          //   address_line_2: resData.address_line_2,
          //   address_line_3: resData.user_id,
          //   city: resData.city,
          //   state: resData.state,
          //   country: resData.country,
          //   zipcode: resData.zipcode,

          // })
        } else {
          let createLocationValue = [
            {
              app_user_id: this.userId,
              location_id: null,
              company_id: this.companyId,
              location_name: null,
              location_type_id: null,
              location_code: null,
              address_name: null,
              address_type_id: null,
              address_line_1: null,
              address_line_2: null,
              address_line_3: null,
              city: null,
              state: null,
              country: null,
              zipcode: null,
            },
          ];
          this.patchLocationForm(createLocationValue);
        }
        console.log('getLocationById', resData);
      })
      .catch((error) => {
        console.error('getLocationById', error);
      });
  }

  getCompanyByUserId(userId: any) {
    console.log(userId);
    let params = { user_id: userId };
    this._sunshineApi
      .fetchCompany(params)
      .then((companyRes: any) => {
        let resData = companyRes.data[0];
        console.log(resData);
        // typeof resData !== undefined? this.companyId=resData.companyId:
        if (resData.length > 0) {
          this.companyId = resData[0]['company_id'];
          // console.log(this.companyId);
          // this.urc.company_id = this.companyId;
        } else {
          this.openSnackBar(
            `'${this.companyForm.value.first_name} ${this.companyForm.value.last_name}' is not associated with any company`
          );
        }
      })
      .catch((error) => {
        // console.error(error);
        this.openSnackBar(error);
      });
  }

  getUrcByAdminRoleId(roleId: any) {
    console.log(roleId);
    let urcBody = { role_id: roleId };
    this._sunshineApi
      .fetchURC(urcBody)
      .then((urcRes: any) => {
        // console.log("getUrcByAdminRoleId---->", urcRes)
        let resData = urcRes.data.data[0];

        if (resData && roleId) {
          // Filter only active users (status = 1) and ensure they have valid names
          this.urcfilterdbyAdminRole = resData.filter((user: any) => 
            user.status === 1 && user.full_name && user.full_name.trim() !== ''
          );
          this.urcfilterdbyAdminRole = [
            ...new Map(
              this.urcfilterdbyAdminRole.map((item: any) => [
                item.user_id,
                item,
              ])
            ).values(),
          ];
          this.urcfilterdbyAdminRole.sort((a: any, b: any) => 
            a.full_name.localeCompare(b.full_name)
          );
        }

        console.log('urcfilterdbyAdminRole-', this.urcfilterdbyAdminRole);
      })
      .catch((error) => {
        console.error('urcfilterdbyAdminRole', error.response);
      });
  }

  getUrcBySeniorManagerRoleId(roleId: any) {
    // Use active users array instead of API call to ensure only active users are shown
    if (!this.activeUsers || this.activeUsers.length === 0) {
      console.warn('Active users not loaded yet, using fallback API call');
      this.fallbackFetchURC('senior_manager', roleId);
      return;
    }

    console.log('Senior Manager - Filtering from active users:', this.activeUsers.length);
    
    // Filter active users by role name (SENIOR MANAGER) - handle both uppercase and lowercase
    let filteredUsers = this.activeUsers.filter((user: any) => {
      const userRole = user.role_name?.toLowerCase().trim();
      const isSeniorManager = userRole === 'senior manager' || userRole === 'senior_manager';
      const hasValidName = user.full_name && user.full_name.trim() !== '';
      const isActive = user.status !== 0;
      const isNotDeactivated = !this.deactivatedUsers.some(deactivatedUser => deactivatedUser.user_id === user.user_id);
      
      return isSeniorManager && hasValidName && isActive && isNotDeactivated;
    });
    
    // Remove duplicates by full_name - keep the first occurrence
    const uniqueUsers = [];
    const seenNames = new Set();
    
    for (const user of filteredUsers) {
      const normalizedName = user.full_name.trim().toLowerCase();
      if (!seenNames.has(normalizedName)) {
        seenNames.add(normalizedName);
        uniqueUsers.push(user);
      }
    }
    
    this.urcfilterdbySeniorManagerRole = uniqueUsers;
    
    console.log('Senior Manager users after filtering and deduplication:', this.urcfilterdbySeniorManagerRole.map((u: any) => ({ id: u.user_id, name: u.full_name, role: u.role_name, status: u.status })));
    
    this.urcfilterdbySeniorManagerRole.sort((a: any, b: any) => 
      a.full_name.localeCompare(b.full_name)
    );
    
    // Remove selection if current value is not in the filtered list
    const selectedId = this.companyForm.get('senior_manager_id')?.value;
    if (selectedId && !this.urcfilterdbySeniorManagerRole.some((u: any) => u.user_id === selectedId)) {
      this.companyForm.get('senior_manager_id')?.setValue(null);
    }
    
    this.isLoadingUsers = false;
  }

  getUrcByManagerRoleId(roleId: any) {
    // Use active users array instead of API call to ensure only active users are shown
    if (!this.activeUsers || this.activeUsers.length === 0) {
      console.warn('Active users not loaded yet, using fallback API call');
      this.fallbackFetchURC('team_manager', roleId);
      return;
    }

    console.log('Team Manager - Filtering from active users:', this.activeUsers.length);
    
    // Filter active users by role name (TEAM MANAGER) - handle both uppercase and lowercase
    let filteredUsers = this.activeUsers.filter((user: any) => {
      const userRole = user.role_name?.toLowerCase().trim();
      const isTeamManager = userRole === 'team manager' || userRole === 'team_manager';
      const hasValidName = user.full_name && user.full_name.trim() !== '';
      const isActive = user.status !== 0;
      const isNotDeactivated = !this.deactivatedUsers.some(deactivatedUser => deactivatedUser.user_id === user.user_id);
      
      return isTeamManager && hasValidName && isActive && isNotDeactivated;
    });
    
    // Remove duplicates by full_name - keep the first occurrence
    const uniqueUsers = [];
    const seenNames = new Set();
    
    for (const user of filteredUsers) {
      const normalizedName = user.full_name.trim().toLowerCase();
      if (!seenNames.has(normalizedName)) {
        seenNames.add(normalizedName);
        uniqueUsers.push(user);
      }
    }
    
    this.urcfilterdbyManagerRole = uniqueUsers;
    
    console.log('Team Manager users after filtering and deduplication:', this.urcfilterdbyManagerRole.map((u: any) => ({ id: u.user_id, name: u.full_name, role: u.role_name, status: u.status })));
    
    this.urcfilterdbyManagerRole.sort((a: any, b: any) => 
      a.full_name.localeCompare(b.full_name)
    );
    
    // Remove selection if current value is not in the filtered list
    const selectedId = this.companyForm.get('team_manager_id')?.value;
    if (selectedId && !this.urcfilterdbyManagerRole.some((u: any) => u.user_id === selectedId)) {
      this.companyForm.get('team_manager_id')?.setValue(null);
    }
    
    this.isLoadingUsers = false;
  }

  getUrcByLeadRoleId(roleId: any) {
    // Use active users array instead of API call to ensure only active users are shown
    if (!this.activeUsers || this.activeUsers.length === 0) {
      console.warn('Active users not loaded yet, using fallback API call');
      this.fallbackFetchURC('team_lead', roleId);
      return;
    }

    console.log('Team Lead - Filtering from active users:', this.activeUsers.length);
    
    // Filter active users by role name (TEAM LEAD) - handle both uppercase and lowercase
    let filteredUsers = this.activeUsers.filter((user: any) => {
      const userRole = user.role_name?.toLowerCase().trim();
      const isTeamLead = userRole === 'team lead' || userRole === 'team_lead';
      const hasValidName = user.full_name && user.full_name.trim() !== '';
      const isActive = user.status !== 0;
      const isNotDeactivated = !this.deactivatedUsers.some(deactivatedUser => deactivatedUser.user_id === user.user_id);
      
      return isTeamLead && hasValidName && isActive && isNotDeactivated;
    });
    
    // Remove duplicates by full_name - keep the first occurrence
    const uniqueUsers = [];
    const seenNames = new Set();
    
    for (const user of filteredUsers) {
      const normalizedName = user.full_name.trim().toLowerCase();
      if (!seenNames.has(normalizedName)) {
        seenNames.add(normalizedName);
        uniqueUsers.push(user);
      }
    }
    
    this.urcfilterdbyLeadRole = uniqueUsers;
    
    console.log('Team Lead users after filtering and deduplication:', this.urcfilterdbyLeadRole.map((u: any) => ({ id: u.user_id, name: u.full_name, role: u.role_name, status: u.status })));
    
    this.urcfilterdbyLeadRole.sort((a: any, b: any) => 
      a.full_name.localeCompare(b.full_name)
    );
    
    // Remove selection if current value is not in the filtered list
    const selectedId = this.companyForm.get('team_lead_id')?.value;
    if (selectedId && !this.urcfilterdbyLeadRole.some((u: any) => u.user_id === selectedId)) {
      this.companyForm.get('team_lead_id')?.setValue(null);
    }
    
    this.isLoadingUsers = false;
  }

  filterRoles() {
    this.isLoadingUsers = true;
    
    let getIds = this.allRoles.filter((res: any) => {
      if (
        res.role_name.toLowerCase().trim() == 'TEAM LEAD'.toLowerCase().trim()
      ) {
        return (this.teamLeadeId = res.role_id);
      } else if (
        res.role_name.toLowerCase().trim() ==
        'TEAM MANAGER'.toLowerCase().trim()
      ) {
        return (this.teamManagerId = res.role_id);
      } else if (
        res.role_name.toLowerCase().trim() ==
        'SENIOR MANAGER'.toLowerCase().trim()
      ) {
        return (this.seniorManagerId = res.role_id);
      } else {
        if (
          res.role_name.toLowerCase().trim() == 'ADMIN'.toLowerCase().trim()
        ) {
          return (this.adminId = res.role_id);
        }
      }
    });
    
    // Initialize arrays to prevent undefined errors
    this.urcfilterdbyLeadRole = [];
    this.urcfilterdbyManagerRole = [];
    this.urcfilterdbySeniorManagerRole = [];
    
    this.getUrcByManagerRoleId(this.teamManagerId);
    this.getUrcByLeadRoleId(this.teamLeadeId);
    this.getUrcBySeniorManagerRoleId(this.seniorManagerId);
    this.getUrcByAdminRoleId(this.adminId);

    // Load deactivated users for warning display
    this.loadDeactivatedUsers();

    console.log('Lead-->', this.teamLeadeId);
    console.log('manager-->', this.teamManagerId);
  }

  loadDeactivatedUsers() {
    this._sunshineApi.fetchAllUsers()
      .then((res: any) => {
        let resData = res.data[0];
        // Store both active and deactivated users like user management component
        this.activeUsers = resData.filter((user: any) => user.status !== 0);
        this.deactivatedUsers = resData.filter((user: any) => user.status === 0);
        console.log('Active users loaded:', this.activeUsers.length, 'users');
        console.log('Deactivated users loaded:', this.deactivatedUsers.length, 'users');
        
        // Debug: Check what role names are actually in the data
        const uniqueRoles = [...new Set(this.activeUsers.map(u => u.role_name))];
        console.log('Unique role names in active users:', uniqueRoles);
        
        console.log('Deactivated users:', this.deactivatedUsers.map(u => ({ id: u.user_id, name: u.full_name, status: u.status })));
      })
      .catch((error) => {
        console.error('Error loading users:', error);
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

  // createNewCompany() {
  //   let payload = {};
  //   this._sunshineApi.postNewOrgCompany(payload).then((res: any) => {
  //     console.log('createNewCompany', res);
  //     if (res.errorCode == 0) {
  //       this.companyTypes = res.data
  //     }

  //   })

  // }

  getAllComapanyType() {
    this._sunshineApi.fetchAllCompanyType().then((res: any) => {
      console.log(res);
      if (res.errorCode == 0) {
        this.companyTypes = res.data;
      }
    });
  }

  getContactDeptType() {
    this._sunshineApi.fetchAllContactDeptType().then((res: any) => {
      console.log(res);
      if (res.errorCode == 0) {
        this.contactDeptTypes = res.data;
      }
    });
  }

  getLocationType() {
    this._sunshineApi.fetchAllLocationType().then((res: any) => {
      console.log(res);
      if (res.errorCode == 0) {
        this.locationTypes = res.data;
      }
    });
  }

  getAllAddressType() {
    this._sunshineApi.fetchAllAddressType().then((res: any) => {
      console.log(res);
      if (res.errorCode == 0) {
        this.addressTypes = res.data;
      }
    });
  }
  selectContactDeptType(event: any) {
    let type = event.value;
    if (type) {
      console.log('selectContactDeptType-->', type);
      this.companyContactForm.patchValue({
        contact_dept_type_id: type,
      });
    }
  }

  selectComapanyType(event: any) {
    let type = event.value;
    if (type) {
      console.log('selectComapanyType-->', type);
      this.companyForm.patchValue({
        company_type_id: type,
      });
    }
  }
  selectLocationType(event: any) {
    let type = event.value;
    if (type) {
      console.log('selectLocationType-->', type);
      this.companyLocationForm.patchValue({
        location_type_id: type,
      });
    }
  }
  selectAddressType(event: any) {
    let type = event.value;
    if (type) {
      console.log('selectAddressType-->', type);
      this.companyLocationForm.patchValue({
        address_type_id: type,
      });
    }
  }

  updateCompanyDetails() {
    let companyPayload = this.companyForm.value;
    console.log('companyPayload:::', companyPayload);
    console.log(
      'old-->',
      this.currentAssignedTeamLeaderId,
      this.currentAssignedTeamManagerId,
      this.currentAssignedSeniorManagerId
    );
    console.log(
      'new-->',
      this.companyForm.value.team_lead_id,
      this.companyForm.value.team_manager_id,
      this.companyForm.value.senior_manager_id
    );
    if (this.companyForm.valid) {
      // Combine active and deactivated users for lookup
      const allLeads = [...(this.urcfilterdbyLeadRole1 || []), ...(this.deactivatedUsers || [])];
      const allManagers = [...(this.urcfilterdbyManagerRole1 || []), ...(this.deactivatedUsers || [])];
      const allSeniorManagers = [...(this.urcfilterdbySeniorManagerRole1 || []), ...(this.deactivatedUsers || [])];
      this.leadDetails = allLeads.filter((lead: any) => lead.user_id === this.companyForm.value.team_lead_id);
      this.managerDetails = allManagers.filter((manager: any) => manager.user_id === this.companyForm.value.team_manager_id);
      this.seniorManagerDetails = allSeniorManagers.filter((srmanager: any) => srmanager.user_id === this.companyForm.value.senior_manager_id);

      // Safe check: If not found, do not throw error
      if (this.leadDetails.length === 0) this.leadDetails = [{}];
      if (this.managerDetails.length === 0) this.managerDetails = [{}];
      if (this.seniorManagerDetails.length === 0) this.seniorManagerDetails = [{}];

      console.log('before update api call::::', this.companyForm.value);
      this._sunshineApi
        .putOrgCompany(companyPayload)
        .then((res: any) => {
          console.log('updateCompanyDetails-->', res);
          // this.getCompanyById(this.companyId);

          let company_name = companyPayload.company_name.toUpperCase();
          if (
            `${this.currentAssignedTeamLeaderId}` !==
            `${this.companyForm.value.team_lead_id}`
          ) {
            this.sendLeadAssignmentEmail(this.leadDetails, company_name);
            console.log('chanaged team lead');
          }

          if (
            `${this.currentAssignedTeamManagerId}` !==
            `${this.companyForm.value.team_manager_id}`
          ) {
            this.sendManagerAssignmentEmail(this.managerDetails, company_name);
            console.log('chanaged team manager');
          }

          if (
            `${this.currentAssignedSeniorManagerId}` !==
            `${this.companyForm.value.senior_manager_id}`
          ) {
            this.sendSeniorManagerAssignmentEmail(this.seniorManagerDetails, company_name);
            console.log('chanaged team manager');
          }

          this.openSnackBar(res.message);
          this._router.navigate(['/client-management']);

          // Reset change flag after successful update
          this.isCompanyFormChanged = false;
          this.originalCompanyData = JSON.parse(JSON.stringify(this.companyForm.value));

          // location.reload();
        })
        .catch((err) => {
          this.openSnackBar(err);
        });
    } else {
      this.companyForm.markAllAsTouched();
    }
  }

  updateContactDetails(index: any) {
    console.log('this.companyContactForm.valid', this.companyContactForm.value);
    // this.companyContactForm.patchValue({
    //   app_user_id: this.userId,
    //   company_id: compId
    // });
    let contactPayload = this.companyContactForm.value.contacts[index];
    if (this.companyContactForm.valid) {
      this._sunshineApi
        .putOrgContact(contactPayload)
        .then((res: any) => {
          console.log('updateContactDetails-->', res);
          this.openSnackBar(res.message);
          
          // Reset change flag after successful update
          this.isContactFormChanged[index] = false;
          this.originalContactData[index] = JSON.parse(JSON.stringify(this.companyContactForm.value.contacts[index]));
        })
        .catch((err) => {
          this.openSnackBar(err);
        });
    } else {
      this.companyContactForm.markAllAsTouched();
    }
    // let contactPayload = {
    //   "app_user_id": 5,
    //   'company_id': compId,
    //   "contact_dept_type_id": 1,
    //   "contact_mode_list": "Test Mode",
    //   "designation": "Manager",
    //   "salutation": "Hope to talk soon",
    //   "first_name": "Priya",
    //   "last_name": "Kotak",
    //   "email_address": 'priya@gmail.com',
    //   "phone": "1860 266 0811",
    //   "phone_ext": "811",
    //   "alternate_phone": "1860 266 0811",
    //   "fax": null
    // };

    // console.log(contactPayload);
    // this._sunshineApi.postNewOrgContact(contactPayload).then((res: any) => {
    //   console.log('createNewContact', res);
    //   if (res.errorCode == 0) {
    //     let response = res.data
    //     console.log(response)

    //   }
    // })
  }

  updateLocationDetails(index: any) {
    let locationPayload = this.companyLocationForm.value.locations;
    console.log('locationPayload:::', locationPayload[index]);
    if (this.companyLocationForm.valid) {
      this._sunshineApi
        .putOrgLocation(locationPayload[index])
        .then((res: any) => {
          console.log('updateLocationDetails-->', res);
          this.openSnackBar(res.message);
          
          // Reset change flag after successful update
          this.isLocationFormChanged[index] = false;
          this.originalLocationData[index] = JSON.parse(JSON.stringify(this.companyLocationForm.value.locations[index]));
        })
        .catch((err) => {
          this.openSnackBar(err);
        });
    } else {
      this.companyLocationForm.markAllAsTouched();
    }

    // let locationPayload = {
    //   "app_user_id": 5,
    //   'company_id': compId,
    //   "contact_dept_type_id": 1,
    //   "contact_mode_list": "Test Mode",
    //   "designation": "Manager",
    //   "salutation": "Hope to talk soon",
    //   "first_name": "Priya",
    //   "last_name": "Kotak",
    //   "email_address": 'priya@gmail.com',
    //   "phone": "1860 266 0811",
    //   "phone_ext": "811",
    //   "alternate_phone": "1860 266 0811",
    //   "fax": null
    // };

    // console.log(locationPayload);
    // this._sunshineApi.postNewOrgLocation(locationPayload).then((res: any) => {
    //   console.log('saveLocationDetails', res);
    //   if (res.errorCode == 0) {
    //     let response = res.data
    //     console.log(response)

    //   }
    // })
  }

  sendSeniorManagerAssignmentEmail(managerDeatils: any, comapnyName: any) {
    const { email_address, designation, full_name } = managerDeatils[0];

    let emailBody = `
      Hi ${full_name},
      <br><br>
      You are assigned as Senior Manager for the client ${
        comapnyName === undefined || comapnyName === null ? '' : comapnyName
      }.
      <br><br>
      Thank you,<br>
      Team Sunshine Solutions Pvt. Ltd.<br>
      This automated mail was sent by Sunshine Solutions Pvt. Ltd.<br> 
      Please do not reply directly to this email. 
      For questions or assistance, please get in touch with info@mailers.codeswift.in.
    `;

    let receiverEmailId = email_address;
    let emailSubject =
      this.managerAssign_notification_type[0].notification_type_name;

    let finalEmail = {
      to: receiverEmailId,
      subject: emailSubject,
      emailBody: emailBody,
    };

    console.log(finalEmail);

    this._sunshineApi
      .sendEmail(finalEmail)
      .then((res: any) => {
        console.log('email-res::::', res);
        // this.openSnackBar(res.message);
        // this.createManagerNotifications()
      })
      .catch((error) => {
        this.openSnackBar(error);
      });
  }

  sendManagerAssignmentEmail(managerDeatils: any, comapnyName: any) {
    const { email_address, designation, full_name } = managerDeatils[0];

    let emailBody = `
      Hi ${full_name},
      <br><br>
      You are assigned as Team Manager for the client ${
        comapnyName === undefined || comapnyName === null ? '' : comapnyName
      }.
      <br><br>
      Thank you,<br>
      Team Sunshine Solutions Pvt. Ltd.<br>
      This automated mail was sent by Sunshine Solutions Pvt. Ltd.<br> 
      Please do not reply directly to this email. 
      For questions or assistance, please get in touch with info@mailers.codeswift.in.
    `;

    let receiverEmailId = email_address;
    let emailSubject =
      this.managerAssign_notification_type[0].notification_type_name;

    let finalEmail = {
      to: receiverEmailId,
      subject: emailSubject,
      emailBody: emailBody,
    };

    console.log(finalEmail);

    this._sunshineApi
      .sendEmail(finalEmail)
      .then((res: any) => {
        console.log('email-res::::', res);
        // this.openSnackBar(res.message);
        // this.createManagerNotifications()
      })
      .catch((error) => {
        this.openSnackBar(error);
      });
  }
  sendLeadAssignmentEmail(leadDeatils: any, comapnyName: any) {
    const { email_address, designation, full_name } = leadDeatils[0];

    let emailBody = `
      Hi ${full_name},
      <br><br>
      You are assigned as Team Lead for the client ${
        comapnyName === undefined || comapnyName === null ? '' : comapnyName
      }.
      <br><br>
      Thank you,<br>
      Team Sunshine Solutions Pvt. Ltd.<br>
      This automated mail was sent by Sunshine Solutions Pvt. Ltd. 
      <br><br>Please do not reply directly to this email. 
      For questions or assistance, please get in touch with info@mailers.codeswift.in.
    `;

    let receiverEmailId = email_address;
    let emailSubject =
      this.LeadAssign_notification_type[0].notification_type_name;
    let finalEmail = {
      to: receiverEmailId,
      subject: emailSubject,
      emailBody: emailBody,
    };

    console.log(finalEmail);

    this._sunshineApi
      .sendEmail(finalEmail)
      .then((res: any) => {
        console.log('email-res::::', res);
        // this.openSnackBar(res.message);
        // this.createLeadNotifications();
      })
      .catch((error) => {
        this.openSnackBar(error);
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

  getNotificationTypes() {
    let notifType: any = sessionStorage.getItem('notifType');
    let parsedNotifType = JSON.parse(notifType);

    this.LeadAssign_notification_type = parsedNotifType.filter((type: any) => {
      return (
        type.notification_type_name.toLowerCase().trim() ===
        'CLIENT_LEAD_ASSIGNMENT'.toLowerCase().trim()
      );
    });

    this.managerAssign_notification_type = parsedNotifType.filter(
      (type: any) => {
        return (
          type.notification_type_name.toLowerCase().trim() ===
          'CLIENT_MANAGER_ASSIGNMENT'.toLowerCase().trim()
        );
      }
    );

    console.log(
      ' this.LeadAssign_notification_type-->',
      this.LeadAssign_notification_type
    );
    console.log(
      ' this.managerAssign_notification_type-->',
      this.managerAssign_notification_type
    );

    // console.log(parsedNotifType[0]);

    // let createUsrNotifObj = {
    //   user_id: userId,
    //   notification_type_id: parsedNotifType[0].notification_type_id,
    //   notification_name: parsedNotifType[0].notification_type_name,
    //   notification_message: parsedNotifType[0].notification_type_description,
    //   notification_effective_from: this.getCurrentTimestamp(),
    //   notification_effective_to: null,
    //   notification_lifespan_days: null,
    //   notification_publish_flag: 1,
    //   acknowledgment_required: 1,
    //   notification_acknowledged_on: null,
    //   app_user_id: this.app_user_id,
    // };

    // // console.log('------>', createUsrNotifObj);

    // this._sunshineApi
    //   .postNewUserNotification(createUsrNotifObj)
    //   .then((res: any) => {
    //     console.log('create-use-notif-res;:::', res);
    //     this.openSnackBar(res.message);
    //   })
    //   .catch((error) => {
    //     console.error('create-use-notif-err::::', error);
    //     this.openSnackBar(error.response.message);
    //   });
  }

  // createManagerNotifications() {
  //   let createUsrNotifObj = {
  //     user_id: this.managerDetails[0].user_id,
  //     notification_type_id: this.managerAssign_notification_type[0].notification_type_id,
  //     notification_name: this.managerAssign_notification_type[0].notification_type_name,
  //     notification_message: `You are assigned as team manager for the client ${this.companyForm.value.company_name}.`,
  //     notification_effective_from: this.getCurrentTimestamp(),
  //     notification_effective_to: null,
  //     notification_lifespan_days: null,
  //     notification_publish_flag: 1,
  //     acknowledgment_required: 1,
  //     notification_acknowledged_on: null,
  //     app_user_id: this.app_user_id,
  //   };

  //   // console.log('------>', createUsrNotifObj);

  //   this._sunshineApi
  //     .postNewUserNotification(createUsrNotifObj)
  //     .then((res: any) => {
  //       console.log('create-use-notif-res;:::', res);
  //       // this.openSnackBar(res.message);
  //     })
  //     .catch((error) => {
  //       console.error('create-use-notif-err::::', error);
  //       // this.openSnackBar(error.response.message);
  //     });
  // }

  // createLeadNotifications() {
  //   // console.log(parsedNotifType[0]);

  //   let createUsrNotifObj = {
  //     user_id: this.leadDetails[0].user_id,
  //     notification_type_id: this.LeadAssign_notification_type[0].notification_type_id,
  //     notification_name: this.LeadAssign_notification_type[0].notification_type_name,
  //     notification_message: `You are assigned as team lead for the client ${this.companyForm.value.company_name}.`,
  //     notification_effective_from: this.getCurrentTimestamp(),
  //     notification_effective_to: null,
  //     notification_lifespan_days: null,
  //     notification_publish_flag: 1,
  //     acknowledgment_required: 1,
  //     notification_acknowledged_on: null,
  //     app_user_id: this.app_user_id,
  //   };

  //   // console.log('------>', createUsrNotifObj);

  //   this._sunshineApi
  //     .postNewUserNotification(createUsrNotifObj)
  //     .then((res: any) => {
  //       console.log('create-use-notif-res;:::', res);
  //       // this.openSnackBar(res.message);
  //     })
  //     .catch((error) => {
  //       console.error('create-use-notif-err::::', error);
  //       // this.openSnackBar(error.response.message);
  //     });
  // }

  // Method to check if dropdown has users
  hasUsersForRole(roleType: string): boolean {
    switch (roleType) {
      case 'team_lead':
        return this.urcfilterdbyLeadRole && Array.isArray(this.urcfilterdbyLeadRole) && this.urcfilterdbyLeadRole.length > 0;
      case 'team_manager':
        return this.urcfilterdbyManagerRole && Array.isArray(this.urcfilterdbyManagerRole) && this.urcfilterdbyManagerRole.length > 0;
      case 'senior_manager':
        return this.urcfilterdbySeniorManagerRole && Array.isArray(this.urcfilterdbySeniorManagerRole) && this.urcfilterdbySeniorManagerRole.length > 0;
      default:
        return false;
    }
  }

  // Method to get user count for role
  getUserCountForRole(roleType: string): number {
    switch (roleType) {
      case 'team_lead':
        return this.urcfilterdbyLeadRole && Array.isArray(this.urcfilterdbyLeadRole) ? this.urcfilterdbyLeadRole.length : 0;
      case 'team_manager':
        return this.urcfilterdbyManagerRole && Array.isArray(this.urcfilterdbyManagerRole) ? this.urcfilterdbyManagerRole.length : 0;
      case 'senior_manager':
        return this.urcfilterdbySeniorManagerRole && Array.isArray(this.urcfilterdbySeniorManagerRole) ? this.urcfilterdbySeniorManagerRole.length : 0;
      default:
        return 0;
    }
  }

  // New methods for automatic deactivated user detection
  hasDeactivatedTeamLead(): boolean {
    const teamLeadId = this.companyForm.get('team_lead_id')?.value;
    if (!teamLeadId) return false;
    return this.deactivatedUsers.some(user => user.user_id === teamLeadId);
  }

  hasDeactivatedTeamManager(): boolean {
    const teamManagerId = this.companyForm.get('team_manager_id')?.value;
    if (!teamManagerId) return false;
    return this.deactivatedUsers.some(user => user.user_id === teamManagerId);
  }

  hasDeactivatedSeniorManager(): boolean {
    const seniorManagerId = this.companyForm.get('senior_manager_id')?.value;
    if (!seniorManagerId) return false;
    return this.deactivatedUsers.some(user => user.user_id === seniorManagerId);
  }

  // Method to get deactivated user name by ID
  getDeactivatedUserName(userId: number): string {
    const deactivatedUser = this.deactivatedUsers.find(user => user.user_id === userId);
    return deactivatedUser ? deactivatedUser.full_name : '';
  }

  // Method to check if any assigned users are deactivated
  hasAnyDeactivatedUsers(): boolean {
    return this.hasDeactivatedTeamLead() || this.hasDeactivatedTeamManager() || this.hasDeactivatedSeniorManager();
  }

  // Method to get all deactivated user warnings
  getDeactivatedUserWarnings(): string[] {
    const warnings: string[] = [];
    
    if (this.hasDeactivatedTeamLead()) {
      const userName = this.getDeactivatedUserName(this.companyForm.get('team_lead_id')?.value);
      warnings.push(`Team Lead "${userName}" has been deactivated. Please select a new Team Lead.`);
    }
    
    if (this.hasDeactivatedTeamManager()) {
      const userName = this.getDeactivatedUserName(this.companyForm.get('team_manager_id')?.value);
      warnings.push(`Team Manager "${userName}" has been deactivated. Please select a new Team Manager.`);
    }
    
    if (this.hasDeactivatedSeniorManager()) {
      const userName = this.getDeactivatedUserName(this.companyForm.get('senior_manager_id')?.value);
      warnings.push(`Senior Manager "${userName}" has been deactivated. Please select a new Senior Manager.`);
    }
    
    return warnings;
  }

  // Show warning snackbar for deactivated users
  showDeactivatedUserWarnings() {
    if (this.hasAnyDeactivatedUsers()) {
      const warnings = this.getDeactivatedUserWarnings();
      const warningMessage = warnings.length > 0 ? warnings.join('. ') : 'Some assigned users have been deactivated.';
      this.openSnackBar(warningMessage);
    }
  }

  showDeactivatedUserWarning(field: string) {
    let message = `Warning: The selected ${field} user has been deactivated/deleted from the platform.`;
    this._snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  // Fallback method to use fetchURC when activeUsers is not available
  fallbackFetchURC(roleType: string, roleId: any) {
    console.log(`Using fallback fetchURC for ${roleType}`);
    let urcBody = { role_id: roleId };
    
    this._sunshineApi.fetchURC(urcBody)
      .then((urcRes: any) => {
        let resData = urcRes.data.data[0];
        if (resData && roleId) {
          const filteredUsers = resData.filter((user: any) => 
            user.status === 1 && 
            user.full_name && 
            user.full_name.trim() !== '' &&
            !this.deactivatedUsers.some(deactivatedUser => deactivatedUser.user_id === user.user_id)
          );
          
          // Remove duplicates by full_name - keep the first occurrence
          const uniqueUsers = [];
          const seenNames = new Set();
          
          for (const user of filteredUsers) {
            const normalizedName = user.full_name.trim().toLowerCase();
            if (!seenNames.has(normalizedName)) {
              seenNames.add(normalizedName);
              uniqueUsers.push(user);
            }
          }
          
          switch (roleType) {
            case 'team_lead':
              this.urcfilterdbyLeadRole = uniqueUsers;
              break;
            case 'team_manager':
              this.urcfilterdbyManagerRole = uniqueUsers;
              break;
            case 'senior_manager':
              this.urcfilterdbySeniorManagerRole = uniqueUsers;
              break;
          }
        }
        this.isLoadingUsers = false;
      })
      .catch((error) => {
        console.error(`Error in fallback fetchURC for ${roleType}:`, error);
        this.isLoadingUsers = false;
      });
  }

  // Method to safely get user arrays - filter out deactivated users, but include assigned deactivated user if any
  getSafeUserArray(roleType: string): any[] {
    let userArray: any[] = [];
    let assignedId: number | null = null;
    switch (roleType) {
      case 'team_lead':
        userArray = this.urcfilterdbyLeadRole && Array.isArray(this.urcfilterdbyLeadRole) ? this.urcfilterdbyLeadRole : [];
        assignedId = this.companyForm.get('team_lead_id')?.value;
        break;
      case 'team_manager':
        userArray = this.urcfilterdbyManagerRole && Array.isArray(this.urcfilterdbyManagerRole) ? this.urcfilterdbyManagerRole : [];
        assignedId = this.companyForm.get('team_manager_id')?.value;
        break;
      case 'senior_manager':
        userArray = this.urcfilterdbySeniorManagerRole && Array.isArray(this.urcfilterdbySeniorManagerRole) ? this.urcfilterdbySeniorManagerRole : [];
        assignedId = this.companyForm.get('senior_manager_id')?.value;
        break;
      default:
        return [];
    }
    // Filter out deactivated users
    let filteredArray = userArray.filter(user => {
      return user && 
             user.status !== 0 && 
             user.status === 1 && 
             user.full_name && 
             user.full_name.trim() !== '' &&
             !this.deactivatedUsers.some(deactivatedUser => deactivatedUser.user_id === user.user_id);
    });
    // If the assigned user is deactivated, add them to the array
    if (assignedId) {
      const deactivated = this.deactivatedUsers.find(u => u.user_id === assignedId);
      if (deactivated) {
        // Only add if not already present
        if (!filteredArray.some(u => u.user_id === deactivated.user_id)) {
          filteredArray = [deactivated, ...filteredArray];
        }
      }
    }
    
    // Final deduplication by name to ensure no duplicate names in dropdown
    const uniqueUsers = [];
    const seenNames = new Set();
    
    for (const user of filteredArray) {
      const normalizedName = user.full_name.trim().toLowerCase();
      if (!seenNames.has(normalizedName)) {
        seenNames.add(normalizedName);
        uniqueUsers.push(user);
      }
    }
    
    return uniqueUsers;
  }
}


