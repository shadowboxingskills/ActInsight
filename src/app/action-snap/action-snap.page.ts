import { Component, OnInit } from '@angular/core';

import { DataService } from '../services/data.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-action-snap',
  templateUrl: './action-snap.page.html',
  styleUrls: ['./action-snap.page.scss'],
})
export class ActionSnapPage implements OnInit {
  // state management
  isSearching = false;

  constructor(public ds: DataService) {}

  ngOnInit() {}
}
