import { Component, OnInit, ViewChild } from '@angular/core';
import { SunshineInternalService } from '../sunshine-services/sunshine-internal.service';
import { Observable, map, startWith, switchMap, timer } from 'rxjs';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-activity-logs',
  templateUrl: './activity-logs.component.html',
  styleUrls: ['./activity-logs.component.css'],
})
export class ActivityLogsComponent implements OnInit {
  activityLogForm: any;
  autoRefresh: number = 6000;
  activityLogs: any = [];
  tableTxt: any = 'Activity Logs';
  showProgressBar: boolean = false;
  userId: any;
  displayedColumns: any = ['activity_dtm', 'full_name', 'activity_type'];
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  resultsLength: number = 0;
  
  // Filter properties
  selectedFromDate: string = new Date().toISOString().split('T')[0]; // Default to today
  selectedToDate: string = new Date().toISOString().split('T')[0]; // Default to today
  selectedUserId: number | null = null;
  allUsersData: { first_name: string; last_name: string; user_id: string; role_name?: string }[] = [];
  filteredUsers!: Observable<{ first_name: string; last_name: string; user_id: string }[]>;
  userControl = new FormControl();
  roleIdToName: { [key: string]: string } = {
    '1': 'READ_ONLY',
    '2': 'SUPERUSER',
    '3': 'ADMIN',
    '4': 'GROUP HEAD',
    '5': 'COMPANY HEAD',
    '6': 'BUSINESS UNIT HEAD',
    '7': 'DIVISION HEAD',
    '8': 'DEPARTMENT HEAD',
    '9': 'TEAM MANAGER',
    '10': 'TEAM LEAD',
    '11': 'AGENT',
    '12': 'SENIOR MANAGER',
    '13': 'IT MANAGER',
    '14': 'FIELD AGENT'
  };
  privilegeBitToName: { [key: number]: string } = {
    1: 'READ',
    2: 'WRITE',
    4: 'UPDATE',
    8: 'DELETE',
    16: 'EXPORT',
    32: 'IMPORT'
  };
  userIdToFullName: { [key: string]: string } = {};
  customerIdToName: { [key: string]: string } = {};
  allLeadsData: any[] = [];

  constructor(
    private _sunshineIntService: SunshineInternalService,
    private _fb: FormBuilder,
    private _snackBar: MatSnackBar
  ) {
    this.activityLogForm = this._fb.group({
      lead_id: [null], // Optional - null means get all activity logs
    });
  }

