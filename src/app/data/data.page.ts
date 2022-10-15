/* eslint-disable max-len */

import { AfterViewInit, Component, OnInit } from '@angular/core';

import { environment } from '../../environments/environment';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-data',
  templateUrl: './data.page.html',
  styleUrls: ['./data.page.scss'],
})
export class DataPage implements OnInit, AfterViewInit {
  isSchemaVisible = false;
  queryApiBaseUrl = environment.queryApiBaseUrl;
  // defaultQuery = `SELECT\n\t*\nFROM\n\t"Actor"\nJOIN\n\t"Action"\nON\n\t"Action".actor_id = "Actor".actor_id;`;
  defaultQuery = `SELECT\n\t*\nFROM\n\t"Actor"\nJOIN\n\t"EmissionsAgg"\nON\n\t"EmissionsAgg".actor_id = "Actor".actor_id\nWHERE\n\t"EmissionsAgg".total_emissions IS NOT NULL;`;
  queryCallUrl = '';
  cmContent = '';
  cmOptions = {
    lineNumbers: false,
    theme: 'material-darker',
    mode: 'sql',
    smartIndent: true,
    readOnly: false,
    autoFocus: false,
    indentWithTabs: true,
    matchBrackets: true,
  };

  constructor(public ds: DataService) {}

  ngOnInit() {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.onRefreshQuery();
    }, 2000);
  }

  onCodeMirrorValueChanged(e): void {
    if (!environment.production) {
      console.log(this.cmContent);
    }
    this.queryCallUrl = this.buildQueryCallUrl(this.cmContent);
  }

  onRefreshQuery() {
    this.cmContent = this.defaultQuery;
    this.queryCallUrl = this.buildQueryCallUrl(this.cmContent);
  }

  toggleSchemaVisibility() {
    this.isSchemaVisible = this.isSchemaVisible ? false : true;
  }

  private buildQueryCallUrl(query: string) {
    return this.ds.replaceAllLocal(
      this.ds.replaceAllLocal(
        `${this.queryApiBaseUrl}?type=query&query=${query}`,
        '\n',
        ' '
      ),
      '\t',
      ' '
    );
  }
}
