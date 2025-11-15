import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  template: `
  <h2 mat-dialog-title>Confirm Deletion</h2>

  <mat-dialog-content class="dialog-content">
    <p>
      <strong>Note:</strong> Once deleted, the user will no longer have access to the CRM,
      and their entry will be removed from the table.
    </p>
    <p>
      Are you sure you want to delete the user <strong>"{{ data.userName }}"</strong>?
    </p>
  </mat-dialog-content>

  <mat-dialog-actions align="end">
    <button mat-button (click)="onNoClick()">Cancel</button>
    <button mat-raised-button color="warn" (click)="onYesClick()">Delete</button>
  </mat-dialog-actions>
`,
styles: [`
  .dialog-content p {
    margin: 10px 0;
    font-size: 14px;
    line-height: 1.5;
  }
`]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { userName: string }
  ) {}

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  onYesClick(): void {
    this.dialogRef.close(true);
  }
} 