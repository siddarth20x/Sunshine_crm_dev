import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Subscription } from 'rxjs';
import { SunshineInternalService } from 'src/app/sunshine-services/sunshine-internal.service';
import { SidebarStatusService, ReminderSidebarInfo } from '../services/sidebar-status.service';

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
  status: Number;
  company_code: String;
  company_id: Number;
  company_logo_url: String;
  created_dtm: String;
  created_id: Number;
  group_bit: String;
  group_mask: Number;
  modified_dtm: String;
  modified_id: Number;
  privilege_bit: String;
  privilege_mask: Number;
  role_id: Number;
  role_name: String;
  user_id: Number;
  user_role_company_id: Number;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit, OnDestroy {
  modules: Modules[] = [];
  listFilteredModule: Modules[] = [];
  skeletonLoader: boolean = true;
  autoRefresh: number = 6000;
  @ViewChild('sidenav')
  sidenav!: MatSidenav;

  reminderInfo: ReminderSidebarInfo = { status: '', count: 0 };
  private reminderInfoSubscription: Subscription = new Subscription();

  private defaultRemindersModule: Modules = {
    module_id: 0,
    module_name: "Reminders",
    module_desc: "Task Reminders",
    module_bit: 0,
    route_name: "/reminders",
    module_icon: "notifications",
    module_alias: "Reminders",
    module_type: "list",
    module_group: "Tasks",
    module_group_sort_order: 0,
    module_sort_order: -1,
    status: 1,
    company_code: "",
    company_id: 0,
    company_logo_url: "",
    created_dtm: "",
    created_id: 0,
    group_bit: "",
    group_mask: 0,
    modified_dtm: "",
    modified_id: 0,
    privilege_bit: "",
    privilege_mask: 0,
    role_id: 0,
    role_name: "",
    user_id: 0,
    user_role_company_id: 0
  };

  constructor(
    private sunshineServicesInt: SunshineInternalService,
    private sidebarStatusService: SidebarStatusService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Only show modules if user is logged in
    if (sessionStorage.getItem('userDetails')) {
      if (!sessionStorage.getItem('loggedInUsrAuthModules')) {
        let userDetails: any = sessionStorage.getItem('userDetails');
        let parseduserDetails = JSON.parse(userDetails);
        this.getAllURCDetailsofLoggedInUser(parseduserDetails.user_id);
      } else {
        this.checkAuthModules();
      }
    } else {
      this.modules = []; // No modules if not logged in
      this.skeletonLoader = false;
    }

    this.reminderInfoSubscription = this.sidebarStatusService.reminderInfo$.subscribe(
      (info: ReminderSidebarInfo) => {
        this.reminderInfo = info;
        this.cdr.detectChanges();
      }
    );
  }

  ngOnDestroy(): void {
    if (this.reminderInfoSubscription) {
      this.reminderInfoSubscription.unsubscribe();
    }
  }

  checkAuthModules() {
    let modulesFromSession = sessionStorage.getItem('loggedInUsrAuthModules');
    if (modulesFromSession) {
      let parsedAuthModules = JSON.parse(modulesFromSession);
      this.modules = parsedAuthModules;
    } else {
      this.modules = [];
    }

    // Only add Reminders if user is logged in
    if (sessionStorage.getItem('userDetails')) {
      const remindersModuleExists = this.modules.some(module => module.route_name === this.defaultRemindersModule.route_name);
      if (!remindersModuleExists) {
        this.modules.push({ ...this.defaultRemindersModule });
      }
    }

    this.skeletonLoader = false;
  }

  filterModules() {
    return this.modules.filter(
      (module) => module.module_type == 'list' && 
                  module.status == 1 && 
                  module.module_name !== 'FIELD_VISIT_MANAGEMENT' // Hide Field Visit Management
    );
  }

  getAllURCDetailsofLoggedInUser(userId: any) {
    let urcBody = {
      user_id: userId,
    };

    this.sunshineServicesInt
      .fetchURC(urcBody)
      .then((urcRes: any) => {
        let resData = urcRes.data.data[0];
        sessionStorage.setItem(
          'loggedInUsrAuthModules',
          JSON.stringify(resData)
        );
        this.checkAuthModules();
      })
      .catch((error) => {
        console.error('urc-err', error.response);
        this.checkAuthModules();
      });
  }

  selectedModuleGroup(moduleGroup: any) {
    let filterModuleGroupBasedOnSelectedGroup = this.modules.filter(
      (module) => module.module_group == moduleGroup
    );
    sessionStorage.setItem(
      'loggedInUsrSelecedModuleGroup',
      JSON.stringify(filterModuleGroupBasedOnSelectedGroup)
    );
  }
}
