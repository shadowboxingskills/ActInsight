import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { LottieModule } from 'ngx-lottie';

import { HomePageRoutingModule } from './home-routing.module';
import { HomePage } from './home.page';
import { JoyrideModule } from 'ngx-joyride';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    LottieModule,
    JoyrideModule.forChild(),
  ],
  declarations: [HomePage],
})
export class HomePageModule {}
