import { NgModule } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { JoyrideModule } from 'ngx-joyride';

import { MapPageRoutingModule } from './map-routing.module';
import { MapPage } from './map.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MapPageRoutingModule,
    JoyrideModule.forChild(),
  ],
  declarations: [MapPage],
  providers: [TitleCasePipe],
})
export class MapPageModule {}
