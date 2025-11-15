import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';

import { DialogsRoutingModule } from './dialogs-routing.module';
import { DialogComponent } from './dialog/dialog.component';
import { MaterialModule } from '../shared/material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ManageRolesDialogComponent } from './manage-roles-dialog/manage-roles-dialog.component';
import { AccUploadDialogComponent } from './acc-upload-dialog/acc-upload-dialog.component';
import { TasksDialogComponent } from './tasks-dialog/tasks-dialog.component';
import { PaymentLedgerDialogComponent } from './payment-ledger-dialog/payment-ledger-dialog.component';
import { ContactDialogComponent } from './contact-dialog/contact-dialog.component';
import { AddressDialogComponent } from './address-dialog/address-dialog.component';
import { VisaCheckDialogComponent } from './visa-check-dialog/visa-check-dialog.component';
import { MolCheckDialogComponent } from './mol-check-dialog/mol-check-dialog.component';
import { WebTracingDialogComponent } from './web-tracing-dialog/web-tracing-dialog.component';
import { TracingDetailsDialogComponent } from './tracing-details-dialog/tracing-details-dialog.component';
import { SupportDialogComponent } from './support-dialog/support-dialog.component';
import { TargetsDialogComponent } from './targets-dialog/targets-dialog.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { RemindersDialogComponent } from './reminders-dialog/reminders-dialog.component';

@NgModule({
  declarations: [
    DialogComponent,
    ManageRolesDialogComponent,
    AccUploadDialogComponent,
    TasksDialogComponent,
    PaymentLedgerDialogComponent,
    ContactDialogComponent,
    AddressDialogComponent,
    MolCheckDialogComponent,
    VisaCheckDialogComponent,
    WebTracingDialogComponent,
    TracingDetailsDialogComponent,
    SupportDialogComponent,
    TargetsDialogComponent,
    ConfirmationDialogComponent,
    RemindersDialogComponent
  ],
  imports: [
    CommonModule,
    DialogsRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule
  ],
  exports: [],
  entryComponents: []
})
export class DialogsModule {}
