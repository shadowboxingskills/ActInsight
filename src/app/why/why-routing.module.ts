import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WhyPage } from './why.page';

const routes: Routes = [
  {
    path: '',
    component: WhyPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WhyPageRoutingModule {}
