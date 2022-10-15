import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { NgxEchartsModule } from 'ngx-echarts';
import { JoyrideModule } from 'ngx-joyride';

import { InsightsPageRoutingModule } from './insights-routing.module';
import { InsightsPage } from './insights.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InsightsPageRoutingModule,
    NgxEchartsModule.forChild(),
    JoyrideModule.forChild(),
  ],
  declarations: [InsightsPage],
})
export class InsightsPageModule {}
