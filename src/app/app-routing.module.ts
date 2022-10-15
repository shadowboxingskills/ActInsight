import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadChildren: () =>
      import('./home/home.module').then((m) => m.HomePageModule),
  },
  {
    path: 'why',
    loadChildren: () => import('./why/why.module').then((m) => m.WhyPageModule),
  },
  {
    path: 'insights',
    loadChildren: () =>
      import('./insights/insights.module').then((m) => m.InsightsPageModule),
  },
  {
    path: 'map',
    loadChildren: () => import('./map/map.module').then((m) => m.MapPageModule),
  },
  {
    path: 'data',
    loadChildren: () =>
      import('./data/data.module').then((m) => m.DataPageModule),
  },
  {
    path: 'licenses',
    loadChildren: () =>
      import('./licenses/licenses.module').then((m) => m.LicensesPageModule),
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
