import { Component, OnInit } from '@angular/core';

import { DataService } from '../services/data.service';

@Component({
  selector: 'app-why',
  templateUrl: './why.page.html',
  styleUrls: ['./why.page.scss'],
})
export class WhyPage implements OnInit {
  constructor(public ds: DataService) {}

  ngOnInit() {}
}
