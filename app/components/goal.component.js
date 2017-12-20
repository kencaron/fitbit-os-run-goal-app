import document from 'document';
import { me as device } from 'device';
import { units } from 'user-settings';


import { kmToMi } from './../util';
import { log } from './../../common/util'
import * as fsState from './../fs-state';

export class GoalComponent {
  constructor(state) {
    this.minGoal = 0;
    this.maxGoal = 999;
    
    this.state = state;
    this.$goalTopLabel = document.getElementById('goal-top-label');
    this.$goalDistanceText = document.getElementById('goal-distance-text');
    this.$goalDistanceUnitsText = document.getElementById('goal-distance-units-text');
    this.$goalPercentBar = document.getElementById('goal-percent-bar');
    this.$goalPercentText = document.getElementById('goal-percent-text');

    document.onkeypress = (event)=> {
      log('onkeypress ' + event.key);
      this.update(event, state);
    }
    
    this.maxWidth = 350;
    
    if (!this.$goalTopLabel.style) { this.$goalTopLabel.style = {}; }    
    if (!this.$goalDistanceText.style) { this.$goalDistanceText.style = {}; }
    if (!this.$goalDistanceUnitsText.style) { this.$goalDistanceUnitsText.style = {}; }
    if (!this.$goalPercentBar.style) { this.$goalPercentBar.style = {}; }
    if (!this.$goalPercentText.style) { this.$goalPercentText.style = {}; }
    
    this.render(state);
  }
  
  update(event, state) {
    if (event.key === 'up' && state.goal < this.maxGoal) {
      state.goal++;
      this.render(state);
      
    } else if (event.key === 'down' && state.goal > this.minGoal) {
      state.goal--;
      this.render(state);
    }
  }
  
  render(state) {
   
    this.$goalTopLabel.style.fill = state.color;
    this.$goalDistanceText.style.fill = state.color;
    this.$goalDistanceUnitsText.style.fill = state.color;
    this.$goalPercentBar.style.fill = state.color;
    this.$goalPercentText.style.fill = state.color;

    if (units.distance === 'us') {
      this.$goalDistanceUnitsText.text = 'MILES'
    } else {
      this.$goalDistanceUnitsText.text = 'KM'
    }
    const goalPercentNumRaw = (units.distance === 'us') ? (kmToMi(state.distRanNum) / state.goal) * 100 : (state.distRanNum / state.goal) * 100;
    const goalPercentNum = Math.floor(goalPercentNumRaw);
    
    state.goalPercent = `${goalPercentNum <= 999 ? goalPercentNum + '%' : 'MET'}`;
    state.goal = state.goal.toString();
   
    const goalWidth = isNaN(goalPercentNumRaw) ? 0 : Math.floor((goalPercentNumRaw / 100) * this.maxWidth);
    
    this.$goalDistanceText.text = state.goal;
    if (goalWidth > this.maxWidth) goalWidth = this.maxWidth;

    this.$goalPercentBar.width = goalWidth;
    
    this.$goalPercentText.text = `${goalPercentNum}%`;
    const goalPercentTextX = (goalWidth - 35 > 0) ? goalWidth - 35 : 0;
    this.$goalPercentText.x = goalPercentTextX;

    fsState.set(state);
  }
}