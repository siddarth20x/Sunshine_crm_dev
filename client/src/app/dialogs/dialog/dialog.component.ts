import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { SunshineInternalService } from '../../sunshine-services/sunshine-internal.service';
import { Router } from '@angular/router';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { Observable, map, startWith } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LocationServiceService } from 'src/app/sunshine-services/location-service.service';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css'],
})
export class DialogComponent implements OnInit {
  singupForm: any;
  userCompanyForm: any;
  hide = true;
  selectedDesignation: string = '';
  designation: any[] = [
    { name: 'Super Admin' },
    { name: 'Admin' },
    { name: 'Manager' },
    { name: 'Team Lead' },
    { name: 'Agent' },
  ];
  showProgressBar: boolean = false;
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  durationInSeconds = 5;

  // rolesList: any = [];
  reportingToUsers: any = [];
  allUsersData: any = [];

  roleControl = new FormControl(null, [Validators.required]);
  rolesList: { role_name: string; role_id: number }[] = [];
  filteredRoles!: Observable<{ role_name: string; role_id: string }[]>;

  reportingControl = new FormControl(null, [Validators.required]);
  reportingUsers: { user_id: string; full_name: string }[] = [];
  filterdReportingUsers!: Observable<{ user_id: number; full_name: string }[]>;
  userId: any = 0;

  @ViewChild('search') searchTextBox!: ElementRef;

  selectFormControl = new FormControl();
  searchTextboxControl = new FormControl(null);
  selectedValues: any = [];
  allCompany: { company_name: string; company_id: number }[] = [];
  filteredCompany!: Observable<{ company_name: string; company_id: number }[]>;

  compTypeId: any;
  appUserId: any;
  password: any;
  selectedRoleId: any;

  countries: any[] = [];
  states: any[] = [];
  cities: string[] = [];

  selectedCountry: string = '';
  selectedState: string = '';
  selectedCity: string = '';
  isRoleOnlyUpdate: number = 0;
  
  constructor(
    private _sunshineIternalApi: SunshineInternalService,
    private _router: Router,
    private _snackBar: MatSnackBar,
    private _fb: FormBuilder,
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private locationService: LocationServiceService
  ) {
    this.singupForm = new FormGroup({
      app_user_id: new FormControl(null),
      designation: new FormControl(null),
      reporting_to_id: new FormControl(null, [Validators.required]),
      allowed_ip: new FormControl(null),
      // Validators.pattern(`^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])$`)]
      first_name: new FormControl(null, [Validators.required]),
      last_name: new FormControl(null, [Validators.required]),
      email_id: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [Validators.required]),
      // phone: new FormControl(null, [Validators.required, Validators.pattern()]),
      phone: new FormControl(null, [
        Validators.required,
        Validators.pattern('^((\\+91-?)|0)?[0-9]{10}$'),
      ]),
      mac_address: new FormControl(null),
      is_admin: new FormControl(null, [Validators.required]),
      image_url: new FormControl('www.google.com', [Validators.required]),
      country: new FormControl(null, [Validators.required]),
      state: new FormControl(null, [Validators.required]),
      city: new FormControl(null, [Validators.required]),
    });

