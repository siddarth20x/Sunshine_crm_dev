import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientMgtComponent } from './client-mgt/client-mgt.component';
import { ClientViewMgtComponent } from './client-view-mgt/client-view-mgt.component';
import { ClientCreateMgtComponent } from './client-create-mgt/client-create-mgt.component';

const routes: Routes = [
  { path: '', component: ClientMgtComponent },
  { path: 'create', component: ClientCreateMgtComponent },
  { path: 'view/:companyId', component: ClientViewMgtComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientMgtRoutingModule { }
