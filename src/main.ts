import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

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

// import 'codemirror/mode/javascript/javascript';
// import 'codemirror/mode/markdown/markdown';
import 'codemirror/mode/sql/sql';