    this.userCompanyForm = this._fb.group({
      company: this._fb.array([]),
    });
  }

  ngOnInit(): void {
    this.getAllRoles();
    this.getAllUsers();
    this.getAllComapanyType();
    // this.getAllCompany();

    let userDetails: any = sessionStorage.getItem('userDetails');
    let parsedUsrDetails = JSON.parse(userDetails);
    this.userId = parsedUsrDetails.user_id;
    this.appUserId = parsedUsrDetails.user_id;
    this.singupForm.patchValue({
      app_user_id: this.userId,
    });

    this.countries = this.locationService.getCountries();
  }

  onCountryChange(event: any) {
    console.log(event.value);
    let countryEvent = event.value;
    this.selectedCountry = countryEvent;
    this.states = this.locationService.getStatesByCountry(countryEvent);
    this.cities = [];
  }

  onStateChange(event: any) {
    console.log(event.value);
    let stateEvent = event.value;
    this.selectedState = stateEvent;
    this.cities = this.locationService.getCitiesByState(
      this.selectedCountry,
      this.selectedState
    );
  }
  onCityChange(event: any) {
    console.log(event.value);
    let cityEvent = event.value;
    this.selectedCity = cityEvent;
    console.log('Selected City:', this.selectedCity);
    // Add any additional logic needed when the city is changed
  }
  getAllComapanyType() {
    this._sunshineIternalApi.fetchAllCompanyType().then((res: any) => {
      // console.log(res);
      if (res.errorCode == 0) {
        let companyTypes = res.data;
        let findId = companyTypes.find((comp: any) => {
          return comp.company_type_name.toLowerCase().trim() == 'customer';
        });
        this.compTypeId = findId.company_type_id;
        this.getAllCompany();
        console.log(this.compTypeId);
      }
    });
  }

  createCompanyForm(): FormGroup {
    return this._fb.group({
      app_user_id: [null],
      user_id: [null],
      company_id: [null],
    });
  }

  getAllCompany() {
    this._sunshineIternalApi
      .fetchAllCompany()
      .then((res: any) => {
        let resData = res.data;
        // this.allCompany = resData.reverse();
        let customerCompany = resData.filter((comp: any) => {
          return comp.company_type_id == parseInt(this.compTypeId);
        });
        // console.log(customerCompany.length)
        this.allCompany = customerCompany;
        // console.log('this.allCompany-->', this.allCompany);
        this.filteredCompany = this.searchTextboxControl.valueChanges.pipe(
          startWith(''),
          map((name) => this._companyFilter(name || ''))
        );
      })
      .catch((error) => {
        this.showProgressBar = false;
        console.error(error);
      });
  }

  getAllRoles() {
    if (!sessionStorage.getItem('roles')) {
      this._sunshineIternalApi
        .fetchRoles()
        .then((rolesRes: any) => {
          // //console.log('userIdRes', userIdRes.data[0][0]);
          let resData = rolesRes.data[0];
          this.rolesList = resData;
          //console.log(resData);
          sessionStorage.setItem('roles', JSON.stringify(resData));
        })
        .catch((error) => {
          console.error('getAllRoles', error);
        });
    } else {
      let sessRoles: any = sessionStorage.getItem('roles');
      let parsedSessRoles = JSON.parse(sessRoles);
      this.rolesList = parsedSessRoles;
      //console.log('this.selectedRole', this.selectedRole);
    }
    this.filteredRoles = this.roleControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._roleFilter(value || ''))
    );
  }

  getAllUsers() {
    this._sunshineIternalApi
      .fetchAllUsers()
      .then((res: any) => {
        let resData = res.data[0];
        
        // Filter out deactivated users (status = 0)
        this.allUsersData = resData.filter((user: any) => user.status !== 0);
        
        console.log('Active Users:', this.allUsersData);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  private _companyFilter(value: string) {
    const filterValue = value.toLowerCase();
    this.setSelectedValues();
    this.selectFormControl.patchValue(this.selectedValues);
    // Filter out companies that are already selected
    return this.allCompany.filter((option) =>
      option.company_name.toLowerCase().includes(filterValue) &&
      !this.selectedValues.some((selected: any) => selected.company_id === option.company_id)
    );
  }

  selectionChange(event: any): void {
    console.log('selectionChange-->', event);
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
    }
  }

  cancelCompany(comp: any) {
    console.log(comp);
    console.log(this.selectedValues);
    const index = this.selectedValues.findIndex(
      (company: any) => company.company_id === comp.company_id
    );
    console.log(index);
    if (index >= 0) {
      this.selectedValues.splice(index, 1);
    }

    // Refresh filteredCompany observable so the removed bank reappears in the dropdown
    this.filteredCompany = this.searchTextboxControl.valueChanges.pipe(
      startWith(''),
      map((name) => this._companyFilter(name || ''))
    );
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
    console.log('setSelectedValues-->', values);

    if (values) {
      values.forEach((value: any) => {
        const hasCompany = this.selectedValues.some(
          (company: any) => company.company_id === value.company_id
        );
        if (!hasCompany) {
          this.selectedValues.push(value);
          console.log('Company with company_id exists in the array.');
        } else {
          console.log('Company with company_id does not exist in the array.');
        }
      });
    }
  }

  private _roleFilter(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.rolesList.filter((option) =>
      option.role_name.toLowerCase().includes(filterValue)
    );
  }
  private _reportingFilter(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.reportingUsers.filter((option) =>
      option.full_name.toLowerCase().includes(filterValue)
    );
  }
  onDesignationSelect(event: any) {
    console.log('onRoleSelected-->', event.option.value);
    let selDesig = event.option.value.trim();
    this.reportingUsers = [];

    // let selDesig = event.value.role_name;
    selDesig.toLowerCase() != 'Agent'.toLowerCase()
      ? this.singupForm.patchValue({
          is_admin: 1,
          // designation: selDesig,
        })
      : this.singupForm.patchValue({
          is_admin: 0,
          // designation: selDesig,
        });

    const selectedRole = this.rolesList.find(
      (role: any) =>
        `${role.role_name}`.toLowerCase() === selDesig.toLowerCase()
    );

    if (selectedRole && selectedRole.role_id) {
      console.log('selectedRole.role_id-->', selectedRole.role_name);
      this.selectedRoleId = selectedRole.role_id;
      // console.log(this.selectedRoleId);
      const reportingRolesMap: { [key: string]: string } = {
        AGENT: 'TEAM LEAD',
        'TEAM LEAD': 'TEAM MANAGER',
        'TEAM MANAGER': 'SENIOR MANAGER',
        'SENIOR MANAGER': 'ADMIN',
        'IT MANAGER': 'ADMIN',
        'FIELD AGENT': 'TEAM LEAD',
        ADMIN: 'ADMIN',
      };

      if (reportingRolesMap[selDesig]) {
        const reportingRole: any = this.rolesList.find(
          (role: any) => role.role_name === reportingRolesMap[selDesig]
        );
        console.log(reportingRole);
        this.getReportingTousers(reportingRole.role_name);
      }
    }
    console.log(this.singupForm.value);
  }
  onReportingSelect(event: any) {
    console.log('onReportingSelect-->', event.option.value);
    let reportingUser = event.option.value.trim();
    const selectedReportedUser = this.reportingUsers.find(
      (user: any) =>
        `${user.full_name}`.toLowerCase().trim() ===
        reportingUser.toLowerCase().trim()
    );
    console.log(selectedReportedUser);
    if (selectedReportedUser) {
      this.singupForm.patchValue({
        reporting_to_id: selectedReportedUser.user_id,
      });
    }

    // console.log(this.singupForm.value)
  }

  // onDesignationSelect(event: any) {
  //   // console.log(event);
  //   let selDesig = event.value.role_name;
  //   selDesig != 'Agent'
  //     ? this.singupForm.patchValue({
  //       is_admin: 1,
  //       designation: selDesig
  //     })
  //     : this.singupForm.patchValue({
  //       is_admin: 0,
  //       designation: selDesig
  //     });
  //   console.log(this.singupForm.value)

  //   // this.getReportingTousers(selDesig);
  // }

  getReportingTousers(userRole: any) {
    console.log(userRole);
    console.log('reporting user role-->', this.allUsersData);

    this.reportingUsers = this.allUsersData.filter((user: any) => {
      return user.role_name?.toLowerCase() === userRole.toLowerCase();
    });
    if (this.reportingUsers.length > 0) {
      this.filterdReportingUsers = this.reportingControl.valueChanges.pipe(
        startWith(''),
        map((value) => this._reportingFilter(value || ''))
      );
    } else {
      this.reportingUsers = this.allUsersData.filter((user: any) => {
        return user.role_name.toLowerCase() === 'admin'.toLowerCase();
      });
      this.filterdReportingUsers = this.reportingControl.valueChanges.pipe(
        startWith(''),
        map((value) => this._reportingFilter(value || ''))
      );
    }
    console.log('reportingUsers-->', this.reportingUsers);
  }
  clearRoleSelection() {
    this.roleControl.setValue(null);
    this.reportingControl.setValue(null);

    this.reportingUsers = [];
    this.filterdReportingUsers = this.reportingControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._reportingFilter(value || ''))
    );
  }
  clearReportingSelection() {
    this.reportingControl.setValue(null);
  }
  get company(): FormArray {
    return this.userCompanyForm.get('company') as FormArray;
  }

  patchCompanyIds(companies: any[], userId: any): void {
    // const companyForm = this.createCompanyForm();
    companies.forEach((company) => {
      console.log(company);
      const companyForm = this.createCompanyForm();
      const companyId = company.company_id;
      // Assuming you want to patch the form for each company id

      companyForm.patchValue({
        company_id: companyId,
        app_user_id: this.userId,
        user_id: userId,
      });
      // Perform any further operations needed with the patched form
      // console.log(companyForm);
      this.company.push(companyForm);
    });

    this.company.value.forEach((comp: any) => {
      this.createUserCompany(comp);
    });

    console.log(this.company.value);
  }

  createUserCompany(comp: any) {
    if (comp) {
      this._sunshineIternalApi
        .postUserCompany(comp)
        .then((res: any) => {
          console.log(res);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }

  submit() {
    console.log(this.singupForm.value);
    // console.log(this.selectFormControl.value)
    this.password = this.singupForm.value.password;
    // this._router.navigate(['/dashboard']);
    if (this.singupForm.valid && this.selectFormControl.value.length > 0) {
      console.log(this.selectFormControl.value);
      this._sunshineIternalApi
        .newUserSignup(this.singupForm.value)
        .subscribe((res: any) => {
          console.log('signup-res--', res);
          if (res.errorCode == 0) {
            this.showProgressBar = false;
            let response = res.data;
            let userId = response[1][0].user_id;
            console.log('new userId -->', userId);
            this.patchCompanyIds(this.selectFormControl.value, userId);
            this.createDefaultUrc(userId);
            this.createUserNotification(userId);

            this.openSnackBar(res.message);

            this.dialogRef.close({
              create: 1,
              // leadId: this.leadId,
            });
          } else {
            this.showProgressBar = true;
            this.openSnackBar(res.message);
            this.dialogRef.close({
              create: 0,
              // leadId: this.leadId,
            });
          }
          // this._router.navigate(['/dashboard']);
        });
    } else {
      this.singupForm.markAllAsTouched();
      this.selectFormControl.setErrors({ required: true }); // Set error if not selected
      this.dialogRef.close({
        create: 0,
        // leadId: this.leadId,
      });
    }
  }
  openSnackBar(message: string) {
    this._snackBar.open(message, 'Close', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: this.durationInSeconds * 1000,
    });
  }

  createUserNotification(userId: number) {
    let notifType: any = sessionStorage.getItem('notifType');
    let parsedNotifType = JSON.parse(notifType);
    // console.log(parsedNotifType[0]);

    let createUsrNotifObj = {
      user_id: userId,
      notification_type_id: parsedNotifType[0].notification_type_id,
      notification_name: parsedNotifType[0].notification_type_name,
      notification_message: parsedNotifType[0].notification_type_description,
      notification_effective_from: this.getCurrentTimestamp(),
      notification_effective_to: null,
      notification_lifespan_days: null,
      notification_publish_flag: 1,
      acknowledgment_required: 1,
      notification_acknowledged_on: null,
      app_user_id: this.appUserId,
    };

    // console.log('------>', createUsrNotifObj);

    this._sunshineIternalApi
      .postNewUserNotification(createUsrNotifObj)
      .then((res: any) => {
        console.log('create-use-notif-res;:::', res);
        this.openSnackBar(res.message);
      })
      .catch((error) => {
        console.error('create-use-notif-err::::', error);
        this.openSnackBar(error.response.message);
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

  getUserById(_id: number) {
    // //console.log('received-usrId', _id);
    let userBody = {
      user_id: _id,
      first_name: null,
      last_name: null,
      email_address: null,
      phone: null,
      mac_address: null,
    };

    this._sunshineIternalApi
      .fetchUserById(userBody)
      .then((userIdRes: any) => {
        let resData = userIdRes.data[0][0];
        console.log('userIdRes', resData);
        this.sendEmail(resData, this.password);
      })
      .catch((error: any) => {
        console.error('user-by-id-err', error);
      });
  }

  sendEmail(userDetails: any, pwd: any) {
    console.log('sendEmail usrdetls-->', userDetails);
    const {
      first_name,
      last_name,
      email_address,
      phone,
      role_name,
      full_name,
    } = userDetails;

    let emailBody = `
      Hi ${full_name},
      <br><br>
      New Signup Details:
      <ul>
        <li><strong>First Name:</strong> ${
          first_name === undefined || first_name === null ? '' : first_name
        }</li>
        <li><strong>Last Name:</strong> ${
          last_name === undefined || last_name === null ? '' : last_name
        }</li>
        <li><strong>Full Name:</strong> ${
          full_name === undefined || full_name === null ? '' : full_name
        }</li>
        <li><strong>Email Address:</strong> ${
          email_address === undefined || email_address === null
            ? ''
            : email_address
        }</li>
        <li><strong>Phone:</strong> ${
          phone === undefined || phone === null ? '' : phone
        }</li>
        <li><strong>Role:</strong> ${
          role_name === undefined || role_name === null ? '' : role_name
        }</li>
      </ul>
      <br>
      Below are your login credentials:
      <br>
      Login URL :<a href="https://sunshine-crm-dev-client.el.r.appspot.com/#/login">Click Here to Login</a> 
      <br>
      Email Id : ${
        email_address === undefined || email_address === null
          ? ''
          : email_address
      }
      <br>
      Password : ${this.password ? this.password : pwd}
      <br>
      Thank you,<br>
      Team Sunshine Solutions Pvt. Ltd.<br>
      This automated mail was sent by Sunshine Solutions Pvt. Ltd. Please do not reply directly to this email. 
      For questions or assistance, please get in touch with info@mailers.codeswift.in.
    `;

    let receiverEmailId = email_address;
    let emailSubject = `User Created`;

    let finalEmail = {
      to: receiverEmailId,
      subject: emailSubject,
      emailBody: emailBody,
    };

    this._sunshineIternalApi
      .sendEmail(finalEmail)
      .then((res: any) => {
        console.log('email-res::::', res);
        this.openSnackBar(res.message);
      })
      .catch((error) => {
        this.openSnackBar(error);
      });
  }

  createDefaultUrc(userId: any) {
    let urc = {
      app_user_id: this.appUserId,
      user_id: userId,
      role_id: this.selectedRoleId,
      company_id: 1,
      module_id: 1,
      privilege_list: '1,2,4,8,16,32',
      group_list: null,
      status: 1,
      is_role_only_update: 0
    };

    this._sunshineIternalApi
      .postNewURC(urc)
      .then((res: any) => {
        console.log('save-urc', res);
        let resData = res;
        this.getUserById(userId);

        // this.openSnackBar('Privilege(s) Updated');
        // this.getAllURCDetailsofLoggedInUser(urc.user_id);

        // //console.log('urc-obj-after-save', this.urc);
      })
      .catch((error) => {
        console.log(error);
      });
  }
}
