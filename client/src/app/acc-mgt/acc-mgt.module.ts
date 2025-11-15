import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { AccMgtRoutingModule } from './acc-mgt-routing.module';
import { AccMgtComponent } from './acc-mgt/acc-mgt.component';
import { MaterialModule } from '../shared/material/material.module';
import { ViewAccMgtComponent } from './view-acc-mgt/view-acc-mgt.component';
import { DetailsTabComponent } from './details-tab/details-tab.component';
import { TasksTabComponent } from './tasks-tab/tasks-tab.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CaseHistoryTabComponent } from './case-history-tab/case-history-tab.component';
import { LogsInteractionTabComponent } from './logs-interaction-tab/logs-interaction-tab.component';
import { NewlinePipe } from '../pipes/newline.pipe';
import { SqCheckTabComponent } from './sq-check-tab/sq-check-tab.component';
import { ContactsTabComponent } from './contacts-tab/contacts-tab.component';
import { AddressTabComponent } from './address-tab/address-tab.component';
import { PaymentLedgerTabComponent } from './payment-ledger-tab/payment-ledger-tab.component';
import { VisaCheckTabComponent } from './visa-check-tab/visa-check-tab.component';
import { MolCheckTabComponent } from './mol-check-tab/mol-check-tab.component';
import { TracingDetailsTabComponent } from './tracing-details-tab/tracing-details-tab.component';
import { TracingTabComponent } from './tracing-tab/tracing-tab.component';
import { FailedRecordsComponent } from './failed-records/failed-records.component';
import { UploadedFilesComponent } from './uploaded-files/uploaded-files.component';
import { FilePreviewDialogComponent } from './uploaded-files/file-preview-dialog/file-preview-dialog.component';

@NgModule({
  declarations: [
    AccMgtComponent,
    ViewAccMgtComponent,
    DetailsTabComponent,
    TasksTabComponent,
    CaseHistoryTabComponent,
    LogsInteractionTabComponent,
    NewlinePipe,
    SqCheckTabComponent,
    ContactsTabComponent,
    AddressTabComponent,
    PaymentLedgerTabComponent,
    VisaCheckTabComponent,
    MolCheckTabComponent,
    TracingDetailsTabComponent,
    TracingTabComponent,
    FailedRecordsComponent,
    UploadedFilesComponent,
    FilePreviewDialogComponent
  ],
  imports: [
    CommonModule,
    AccMgtRoutingModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [DatePipe]
})
export class AccMgtModule { }