  ngOnInit(): void {
    this.getAllUsers();
    this.setupUserFilter();
    
    // Set userId first from sessionStorage
    let userDetails: any = sessionStorage.getItem('userDetails');
    let parsedUsrDetails = JSON.parse(userDetails);
    this.userId = parsedUsrDetails.user_id;

    this.activityLogForm.patchValue({
      lead_id: null,
    });
    
    // Now call getAllCustomers after userId is set
    this.getAllCustomers();
    this.getAllUserActivityLogs();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getAllUsers() {
    this._sunshineIntService
      .fetchAllUsers()
      .then((res: any) => {
        let resData = res.data[0];
        this.allUsersData = resData;
        // Build userId to fullName map (only by user_id)
        this.allUsersData.forEach(user => {
          this.userIdToFullName[user.user_id] = `${user.first_name} ${user.last_name}`;
        });
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
        this._snackBar.open('Error fetching users', 'Close', {
          duration: 3000,
        });
      });
  }

  getAllCustomers() {
    // Get selected company_id (bank) from sessionStorage
    let companySession = sessionStorage.getItem('company');
    let selectedCompanyId = null;
    if (companySession) {
      try {
        const companies = JSON.parse(companySession);
        // If only one company is selected, use that
        if (Array.isArray(companies) && companies.length === 1) {
          selectedCompanyId = companies[0].company_id;
        } else if (Array.isArray(companies) && companies.length > 1) {
          // If multiple, you may want to select the first or prompt user
          selectedCompanyId = companies[0].company_id;
        }
      } catch (e) {
        console.error('Error parsing company session:', e);
      }
    }
    
    // Only make API call if we have both company_id and userId
    // if (!selectedCompanyId || !this.userId) {
    //   console.warn('Missing required parameters for getAllCustomers:', { selectedCompanyId, userId: this.userId });
    //   return;
    // }
    
    // Fetch all leads for the selected company only
    const params: any = {
      company_id: selectedCompanyId,
      app_user_id: this.userId
    } 
    
    this._sunshineIntService
      .fetchAllLeads(params)
      .then((res: any) => {
        let leads = res.data[0] || [];
        this.customerIdToName = {};
        this.allLeadsData = leads;
        leads.forEach((lead: any) => {
          if (lead.customer_id && lead.customer_name) {
            this.customerIdToName[lead.customer_id] = lead.customer_name;
          }
          if (lead.product_account_no && lead.customer_name) {
            this.customerIdToName[lead.product_account_no] = lead.customer_name;
          }
        });
      })
      .catch((error) => {
        console.error('Error fetching customers:', error);
        // Don't show snackbar here as it might be too intrusive
      });
  }



  async getAllUserActivityLogs() {
    this.showProgressBar = true;
    
    // Build params with new filtering options
    let params = {
      lead_id: null, // Get all activity logs, not filtered by lead
      filter_from_date: this.selectedFromDate,
      filter_to_date: this.selectedToDate,
      filter_user_id: this.selectedUserId,
      ...this.activityLogForm.value
    };
    
    this._sunshineIntService
      .fetchActivityLogs(params)
      .then((res: any) => {
        console.log('Activity Log Response:', res);
        console.log('Response data structure:', {
          hasData: !!res.data,
          dataIsArray: Array.isArray(res.data),
          dataLength: res.data?.length,
          hasNestedData: !!(res.data && res.data.data),
          nestedDataIsArray: Array.isArray(res.data?.data?.[0])
        });
        
        // Handle response - all login activities
        if (res.data && Array.isArray(res.data)) {
          this.activityLogs = res.data;
          console.log('Using direct array data:', this.activityLogs.length);
        } else if (res.data && res.data.data && Array.isArray(res.data.data[0])) {
          // Legacy nested response format
          let resData = res.data.data[0];
          this.activityLogs = resData;
          console.log('Using nested data:', this.activityLogs.length);
        } else {
          this.activityLogs = [];
          console.log('No data found, setting empty array');
        }

        console.log('Raw activity logs before processing:', this.activityLogs.length);
        console.log('Sample log entry:', this.activityLogs[0]);

        // Remove duplicates based on activity_dtm, activity_type, and full_name
        const uniqueLogs = this.activityLogs.filter((log: any, index: number, self: any[]) =>
          index === self.findIndex((l: any) =>
            l.activity_dtm === log.activity_dtm &&
            l.activity_type === log.activity_type &&
            l.full_name === log.full_name
          )
        );

        console.log('After deduplication:', uniqueLogs.length);

        this.activityLogs = uniqueLogs; // Remove .reverse() to show latest first
        this.dataSource = new MatTableDataSource(this.activityLogs);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        
        // Set default sort to show latest activities first
        this.dataSource.sort.sort({ id: 'activity_dtm', start: 'desc', disableClear: false });
        this.resultsLength = this.activityLogs.length;
        
        console.log('Final data source length:', this.dataSource.data.length);
        console.log('Results length:', this.resultsLength);
        
        this.showProgressBar = false;
      })
      .catch((err) => {
        console.error('Error fetching activity logs:', err);
        this._snackBar.open('Error fetching activity logs', 'Close', {
          duration: 3000,
        });
        this.showProgressBar = false;
      });
  }

  applyFilter(event: any) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Filter methods
  onFromDateChange() {
    this.getAllUserActivityLogs();
  }

  onToDateChange() {
    this.getAllUserActivityLogs();
  }

  onUserChange(selectedUser: any) {
    if (selectedUser) {
      this.selectedUserId = selectedUser.user_id;
    } else {
      this.selectedUserId = null;
    }
    this.getAllUserActivityLogs();
  }

  clearUserFilter() {
    this.selectedUserId = null;
    this.userControl.setValue(null);
    this.getAllUserActivityLogs();
  }

  setupUserFilter() {
    this.filteredUsers = this.userControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filterUsers(value || ''))
    );
    
