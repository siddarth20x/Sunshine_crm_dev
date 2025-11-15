import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { UserManagementRoutingModule } from './user-management-routing.module';
import { UsrMgtComponent } from './usr-mgt/usr-mgt.component';
import { UsrViewMgtComponent } from './usr-view-mgt/usr-view-mgt.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from './usr-view-mgt/confirm-dialog/confirm-dialog.component';
import { MaterialModule } from '../shared/material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    UsrViewMgtComponent,
    ConfirmDialogComponent
  ],
  imports: [
    CommonModule,
    UserManagementRoutingModule,
    MatDialogModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  providers:[DatePipe]
})
export class UserManagementModule {}
