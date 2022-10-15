import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { JoyrideModule } from 'ngx-joyride';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';

import { DataPageRoutingModule } from './data-routing.module';
import { DataPage } from './data.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DataPageRoutingModule,
    JoyrideModule.forChild(),
    CodemirrorModule,
  ],
  declarations: [DataPage],
})
export class DataPageModule {}
