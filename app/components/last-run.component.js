import document from 'document';

import { log } from './../../common/util';

import * as fsState from './../fs-state';

export class LastRunComponent {
  constructor(state) {
    this.state = state;
    this.$lastRunTimeText = document.getElementById('last-run-time-text');
    this.$lastCadenceText = document.getElementById('last-cadence-text');
    this.$lastHRText = document.getElementById('last-hr-text');
    this.$lastCadenceUnitsText = document.getElementById('last-cadence-units-text');
    this.$lastHRUnitsText = document.getElementById('last-hr-units-text');
    
    if (!this.$lastRunTimeText.style) { this.$lastRunTimeText.style = {}; }
    if (!this.$lastCadenceText.style) { this.$lastCadenceText.style = {}; }
    if (!this.$lastHRText.style) { this.$lastHRText.style = {}; }
    if (!this.$lastCadenceUnitsText.style) { this.$lastCadenceUnitsText.style = {}; }
    if (!this.$lastHRUnitsText.style) { this.$lastHRUnitsText.style = {}; }
    
    this.render(state);
  }
 
  
  render(state) {
    const defaultRunFormatted = '---';
    
    this.$lastRunTimeText.style.fill = state.color;
    this.$lastCadenceText.style.fill = state.color;
    this.$lastHRText.style.fill = state.color;
    this.$lastCadenceUnitsText.style.fill = state.color;
    this.$lastHRUnitsText.style.fill = state.color;
    this.$lastRunTimeText.text = (state.lastRunTime) ? state.lastRunTime : 'GO RUNNING';
    this.$lastCadenceText.text = (state.lastRunCadence) ? state.lastRunCadence : defaultRunFormatted;
    this.$lastHRText.text = (state.lastRunHeartRate) ? state.lastRunHeartRate : defaultRunFormatted;

    fsState.set(state);
  }
}