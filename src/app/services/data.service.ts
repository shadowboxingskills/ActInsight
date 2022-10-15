/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable max-len */

import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';

import { Observable, throwError, lastValueFrom, BehaviorSubject } from 'rxjs';
import { catchError, retry, filter, map } from 'rxjs/operators';
import { Platform } from '@ionic/angular';
import { JoyrideService } from 'ngx-joyride';
import { JoyrideOptions } from 'ngx-joyride/lib/models/joyride-options.class';

import { environment } from '../../environments/environment';
import STOP_WORDS from '../shared/nlp/stop_words.json';
import COUNTRY_CODES from '../shared/country-codes/country-codes.json';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  // dynamic data
  isDataLoading = true;
  sampleQueries: string[] = [];
  initiatives = [];
  nzTracker = [];
  organizations = [];
  unfcccBaseUrl = 'https://climateaction.unfccc.int/Initiatives?id=';
  gotDataSubject = new BehaviorSubject<boolean>(false);

  // tour content & options
  jrStepTitle = [
    'Start here',
    'Live query',
    'Get inspired',
    'Main visualization section',
    'Side panel',
    'Reset all',
    'Result stats',
    'Side menu',
    'Why',
    'Live data query',
    'Quick-start instructions',
    'Reference data model',
  ];
  jrStepText = [
    'Once this quick tour is finished, click here to start exploring the data & getting insights ✨',
    'Live query section. Search any aspect of climate actions & actors that matter to you. Note that there is no "enter" button - the platform will search and update everything while you type',
    'Get inspired first by picking some of these sample queries, before you go ahead and dive into what interests you most, using the live query section below',
    "Where all the results matching your query come together, mapping the different data dimensions & relationships into a graph, aiming to give you the bigger picture first and then letting you dive into specific nodes of interest, by just clicking on them, or through the right-side data panel. Note that the platform dynamically adjusts the graph's complexity to keep it readable and not to overload your machine. Only essential data is shown but more details can be found in the side panel (as well as in the separate data sharing section)",
    'Click here to toggle the side data panel, which is constantly updated with most relevant detailed information matching your query and your interaction with the graph. If you find a interesting section in the panel, you can also click on "focus" and this will update the graph accordingly, clearing out all non-relevant info. You will also find in this panel many dynamic links to relevant external resources for each node',
    'Reset both query & results, as well as refresh the graph to top level view (no need to reload the whole page to reset all, use this button instead)',
    'This section provides statistics regarding the results of your last query',
    "You can jump to other platform's features from this side menu",
    'More about why we believe that this fairly modern approach to climate actions exploration & tracking could make a difference',
    'Enter your custom SQL queries directly here and click on "run query" to download CSV output results as needed',
    'Get the quick-start instructions document here. Note that it also includes some detailed code examples to connect directly your R & Python workflows',
    'Get the latest generated reference data model here. Note that we are stricly following the OpenEarth OpenClimate schema, as discussed in more details in the "Quick Start" document',
  ];
  jrOptions: JoyrideOptions = {
    steps: [
      'startStep@home',
      'queryStep@insights',
      'samplesStep',
      'graphStep',
      'sidePanelStep',
      'refreshStep',
      'statsStep',
      'sideMenuStep@insights',
      // 'whyStep@why',
      'sqlQueryStep@data',
      'sqlQuickInstructionsStep',
      'downloadSchemaStep',
    ],
    startWith: 'startStep@home',
    waitingTime: 300,
    // themeColor: 'var(--ion-color-primary-shade)',
    themeColor: '#5b4690',
    showCounter: true,
    logsEnabled: false,
  };

  // screen size
  smallScreenFlag = true;
  isDesktop = false;
  isMobile: boolean;
  isHybrid: boolean;
  private platformWidth: number;
  private platformHeight: number;

  constructor(
    private http: HttpClient,
    private swUpdate: SwUpdate,
    private platform: Platform,
    private readonly tourService: JoyrideService,
    private router: Router
  ) {}

  // listen for updates
  updatesAvailable$() {
    return this.swUpdate.versionUpdates.pipe(
      filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'),
      map((evt) => ({
        type: 'UPDATE_AVAILABLE',
        current: evt.currentVersion,
        available: evt.latestVersion,
      }))
    );
  }

  // activate updates
  activateUpdate(): void {
    this.swUpdate.activateUpdate();
  }

  // get latest secondary data
  getLatestData(): Promise<any> {
    const options = { params: new HttpParams().set('type', 'data') };
    const source$: Observable<any> = this.http
      .get<any>(environment.secondaryDataUrl, options)
      .pipe(
        retry(environment.nbHttpRetries), // retry a failed request up to n times
        catchError(this.handleError)
      );
    return lastValueFrom(source$);
  }

  // filter out stop words
  queryWithoutStopWords(query: string): string {
    const words = query.replace(/[&\/\\#,+()$~%.':*?<>{}]/g, '').split(' ');
    return words
      .map((word) => {
        if (STOP_WORDS.includes(word.toLowerCase())) {
          return null;
        } else {
          return word;
        }
      })
      .filter((w) => w)
      .join(' ')
      .trim();
  }

  cleanSpecialCharsCc(query: string): string {
    return query
      .replace(/[&\/\\#,+()$~%.':*?<>{}]/g, '')
      .trim()
      .replace(' ', '_');
  }

  searchInitiatives(inputQuery: string, filteredQuery: string) {
    const hits = this.initiatives.filter(
      (d) =>
        d.a.toLowerCase().indexOf(inputQuery) > -1 || // exact name
        d.a.toLowerCase().indexOf(filteredQuery) > -1 || // name
        d.d.join(' ').toLowerCase().indexOf(inputQuery) > -1 || // initiative_function
        d.d.join(' ').toLowerCase().indexOf(filteredQuery) > -1 || // initiative_function
        d.e.join(' ').toLowerCase().indexOf(inputQuery) > -1 || // thematic_area
        d.e.join(' ').toLowerCase().indexOf(filteredQuery) > -1 || // thematic_area
        d.h.join(' ').toLowerCase().indexOf(inputQuery) > -1 || // lead_org
        d.h.join(' ').toLowerCase().indexOf(filteredQuery) > -1 || // lead_org
        d.l.join(' ').toLowerCase().indexOf(inputQuery) > -1 || // participants_companies
        d.l.join(' ').toLowerCase().indexOf(filteredQuery) > -1 || // participants_companies
        d.m.join(' ').toLowerCase().indexOf(inputQuery) > -1 || // participants_investors
        d.m.join(' ').toLowerCase().indexOf(filteredQuery) > -1 || // participants_investors
        d.n.join(' ').toLowerCase().indexOf(inputQuery) > -1 || // participants_organizations
        d.n.join(' ').toLowerCase().indexOf(filteredQuery) > -1 || // participants_organizations
        d.o.join(' ').toLowerCase().indexOf(inputQuery) > -1 || // participants_regions
        d.o.join(' ').toLowerCase().indexOf(filteredQuery) > -1 || // participants_regions
        d.p.join(' ').toLowerCase().indexOf(inputQuery) > -1 || // participants_cities
        d.p.join(' ').toLowerCase().indexOf(filteredQuery) > -1 || // participants_cities
        d.q.join(' ').toLowerCase().indexOf(inputQuery) > -1 || // participants_countries
        d.q.join(' ').toLowerCase().indexOf(filteredQuery) > -1 || // participants_countries
        d.r.join(' ').toLowerCase().indexOf(inputQuery) > -1 || // climate_focus
        d.r.join(' ').toLowerCase().indexOf(filteredQuery) > -1 || // climate_focus
        d.s.toLowerCase().indexOf(inputQuery) > -1 || // description
        d.s.toLowerCase().indexOf(filteredQuery) > -1 // description
    );
    // if (!environment.production) {
    //   console.log(hits);
    // }
    return hits || [];
  }

  // get screen size
  getScreenSize() {
    this.platform.ready().then(() => {
      this.platformWidth = this.platform.width();
      this.platformHeight = this.platform.height();
      this.isDesktop = this.platform.is('desktop');
      this.isMobile = this.platform.is('mobile');
      this.isHybrid = this.platform.is('hybrid');
      this.smallScreenFlag =
        this.platformWidth <= environment.smallScreenSizeManualCutoff;
    });
  }

  // get country code
  getCountryCode(name: string): string {
    const hits =
      COUNTRY_CODES.filter(
        (c) => c.name.toLowerCase().indexOf(name.toLowerCase()) > -1
      ) || [];
    let code: string = null;
    if (hits && hits[0] && hits[0].code) {
      code = hits[0].code.toLowerCase();
    }
    return code;
  }

  // extract SDG numbers
  // source: https://stackoverflow.com/a/10003709/13714870
  extractSdgNumber(sdg: string): string {
    return sdg.replace(/\D+/g, ''); // replace all non-digits with nothing
  }

  // replaceAll alternative
  // source: https://stackoverflow.com/a/1144788/13714870
  replaceAllLocal(str: string, find: string, replace: string) {
    return str.replace(new RegExp(this.escapeRegExp(find), 'g'), replace);
  }

  startTour() {
    this.tourService.startTour(this.jrOptions);
  }

  endTour() {
    console.log('end tour');
    this.router.navigate(['/home']);
  }

  getLatestLicences(): Promise<string> {
    return lastValueFrom(
      this.http.get('/3rdpartylicenses.txt', { responseType: 'text' })
    );
  }

  private escapeRegExp(str: string) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${error.status}, body was: `,
        error.error
      );
    }
    // Return an observable with a user-facing error message.
    return throwError(
      () => new Error('Something bad happened; please try again later.')
    );
  }
}
