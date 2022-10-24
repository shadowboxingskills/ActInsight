import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ActionSnapPageRoutingModule } from './action-snap-routing.module';

import { ActionSnapPage } from './action-snap.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ActionSnapPageRoutingModule
  ],
  declarations: [ActionSnapPage]
})
export class ActionSnapPageModule {}
