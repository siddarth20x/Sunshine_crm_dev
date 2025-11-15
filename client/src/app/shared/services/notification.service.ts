import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RemindersDialogComponent } from '../../dialogs/reminders-dialog/reminders-dialog.component';
import { SunshineInternalService } from '../../sunshine-services/sunshine-internal.service';
import { Router } from '@angular/router';
import { SidebarStatusService } from './sidebar-status.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationCheckInterval: any;
  // private readonly CHECK_INTERVAL = 60000; // Check every minute
  private readonly ESCALATION_HOUR = 18; // 6 PM
  private hasShownTodayNotification: boolean = false;
  private hasShownEscalationNotification: boolean = false;
  private hasClickedTodayNotification: boolean = false;
  private hasClickedEscalationNotification: boolean = false;
  private isDialogOpen: boolean = false;
  private notificationShown: boolean = false;
  private isNavigatingFromDialog: boolean = false;
  private dialogDismissed: boolean = false;
  private lastNotificationCheck: number = 0;
  private remindersComponentActive: boolean = false;
  // private readonly NOTIFICATION_GAP = 60000; // 1 minute gap between notifications

  constructor(
    private dialog: MatDialog,
    private sunshineService: SunshineInternalService,
    private router: Router,
    private sidebarStatusService: SidebarStatusService
  ) {}

  startNotificationChecks(): void {
    // Reset notification flags when starting new checks
    this.hasShownTodayNotification = false;
    this.hasShownEscalationNotification = false;
    this.hasClickedTodayNotification = false;
    this.hasClickedEscalationNotification = false;
    this.isDialogOpen = false;
    this.notificationShown = false;
    this.isNavigatingFromDialog = false;
    this.dialogDismissed = false;

    // Clear any existing interval
    if (this.notificationCheckInterval) {
      clearInterval(this.notificationCheckInterval);
    }

    // Show immediate notifications on login
    this.showLoginNotifications();
  }

  stopNotificationChecks(): void {
    if (this.notificationCheckInterval) {
      clearInterval(this.notificationCheckInterval);
      this.notificationCheckInterval = null;
    }
  }

  // Method to mark notification as clicked
  markNotificationClicked(type: 'today' | 'escalation'): void {
    if (type === 'today') {
      this.hasClickedTodayNotification = true;
      this.hasShownTodayNotification = true;
    } else {
      this.hasClickedEscalationNotification = true;
      this.hasShownEscalationNotification = true;
    }
    this.isDialogOpen = false;
    this.notificationShown = true;
    // Reset navigation flag after marking notification as clicked
    this.isNavigatingFromDialog = false;
  }

  // Method to set navigation flag
  public setNavigatingFromDialog(value: boolean): void {
    this.isNavigatingFromDialog = value;
  }

  public resetFlags(): void {
    this.hasShownTodayNotification = false;
    this.hasShownEscalationNotification = false;
    this.hasClickedTodayNotification = false;
    this.hasClickedEscalationNotification = false;
    this.isDialogOpen = false;
    this.notificationShown = false;
    this.isNavigatingFromDialog = false;
    this.dialogDismissed = false;
    sessionStorage.removeItem('reminderDialogDismissed');
  }

  public setDialogDismissed(value: boolean): void {
    this.dialogDismissed = value;
    sessionStorage.setItem('reminderDialogDismissed', value ? '1' : '0');
  }

  private isUserOnRemindersPage(): boolean {
    return window.location.pathname === '/reminders';
  }

  public setRemindersComponentActive(isActive: boolean): void {
    // This method can be called by the reminders component to signal its active state
    this.remindersComponentActive = isActive;
  }

  private async fetchAllTasks(userId: string): Promise<{ todayTasks: any[], escalationTasks: any[] }> {
    try {
      // Fetch today's tasks
      const todayRes = await this.sunshineService.getTodaysTasks({
        app_user_id: userId,
        task_category: 'today'
      });
      
      // Get all today's tasks (not just pending ones) to check completion status
      const allTodayTasks = (todayRes && todayRes.data) ? todayRes.data : [];
      const todayTasks = allTodayTasks.filter((t: any) => ['pending','in progress','inprogress','in_progress'].includes((t.task_status_type_name||'').toLowerCase()));

      // Fetch escalation tasks
      const escRes = await this.sunshineService.getEscalationTasks({
        app_user_id: userId,
        task_category: 'escalation'
      });
      const escalationTasks = (escRes && escRes.data) ? escRes.data.filter((t: any) => ['pending','in progress','inprogress','in_progress'].includes((t.task_status_type_name||'').toLowerCase())) : [];

      // Check if all today's tasks are completed
      const allTodayTasksCompleted = allTodayTasks.length > 0 && allTodayTasks.every((task: any) => 
        String(task.task_status_type_name || '').toLowerCase() === 'completed'
      );

      // Determine status and count
      let status: 'red' | 'green' | '' = '';
      let totalCount = 0;

      if (allTodayTasksCompleted) {
        // All today's tasks are completed - show green, no count
        status = 'green';
        totalCount = 0;
      } else if (todayTasks.length > 0 || escalationTasks.length > 0) {
        // There are pending tasks - show red
        status = 'red';
        totalCount = todayTasks.length + escalationTasks.length;
      } else if (allTodayTasks.length === 0) {
        // No tasks for today - no status
        status = '';
        totalCount = 0;
      }

      // Update sidebar status regardless of which page user is on
      this.sidebarStatusService.updateReminderInfo(status, totalCount);
      
      return { todayTasks, escalationTasks };
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return { todayTasks: [], escalationTasks: [] };
    }
  }

  public async showLoginNotifications(): Promise<void> {
    // Check if notification has already been shown this session
    if (sessionStorage.getItem('dashboardNotificationShown') === '1') return;

    const dismissed = this.dialogDismissed || sessionStorage.getItem('reminderDialogDismissed') === '1';
    if (this.isDialogOpen || this.notificationShown || this.isNavigatingFromDialog || dismissed) return;

    const userDetails = sessionStorage.getItem('userDetails');
    if (!userDetails) return;

    const user = JSON.parse(userDetails);
    try {
      // Initialize sidebar status first
      await this.initializeSidebarStatusOnLogin(user.user_id);
      
      // Make a single API call to get all tasks
      const { todayTasks, escalationTasks } = await this.fetchAllTasks(user.user_id);

      // Show today's tasks notification if there are pending tasks
      if (todayTasks.length > 0 && !this.hasClickedTodayNotification) {
        this.showNotification('today', `Welcome ${user.first_name}! You have ${todayTasks.length} tasks due today.`);
        this.hasShownTodayNotification = true;
        sessionStorage.setItem('dashboardNotificationShown', '1'); // Set flag after showing
      }

      // Show escalation tasks notification for team leads and above only after 6 PM
      const now = new Date();
      const currentHour = now.getHours();
      if (
        user.role_name !== 'AGENT' &&
        escalationTasks.length > 0 &&
        !this.hasClickedEscalationNotification &&
        currentHour >= this.ESCALATION_HOUR // Only after 6 PM
      ) {
        this.showNotification('escalation', `You have ${escalationTasks.length} tasks that need attention.`);
        this.hasShownEscalationNotification = true;
        sessionStorage.setItem('dashboardNotificationShown', '1'); // Set flag after showing
      }
    } catch (error) {
      console.error('Error checking login notifications:', error);
    }
  }

  // New method to initialize sidebar status on login
  public async initializeSidebarStatusOnLogin(userId: string): Promise<void> {
    try {
      await this.fetchAllTasks(userId);
    } catch (error) {
      console.error('Error initializing sidebar status on login:', error);
    }
  }

  // Public method to refresh sidebar status (can be called when tasks are updated)
  public async refreshSidebarStatus(): Promise<void> {
    const userDetails = sessionStorage.getItem('userDetails');
    if (!userDetails) return;

    const user = JSON.parse(userDetails);
    try {
      await this.fetchAllTasks(user.user_id);
    } catch (error) {
      console.error('Error refreshing sidebar status:', error);
    }
  }

  private async checkForNotifications(): Promise<void> {
    if (this.isDialogOpen || this.notificationShown || this.isNavigatingFromDialog) return;

    const userDetails = sessionStorage.getItem('userDetails');
    if (!userDetails) return;

    const user = JSON.parse(userDetails);
    try {
      // Make a single API call to get all tasks
      const { todayTasks, escalationTasks } = await this.fetchAllTasks(user.user_id);

      // Show today's tasks notification if there are pending tasks
      if (todayTasks.length > 0 && !this.hasClickedTodayNotification) {
        this.showNotification('today', `You have ${todayTasks.length} tasks due today.`);
        this.hasShownTodayNotification = true;
      }

      // Show escalation tasks notification for team leads and above only after 6 PM
      const now = new Date();
      const currentHour = now.getHours();
      if (
        user.role_name !== 'AGENT' &&
        escalationTasks.length > 0 &&
        !this.hasClickedEscalationNotification &&
        currentHour >= this.ESCALATION_HOUR // Only after 6 PM
      ) {
        this.showNotification('escalation', `You have ${escalationTasks.length} tasks that need attention.`);
        this.hasShownEscalationNotification = true;
      }
    } catch (error) {
      console.error('Error checking notifications:', error);
    }
  }

  private showNotification(type: 'today' | 'escalation', message: string): void {
    const dismissed = this.dialogDismissed || sessionStorage.getItem('reminderDialogDismissed') === '1';
    if (this.isDialogOpen || this.notificationShown || this.isNavigatingFromDialog || dismissed) return;

    // Close any existing dialogs
    this.dialog.closeAll();
    
    // Show new notification
    const dialogRef = this.dialog.open(RemindersDialogComponent, {
      width: '400px',
      data: { 
        type, 
        message,
        showViewTasksButton: true
      },
      disableClose: false
    });

    this.isDialogOpen = true;

    // Subscribe to dialog close event
    dialogRef.afterClosed().subscribe(() => {
      this.markNotificationClicked(type);
      // Reset navigation and dismissed flags
      this.isNavigatingFromDialog = false;
      this.dialogDismissed = false;
      sessionStorage.removeItem('reminderDialogDismissed');
    });
  }

  public initializeSidebarStatus(): void {
    // This will re-emit the current state from session storage to all subscribers
    const state = sessionStorage.getItem('reminderState');
    if (state) {
      const { status, count } = JSON.parse(state);
      this.sidebarStatusService.updateReminderInfo(status, count);
    } else {
      this.sidebarStatusService.updateReminderInfo('', 0);
    }
  }

  // Method to trigger dashboard counts refresh
  public triggerDashboardRefresh(): void {
    // Emit an event that the dashboard can listen to
    window.dispatchEvent(new CustomEvent('refreshDashboardCounts'));
  }
} 