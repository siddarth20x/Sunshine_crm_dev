import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignupComponent } from './signup/signup.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ActivityLogsComponent } from './activity-logs/activity-logs.component';
import { LoginComponent } from './login/login.component';
import { RouteGuard } from './sunshine-services/auth-services/route.guard';
import { DispositionCodeComponent } from './disposition-code/disposition-code.component';
import { ViewDispositionCodeComponent } from './disposition-code/view-disposition-code/view-disposition-code.component';
import { CreateDispositionCodeComponent } from './disposition-code/create-disposition-code/create-disposition-code.component';
import { ReportsModule } from './reports/reports.module';
import { SupportComponent } from './support/support.component';
import { TargetsComponent } from './targets/targets.component';
// import { FieldVstMgtComponent } from './field-vst-mgt/field-vst-mgt.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { RemindersComponent } from './features/reminders/reminders.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent, canActivate: [RouteGuard] },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [RouteGuard],
  },
  {
    path: 'disposition-code',
    component: DispositionCodeComponent,
    canActivate: [RouteGuard],
  },
  {
    path: 'disposition-code/view/:disposition_code_id',
    component: ViewDispositionCodeComponent,
    canActivate: [RouteGuard],
  },
  {
    path: 'disposition-code/create',
    component: CreateDispositionCodeComponent,
    canActivate: [RouteGuard],
  },
  // { path: 'user-management', component: UsrMgtComponent },
  {
    path: 'user-management',
    loadChildren: () =>
      import('./user-management/user-management.module').then(
        (m) => m.UserManagementModule
      ),
    canActivate: [RouteGuard],
  },
  {
    path: 'account-management',
    loadChildren: () =>
      import('./acc-mgt/acc-mgt.module').then((m) => m.AccMgtModule),
    canActivate: [RouteGuard],
  },
  {
    path: 'client-management',
    loadChildren: () =>
      import('./client-mgt/client-mgt.module').then((m) => m.ClientMgtModule),
    canActivate: [RouteGuard],
  },
  {
    path: 'activity-logs',
    component: ActivityLogsComponent,
    canActivate: [RouteGuard],
  },
  {
    path: 'reports',
    loadChildren: () =>
      import('./reports/reports.module').then((m) => m.ReportsModule),
    canActivate: [RouteGuard],
  },
  {
    path: 'support',
    component: SupportComponent,
    canActivate: [RouteGuard],
  },
  {
    path: 'targets',
    component: TargetsComponent,
    canActivate: [RouteGuard],
  },
  // {
  //   path: 'field-management',
  //   component: FieldVstMgtComponent,
  //   canActivate: [RouteGuard],
  // },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
    // canActivate: [RouteGuard],
  },
  {
    path: 'reminders',
    component: RemindersComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
