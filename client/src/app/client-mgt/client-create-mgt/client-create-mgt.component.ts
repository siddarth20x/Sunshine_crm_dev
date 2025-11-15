import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomFunctionsService } from 'src/app/sunshine-services/custom-functions.service';
import { SunshineInternalService } from 'src/app/sunshine-services/sunshine-internal.service';
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
  selector: 'app-client-create-mgt',
  templateUrl: './client-create-mgt.component.html',
  styleUrls: ['./client-create-mgt.component.css'],
})
export class ClientCreateMgtComponent implements OnInit {
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
  teamManagerId: any;
  teamLeadeId: any;
  adminId: any;
  compTypeId: any;

  allNotificationType: any = [];
  managerAssign_notification_type: any;
  LeadAssign_notification_type: any;
  app_user_id: any;
  leadDetails: any;
  managerDetails: any;

  // teamLeadControl = new FormControl('', Validators.required);
  // filteredOptions!: Observable<any[]>;

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
  seniorManagerId: any;
  urcfilterdbySeniorManagerRole: any[] = [];
  urcfilterdbySeniorManagerRole1: any[] = [];
  deactivatedUsers: any[] = [];
  constructor(
    private _router: Router,
    private _aR: ActivatedRoute,
    private _sunshineApi: SunshineInternalService,
    private _customFn: CustomFunctionsService,
    private _snackBar: MatSnackBar
  ) {
    this.companyForm = new FormGroup({
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
      country: new FormControl(null, [Validators.required]),
      region: new FormControl(null, [Validators.required]),
      senior_manager_id: new FormControl(null, [Validators.required]),
      website: new FormControl(null, [Validators.pattern('https?://.+')]),
      team_manager_id: new FormControl(null, [Validators.required]),
      team_lead_id: new FormControl(null, [Validators.required]),
      account_no: new FormControl(null),
      iban_no: new FormControl(null),
      swift_code: new FormControl(null),
    });

    this.companyContactForm = new FormGroup({
      app_user_id: new FormControl(null),
      company_id: new FormControl(null),
      contact_dept_type_id: new FormControl(null, [Validators.required]),
      contact_mode_list: new FormControl(null, [Validators.required]),
      designation: new FormControl(null),
      salutation: new FormControl(null, [Validators.required]),
      first_name: new FormControl(null, [Validators.required]),
      last_name: new FormControl(null, [Validators.required]),
      email_address: new FormControl(null, [Validators.required]),
      phone: new FormControl(null, [
        Validators.required,
        Validators.pattern('^[0-9]{10}$'),
      ]),
      phone_ext: new FormControl(null),
      alternate_phone: new FormControl(null),
      fax: new FormControl(null),
    });

    this.companyLocationForm = new FormGroup({
      app_user_id: new FormControl(),
      company_id: new FormControl(),
      location_name: new FormControl(null, [Validators.required]),
      location_type_id: new FormControl(null, [Validators.required]),
      location_code: new FormControl(null),
      address_name: new FormControl(null, [Validators.required]),
      address_type_id: new FormControl(null, [Validators.required]),
      address_line_1: new FormControl(null, [Validators.required]),
      address_line_2: new FormControl(null),
      address_line_3: new FormControl(null),
      city: new FormControl(null, [Validators.required]),
      state: new FormControl(null, [Validators.required]),
      country: new FormControl(null, [Validators.required]),
      zipcode: new FormControl(null, [Validators.required]),
    });
  }

  ngOnInit(): void {
    this.getAllComapanyType();
    this.getContactDeptType();
    this.getLocationType();
    this.getAllAddressType();

    let rolesList = sessionStorage.getItem('roles');
    if (rolesList) {
      this.allRoles = JSON.parse(rolesList);
      console.log(this.allRoles);
      this.fileterRoles();
    } else {
      this.getAllRoles();
    }

    let userDetails: any = sessionStorage.getItem('userDetails');
    let parsedUsrDetails = JSON.parse(userDetails);
    this.userId = parsedUsrDetails.user_id;
    this.app_user_id = parsedUsrDetails.user_id;

    this.companyForm.patchValue({
      app_user_id: this.userId,
    });
    this.getNotificationTypes();
  }

  isUserDeactivated(fullName: string): boolean {
    return this.deactivatedUsers.some(user => user.full_name === fullName);
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

  getUserFullName(userId: number): string {
    if (!userId) return '';
    
    // Check in all user arrays
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

  // displayFn(user: any): string {

  //   return user && user.full_name ? user.full_name : '';
  // }

  // private _filter(name: string): any[] {
  //   const filterValue = name.toLowerCase();
  //   return this.urcfilterdbyLeadRole.filter((option: any) =>
  //     option.full_name.toLowerCase().includes(filterValue)
  //   );
  // }

  getUrcByManagerRoleId(roleId: any) {
    let urcBody = {
      role_id: roleId,
    };

    this._sunshineApi
      .fetchURC(urcBody)
      .then((urcRes: any) => {
        let resData = urcRes.data.data[0];
        if (resData && roleId) {
          // Filter only active users (status = 1) and exclude deactivated users
          let filteredUsers = resData.filter((user: any) => 
            user.status === 1 && 
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
          
          this.urcfilterdbyManagerRole = uniqueUsers;
          console.log(resData);
        }

        console.log('urc-res-', this.urcfilterdbyManagerRole);
      })
      .catch((error) => {
        console.error('urc-res', error.response);
      });
  }

  getUrcByLeadRoleId(roleId: any) {
    let urcBody = { role_id: roleId };
    this._sunshineApi
      .fetchURC(urcBody)
      .then((urcRes: any) => {
        let resData = urcRes.data.data[0];
        if (resData && roleId) {
          // Filter only active users (status = 1) and exclude deactivated users
          let filteredUsers = resData.filter((user: any) => 
            user.status === 1 && 
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
          
          this.urcfilterdbyLeadRole = uniqueUsers;
        }

        console.log('urcfilterdbyLeadRole-', this.urcfilterdbyLeadRole);
      })
      .catch((error) => {
        console.error('urcfilterdbyLeadRole', error.response);
      });
    // this.filteredOptions = this.urcfilterdbyLeadRole;
    // this.filteredOptions = this.teamLeadControl.valueChanges
    //   .pipe(
    //     startWith(''),
    //     map((value: any) => typeof value === 'string' ? value : value?.full_name),
    //     map(name => name ? this._filter(name) : this.urcfilterdbyLeadRole.slice())
    //   );
  }
  getUrcBySeniorManagerRoleId(roleId: any) {
    let urcBody = {
      role_id: roleId,
    };
    this._sunshineApi
      .fetchURC(urcBody)
      .then((urcRes: any) => {
        let resData = urcRes.data.data[0];
        if (resData && roleId) {
          // Filter only active users (status = 1) and exclude deactivated users
          let filteredUsers = resData.filter((user: any) => 
            user.status === 1 && 
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
          
          this.urcfilterdbySeniorManagerRole = uniqueUsers;
        }

        console.log('urc-res-', this.urcfilterdbySeniorManagerRole);
      })
      .catch((error) => {
        console.error('urc-res', error.response);
      });
  }
  getUrcByAdminRoleId(roleId: any) {
    let urcBody = { role_id: roleId };
    this._sunshineApi
      .fetchURC(urcBody)
      .then((urcRes: any) => {
        // console.log("getUrcByAdminRoleId---->", urcRes)
        let resData = urcRes.data.data[0];

        if (resData && roleId) {
          // Filter only active users (status = 1) and exclude deactivated users
          let filteredUsers = resData.filter((user: any) => 
            user.status === 1 && 
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
          
          this.urcfilterdbyAdminRole = uniqueUsers;
        }

        console.log('urcfilterdbyAdminRole-', this.urcfilterdbyAdminRole);
      })
      .catch((error) => {
        console.error('urcfilterdbyAdminRole', error.response);
      });
  }
  getAllRoles() {
    this._sunshineApi
      .fetchRoles()
      .then((rolesRes: any) => {
        // console.log('userIdRes', userIdRes.data[0][0]);
        let resData = rolesRes.data[0];
        console.log(resData);
        this.allRoles = resData;
        this.fileterRoles();
        sessionStorage.setItem('roles', JSON.stringify(resData));
      })
      .catch((error) => {
        console.error('user-by-id-err', error);
      });
  }

  fileterRoles() {
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
    
    // Load deactivated users first, then load user arrays
    this.loadDeactivatedUsers().then(() => {
      this.getUrcByManagerRoleId(this.teamManagerId);
      this.getUrcByLeadRoleId(this.teamLeadeId);
      this.getUrcByAdminRoleId(this.adminId);
      this.getUrcBySeniorManagerRoleId(this.seniorManagerId);
    });

    console.log('Lead-->', this.teamLeadeId);
    console.log('manager-->', this.teamManagerId);
  }

  loadDeactivatedUsers() {
    return this._sunshineApi.fetchAllUsers()
      .then((res: any) => {
        let resData = res.data[0];
        // Store deactivated users for warning display
        this.deactivatedUsers = resData.filter((user: any) => user.status === 0);
      })
      .catch((error) => {
        console.error('Error loading deactivated users:', error);
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
        let findId = this.companyTypes.find((comp: any) => {
          return (
            comp.company_type_name.toLowerCase().trim() ==
            'customer'.toLowerCase().trim()
          );
        });
        this.compTypeId = findId.company_type_id;
        console.log(this.compTypeId);
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

  saveCompanyDetails() {
    console.log('this.companyForm.valid', this.companyForm.value);
    console.log('this.companyContactForm.valid', this.companyContactForm.value);
    console.log(
      'this.companyLocationForm.valid',
      this.companyLocationForm.value
    );

    this.userSaveProg = true;

    if (
      this.companyForm.valid &&
      this.companyContactForm.valid &&
      this.companyLocationForm.valid
    ) {
      // if (this.companyForm.valid) {
      let companyPayload = this.companyForm.value;
      this.leadDetails = this.urcfilterdbyLeadRole1.filter((lead: any) => {
        return lead.user_id === this.companyForm.value.team_lead_id;
      });
      this.managerDetails = this.urcfilterdbyManagerRole1.filter(
        (manager: any) => {
          return manager.user_id === this.companyForm.value.team_manager_id;
        }
      );
      console.log(this.leadDetails);
      console.log(this.managerDetails);

      console.log('companyForm data', companyPayload);

      this._sunshineApi
        .postNewOrgCompany(companyPayload)
        .then((res: any) => {
          console.log('createNewCompany', res);
          if (res.errorCode == 0) {
            let company_name = companyPayload.company_name.toUpperCase();
            let response = res.data;
            this.companyId = response[1][0].company_id;
            console.log(this.companyId);
            this.userSaveProg = false;
            this.openSnackBar(res.message);
            this.sendManagerAssignmentEmail(this.managerDetails, company_name);
            this.sendLeadAssignmentEmail(this.leadDetails, company_name);
            this._router.navigate(['./client-management']);
            this.saveContactDetails(this.companyId);
            this.saveLocationDetails(this.companyId);
          }
        })
        .catch((error) => {
          this.userSaveProg = false;
          this.openSnackBar(error);
        });
    } else {
      this.userSaveProg = false;
      this.companyForm.markAllAsTouched();
      this.companyContactForm.markAllAsTouched();
      this.companyLocationForm.markAllAsTouched();
    }
  }

  saveContactDetails(compId: any) {
    this.companyContactForm.patchValue({
      app_user_id: this.userId,
      company_id: compId,
    });
    let contactPayload = this.companyContactForm.value;

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

    console.log(contactPayload);
    this._sunshineApi.postNewOrgContact(contactPayload).then((res: any) => {
      console.log('createNewContact', res);
      if (res.errorCode == 0) {
        let response = res.data;
        console.log(response);
      }
    });
  }

  saveLocationDetails(compId: any) {
    this.companyLocationForm.patchValue({
      app_user_id: this.userId,
      company_id: compId,
    });
    let locationPayload = this.companyLocationForm.value;

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

    console.log(locationPayload);
    this._sunshineApi.postNewOrgLocation(locationPayload).then((res: any) => {
      console.log('saveLocationDetails', res);
      if (res.errorCode == 0) {
        let response = res.data;
        console.log(response);
      }
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

  createManagerNotifications() {
    let createUsrNotifObj = {
      user_id: this.managerDetails[0].user_id,
      notification_type_id:
        this.managerAssign_notification_type[0].notification_type_id,
      notification_name:
        this.managerAssign_notification_type[0].notification_type_name,
      notification_message: `You are assigned as team manager for the client ${this.companyForm.value.company_name}.`,
      notification_effective_from: this.getCurrentTimestamp(),
      notification_effective_to: null,
      notification_lifespan_days: null,
      notification_publish_flag: 1,
      acknowledgment_required: 1,
      notification_acknowledged_on: null,
      app_user_id: this.app_user_id,
    };

    // console.log('------>', createUsrNotifObj);

    this._sunshineApi
      .postNewUserNotification(createUsrNotifObj)
      .then((res: any) => {
        console.log('create-use-notif-res;:::', res);
        // this.openSnackBar(res.message);
      })
      .catch((error) => {
        console.error('create-use-notif-err::::', error);
        // this.openSnackBar(error.response.message);
      });
  }

  createLeadNotifications() {
    // console.log(parsedNotifType[0]);

    let createUsrNotifObj = {
      user_id: this.leadDetails[0].user_id,
      notification_type_id:
        this.LeadAssign_notification_type[0].notification_type_id,
      notification_name:
        this.LeadAssign_notification_type[0].notification_type_name,
      notification_message: `You are assigned as team lead for the client ${this.companyForm.value.company_name}.`,
      notification_effective_from: this.getCurrentTimestamp(),
      notification_effective_to: null,
      notification_lifespan_days: null,
      notification_publish_flag: 1,
      acknowledgment_required: 1,
      notification_acknowledged_on: null,
      app_user_id: this.app_user_id,
    };

    // console.log('------>', createUsrNotifObj);

    this._sunshineApi
      .postNewUserNotification(createUsrNotifObj)
      .then((res: any) => {
        console.log('create-use-notif-res;:::', res);
        // this.openSnackBar(res.message);
      })
      .catch((error) => {
        console.error('create-use-notif-err::::', error);
        // this.openSnackBar(error.response.message);
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
