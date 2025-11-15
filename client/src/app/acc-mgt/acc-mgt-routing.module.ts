import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccMgtComponent } from './acc-mgt/acc-mgt.component';
import { ViewAccMgtComponent } from './view-acc-mgt/view-acc-mgt.component';
import { DetailsTabComponent } from './details-tab/details-tab.component';
import { TasksTabComponent } from './tasks-tab/tasks-tab.component';
import { FailedRecordsComponent } from './failed-records/failed-records.component';
import { UploadedFilesComponent } from './uploaded-files/uploaded-files.component';

const routes: Routes = [
  { path: '', component: AccMgtComponent },
  { path: 'view', component: ViewAccMgtComponent },
  { path: 'view/:leadId', component: ViewAccMgtComponent },
  { path: 'view/:leadId/:companyId', component: ViewAccMgtComponent },
  { path: 'details', component: DetailsTabComponent },
  { path: 'tasks', component: TasksTabComponent },
  { path: 'failed-records', component: FailedRecordsComponent },
  { path: 'uploaded-files', component: UploadedFilesComponent }
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccMgtRoutingModule {}
