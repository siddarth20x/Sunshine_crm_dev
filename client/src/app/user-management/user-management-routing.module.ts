import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsrMgtComponent } from './usr-mgt/usr-mgt.component';
import { UsrViewMgtComponent } from './usr-view-mgt/usr-view-mgt.component';

const routes: Routes = [
  { path: '', component: UsrMgtComponent },
  { path: 'view', component: UsrViewMgtComponent },
  { path: 'view/:userId', component: UsrViewMgtComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserManagementRoutingModule {}
