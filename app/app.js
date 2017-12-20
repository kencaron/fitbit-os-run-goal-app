import { me } from 'appbit';
import clock from 'clock';
import document from 'document';
import { readFileSync } from 'fs';
import { inbox } from 'file-transfer';
import * as messaging from 'messaging';

import { display } from 'display';
import userSettings from "user-settings";

import { clone, updateMemoryMonitor, watchMemoryMonitor } from "./util";
import * as fsState from './fs-state';
import * as userActivity from "user-activity";

import { MOCK_DEFAULT_STATE, DATA, DATA_LIVE, WEB_STATE_FILENAME } from './../common/constants';
import { log } from './../common/util.js'

import { GoalComponent } from './components/goal.component';
import { BarChartComponent } from './components/bar-chart.component';
import { LastSyncTimeComponent } from './components/last-sync-time.component';
import { LastRunComponent } from './components/last-run.component';

export class App {
  constructor() {    
    fsState.init();
    this.state = (DATA === DATA_LIVE) ? fsState.get() || DEFAULT_STATE : MOCK_DEFAULT_STATE;
    
    if (DATA === DATA_LIVE) {
      this.state.date = new Date();
    } else {
      this.state.date = new Date(this.state.date);
    }
    
    this.initComponents();
    
    if (DATA === DATA_LIVE) {
      this.loadInbox();
      inbox.onnewfile = () => this.loadInbox();
    }
    watchMemoryMonitor();
    me.onunload = () => fsState.save();

    clock.granularity = 'seconds';
    clock.ontick = (evt) => {
      if (DATA === DATA_LIVE) { this.state.date = evt.date;}
      this.initComponents();
      this.lastSyncTimeComponent.render(this.state);
    }
    
    display.onchange = evt => {
      if (display.on) { this.renderApp();}
    };
  }
  
  loadInbox() {
    let fileName;
    do {
      fileName = inbox.nextFile();
      if (fileName) {
        if (fileName === WEB_STATE_FILENAME) {
          this.loadWebState();
        }
      }
    } while (fileName);
  }
  
  loadWebState() {
    const webState = readFileSync(WEB_STATE_FILENAME, 'cbor');
    if (webState && webState !== '') {
      log(JSON.stringify(webState));
      display.poke(); //Wake up if we have new stuff to show!
      if (webState.color) { this.state.color = webState.color; }
      if (webState.barChart) { this.state.barChart = webState.barChart; }
      if (webState.hasOwnProperty('distRanNum')) { this.state.distRanNum = webState.distRanNum; }
      if (webState.lastRunHeartRate) { this.state.lastRunHeartRate = webState.lastRunHeartRate; }
      if (webState.lastRunCadence) { this.state.lastRunCadence = webState.lastRunCadence; }
      if (webState.lastRunTime) { this.state.lastRunTime = webState.lastRunTime; }
      fsState.set(this.state);
      this.renderApp();
    }
  }
  
  initComponents() {    
    if (!this.barChartComponent) this.barChartComponent = new BarChartComponent(this.state);
    if (!this.lastSyncTimeComponent) this.lastSyncTimeComponent = new LastSyncTimeComponent(this.state);
    if (!this.goalComponent) this.goalComponent = new GoalComponent(this.state);
    if (!this.lastRunComponent) this.lastRunComponent = new LastRunComponent(this.state);
  }
  
  renderApp() {
    if (DATA === DATA_LIVE) { this.state.date = new Date();}
    
    this.barChartComponent.render(this.state);   
    this.goalComponent.render(this.state);
    this.lastRunComponent.render(this.state);
    updateMemoryMonitor();
  }
}