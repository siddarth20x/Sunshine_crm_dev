import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClientMgtRoutingModule } from './client-mgt-routing.module';
import { MaterialModule } from '../shared/material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClientMgtComponent } from './client-mgt/client-mgt.component';
import { ClientViewMgtComponent } from './client-view-mgt/client-view-mgt.component';
import { ClientCreateMgtComponent } from './client-create-mgt/client-create-mgt.component';
import { LinkifyDirective } from '../directives/linkify.directive';



@NgModule({
  declarations: [
    ClientMgtComponent,
    ClientViewMgtComponent,
    ClientCreateMgtComponent,
    LinkifyDirective
  ],
  imports: [
    CommonModule,
    ClientMgtRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
  ]
})
export class ClientMgtModule { }
