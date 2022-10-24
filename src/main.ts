import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import { defineCustomElements } from '@ionic/pwa-elements/loader';

if (environment.production) {
  enableProdMode();

  // override all console logs in prod
  if (environment.muteProdLogs && window) {
    window.console.log = () => {};
    window.console.warn = () => {};
  }
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.log(err));

// Call the element loader after the platform has been bootstrapped
defineCustomElements(window);

// SQL code highlights
import 'codemirror/mode/sql/sql';