    // Handle user selection
    this.userControl.valueChanges.subscribe(selectedUser => {
      if (selectedUser && typeof selectedUser === 'object') {
        this.onUserChange(selectedUser);
      }
    });
  }

  private _filterUsers(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.allUsersData.filter((option) =>
      `${option.first_name} ${option.last_name}`.toLowerCase().includes(filterValue)
    );
  }

  displayUser(user: any): string {
    return user ? `${user.first_name} ${user.last_name}` : '';
  }

  formatActivityType(activityType: string, row?: any): string {
    // Since we're only showing login activities, simplify this
    if (activityType === 'USER_LOGIN') {
      return 'Login';
    }
    
    // Hide USER_DATA_INSERT from frontend
    if (activityType === 'USER_DATA_INSERT') {
      return '';
    }
    // Special case for USER_DATA_UPDATE
    if (activityType === 'USER_DATA_UPDATE' && row && row.activity_detail) {
      const profileName = row.full_name || 'user';

      // First try to get user_id from activity_doc_num
      let updatedUserId = row.activity_doc_num;
      
      // If not found, try to extract from activity_detail
      if (!updatedUserId) {
        const userIdMatch = row.activity_detail.match(/user_id value was modified from (\d+) to (\d+);/i);
        if (userIdMatch) {
          updatedUserId = userIdMatch[2];
        }
      }
      
      // Get the full name of the user being updated
      let updatedUserFullName = 'unknown';
      if (updatedUserId) {
        updatedUserFullName = this.userIdToFullName[updatedUserId] || `user_id: ${updatedUserId}` || 'unknown';
      }

      // Check for reporting_to_id change
      const reportingMatch = row.activity_detail.match(/reporting_to_id value was modified from (\d+) to (\d+);/i);
      if (reportingMatch) {
        return `${profileName} updated the reporting to in ${updatedUserFullName}`;
      }

      // Check for assigned_by_id change
      const assignedMatch = row.activity_detail.match(/assigned_by_id value was modified from (\d+) to (\d+);/i);
      if (assignedMatch) {
        const fromManagerName = this.userIdToFullName[assignedMatch[1]] || assignedMatch[1];
        const toManagerName = this.userIdToFullName[assignedMatch[2]] || assignedMatch[2];
        return `${profileName} updated assigned by from '${fromManagerName}' to '${toManagerName}' in ${updatedUserFullName}`;
      }

      // Check for is_admin change
      const adminMatch = row.activity_detail.match(/is_admin value was modified from (\d+) to (\d+);/i);
      if (adminMatch) {
        const fromStatus = adminMatch[1] === '1' ? 'Admin' : 'Non-Admin';
        const toStatus = adminMatch[2] === '1' ? 'Admin' : 'Non-Admin';
        return `${profileName} updated admin status from '${fromStatus}' to '${toStatus}' in ${updatedUserFullName}`;
      }

      // Check for other field changes
      const fieldMatch = row.activity_detail.match(/(\w+) value was modified from ([^;]+) to ([^;]+);/i);
      if (fieldMatch) {
        const [_, field, fromValue, toValue] = fieldMatch;
        return `${profileName} updated ${field} from '${fromValue}' to '${toValue}' in ${updatedUserFullName}`;
      }

      // Fallback if no specific changes found
      return `${profileName} updated the details of ${updatedUserFullName}`;
    }
    // Special case for USER_ROLE_COMPANY_DATA_INSERT
    if (activityType === 'USER_ROLE_COMPANY_DATA_INSERT' && row) {
      const profileName = row.full_name || 'user';
      const newUserId = row.activity_doc_num;
      const newUserFullName = this.userIdToFullName[newUserId] || 'unknown';
      return `${profileName} created a new user with full name ${newUserFullName}`;
    }
    // Special case for TASK_UPDATE
    if (activityType === 'TASK_UPDATE' && row) {
      const profileName = row.full_name || 'user';
      return `${profileName} updated the task`;
    }
    // Special case for TASK_INSERT
    if (activityType === 'TASK_INSERT' && row) {
      const profileName = row.full_name || 'user';
      return `${profileName} created a new task`;
    }
    // Special case for USER_NOTIFICATION_DATA_INSERT
    if (activityType === 'USER_NOTIFICATION_DATA_INSERT' && row) {
      const profileName = row.full_name || 'user';
      // Debug: log the row to see what fields are present
      // console.log('Activity log row:', row);
      const customerId =
        row.customer_id ||
        row.lead_id ||
        row.customerId ||
        row.account_id ||
        row.product_account_no ||
        (row.customer_id ? String(row.customer_id) : undefined) ||
        (row.product_account_no ? String(row.product_account_no) : undefined);

      let customerName = row.customer_name;

      // Try mapping by ID or account number (as string and number)
      if (!customerName && customerId) {
        customerName = this.customerIdToName[customerId] || this.customerIdToName[String(customerId)];
      }

      // Try matching in allLeadsData
      if (!customerName && this.allLeadsData) {
        const found = this.allLeadsData.find(
          (lead: any) =>
            lead.customer_id == customerId ||
            lead.product_account_no == customerId ||
            String(lead.customer_id) == String(customerId) ||
            String(lead.product_account_no) == String(customerId)
        );
        if (found) customerName = found.customer_name;
      }

      // Fallback
      if (!customerName) {
        customerName = row.product_account_no
          ? `Account No: ${row.product_account_no}`
          : customerId
          ? `Customer ID: ${customerId}`
          : 'Unknown Customer';
      }

      // Defensive: If this is actually a ticket, show the correct message
      if (row.ticket_id || row.ticket_issue_category_type_id) {
        return `Ticket raised by ${row.full_name}`;
      }

      return `${profileName}  has created a notification for task creation or update.`;
    }
    if (activityType === 'USER_ROLE_COMPANY_DATA_UPDATE' && row && row.activity_detail) {
      const profileName = row.full_name || 'user';
      let updatedUserId = row.activity_doc_num;
      let updatedUserFullName = this.userIdToFullName[updatedUserId] || `user_id: ${updatedUserId}` || 'unknown';

      // Extract assigned_by_id changes (more flexible regex)
      const assignedMatch = row.activity_detail.match(/assigned_by_id\s*value\s*was\s*modified\s*from\s*(\d+)\s*to\s*(\d+)/i);
      let assignedMsg = '';
      if (assignedMatch) {
        const fromManagerName = this.userIdToFullName[assignedMatch[1]] || assignedMatch[1];
        const fromManagerRole = this.allUsersData.find(u => String(u.user_id) === assignedMatch[1])?.role_name || '';
        const toManagerName = this.userIdToFullName[assignedMatch[2]] || assignedMatch[2];
        const toManagerRole = this.allUsersData.find(u => String(u.user_id) === assignedMatch[2])?.role_name || '';
        assignedMsg = `changed assigned by from '${fromManagerName} (${fromManagerRole})' to '${toManagerName} (${toManagerRole})'`;
      }

      // Extract reporting_to_id changes (more flexible regex)
      const reportingMatch = row.activity_detail.match(/reporting_to_id\s*value\s*was\s*modified\s*from\s*(\d+)\s*to\s*(\d+)/i);
      let reportingMsg = '';
      if (reportingMatch) {
        const fromReportingName = this.userIdToFullName[reportingMatch[1]] || reportingMatch[1];
        const fromReportingRole = this.allUsersData.find(u => String(u.user_id) === reportingMatch[1])?.role_name || '';
        const toReportingName = this.userIdToFullName[reportingMatch[2]] || reportingMatch[2];
        const toReportingRole = this.allUsersData.find(u => String(u.user_id) === reportingMatch[2])?.role_name || '';
        reportingMsg = `changed reporting to from '${fromReportingName} (${fromReportingRole})' to '${toReportingName} (${toReportingRole})'`;
      }

      let changes = [];
      if (assignedMsg) changes.push(assignedMsg);
      if (reportingMsg) changes.push(reportingMsg);

      if (changes.length > 0) {
        return `${profileName} updated the Reporting to and Assigned by details in ${updatedUserFullName} and ${changes.join(' and ')}`;
      } else {
        return `${profileName} updated the Reporting to and Assigned by details  in ${updatedUserFullName}`;
      }
    }
    if (activityType === 'TARGET_ASSIGN' && row) {
      const profileName = row.target_assigned_by_full_name || row.full_name || 'user';
      const seniorManager = row.senior_manager_full_name || 'N/A';
      const teamManager = row.team_manager_full_name || 'N/A';
      const teamLead = row.team_lead_full_name || 'N/A';
      const agent = row.agent_full_name || 'N/A';

      return `${profileName} assigned target to Senior Manager: ${seniorManager}, Team Manager: ${teamManager}, Team Lead: ${teamLead}, Agent: ${agent}`;
    }
    if (activityType === 'DISPOSITION_CODE_CREATE' && row) {
      const profileName = row.full_name || 'user';
      const stage = row.disposition_stage || 'N/A';
      const status = row.disposition_status || 'N/A';
      const statusName = row.disposition_status_name || 'N/A';
      const code = row.disposition_code || 'N/A';
      return `${profileName} has created disposition code with Stage: ${stage}, Status: ${status}, Status Name: ${statusName}, Code: ${code}`;
    }
    switch (activityType) {
      case 'USER_LOGIN':
        return 'User Login';
      case 'USER_LOGOUT':
        return 'User Logout';
      case 'TICKET_CREATE':
        return `Ticket raised by ${row.full_name}`;
      case 'DISPOSITION_CODE_CREATE':
        return `${row.full_name} has created disposition code with Stage: ${row.disposition_stage}, Status: ${row.disposition_status}, Status Name: ${row.disposition_status_name}, Code: ${row.disposition_code}`;
      case 'USER_CREATE':
        return 'User Created';
      case 'BANK_CREATE':
        return 'Bank Created';
      default:
        return activityType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  }

  decodePrivilegeMask(mask: number): string[] {
    const privileges: string[] = [];
    Object.keys(this.privilegeBitToName).forEach(bitStr => {
      const bit = Number(bitStr);
      if ((mask & bit) === bit) {
        privileges.push(this.privilegeBitToName[bit]);
      }
    });
    return privileges;
  }
}
