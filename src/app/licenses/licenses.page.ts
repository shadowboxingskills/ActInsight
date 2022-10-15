import { Component, OnInit } from '@angular/core';

import { DataService } from '../services/data.service';

@Component({
  selector: 'app-licenses',
  templateUrl: './licenses.page.html',
  styleUrls: ['./licenses.page.scss'],
})
export class LicensesPage implements OnInit {
  licenses = '';

  constructor(private ds: DataService) {}

  ngOnInit() {
    this.ds.getLatestLicences().then((res) => {
      this.licenses = res;
    });
  }
}
