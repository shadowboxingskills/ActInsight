import { Component, OnDestroy, OnInit } from '@angular/core';

import { Subscription } from 'rxjs';
import { ToastController } from '@ionic/angular';

import { environment } from '../environments/environment';
import { DataService } from './services/data.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  appPages = [
    { title: 'Home', url: 'home', icon: 'home' },
    { title: 'Why & How', url: 'why', icon: 'leaf' },
    { title: 'Action Tracking', url: 'insights', icon: 'share-social' },
    { title: 'Geo Insights', url: 'map', icon: 'earth' },
    { title: 'Data Sharing', url: 'data', icon: 'server' },
  ];

  // tag line
  tagLine = environment.shortTagLine;

  // updates observable
  private updateSub: Subscription;

  constructor(private toastCtrl: ToastController, public ds: DataService) {}

  ngOnInit() {
    // get screen size
    this.ds.getScreenSize();

    // listen for updates
    const updatesAvailable$ = this.ds.updatesAvailable$();
    this.updateSub = updatesAvailable$.subscribe(async () => {
      // w/ active reload acknowledgment
      const toast = await this.toastCtrl.create({
        message: 'Update available!',
        position: 'bottom',
        buttons: [
          {
            role: 'cancel',
            text: 'Reload',
          },
        ],
      });
      await toast.present();
      toast
        .onDidDismiss()
        .then(() => this.ds.activateUpdate())
        .then(() => window.location.reload());
    });

    // async load of latest data
    this.ds.isDataLoading = true;
    this.ds
      .getLatestData()
      .then((res) => {
        if (res) {
          this.ds.sampleQueries = [...res.sampleQueries] || [];
          this.ds.initiatives = [...res.initiatives] || [];
          this.ds.nzTracker = [...res.nzTracker] || [];
          this.ds.organizations = [...res.organizations] || [];
          this.ds.gotDataSubject.next(true);
          this.ds.isDataLoading = false;
        }
      })
      .catch((err) => {
        console.error(err);
        this.ds.gotDataSubject.next(false);
      });
  }

  ngOnDestroy() {
    if (this.updateSub) {
      this.updateSub.unsubscribe();
    }
    if (this.ds.gotDataSubject) {
      this.ds.gotDataSubject.unsubscribe();
    }
  }
}
