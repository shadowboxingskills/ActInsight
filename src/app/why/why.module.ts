import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { JoyrideModule } from 'ngx-joyride';

import { WhyPageRoutingModule } from './why-routing.module';
import { WhyPage } from './why.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WhyPageRoutingModule,
    JoyrideModule.forChild(),
  ],
  declarations: [WhyPage],
})
export class WhyPageModule {}
