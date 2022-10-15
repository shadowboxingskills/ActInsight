import { Component, OnInit } from '@angular/core';

import { AnimationOptions } from 'ngx-lottie';

import { environment } from '../../environments/environment';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  options: AnimationOptions = {
    path: 'assets/anim/actinsight_logo_anim.json',
  };
  styles: Partial<CSSStyleDeclaration> = {
    maxWidth: '700px',
    minWidth: '230px',
    margin: '0 auto',
  };

  // tag line
  tagLine = environment.tagLine;

  constructor(public ds: DataService) {}

  ngOnInit() {}
}
