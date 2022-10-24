import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ActionSnapPage } from './action-snap.page';

const routes: Routes = [
  {
    path: '',
    component: ActionSnapPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ActionSnapPageRoutingModule {}
