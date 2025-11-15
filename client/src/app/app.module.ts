import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { SharedModule } from './shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UsrMgtComponent } from './user-management/usr-mgt/usr-mgt.component';
import { ActivityLogsComponent } from './activity-logs/activity-logs.component';
import { DialogsModule } from './dialogs/dialogs.module';

import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { environment } from '../environments/environment';
import { DispositionCodeComponent } from './disposition-code/disposition-code.component';
import { ViewDispositionCodeComponent } from './disposition-code/view-disposition-code/view-disposition-code.component';
import { CreateDispositionCodeComponent } from './disposition-code/create-disposition-code/create-disposition-code.component';
import { SupportComponent } from './support/support.component';
import { MatDialogModule } from '@angular/material/dialog';
import { TargetsComponent } from './targets/targets.component';
// import { FieldVstMgtComponent } from './field-vst-mgt/field-vst-mgt.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { FeaturesModule } from './features/features.module';

@NgModule({
  declarations: [
    AppComponent,
    SignupComponent,
    LoginComponent,
    SignupComponent,
    DashboardComponent,
    UsrMgtComponent,
    ActivityLogsComponent,
    DispositionCodeComponent,
    ViewDispositionCodeComponent,
    CreateDispositionCodeComponent,
    SupportComponent,
    TargetsComponent,
    // FieldVstMgtComponent,
    ForgotPasswordComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FeaturesModule,
    DialogsModule,
    BrowserAnimationsModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireStorageModule,
    DialogsModule,
    MatDialogModule,

  ],
  providers: [{ provide: Window, useValue: window }],
  bootstrap: [AppComponent],
})
export class AppModule {}
