import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NotificationService } from '../../shared/services/notification.service';

@Component({
  selector: 'app-reminders-dialog',
  template: `
    <h2 mat-dialog-title>{{ getTitle() }}</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onViewTasks()" *ngIf="data.showViewTasksButton">View Tasks</button>
      <button mat-button (click)="onClose()">Close</button>
    </mat-dialog-actions>
  `
})
export class RemindersDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<RemindersDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      type: 'today' | 'escalation';
      message: string;
      showViewTasksButton: boolean;
    },
    private router: Router,
    private notificationService: NotificationService
  ) {}

  getTitle(): string {
    return this.data.type === 'today' ? 'Today\'s Tasks' : 'Escalation Tasks';
  }

  onViewTasks(): void {
    this.notificationService.setNavigatingFromDialog(true);
    this.dialogRef.close();
    this.router.navigate(['/reminders'], { queryParams: { tab: this.data.type } });
  }

  onClose(): void {
    this.notificationService.setDialogDismissed(true);
    this.dialogRef.close();
  }
} 