import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IdleTimeReportsComponent } from './idle-time-reports/idle-time-reports.component';
import { AllReportsComponent } from './all-reports/all-reports.component';

const routes: Routes = [
  { path: '', component: AllReportsComponent },
  // { path: '/idle-time-report', component: IdleTimeReportsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportsRoutingModule {}
