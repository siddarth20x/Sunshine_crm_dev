import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportsRoutingModule } from './reports-routing.module';
import { IdleTimeReportsComponent } from './idle-time-reports/idle-time-reports.component';
import { AllReportsComponent } from './all-reports/all-reports.component';
import { MaterialModule } from '../shared/material/material.module';
import { DailyReportsComponent } from './daily-reports/daily-reports.component';
import { ContactableNonContactableReportsComponent } from './contactable-non-contactable-reports/contactable-non-contactable-reports.component';
import { TouchedUntouchedReportsComponent } from './touched-untouched-reports/touched-untouched-reports.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FifteenThirtyReportsComponent } from './fifteen-thirty-reports/fifteen-thirty-reports.component';
import { FeedbackForBankReportsComponent } from './feedback-for-bank-reports/feedback-for-bank-reports.component';
import { ProjectionReportsComponent } from './projection-reports/projection-reports.component';
import { FinalFeedbackReportsComponent } from './final-feedback-reports/final-feedback-reports.component';


@NgModule({
  declarations: [
    IdleTimeReportsComponent,
    AllReportsComponent,
    DailyReportsComponent,
    ContactableNonContactableReportsComponent,
    TouchedUntouchedReportsComponent,
    FifteenThirtyReportsComponent,
    FeedbackForBankReportsComponent,
    ProjectionReportsComponent,
    FinalFeedbackReportsComponent,
  ],
  imports: [
    CommonModule,
    MaterialModule,
    ReportsRoutingModule,
    ReactiveFormsModule
  ]
})
export class ReportsModule { }
