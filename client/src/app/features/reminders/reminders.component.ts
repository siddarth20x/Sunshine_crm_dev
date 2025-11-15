import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SunshineInternalService } from '../../sunshine-services/sunshine-internal.service';
import { Task, TaskCount } from '../../shared/interfaces/task.interface';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { MatDialog } from '@angular/material/dialog';
import { TasksDialogComponent } from '../../dialogs/tasks-dialog/tasks-dialog.component';
import { Observable, Subject, takeUntil } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { SidebarStatusService } from '../../shared/services/sidebar-status.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { NotificationService } from '../../shared/services/notification.service';

// Rename local Task interface to RemindersTask to avoid import conflict
export interface RemindersTask {
  account_number?: string;
  customer_name?: string;
  bank_name?: string;
  task_id?: string;
  task_type_id?: string;
  task_type_name?: string;
  task_status_type_name?: string;
  customer_id?: string;
  assigned_to?: string;
  assigned_to_full_name?: string;
  company_id?: string;
  lead_id?: string;
  [key: string]: any;
}

@Component({
  selector: 'app-reminders',
  templateUrl: './reminders.component.html',
  styleUrls: ['./reminders.component.css']
})
export class RemindersComponent implements OnInit, OnDestroy {
  tasks: RemindersTask[] = [];
  taskCount: number = 0;
  banks: any[] = [];
  taskTypes: any[] = [];
  allUsers: any[] = [];
  loading: boolean = false;
  error: string = '';
  errorType: 'users' | 'tasks' | '' = '';
  highlight: 'red' | 'green' | '' = '';
  userRole: string = '';
  selectedTabIndex: number = 0;
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns: string[] = ['slNo', 'accountNo', 'customerName', 'bankName', 'taskId', 'taskType', 'status', 'cifId', 'assignee'];

  appUserId: string | number | null = null;

  bankControl = new FormControl('');
  taskTypeControl = new FormControl('');
  assigneeControl = new FormControl('');
  taskStatusControl = new FormControl('');
  contactableControl = new FormControl('');
  dispositionStageControl = new FormControl('');
  dispositionStatusControl = new FormControl('');
  dispositionCodeControl = new FormControl('');

  filteredBanks: Observable<any[]> = new Observable<any[]>();
  filteredTaskTypes: Observable<any[]> = new Observable<any[]>();
  filteredUsers: Observable<any[]> = new Observable<any[]>();

  // Store original escalation tasks snapshot
  private originalEscalationTasks: { [taskId: string]: any } = {};

  todayTaskCount: number = 0;
  escalationTaskCount: number = 0;

  reminderCount$ = this.sidebarStatusService.reminderInfo$.pipe(map(info => info.count));
  sidebarHighlightClass$ = this.sidebarStatusService.reminderInfo$.pipe(
    map(info => info.status === 'red' ? 'sidebar-red' : info.status === 'green' ? 'sidebar-green' : '')
  );

  private destroy$ = new Subject<void>();
  private taskCache: { [key: string]: any[] } = {};
  private lastUpdateTime: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor(
    private sunshineService: SunshineInternalService,
    private fb: FormBuilder,
    private router: Router,
    private dialog: MatDialog,
    private sidebarStatusService: SidebarStatusService,
    private route: ActivatedRoute,
    private notificationService: NotificationService
  ) {}

  async ngOnInit(): Promise<void> {
    // Signal that reminders component is now active
    this.notificationService.setRemindersComponentActive(true);
    
    this.route.queryParams.subscribe(params => {
      if (params['tab'] === 'today') {
        this.selectedTabIndex = 0;
      } else if (params['tab'] === 'escalation') {
        this.selectedTabIndex = 1;
      }
    });
    this.loading = true;
    this.setUserRole();
    try {
      // Get user details and set appUserId first
      const userDetailsString = sessionStorage.getItem('userDetails');
      if (userDetailsString) {
        const userDetails = JSON.parse(userDetailsString);
        this.appUserId = userDetails.user_id || userDetails.id;
      }

      // Load other data in parallel
      await Promise.all([
        this.loadBanksFromReports(),
        this.loadAllUsersFromReports(),
        this.loadTaskTypes()
      ]);

      // Load tasks immediately if we have appUserId
      if (this.appUserId) {
        await this.loadInitialTasks();
      } else {
        // If no appUserId, still try to fetch task counts
        await this.fetchTaskCounts();
      }
      
      this.setupFilteredOptions();

      this.bankControl.valueChanges.subscribe(() => this.applyFilters().catch(console.error));
      
      this.taskTypeControl.valueChanges.subscribe(() => this.applyFilters().catch(console.error));
      
      this.assigneeControl.valueChanges.subscribe(() => this.applyFilters().catch(console.error));

    } catch (err) {
      console.error('Error during component initialization:', err);
      this.error = 'Failed to initialize reminders. Please try again later.';
    } finally {
      this.loading = false;
      // Initialize sidebar status after loading tasks
      await this.updateSidebarInfo();
    }
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    // Signal that reminders component is no longer active
    this.notificationService.setRemindersComponentActive(false);
    
    // Preserve the current sidebar status when leaving the reminders page
    const currentState = sessionStorage.getItem('reminderState');
    if (currentState) {
      const { status, count } = JSON.parse(currentState);
      // Only preserve if we have a valid status
      if (status && count > 0) {
        this.sidebarStatusService.updateReminderInfo(status, count);
      }
    }
    
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupFilteredOptions(): void {
    this.filteredBanks = this.bankControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        if (!value || value === '') {
          return this.banks;
        }
        return this._filter(this.banks, value, 'company_name');
      })
    );

    this.filteredTaskTypes = this.taskTypeControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        if (!value || value === '') {
          return this.taskTypes;
        }
        return this._filter(this.taskTypes, value, 'task_type_name');
      })
    );

    this.filteredUsers = this.assigneeControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        if (!value || value === '') {
          return this.allUsers;
        }
        return this._filter(this.allUsers, value, 'full_name');
      })
    );
  }

  private _filter(items: any[], value: any, displayKey: string): any[] {
    // Ensure value is a string for filtering
    let filterValue = '';
    if (typeof value === 'string') {
      filterValue = value.toLowerCase();
    } else if (value && typeof value === 'object' && value[displayKey]) {
      filterValue = String(value[displayKey]).toLowerCase();
    } else if (value != null) {
      filterValue = String(value).toLowerCase();
    }

    return items.filter(item =>
      item[displayKey] && String(item[displayKey]).toLowerCase().includes(filterValue)
    );
  }

  setUserRole(): void {
    const userDetails = sessionStorage.getItem('userDetails');
    if (userDetails) {
      const parsed = JSON.parse(userDetails);
      this.userRole = parsed.role_name || '';
      // Only set default tab if no query parameter is present
      if (!this.route.snapshot.queryParams['tab']) {
        this.selectedTabIndex = this.userRole === 'AGENT' ? 0 : 1;
      }
    }
  }

  async loadBanksFromReports(): Promise<void> {
    try {
      const userDetailsString = sessionStorage.getItem('userDetails');
      if (!userDetailsString) {
        console.error('User details not found in session storage.');
        this.banks = [];
        return;
      }
      const userDetails = JSON.parse(userDetailsString);
      const userId = userDetails.user_id || userDetails.id;

      if (!userId) {
        console.error('User ID not found in user details.');
        this.banks = [];
        return;
      }

      const res = await this.sunshineService.fectchUserCompany({ user_id: userId });
      this.banks = res.data?.[0] || [];
    } catch (error) {
      console.error('Error loading banks:', error);
      this.banks = [];
    }
  }

  async loadAllUsersFromReports(): Promise<void> {
    try {
      const res = await this.sunshineService.fetchAllUsers();
      const allUsersRaw = (res.data && res.data[0])
        ? res.data[0].filter((u: any) => u.status === 1 && u.role_name !== 'SUPERUSER')
        : [];
      
      const userDetailsString = sessionStorage.getItem('userDetails');
      if (!userDetailsString) {
        console.error('User details not found for hierarchy filtering.');
        this.allUsers = allUsersRaw; // Fallback to all users if details not found
        return;
      }
      const userDetails = JSON.parse(userDetailsString);
      const loggedInUserId = userDetails.user_id;

      // For non-agents, get users reporting to them. For agents, they see no one in assignee filter.
      this.allUsers = this.getReportingUsers(loggedInUserId, allUsersRaw);

    } catch (error) {
      console.error('Error loading users:', error);
      this.allUsers = [];
    }
  }

  private getReportingUsers(managerId: number, allUsers: any[]): any[] {
    const subordinates: any[] = [];
    const managerQueue: number[] = [managerId];
  
    const usersByManager = allUsers.reduce((acc, user) => {
      const reportingId = user.reporting_to_id;
      if (reportingId) {
        if (!acc[reportingId]) {
          acc[reportingId] = [];
        }
        acc[reportingId].push(user);
      }
      return acc;
    }, {});
  
    let head = 0;
    while (head < managerQueue.length) {
      const currentManagerId = managerQueue[head++];
      const directReports = usersByManager[currentManagerId] || [];
      
      for (const report of directReports) {
        subordinates.push(report);
        managerQueue.push(report.user_id);
      }
    }
  
    return subordinates;
  }

  async loadTaskTypes(): Promise<void> {
    try {
      const res = await this.sunshineService.fetchTaskTypes();
      this.taskTypes = res.data && res.data[0] ? res.data[0] : [];
    } catch (error) {
      console.error('Error loading task types:', error);
      this.taskTypes = [];
    }
  }

  private async fetchTaskCounts(): Promise<void> {
    if (!this.appUserId) return;
    try {
      // Fetch today tasks
      const todayRes = await this.sunshineService.getTodaysTasks({ app_user_id: this.appUserId.toString(), task_category: 'today' });
      this.todayTaskCount = (todayRes && todayRes.data) ? todayRes.data.filter((t: any) => ['pending','in progress','inprogress','in_progress','completed'].includes((t.task_status_type_name||'').toLowerCase())).length : 0;
      
      // Fetch escalation tasks
      const escRes = await this.sunshineService.getEscalationTasks({ app_user_id: this.appUserId.toString(), task_category: 'escalation' });
      this.escalationTaskCount = (escRes && escRes.data) ? escRes.data.filter((t: any) => ['pending','in progress','inprogress','in_progress','completed'].includes((t.task_status_type_name||'').toLowerCase())).length : 0;
    } catch (error) {
      console.error('Error fetching task counts:', error);
      this.todayTaskCount = 0;
      this.escalationTaskCount = 0;
    }
  }

  private updateTaskCounts(todayData: any[], escalationData: any[]): void {
    // Update today task count
    this.todayTaskCount = todayData ? todayData.filter((t: any) => 
      ['pending','in progress','inprogress','in_progress','completed'].includes((t.task_status_type_name||'').toLowerCase())
    ).length : 0;
    
    // Update escalation task count
    this.escalationTaskCount = escalationData ? escalationData.filter((t: any) => 
      ['pending','in progress','inprogress','in_progress','completed'].includes((t.task_status_type_name||'').toLowerCase())
    ).length : 0;
  }

  public async refreshTaskCounts(): Promise<void> {
    await this.fetchTaskCounts();
  }

  private async loadInitialTasks(): Promise<void> {
    if (!this.appUserId) {
      this.handleError();
      return;
    }

    try {
      // Make a single API call to get both today's and escalation tasks
      const [todayResult, escalationResult] = await Promise.all([
        this.sunshineService.getTodaysTasks({ 
          app_user_id: this.appUserId.toString(),
          task_category: 'today'
        }),
        this.sunshineService.getEscalationTasks({ 
          app_user_id: this.appUserId.toString(),
          task_category: 'escalation'
        })
      ]);

      // Cache both results
      this.taskCache['0_'] = todayResult.data;
      this.taskCache['1_'] = escalationResult.data;
      this.lastUpdateTime = Date.now();

      // Update task counts for tab badges
      this.updateTaskCounts(todayResult.data, escalationResult.data);

      // Process the appropriate tasks based on selected tab
      const serviceCallResult = this.selectedTabIndex === 0 ? todayResult : escalationResult;
      
      if (serviceCallResult.errorCode === 0 && serviceCallResult.data) {
        await this.processTasks(serviceCallResult.data);
      } else {
        this.handleNoTasks();
      }
    } catch (err) {
      this.handleError();
    }
  }

  private async processTasks(data: any[]): Promise<void> {
    // Flatten if data is an array of arrays
    let tasksArray = Array.isArray(data[0]) ? data[0] : data;
    
    // Only show Pending, In Progress, Completed
    let filteredTasks = tasksArray.filter((task: any) => 
      ['pending','in progress','inprogress','in_progress','completed'].includes((task.task_status_type_name||'').toLowerCase())
    );

    // Apply filters
    const selectedBank = this.bankControl.value;
    const selectedTaskType = this.taskTypeControl.value;
    const selectedAssignee = this.assigneeControl.value;

    if (selectedBank) {
      filteredTasks = filteredTasks.filter((task: any) => 
        String(task.company_id) === String(selectedBank) || String(task.bank_name || '') === String(selectedBank)
      );
    }
    if (selectedTaskType) {
      filteredTasks = filteredTasks.filter((task: any) => 
        String(task.task_type_id) === String(selectedTaskType) || String(task.task_type_name || '') === String(selectedTaskType)
      );
    }
    if (this.selectedTabIndex === 1 && selectedAssignee) {
      filteredTasks = filteredTasks.filter((task: any) => 
        String(task.assigned_to) === String(selectedAssignee) || String(task.assigned_to_full_name || '') === String(selectedAssignee)
      );
    }

    this.tasks = filteredTasks;
    this.dataSource = new MatTableDataSource<any>(filteredTasks.map((task: any, index: number) => ({
      slNo: index + 1,
      accountNo: task.account_number || '',
      customerName: task.customer_name || '',
      bankName: task.bank_name || '',
      taskId: task.task_id || '',
      taskType: task.task_type_name || '',
      status: task.task_status_type_name || '',
      cifId: task.customer_id || '',
      assignee: task.assigned_to_full_name || '',
      lead_id: task.lead_id,
      company_id: task.company_id
    })));
    this.dataSource.paginator = this.paginator;

    // Refresh sidebar status and task counts when tasks are updated
    await this.notificationService.refreshSidebarStatus();
    await this.refreshTaskCounts();
  }

  private handleNoTasks(): void {
    this.error = (this.selectedTabIndex === 1) ? 'No escalation task found for selected filter.' : 'No tasks found for the selected filters.';
    this.errorType = 'tasks';
    this.tasks = [];
    this.dataSource = new MatTableDataSource<any>([]);
    this.taskCount = 0;
    this.highlight = '';
  }

  private handleError(): void {
    this.loading = false;
    this.error = 'Failed to load tasks. Please try again.';
    this.errorType = 'tasks';
    this.tasks = [];
    this.dataSource = new MatTableDataSource<any>([]);
  }

  // Removed setHighlight method as we now use global sidebar status

  private async updateSidebarInfo(): Promise<void> {
    try {
      // Don't override the global status when reminders component is active
      // The notification service now handles the global status
      // Only update if we're not on the reminders page
      if (this.router.url !== '/reminders') {
        let newStatus: 'red' | 'green' | '' = '';
        let totalCount = 0;

        // Use the currently displayed tasks for count and highlight
        const allTasks = this.tasks || [];

        if (allTasks.length === 0) {
          newStatus = '';
          totalCount = 0;
        } else {
          const anyPendingOrInProgress = allTasks.some(
            (task: any) => {
              const status = String(task.task_status_type_name || '').toLowerCase();
              return status === 'pending' || status === 'in progress' || status === 'inprogress' || status === 'in_progress';
            }
          );
          
          const allCompleted = allTasks.every(
            (task: any) => String(task.task_status_type_name || '').toLowerCase() === 'completed'
          );
          
          if (anyPendingOrInProgress) {
            newStatus = 'red';
            totalCount = allTasks.length;
          } else if (allCompleted) {
            newStatus = 'green';
            totalCount = 0; // No count when all tasks are completed
          } else {
            newStatus = '';
            totalCount = 0;
          }
        }

        this.sidebarStatusService.updateReminderInfo(newStatus, totalCount);
      }
    } catch (error) {
      console.error('Error updating sidebar info:', error);
    }
  }

  onTaskClick(task: RemindersTask): void {
    console.log('Task clicked:', task);
    this.router.navigate(
      ['/account-management/view', task['lead_id'], task.company_id],
      { queryParams: { task_id: task.task_id } }
    );
  }

  async onTabChange(event: MatTabChangeEvent): Promise<void> {
    this.selectedTabIndex = event.index;
    this.bankControl.reset('');
    this.taskTypeControl.reset('');
    this.assigneeControl.reset('');
    
    const cacheKey = `${this.selectedTabIndex}_`;
    if (this.taskCache[cacheKey]) {
      await this.processTasks(this.taskCache[cacheKey]);
    } else {
      this.loading = true;
      await this.loadInitialTasks();
      this.loading = false;
    }
  }

  displayBankName = (companyId: any) => {
    const bank = this.banks.find(b => b.company_id == companyId);
    return bank ? bank.company_name : '';
  };

  displayUserName = (userId: any) => {
    if (!userId) return '';
    const user = this.allUsers.find(u => u.user_id == userId);
    return user ? user.full_name : 'Unknown User';
  };

  displayTaskTypeName = (taskTypeId: any) => {
    const taskType = this.taskTypes.find(t => t.task_type_id == taskTypeId);
    return taskType ? taskType.task_type_name : '';
  };

  onBankInputClick(): void {
    this.bankControl.setValue('');
  }

  onTaskTypeInputClick(): void {
    this.taskTypeControl.setValue('');
  }

  onAssigneeInputClick(): void {
    this.assigneeControl.setValue('');
  }

  onBankSelect(event: any): void {
    const selectedBank = event.option.value;
    this.bankControl.setValue(selectedBank);
    this.applyFilters().catch(console.error);
  }

  onTaskTypeSelect(event: any): void {
    const selectedTaskType = event.option.value;
    this.taskTypeControl.setValue(selectedTaskType);
    this.applyFilters().catch(console.error);
  }

  onAssigneeSelect(event: any): void {
    const selectedAssignee = event.option.value;
    this.assigneeControl.setValue(selectedAssignee);
    this.applyFilters().catch(console.error);
  }

  private async applyFilters(): Promise<void> {
    const cacheKey = `${this.selectedTabIndex}_`;
    if (this.taskCache[cacheKey]) {
      await this.processTasks(this.taskCache[cacheKey]);
    }
  }

  getTaskStatusOptions(): string[] {
    return ['pending', 'in progress', 'inprogress', 'in_progress', 'completed'];
  }

  formatTaskStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'Pending',
      'in progress': 'In Progress',
      'inprogress': 'In Progress',
      'in_progress': 'In Progress',
      'completed': 'Completed'
    };
    return statusMap[status.toLowerCase()] || status;
  }
} 