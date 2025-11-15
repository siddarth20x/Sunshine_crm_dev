import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSidenav } from '@angular/material/sidenav';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SunshineInternalService } from '../sunshine-services/sunshine-internal.service';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { FormControl } from '@angular/forms';
import { NotificationService } from '../shared/services/notification.service';

/**
 * Dashboard Component
 * 
 * Key Logic for Account Tracking:
 * 
 * 1. CURRENT MONTH DATE RANGE:
 *    - Start: First day of current month at 00:00:00 (e.g., '2025-10-01 00:00:00')
 *    - End: Last day of current month at 23:59:59 (e.g., '2025-10-31 23:59:59')
 *    - Set via setMonthRange() method on component initialization
 * 
 * 2. ACCOUNTS ALLOCATED:
 *    - Total count of all accounts allocated to the bank
 *    - No date filtering - shows all allocated accounts
 *    - Filter: lead_status NOT IN ('DEFERRED', 'CANCELLED') AND allocation_type = 'monthly'
 * 
 * 3. ACCOUNTS TOUCHED:
 *    - Accounts where user has filled disposition fields during current month:
 *      • Feedback
 *      • Contactable / Non-Contactable
 *      • Disposition Status
 *      • Disposition Status Name
 *      • Disposition Code
 *    - Logic: Checks activity_log for entries with is_touched = 1 within current month date range
 *    - Stored procedure filters by: al.is_touched = 1 AND al.activity_type NOT LIKE '%NEW_ACCOUNT%'
 *                                   AND al.activity_dtm BETWEEN start_dtm AND end_dtm
 * 
 * 4. ACCOUNTS UNTOUCHED:
 *    - Accounts where user has NOT filled any disposition fields during current month
 *    - Logic: Allocated accounts that don't have any activity_log entries with is_touched = 1
 *            within the current month date range
 *    - Formula: Accounts Allocated - Accounts Touched (for current month)
 * 
 * 5. TOTAL OUTSTANDING:
 *    - Sum of total_outstanding_amount from leads_payment_ledger
 *    - Calculated by stored procedure from latest payment ledger entries
 * 
 * 6. FOLLOW-UPS (CURRENT MONTH):
 *    - Follow-up tasks with target_dtm falling within current month
 *    - Filter: task_type = 'FOLLOW UP' AND task_status IN ('PENDING', 'IN PROGRESS')
 *             AND target_dtm BETWEEN start_dtm AND end_dtm
 * 
 * 7. FOLLOW-UPS (TODAY):
 *    - Follow-up tasks with target_dtm = today's date
 *    - Filter: task_type = 'FOLLOW UP' AND task_status IN ('PENDING', 'IN PROGRESS')
 *             AND DATE(target_dtm) = CURRENT_DATE
 * 
 * 8. TARGETS:
 *    - Total Target: Sum of all targets assigned
 *    - Achieved: Total collections made
 *    - Daily Target: Calculated based on working days and remaining target
 */
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  displayedAccHoldersColumns: string[] = [];
  dataSource: any;
  myDataArray: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  resultsLength: number = 0;
  touchedAccLength: string = '0';
  pendingAccLength: number = 0;
  tableTxt: string = '';

  allocatedAcc: boolean = true;
  touchedAcc: boolean = false;
  pendingAcc: boolean = false;
  followUpAcc: boolean = false;
  currentMonthFollowUpAcc: boolean = false;
  currentDayFollowUpAcc: boolean = false;

  isHidden: boolean = true;
  @ViewChild('sidenav') sidenav!: MatSidenav;
  // drawer: any;
  opened: boolean = true;
  showProgressBar: boolean = false;
  accountsTouched: any = [];
  accountsPending: any = [];
  userId: any;
  isCountsLoading: boolean = false;
  accountsAllocated: string = '0';
  totalOutstanding: string = '0';
  totalCollection: string = '0';
  totalFollowups: string = '0';
  currentMonthFollowups: string = '0';
  currentDayFollowups: string = '0';
  
  // Flag to prevent repeated manual calculations
  private isCalculatingManually: boolean = false;

  notifications: any = [];
  paginatedNotifications: any = [];
  notificationsType: any = [];
  notificationsLength: number = 0;
  targetAmount: number = 0;
  achievedAmount: number = 0;
  dailyTarget: number = 0;
  loggedInUserRole: string = '';

  companyArr: any[] = [];
  companyId: any;

  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  durationInSeconds = 5;
  companyControl = new FormControl('');
  hasShownBankSelectMessage: boolean = false;
  startDate: string | null = null;
  endDate: string | null = null;
  isBankSearched: boolean = false;
  currentlySearchedBank: string = ''; // Add this property to track the currently searched bank
  isNoAccountsFound: boolean = false; // Add this property to track when "No Accounts Found" is shown

  untouchedAcc: boolean = false;
  untouchedAccLength: string = '0';

  // Add these properties to store lead IDs
  private allocatedLeadIds: string = '';
  private touchedLeadIds: string = '';
  private untouchedLeadIds: string = '';

  // Add properties for pending days filter
  pendingDaysFilter: string = '';
  pendingDaysOptions: string[] = ['0-7', '8-15', '16-30', '31-60', '61-90', '90+', 'All'];

  // Add properties for pending days calculation
  originalDataArray: any[] = [];
  
  // Add property to track current filtered data
  currentFilteredData: any[] = [];

  // Add deactivated users functionality
  deactivatedUsers: any[] = [];
  
  // Add subscription for cleanup
  private companyControlSubscription: any;

  constructor(
    private _sunshineIntService: SunshineInternalService,
    private _snackBar: MatSnackBar,
    private _router: Router,
    private _aR: ActivatedRoute,
    private _changeDetectorRef: ChangeDetectorRef,
    private notificationService: NotificationService
  ) {
    // Subscribe to route changes
    this._router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/dashboard') {
          this.resetDashboard();
        }
      }
    });

    // Handle page refresh
    window.addEventListener('beforeunload', () => {
      // Clear any stored data when page is about to refresh
      sessionStorage.removeItem('ac-mgt-url');
      this.resetDashboard();
    });
  }

  ngOnInit(): void {
    // Only reset on full reload
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation.type === 'reload') {
      this.notificationService.resetFlags();
      this.notificationService.setNavigatingFromDialog(false);
      // Don't reset dashboard on reload - preserve bank selection
    }
    
    // Initialize sidebar status to show reminder count and highlight on app load
    this.notificationService.initializeSidebarStatus();
    
    this.notificationService.showLoginNotifications();
    this.initializeDataSource();
    this.initializeUserDetails();
    this.getAllNotifications(this.userId);
    this.initializeCompanyData();
    this.configureDisplayedColumns();
    this.setMonthRange(new Date().toISOString());
    this.loadDeactivatedUsers();
    
    // Auto-load last selected bank
    if ((!this.companyArr || this.companyArr.length === 0) && sessionStorage.getItem('userCompany')) {
      this.companyArr = JSON.parse(sessionStorage.getItem('userCompany')!);
    }
    
    // Check for stored bank selection
    const storedBankId = sessionStorage.getItem('selectedBankId');
    const storedBankName = sessionStorage.getItem('selectedBankName');
    
    if (storedBankId && storedBankName && this.companyArr && this.companyArr.length > 0) {
      // Auto-select the previously selected bank
      this.companyControl.setValue(storedBankName);
      this.companyId = parseInt(storedBankId);
      this.currentlySearchedBank = storedBankName;
      
      // Auto-load data for the stored bank
      setTimeout(() => {
        this.searchByBank(this.userId, this.companyId);
      }, 500);
    } else {
      // Set empty value but don't reset flags
      this.companyControl.setValue('');
    }
    
    // Listen for changes to the company control to reset flags when cleared
    this.companyControlSubscription = this.companyControl.valueChanges.subscribe(value => {
      if (!value) {
        this.isBankSearched = false;
        this.isNoAccountsFound = false;
        this.companyId = null;
        // Clear stored bank selection
        sessionStorage.removeItem('selectedBankId');
        sessionStorage.removeItem('selectedBankName');
      }
    });
  }

  ngOnDestroy(): void {
    // Clean up event listeners
    window.removeEventListener('beforeunload', () => {
      sessionStorage.removeItem('ac-mgt-url');
      this.resetDashboard();
    });
    window.removeEventListener('targetUpdated', ((event: CustomEvent) => {
      // Clean up the event listener
    }) as EventListener);
    
    // Clean up subscription
    if (this.companyControlSubscription) {
      this.companyControlSubscription.unsubscribe();
    }
  }

  private initializeDataSource(): void {
    this.dataSource = new MatTableDataSource(this.myDataArray);
    this.setupCustomFilter();
  }

  private setupCustomFilter(): void {
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const searchStr = filter.toLowerCase().trim();
      
      // If search string is empty or only contains spaces, show all results
      if (!searchStr) {
        return true;
      }
      
      // Check all relevant fields for partial matches
      const fieldsToSearch = [
        'customer_name',
        'account_number', 
        'product_account_number',
        'company_name',
        'senior_manager_full_name',
        'team_manager_full_name',
        'assigned_by_full_name',
        'assigned_to_full_name',
        'lead_status_type_name'
      ];

      return fieldsToSearch.some(field => {
        const fieldValue = data[field];
        if (fieldValue) {
          const fieldStr = fieldValue.toString().toLowerCase().trim();
          return fieldStr.includes(searchStr);
        }
        return false;
      });
    };
  }

  private initializeUserDetails(): void {
    const userDetails = sessionStorage.getItem('userDetails');
    if (userDetails) {
      const parsedUserDetails = JSON.parse(userDetails);
      this.userId = parsedUserDetails.user_id;
      this.loggedInUserRole = parsedUserDetails.role_name;
    } else {
      console.error('User details not found in session storage.');
    }
  }

  private initializeCompanyData(): void {
    if (!sessionStorage.getItem('userCompany')) {
      this.getUserCompany();
      return;
    }

    const companyTypes = sessionStorage.getItem('companyType');
    if (companyTypes) {
      const parsedCompanyTypes = JSON.parse(companyTypes);
      const customerType = parsedCompanyTypes.find(
        (comp: any) => comp.company_type_name === 'CUSTOMER'
      );

      if (customerType) {
        const companySession = sessionStorage.getItem('userCompany');
        if (companySession) {
          const parsedCompanySession = JSON.parse(companySession);
          this.companyArr = parsedCompanySession.filter(
            (company: any) =>
              company.company_type_id === customerType.company_type_id
          );
        }
      }
    }
  }

  private configureDisplayedColumns(): void {
    this.displayedAccHoldersColumns = [
      'lead_status_type_name',
      'company_name',
      'customer_name',
      'account_number',
      'product_account_number',
      'pending_days',
      'pli_status',
      'senior_manager',
      'team_manager',
      'team_lead',
      'agent',
    ];
  }

  private fetchAndCalculateTargetStats(): void {
    // Fetch all targets for the user (no date filtering to show all assigned targets)
    const params = {
      app_user_id: this.userId,
      in_start_dtm: null,
      in_end_dtm: null
    };

    console.log('Fetching target stats for user:', this.userId);
    
    this.isCountsLoading = true;
    this._sunshineIntService
        .fetchTargetCounts(params)
      .then((res: any) => {
        this.isCountsLoading = false;
        console.log('Target stats response:', res.data);
        
        const stats = res.data?.[0]?.[0];
        if (stats) {
          this.targetAmount = stats.total_target_amount || 0;
          this.achievedAmount = stats.total_achieved_target || 0;
          this.dailyTarget = stats.daily_target || 0;
          
          console.log('Target Amount:', this.targetAmount);
          console.log('Achieved Amount:', this.achievedAmount);
          console.log('Daily Target:', this.dailyTarget);
        } else {
          console.log('No target stats found - user may not have targets assigned');
          this.targetAmount = 0;
          this.achievedAmount = 0;
          this.dailyTarget = 0;
        }
      })
      .catch((error: any) => {
        this.isCountsLoading = false;
        this.targetAmount = 0;
        this.achievedAmount = 0;
        this.dailyTarget = 0;
        console.error('Error fetching target stats:', error);
      });
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
  }

  getUserCompany(): void {
    const params = { user_id: this.userId };

    this._sunshineIntService
      .fectchUserCompany(params)
      .then((companyRes: any) => {
        const resData = companyRes?.data?.[0] || [];
        sessionStorage.setItem('userCompany', JSON.stringify(resData));
        this.companyArr = resData;
      })
      .catch((error: any) => {
        console.error('Error fetching user company:', error);
        const errorMessage =
          error?.message ||
          'An error occurred while fetching user company details.';
        this.openSnackBar(errorMessage);
      });
  }

  ngAfterViewInit() {
    // Don't reset dashboard automatically - preserve state
    
    const bankQueryParams: any = this._aR.snapshot;
    if (!this.companyArr || this.companyArr.length === 0) {
      const companySession = sessionStorage.getItem('userCompany');
      if (companySession) {
        this.companyArr = JSON.parse(companySession);
      }
    }

    // Check for query parameters first, then stored bank selection
    if (this.hasValidQueryParams(bankQueryParams) && this.companyArr && this.companyArr.length > 0) {
      const routerSnapshot = bankQueryParams._routerState.url;
      sessionStorage.setItem('ac-mgt-url', routerSnapshot);
      const id1 = bankQueryParams.queryParams['id1'];
      const id2 = bankQueryParams.queryParams['id2'];
      this.searchByBank(id1, id2);
      const selectedCompany = this.getCompanyById(id2);
      if (selectedCompany) {
        this.companyControl.setValue(selectedCompany.company_name);
        // Store the bank selection
        sessionStorage.setItem('selectedBankId', id2.toString());
        sessionStorage.setItem('selectedBankName', selectedCompany.company_name);
      }
    } else {
      // Check for stored bank selection
      const storedBankId = sessionStorage.getItem('selectedBankId');
      const storedBankName = sessionStorage.getItem('selectedBankName');
      
      if (storedBankId && storedBankName && this.companyArr && this.companyArr.length > 0) {
        // Use stored bank selection
        this.companyControl.setValue(storedBankName);
        this.companyId = parseInt(storedBankId);
        this.searchByBank(this.userId, this.companyId);
      } else if (!this.hasShownBankSelectMessage) {
        // Show message to select a bank only if no stored selection
        this.openSnackBar(`Please select a bank to view accounts`);
        this.hasShownBankSelectMessage = true;
        this.resetDashboard();
      }
    }
  }

  private hasValidQueryParams(bankQueryParams: any): boolean {
    return (
      bankQueryParams.queryParams &&
      bankQueryParams.queryParams['id1'] &&
      bankQueryParams.queryParams['id2']
    );
  }

  private getCompanyById(companyId: number): any {
    if (!this.companyArr || this.companyArr.length === 0) {
      console.error('Company array is empty or undefined.');
      return null;
    }

    return this.companyArr.find(
      (company: any) => company.company_id == companyId
    );
  }

  dashboardCounts(company_id: number): void {
    this.isCountsLoading = true;

    // Use the current month dates from setMonthRange
    // For October 2025: start = '2025-10-01 00:00:00', end = '2025-10-31 23:59:59'
    const params = {
      app_user_id: this.userId,
      company_id: company_id,
      start_dtm: this.startDate,  // Already set by setMonthRange
      end_dtm: this.endDate        // Already set by setMonthRange
    };


    this._sunshineIntService
      .fetchDashboardCounts(params)
      .then((res: any) => {
        this.isCountsLoading = false;

        const resData = res?.data?.[0] || [];

        // Store lead IDs for each category
        resData.forEach((item: any) => {
          switch (item.param_name) {
            case 'accounts_allocated':
              this.allocatedLeadIds = item.lead_id_list || '';
              this.accountsAllocated = item.param_value || '0';
              break;
            case 'accounts_touched':
              this.touchedLeadIds = item.lead_id_list || '';
              this.touchedAccLength = item.param_value || '0';
              break;
            case 'accounts_untouched':
              this.untouchedLeadIds = item.lead_id_list || '';
              this.untouchedAccLength = item.param_value || '0';
              break;
            case 'total_outstanding_amount':
              this.totalOutstanding = item.param_value || '0';
              break;
            case 'total_collections':
              this.totalCollection = item.param_value || '0';
              break;
            case 'total_follow_up':
              this.totalFollowups = item.param_value || '0';
              break;
            case 'total_follow_up_today':
              this.currentDayFollowups = item.param_value || '0';
              break;
          }
        });

        // If backend didn't provide untouched accounts, calculate manually as fallback
        if (!this.untouchedLeadIds || this.untouchedLeadIds === '' || this.untouchedLeadIds === '0') {
          if (!this.isCalculatingManually) {
            console.log('Backend did not provide untouched accounts, calculating manually...');
            // Show user feedback that calculation is in progress
            this.openSnackBar('Calculating untouched accounts...', 'info');
            this.calculateTouchedUntouchedManually(this.userId, company_id);
          }
        }
      })
      .catch((error: any) => {
        this.isCountsLoading = false;
        console.error('dashboard_counts:err::', error.response?.data || error);
        // Provide user-friendly error feedback
        this.openSnackBar('Failed to load dashboard counts. Please try refreshing.', 'error');
      });
  }

  // Helper to get first date of month with 00:00:00
  private firstDateOfMonth(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}-01 00:00:00`;
  }

  // Helper to get last date of month with 23:59:59
  private lastDateOfMonth(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = date.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    const monthStr = String(month + 1).padStart(2, '0');
    return `${year}-${monthStr}-${String(lastDay).padStart(2, '0')} 23:59:59`;
  }

  // Call this method with a date string (e.g., '2025-10-01') to set the month range
  // For current month: October 2025, this sets start_dtm = '2025-10-01 00:00:00' and end_dtm = '2025-10-31 23:59:59'
  setMonthRange(inputDate: string) {
    const date = new Date(inputDate);
    this.startDate = this.firstDateOfMonth(date);
    this.endDate = this.lastDateOfMonth(date);
    this.fetchAndCalculateTargetStats();
  }

  // Fetch all leads for the selected bank and user for the current month
  private fetchAllLeadsForCurrentMonth(callback: (leads: any[]) => void) {
    if (!this.userId || !this.companyId) {
      this.openSnackBar('Please select a bank to view accounts');
      return;
    }
    const params = this.buildSearchParams(this.userId, this.companyId);
    this.showProgressBar = true;
    this._sunshineIntService.fetchLeadsBySearchParams(params)
      .then((res: any) => {
        this.showProgressBar = false;
        const allLeads = res.data[0] || [];
        callback(allLeads);
      })
      .catch((err: any) => {
        this.showProgressBar = false;
        this.openSnackBar('No Accounts Found');
        this.dataSource.data = [];
        this.resultsLength = 0;
      });
  }

  // Accounts Allocated
  filterAllocatedAccounts() {
    // Reset pending days filter when switching to allocated accounts
    this.pendingDaysFilter = '';
    
    // Use the already loaded data
    this.dataSource.data = this.myDataArray;
    this.currentFilteredData = [...this.myDataArray];
    this.tableTxt = `Accounts Allocated (${this.myDataArray.length})`;
    this.allocatedAcc = true;
    this.touchedAcc = false;
    this.pendingAcc = false;
    this.untouchedAcc = false;
    this.resultsLength = this.myDataArray.length;
    
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Accounts Touched
  filterTouchedAccounts() {
    // Reset pending days filter when switching to touched accounts
    this.pendingDaysFilter = '';
    
    // Ensure we have bank selected and data loaded
    if (!this.userId || !this.companyId) {
      this.openSnackBar('Please select a bank first');
      return;
    }
    
    // If no touched lead IDs, try to get fresh data from backend
    if (!this.touchedLeadIds || this.touchedLeadIds === '' || this.touchedLeadIds === '0') {
      if (!this.isCalculatingManually) {
        console.log('No touched lead IDs available, refreshing dashboard counts...');
        this.dashboardCounts(this.companyId);
        setTimeout(() => {
          this.filterTouchedAccounts(); // Retry after refresh
        }, 2000); // Increased timeout to allow calculation to complete
      }
      return;
    }

    const expectedLeadIds = this.touchedLeadIds.split(',').filter(id => id.trim() && id !== '0');
    if (expectedLeadIds.length === 0) {
      this.openSnackBar('No touched accounts found');
      return;
    }

    const params = {
      app_user_id: this.userId,
      company_id: this.companyId,
      lead_id_list: this.touchedLeadIds,
      account_number: null,
      product_account_number: null,
      agreement_id: null,
      customer_name: null,
      customer_id: null,
      passport_number: null,
      emirates_id_number: null,
      state: null
    };
    this.showProgressBar = true;
    this._sunshineIntService.fetchLeadsBySearchParams(params)
      .then((res: any) => {
        this.showProgressBar = false;
        const leads = res.data[0] || [];

        this.dataSource.data = leads;
        this.currentFilteredData = leads; // Store current filtered data
        this.touchedAccLength = leads.length.toString();
        this.tableTxt = `Accounts Touched (${leads.length})`;
        this.allocatedAcc = false;
        this.touchedAcc = true;
        this.pendingAcc = false;
        this.untouchedAcc = false;
        this.resultsLength = leads.length;
      })
      .catch((err: any) => {
        this.showProgressBar = false;
        console.error('Error fetching touched accounts:', err);
        this.openSnackBar('No Touched Accounts Found');
      });
  }

  // Accounts Pending (Last 15 Days)
  filterPending15Days() {
    if (!this.allocatedLeadIds) {
      this.openSnackBar('No pending accounts found for last 15 days');
      return;
    }
    const params = {
      app_user_id: this.userId,
      company_id: this.companyId,
      lead_id_list: this.allocatedLeadIds,
      account_number: null,
      product_account_number: null,
      agreement_id: null,
      customer_name: null,
      customer_id: null,
      passport_number: null,
      emirates_id_number: null,
      state: null
    };
    this.showProgressBar = true;
    this._sunshineIntService.fetchLeadsBySearchParams(params)
      .then((res: any) => {
        this.showProgressBar = false;
        const leads = res.data[0] || [];
        this.dataSource.data = leads;
        this.tableTxt = `Accounts Pending (Last 15 Days) (${leads.length})`;
        this.allocatedAcc = false;
        this.touchedAcc = false;
        this.pendingAcc = true;
        this.untouchedAcc = false;
        this.resultsLength = leads.length;
      })
      .catch((err: any) => {
        this.showProgressBar = false;
        console.error('Error fetching pending 15 days accounts:', err);
        this.openSnackBar('No Pending Accounts Found');
      });
  }

  // Accounts Pending (Last 30 Days)
  filterPending30Days() {
    if (!this.allocatedLeadIds) {
      this.openSnackBar('No pending accounts found for last 30 days');
      return;
    }
    const params = {
      app_user_id: this.userId,
      company_id: this.companyId,
      lead_id_list: this.allocatedLeadIds,
      account_number: null,
      product_account_number: null,
      agreement_id: null,
      customer_name: null,
      customer_id: null,
      passport_number: null,
      emirates_id_number: null,
      state: null
    };
    this.showProgressBar = true;
    this._sunshineIntService.fetchLeadsBySearchParams(params)
      .then((res: any) => {
        this.showProgressBar = false;
        const leads = res.data[0] || [];
        this.dataSource.data = leads;
        this.tableTxt = `Accounts Pending (Last 30 Days) (${leads.length})`;
        this.allocatedAcc = false;
        this.touchedAcc = false;
        this.pendingAcc = true;
        this.untouchedAcc = false;
        this.resultsLength = leads.length;
      })
      .catch((err: any) => {
        this.showProgressBar = false;
        console.error('Error fetching pending 30 days accounts:', err);
        this.openSnackBar('No Pending Accounts Found');
      });
  }

  // Accounts Untouched
  filterUntouchedAccounts() {
    // Reset pending days filter when switching to untouched accounts
    this.pendingDaysFilter = '';
    
    // Ensure we have bank selected and data loaded
    if (!this.userId || !this.companyId) {
      this.openSnackBar('Please select a bank first');
      return;
    }
    
    // If no untouched lead IDs, try to get fresh data from backend
    if (!this.untouchedLeadIds || this.untouchedLeadIds === '' || this.untouchedLeadIds === '0') {
      if (!this.isCalculatingManually) {
        console.log('No untouched lead IDs available, refreshing dashboard counts...');
        this.dashboardCounts(this.companyId);
        setTimeout(() => {
          this.filterUntouchedAccounts(); // Retry after refresh
        }, 2000); // Increased timeout to allow calculation to complete
      }
      return;
    }

    // Check if we have valid lead IDs
    const expectedLeadIds = this.untouchedLeadIds.split(',').filter(id => id.trim() && id !== '0');
    if (expectedLeadIds.length === 0) {
      this.openSnackBar('No untouched accounts found');
      return;
    }
    
    const params = {
      app_user_id: this.userId,
      company_id: this.companyId,
      lead_id_list: this.untouchedLeadIds,
      account_number: null,
      product_account_number: null,
      agreement_id: null,
      customer_name: null,
      customer_id: null,
      passport_number: null,
      emirates_id_number: null,
      state: null
    };
    this.showProgressBar = true;
    this._sunshineIntService.fetchLeadsBySearchParams(params)
      .then((res: any) => {
        this.showProgressBar = false;
        const leads = res.data[0] || [];
        this.dataSource.data = leads;
        this.currentFilteredData = leads; // Store current filtered data
        this.untouchedAccLength = leads.length.toString(); // Update count based on actual data
        this.tableTxt = `Accounts Untouched (${leads.length})`;
        this.allocatedAcc = false;
        this.touchedAcc = false;
        this.pendingAcc = false;
        this.untouchedAcc = true;
        this.resultsLength = leads.length;
      })
      .catch((err: any) => {
        this.showProgressBar = false;
        console.error('Error fetching untouched accounts:', err);
        this.openSnackBar('No Untouched Accounts Found');
      });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
      this.resultsLength = this.dataSource.filteredData.length;
    }
  }

  filterByPendingDays(): void {
    // Determine which base data to filter based on current selection
    let baseData: any[] = [];
    
    if (this.touchedAcc) {
      // If currently showing touched accounts, filter from touched accounts data
      if (!this.pendingDaysFilter || this.pendingDaysFilter === '') {
        // If no date filter, show all touched accounts
        this.filterTouchedAccounts();
        return;
      } else {
        // Apply date filter to touched accounts
        this.applyDateFilterToTouchedAccounts();
        return;
      }
    } else if (this.untouchedAcc) {
      // If currently showing untouched accounts, filter from untouched accounts data
      if (!this.pendingDaysFilter || this.pendingDaysFilter === '') {
        // If no date filter, show all untouched accounts
        this.filterUntouchedAccounts();
        return;
      } else {
        // Apply date filter to untouched accounts
        this.applyDateFilterToUntouchedAccounts();
        return;
      }
    } else {
      // Default to allocated accounts or original data
      if (!this.pendingDaysFilter || this.pendingDaysFilter === '') {
        // If no filter is selected, show all data
        this.dataSource.data = this.originalDataArray;
        this.currentFilteredData = [...this.originalDataArray];
        this.tableTxt = `Accounts Allocated (${this.originalDataArray.length})`;
      } else {
        const filteredData = this.originalDataArray.filter((item: any) => {
          const pendingDays = this.calculatePendingDays(item);
          return this.isInPendingDaysRange(pendingDays, this.pendingDaysFilter);
        });
        this.dataSource.data = filteredData;
        this.currentFilteredData = [...filteredData];
        this.tableTxt = `Accounts Allocated (${filteredData.length}) - ${this.pendingDaysFilter} days`;
      }
    }
    
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Helper method to apply date filter to touched accounts
  private applyDateFilterToTouchedAccounts(): void {
    if (!this.touchedLeadIds) {
      this.openSnackBar('No touched accounts found');
      return;
    }

    const params = {
      app_user_id: this.userId,
      company_id: this.companyId,
      lead_id_list: this.touchedLeadIds,
      account_number: null,
      product_account_number: null,
      agreement_id: null,
      customer_name: null,
      customer_id: null,
      passport_number: null,
      emirates_id_number: null,
      state: null
    };

    this.showProgressBar = true;
    this._sunshineIntService.fetchLeadsBySearchParams(params)
      .then((res: any) => {
        this.showProgressBar = false;
        const leads = res.data[0] || [];
        
        // Apply date filter to the fetched touched accounts
        const filteredLeads = leads.filter((lead: any) => {
          const pendingDays = this.calculatePendingDays(lead);
          return this.isInPendingDaysRange(pendingDays, this.pendingDaysFilter);
        });

        this.dataSource.data = filteredLeads;
        this.tableTxt = `Accounts Touched (${filteredLeads.length}) - ${this.pendingDaysFilter} days`;
        this.resultsLength = filteredLeads.length;
        this.currentFilteredData = [...filteredLeads];
        
        if (this.dataSource.paginator) {
          this.dataSource.paginator.firstPage();
        }
      })
      .catch((err: any) => {
        this.showProgressBar = false;
        console.error('Error fetching touched accounts:', err);
        this.openSnackBar('No Touched Accounts Found');
      });
  }

  // Helper method to apply date filter to untouched accounts
  private applyDateFilterToUntouchedAccounts(): void {
    if (!this.untouchedLeadIds) {
      this.openSnackBar('No untouched accounts found');
      return;
    }

    const params = {
      app_user_id: this.userId,
      company_id: this.companyId,
      lead_id_list: this.untouchedLeadIds,
      account_number: null,
      product_account_number: null,
      agreement_id: null,
      customer_name: null,
      customer_id: null,
      passport_number: null,
      emirates_id_number: null,
      state: null
    };

    this.showProgressBar = true;
    this._sunshineIntService.fetchLeadsBySearchParams(params)
      .then((res: any) => {
        this.showProgressBar = false;
        const leads = res.data[0] || [];
        
        // Apply date filter to the fetched untouched accounts
        const filteredLeads = leads.filter((lead: any) => {
          const pendingDays = this.calculatePendingDays(lead);
          return this.isInPendingDaysRange(pendingDays, this.pendingDaysFilter);
        });

        this.dataSource.data = filteredLeads;
        this.tableTxt = `Accounts Untouched (${filteredLeads.length}) - ${this.pendingDaysFilter} days`;
        this.resultsLength = filteredLeads.length;
        this.currentFilteredData = [...filteredLeads];
        
        if (this.dataSource.paginator) {
          this.dataSource.paginator.firstPage();
        }
      })
      .catch((err: any) => {
        this.showProgressBar = false;
        console.error('Error fetching untouched accounts:', err);
        this.openSnackBar('No Untouched Accounts Found');
      });
  }

  calculatePendingDays(lead: any): number {
    if (!lead.modified_dtm) return -1;
    const modifiedDate = new Date(lead.modified_dtm);
    const today = new Date();
    // Use only the year, month, and date (ignore time)
    const modifiedDateOnly = new Date(modifiedDate.getFullYear(), modifiedDate.getMonth(), modifiedDate.getDate());
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const diffMs = todayDateOnly.getTime() - modifiedDateOnly.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays;
  }

  isInPendingDaysRange(pendingDays: number, range: string): boolean {
    if (range === '') return true; // All
    
    switch (range) {
      case '0-7':
        return pendingDays >= 0 && pendingDays <= 7;
      case '8-15':
        return pendingDays >= 8 && pendingDays <= 15;
      case '16-30':
        return pendingDays >= 16 && pendingDays <= 30;
      case '31-60':
        return pendingDays >= 31 && pendingDays <= 60;
      case '61-90':
        return pendingDays >= 61 && pendingDays <= 90;
      case '90+':
        return pendingDays >= 90;
      default:
        return true;
    }
  }

  getAllNotifications(user_id: any) {
    let params = { app_user_id: user_id };
    this._sunshineIntService
      .fetchAllNotifications(params)
      .then((res: any) => {
        this.notifications = res.data[0].reverse();
        this.notificationsLength = this.notifications.length;
        this._sunshineIntService.updateNotificationCount(
          this.notificationsLength
        );
      })
      .catch((err) => {
        console.log(err);
      });
  }

  companySelectHandler(event: any) {
    let selectedCompanyId = event.value;
    
    // If no bank is selected, reset flags and return
    if (!selectedCompanyId) {
      this.isBankSearched = false;
      this.isNoAccountsFound = false;
      this.companyId = null;
      this.resetTableData();
      // Clear stored bank selection
      sessionStorage.removeItem('selectedBankId');
      sessionStorage.removeItem('selectedBankName');
      return;
    }
    
    let compId = this.companyArr.find((id: any) => {
      return id.company_name == selectedCompanyId;
    });
    this.companyId = compId.company_id;
    
    // Store selected bank for future use
    sessionStorage.setItem('selectedBankId', this.companyId.toString());
    sessionStorage.setItem('selectedBankName', selectedCompanyId);
    
    // Check if the selected bank is different from the currently searched bank
    if (selectedCompanyId !== this.currentlySearchedBank) {
      this.isBankSearched = false; // Reset the search flag when a different bank is selected
      this.isNoAccountsFound = false; // Reset the no accounts found flag when a different bank is selected
    }
    
    // Automatically call the API when bank is selected
    this.searchByBank(this.userId, this.companyId);
    
    this._router.navigate(['/dashboard'], {
      queryParams: {
        id1: this.userId,
        id2: this.companyId,
      },
    });
    setTimeout(() => {
      let snapshot: any = this._aR.snapshot;
      let routerSnapshot = snapshot._routerState.url;
      sessionStorage.setItem('ac-mgt-url', routerSnapshot);
    }, 500);
  }

  searchByBank(userId: number, companyId: number): void {
    // Reset pending days filter when performing a new search
    this.pendingDaysFilter = '';
    
    if (!userId || !companyId) {
      if (!this.hasShownBankSelectMessage) {
        this.openSnackBar(`Please select bank to view the accounts`);
        this.hasShownBankSelectMessage = true;
      }
      return;
    }

    this.showProgressBar = true;
    
    // Set the currently searched bank and enable cards and table
    this.currentlySearchedBank = this.companyControl.value || '';
    this.isBankSearched = true;

    // Use direct fetch approach as primary method (like acc-mgt component)
    this.fetchAccountsDirectly(userId, companyId);
  }

  // Add new method to fetch follow-up counts for current month
  private fetchFollowUpCounts(userId: number, companyId: number): void {
    const leadParams = this.buildSearchParams(userId, companyId);
    this._sunshineIntService.fetchLeadsBySearchParams(leadParams)
      .then((leadRes: any) => {
        const allLeads = leadRes.data[0] || [];
        const validAccountStatuses = ['pending', 'inprogress', 'in_progress', 'in progress'];
        const filteredLeads = allLeads.filter((lead: any) => {
          const accStatus = String(lead.lead_status_type_name || '').replace(/\s+/g, '').toLowerCase();
          return validAccountStatuses.includes(accStatus);
        });

        const taskParams = { app_user_id: userId, company_id: companyId };
        this._sunshineIntService.fetchAllTasks(taskParams)
          .then((taskRes: any) => {
            const tasks = taskRes.data[0] || [];
            
            // Parse current month from startDate (e.g., '2025-10-01 00:00:00')
            const currentMonthStart = new Date(this.startDate || new Date());
            const currentMonth = currentMonthStart.getMonth();
            const currentYear = currentMonthStart.getFullYear();
            
            const today = new Date();
            const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

            // Calculate current month follow-ups based on target_dtm falling within current month
            const currentMonthFollowUps = filteredLeads.filter((lead: any) => {
              return tasks.some((task: any) => {
                const type = String(task.task_type_name || '').replace(/\s+/g, '').toLowerCase();
                if (type !== 'followup') return false;
                if (task.lead_id !== lead.lead_id) return false;

                const status = String(task.task_status_type_name || task.status || '').replace(/\s+/g, '').toLowerCase();
                const isPendingOrInProgress = 
                  status === 'pending' || 
                  status === 'inprogress' || 
                  status === 'in_progress' || 
                  status === 'in progress' ||
                  (!task.task_status_type_name && task.status === 1);

                if (!isPendingOrInProgress) return false;
                if (!task.target_dtm) return false;

                const taskDate = new Date(task.target_dtm);
                return taskDate.getMonth() === currentMonth && taskDate.getFullYear() === currentYear;
              });
            });

            // Calculate current day follow-ups
            const currentDayFollowUps = filteredLeads.filter((lead: any) => {
              return tasks.some((task: any) => {
                const type = String(task.task_type_name || '').replace(/\s+/g, '').toLowerCase();
                if (type !== 'followup') return false;
                if (task.lead_id !== lead.lead_id) return false;

                const status = String(task.task_status_type_name || task.status || '').replace(/\s+/g, '').toLowerCase();
                const isPendingOrInProgress = 
                  status === 'pending' || 
                  status === 'inprogress' || 
                  status === 'in_progress' || 
                  status === 'in progress' ||
                  (!task.task_status_type_name && task.status === 1);

                if (!isPendingOrInProgress) return false;
                if (!task.target_dtm) return false;

                const taskDate = new Date(task.target_dtm);
                const taskDay = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
                return taskDay.getTime() === todayDate.getTime();
              });
            });

            this.currentMonthFollowups = currentMonthFollowUps.length.toString();
            this.currentDayFollowups = currentDayFollowUps.length.toString();
          })
          .catch((err: any) => {
            console.error('Error fetching follow-up tasks:', err);
          });
      })
      .catch((err: any) => {
        console.error('Error fetching leads for follow-ups:', err);
      });
  }

  private buildSearchParams(userId: number, companyId: number): any {
    return {
      app_user_id: userId,
      company_id: this.companyId || companyId,
      account_number: null,
      product_account_number: null,
      agreement_id: null,
      customer_name: null,
      customer_id: null,
      passport_number: null,
      emirates_id_number: null,
      state: null,
      lead_id_list: null,
      pending_days_filter: this.pendingDaysFilter || null
    };
  }

  private handleSearchResponse(res: any, companyId: number): void {
    const response = res.data[0];
    const companyName = this.companyArr.find(
      (company) => company.company_id == companyId
    )?.company_name;

    if (response.length > 0) {
      this.myDataArray = response;
      this.updateTableData(companyName);
      // Reset calculation flag when switching banks
      this.isCalculatingManually = false;
      this.dashboardCounts(companyId);
      this.isBankSearched = true;
    } else {
      this.myDataArray = [];
      this.updateTableData('');
      this.isBankSearched = false;
    }

    this.showProgressBar = false;
  }

  private handleSearchError(err: any): void {
    console.error('Search error:', err.response?.data?.message || err);
    this.resetTableData();
    this.isBankSearched = false;
    this.openSnackBar(
      err.response?.data?.message || 'An error occurred while fetching leads.'
    );
  }

  private updateTableData(companyName: string): void {
    this.dataSource = new MatTableDataSource(this.myDataArray);
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = this.customSortingDataAccessor;
    this.dataSource.paginator = this.paginator;

    this.resultsLength = this.myDataArray.length;
    this.tableTxt = `Viewing (${this.resultsLength}) accounts for ${companyName}`;
  }

  private customSortingDataAccessor(item: any, property: string): any {
    switch (property) {
      case 'multiple_bank_list':
        return item.multiple_banks_list
          ? item.multiple_banks_list.split(',').length
          : 0;
      case 'pending_days':
        return this.calculatePendingDays(item);
      default:
        return item[property];
    }
  }

  private filterAccounts(status: string): any[] {
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    return this.myDataArray.filter((item) => {
      if (item.lead_status_type_name !== status) return false;
      // Use modified_dtm as the action date
      if (!item.modified_dtm) return false;
      const modDate = new Date(item.modified_dtm);
      return modDate >= firstOfMonth && modDate <= lastOfMonth;
    });
  }

  private resetTableData(): void {
    this.myDataArray = [];
    this.dataSource = new MatTableDataSource(this.myDataArray);
    this.tableTxt = '';
    this.resultsLength = 0;

    this.accountsAllocated = '0';
    this.touchedAccLength = '0';
    this.untouchedAccLength = '0';
    this.totalOutstanding = '0';
    this.totalCollection = '0';
    this.totalFollowups = '0';

    this.showProgressBar = false;
    this.isBankSearched = false;
  }

  openSnackBar(message: string, type: 'success' | 'error' | 'info' = 'info') {
    const panelClass = type === 'error' ? 'error-snackbar' : 
                      type === 'success' ? 'success-snackbar' : 'info-snackbar';
    
    this._snackBar.open(message, 'Close', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: this.durationInSeconds * 1000,
      panelClass: [panelClass]
    });
  }

  filterCurrentMonthFollowUps(event?: Event) {
    if (event) event.stopPropagation();

    if (!this.userId || !this.companyId) {
      this.resetTableData();
      this.openSnackBar(`Please select bank to view the current month follow-ups`);
      return;
    }

    this.resetAllFilters();
    this.followUpAcc = true;
    this.showProgressBar = true;

    const leadParams = this.buildSearchParams(this.userId, this.companyId);
    this._sunshineIntService.fetchLeadsBySearchParams(leadParams)
      .then((leadRes: any) => {
        const allLeads = leadRes.data[0] || [];
        const validAccountStatuses = ['pending', 'inprogress', 'in_progress', 'in progress'];
        const filteredLeads = allLeads.filter((lead: any) => {
          const accStatus = String(lead.lead_status_type_name || '').replace(/\s+/g, '').toLowerCase();
          return validAccountStatuses.includes(accStatus);
        });

        const taskParams = { app_user_id: this.userId, company_id: this.companyId };
        this._sunshineIntService.fetchAllTasks(taskParams)
          .then((taskRes: any) => {
            this.showProgressBar = false;
            const tasks = taskRes.data[0] || [];
            
            // Use the current month from setMonthRange (e.g., October 2025: month=9, year=2025)
            const currentMonthStart = new Date(this.startDate || new Date());
            const currentMonth = currentMonthStart.getMonth();
            const currentYear = currentMonthStart.getFullYear();

            const leadsWithFollowUp = filteredLeads.filter((lead: any) => {
              return tasks.some((task: any) => {
                const type = String(task.task_type_name || '').replace(/\s+/g, '').toLowerCase();
                if (type !== 'followup') return false;
                if (task.lead_id !== lead.lead_id) return false;

                // Simplified status check
                const status = String(task.task_status_type_name || task.status || '').replace(/\s+/g, '').toLowerCase();
                const isPendingOrInProgress = 
                  status === 'pending' || 
                  status === 'inprogress' || 
                  status === 'in_progress' || 
                  status === 'in progress' ||
                  (!task.task_status_type_name && task.status === 1);

                if (!isPendingOrInProgress) return false;
                if (!task.target_dtm) return false;

                const taskDate = new Date(task.target_dtm);
                return taskDate.getMonth() === currentMonth && taskDate.getFullYear() === currentYear;
              });
            });

            this.myDataArray = leadsWithFollowUp;
            this.updateTableData('Current Month Follow-ups');
            this.currentMonthFollowups = leadsWithFollowUp.length.toString();
          })
          .catch((err: any) => {
            this.showProgressBar = false;
            this.handleSearchError(err);
          });
      })
      .catch((err: any) => {
        this.showProgressBar = false;
        this.handleSearchError(err);
      });
  }

  filterCurrentDayFollowUps(event?: Event) {
    if (event) event.stopPropagation();

    if (!this.userId || !this.companyId) {
      this.resetTableData();
      this.openSnackBar(`Please select bank to view the current day follow-ups`);
      return;
    }

    this.resetAllFilters();
    this.followUpAcc = true;
    this.showProgressBar = true;

    const leadParams = this.buildSearchParams(this.userId, this.companyId);
    this._sunshineIntService.fetchLeadsBySearchParams(leadParams)
      .then((leadRes: any) => {
        const allLeads = leadRes.data[0] || [];
        const validAccountStatuses = ['pending', 'inprogress', 'in_progress', 'in progress'];
        const filteredLeads = allLeads.filter((lead: any) => {
          const accStatus = String(lead.lead_status_type_name || '').replace(/\s+/g, '').toLowerCase();
          return validAccountStatuses.includes(accStatus);
        });

        const taskParams = { app_user_id: this.userId, company_id: this.companyId };
        this._sunshineIntService.fetchAllTasks(taskParams)
          .then((taskRes: any) => {
            this.showProgressBar = false;
            const tasks = taskRes.data[0] || [];
            const currentDate = new Date();
            const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

            const leadsWithFollowUp = filteredLeads.filter((lead: any) => {
              return tasks.some((task: any) => {
                const type = String(task.task_type_name || '').replace(/\s+/g, '').toLowerCase();
                if (type !== 'followup') return false;
                if (task.lead_id !== lead.lead_id) return false;

                // Simplified status check
                const status = String(task.task_status_type_name || task.status || '').replace(/\s+/g, '').toLowerCase();
                const isPendingOrInProgress = 
                  status === 'pending' || 
                  status === 'inprogress' || 
                  status === 'in_progress' || 
                  status === 'in progress' ||
                  (!task.task_status_type_name && task.status === 1);

                if (!isPendingOrInProgress) return false;
                if (!task.target_dtm) return false;

                const taskDate = new Date(task.target_dtm);
                const taskDay = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
                return taskDay.getTime() === today.getTime();
              });
            });

            this.myDataArray = leadsWithFollowUp;
            this.updateTableData('Current Day Follow-ups');
            this.currentDayFollowups = leadsWithFollowUp.length.toString();
          })
          .catch((err: any) => {
            this.showProgressBar = false;
            this.handleSearchError(err);
          });
      })
      .catch((err: any) => {
        this.showProgressBar = false;
        this.handleSearchError(err);
      });
  }

  private resetAllFilters(): void {
    this.allocatedAcc = false;
    this.touchedAcc = false;
    this.pendingAcc = false;
    this.followUpAcc = false;
  }

  private resetDashboard(): void {
    this.accountsAllocated = '0';
    this.touchedAccLength = '0';
    this.untouchedAccLength = '0';
    this.totalOutstanding = '0';
    this.totalCollection = '0';
    this.totalFollowups = '0';
    this.currentMonthFollowups = '0';
    this.currentDayFollowups = '0';

    this.allocatedAcc = false;
    this.touchedAcc = false;
    this.pendingAcc = false;
    this.followUpAcc = false;
    this.currentMonthFollowUpAcc = false;
    this.currentDayFollowUpAcc = false;
    this.untouchedAcc = false;

    this.myDataArray = [];
    this.dataSource = new MatTableDataSource(this.myDataArray);
    this.tableTxt = '';
    this.resultsLength = 0;

    // Don't reset bank selection - preserve it
    // this.companyId = null;
    // this.companyControl.setValue('');
    this.hasShownBankSelectMessage = false;
    this.isBankSearched = false;
    this.currentlySearchedBank = ''; // Reset currently searched bank
    this.isNoAccountsFound = false; // Reset the flag

    // Don't remove the stored URL - preserve navigation state
    // sessionStorage.removeItem('ac-mgt-url');
  }

  // Primary method to fetch accounts and dashboard counts
  private fetchAccountsDirectly(userId: number, companyId: number): void {
    const directParams = {
      app_user_id: userId,
      company_id: companyId,
      account_number: null,
      product_account_number: null,
      agreement_id: null,
      customer_name: null,
      customer_id: null,
      passport_number: null,
      emirates_id_number: null,
      state: null
      // Note: lead_id_list is not included here - we want all accounts for the company
    };
    
    this._sunshineIntService
      .fetchLeadsBySearchParams(directParams)
      .then((res: any) => {
        const leads = res.data[0] || [];
        
        if (leads.length > 0) {
          // Filter out 'STOP FOLLOW UP' accounts like acc-mgt does
          const filteredLeads = leads.filter((lead: any) => 
            lead.lead_status_type_name !== 'STOP FOLLOW UP'
          );
          
          this.myDataArray = filteredLeads;
          this.originalDataArray = [...this.myDataArray];
          this.currentFilteredData = [...this.myDataArray];
          this.dataSource = new MatTableDataSource(this.myDataArray);
          this.setupCustomFilter();
          this.dataSource.sort = this.sort;
          this.dataSource.sortingDataAccessor = this.customSortingDataAccessor;
          this.dataSource.paginator = this.paginator;

          const companyName = this.companyArr.find(
            (company) => company.company_id == companyId
          )?.company_name;

          this.resultsLength = filteredLeads.length;
          this.tableTxt = `Accounts Allocated for ${companyName} (${filteredLeads.length})`;
          this.allocatedAcc = true;
          this.touchedAcc = false;
          this.pendingAcc = false;
          this.untouchedAcc = false;
          
          // Store lead IDs for dashboard counts API
          this.allocatedLeadIds = filteredLeads.map((lead: any) => lead.lead_id).join(',');
          
          this.showProgressBar = false;
          this.isNoAccountsFound = false;
          
          // Now fetch dashboard counts with the actual lead IDs
          this.fetchDashboardCountsWithLeadIds(userId, companyId);
          
          // Fetch follow-up counts
          this.fetchFollowUpCounts(userId, companyId);
          
          // Also calculate touched/untouched as a fallback
          if (!this.isCalculatingManually) {
            this.calculateTouchedUntouchedManually(userId, companyId);
          }
        } else {
          this.openSnackBar('No accounts found for the selected bank');
          this.resetTableData();
          this.isNoAccountsFound = true;
        }
      })
      .catch((err: any) => {
        console.error('Error fetching accounts:', err);
        this.openSnackBar('No Accounts Found');
        this.resetTableData();
        this.isNoAccountsFound = true;
      });
  }

  // Fetch dashboard counts with proper lead IDs
  private fetchDashboardCountsWithLeadIds(userId: number, companyId: number): void {
    const today = new Date();
    
    const params: any = {
      app_user_id: userId,
      company_id: companyId,
      start_dtm: this.firstDateOfMonth(today),
      end_dtm: this.lastDateOfMonth(today)
    };

    this._sunshineIntService
      .fetchDashboardCounts(params)
      .then((res: any) => {
        const resData = res?.data?.[0] || [];
        
        console.log('Dashboard counts full response:', resData);
        
        // Update all counts from dashboard counts API
        this.accountsAllocated = resData.find((item: any) => item.param_name === 'accounts_allocated')?.param_value || this.myDataArray.length.toString();
        
        const outstandingItem = resData.find((item: any) => item.param_name === 'total_outstanding_amount');
        console.log('Outstanding item from stored procedure:', outstandingItem);
        
        if (outstandingItem && outstandingItem.param_value && outstandingItem.param_value !== null && outstandingItem.param_value !== '0' && outstandingItem.param_value !== 0) {
          this.totalOutstanding = outstandingItem.param_value.toString();
          console.log('Using outstanding from stored procedure:', this.totalOutstanding);
        } else {
          console.log('No outstanding from stored procedure, calculating manually...');
          this.calculateOutstandingManually();
        }
        
        this.totalCollection = resData.find((item: any) => item.param_name === 'total_collections')?.param_value || '0';
        this.totalFollowups = resData.find((item: any) => item.param_name === 'total_follow_up')?.param_value || '0';
        
        // Store lead IDs for touched/untouched filtering
        const touchedItem = resData.find((item: any) => item.param_name === 'accounts_touched');
        const untouchedItem = resData.find((item: any) => item.param_name === 'accounts_untouched');
        
        // Fix lead_id_list issue - use actual lead IDs from allocated accounts if API returns "0"
        let touchedLeadIds = touchedItem?.lead_id_list || '';
        let untouchedLeadIds = untouchedItem?.lead_id_list || '';
        
        // If API returns "0" or empty, calculate manually using allocated lead IDs
        if (!touchedLeadIds || touchedLeadIds === '' || touchedLeadIds === '0') {
          if (!this.isCalculatingManually) {
            this.calculateTouchedUntouchedManually(userId, companyId);
          }
        } else {
          this.touchedLeadIds = touchedLeadIds;
          this.untouchedLeadIds = untouchedLeadIds;
          this.touchedAccLength = touchedItem?.param_value || '0';
          this.untouchedAccLength = untouchedItem?.param_value || '0';
        }
        
      })
      .catch((err: any) => {
        console.error('Error fetching dashboard counts:', err);
        // Fallback to manual calculation
        this.accountsAllocated = this.myDataArray.length.toString();
        if (!this.isCalculatingManually) {
          this.calculateTouchedUntouchedManually(userId, companyId);
        }
        // Also calculate outstanding manually on error
        this.calculateOutstandingManually();
      });
  }

  // Calculate total outstanding manually from payment ledger
  private calculateOutstandingManually(): void {
    console.log('Calculating outstanding manually from payment ledger...');
    
    const allocatedLeadIds = this.allocatedLeadIds.split(',').filter(id => id.trim() && id !== '0');
    
    if (allocatedLeadIds.length === 0) {
      console.log('No allocated accounts to calculate outstanding');
      this.totalOutstanding = '0';
      return;
    }
    
    console.log('Fetching payment ledger for', allocatedLeadIds.length, 'allocated accounts');
    
    this._sunshineIntService.fetchLeadsPaymentLedger({ lead_id: null })
      .then((res: any) => {
        const paymentData = res.data[0] || [];
        console.log('Payment ledger total entries:', paymentData.length);
        
        // Sum outstanding amounts for allocated accounts with status = 1
        let total = 0;
        let count = 0;
        
        paymentData.forEach((payment: any) => {
          if (payment.lead_id && allocatedLeadIds.includes(payment.lead_id.toString()) && payment.status === 1) {
            if (payment.total_outstanding_amount) {
              const amount = parseFloat(payment.total_outstanding_amount) || 0;
              total += amount;
              count++;
            }
          }
        });
        
        console.log(`Outstanding calculated: ${total} from ${count} accounts`);
        this.totalOutstanding = total > 0 ? Math.round(total).toString() : '0';
      })
      .catch((err: any) => {
        console.error('Error calculating outstanding:', err);
        this.totalOutstanding = '0';
      });
  }

  // Calculate touched/untouched accounts manually by checking activity log with is_touched flag
  // This follows the same logic as the stored procedure: accounts are touched only if they have
  // activity log entries with is_touched = 1 (which happens when disposition fields are updated)
  private calculateTouchedUntouchedManually(userId: number, companyId: number): void {
    // Prevent multiple simultaneous calculations
    if (this.isCalculatingManually) {
      return;
    }
    
    this.isCalculatingManually = true;
    
    // Note: Since we don't have direct access to activity_log from frontend,
    // we rely on the stored procedure results. This method is just a fallback.
    // The stored procedure checks: al.is_touched = 1 AND al.activity_type NOT LIKE '%NEW_ACCOUNT%'
    
    const taskParams = { 
      app_user_id: userId, 
      company_id: companyId 
    };
    
    this._sunshineIntService.fetchAllTasks(taskParams)
      .then((taskRes: any) => {
        const tasks = taskRes.data[0] || [];
        
        // Get all lead IDs that have tasks with disposition updates
        // Tasks are created when disposition fields are filled: 
        // Feedback, Contactable/Non-Contactable, Disposition Status, Disposition Status Name, Disposition Code
        const touchedLeadIds = new Set();
        tasks.forEach((task: any) => {
          // Only consider tasks that have disposition information (which sets is_touched = 1)
          if (task.lead_id && task.disposition_code_id) {
            touchedLeadIds.add(task.lead_id.toString());
          }
        });
        
        // Get all allocated lead IDs
        const allocatedLeadIds = this.allocatedLeadIds.split(',').filter(id => id.trim() && id !== '0');
        
        // Calculate touched and untouched
        const touchedIds = allocatedLeadIds.filter(id => touchedLeadIds.has(id));
        const untouchedIds = allocatedLeadIds.filter(id => !touchedLeadIds.has(id));
        
        // Update counts
        this.touchedAccLength = touchedIds.length.toString();
        this.untouchedAccLength = untouchedIds.length.toString();
        
        // Store lead IDs for filtering
        this.touchedLeadIds = touchedIds.join(',');
        this.untouchedLeadIds = untouchedIds.join(',');
        
        // Reset flag when done
        this.isCalculatingManually = false;
        
      })
      .catch((err: any) => {
        console.error('Error calculating touched/untouched manually:', err);
        // Fallback: assume all accounts are untouched
        this.touchedAccLength = '0';
        this.untouchedAccLength = this.myDataArray.length.toString();
        this.touchedLeadIds = '';
        this.untouchedLeadIds = this.allocatedLeadIds;
        
        // Reset flag even on error
        this.isCalculatingManually = false;
      });
  }

  // Deactivated user functionality methods
  isUserDeactivated(fullName: string): boolean {
    return this.deactivatedUsers.some(user => user.full_name === fullName);
  }

  openDeactivatedUserMessage(role: string) {
    // Snackbar removed as requested
    // No action needed when warning icon is clicked
  }

  loadDeactivatedUsers() {
    this._sunshineIntService.fetchAllUsers()
      .then((userRes: any) => {
        const resData = userRes.data[0];
        this.deactivatedUsers = resData.filter((user: any) => user.status === 0);
      })
      .catch((error: any) => {
        console.error('Error loading deactivated users:', error);
      });
  }
} 