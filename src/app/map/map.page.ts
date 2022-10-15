/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/member-ordering */

import { AfterViewInit, Component, OnInit } from '@angular/core';
import { TitleCasePipe, formatNumber } from '@angular/common';

import { ActionSheetController } from '@ionic/angular';

import { DataService } from '../services/data.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit, AfterViewInit {
  // state management
  isSearching = false;

  // search
  debounceDurationMs = 300;
  query = '';
  hits = [];
  private pickedSample: string;
  private nbInitiativeFound = 0;
  statsMsg = '';

  constructor(
    private actionSheetCtrl: ActionSheetController,
    private titleCasePipe: TitleCasePipe,
    public ds: DataService
  ) {}

  ngOnInit() {
    // state management
    this.isSearching = false;
  }

  ngAfterViewInit() {}
}
