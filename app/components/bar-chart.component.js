import document from 'document';
import { preferences } from 'user-settings';

import { log } from './../../common/util'
import { getDayOfWeek } from './../util';
import { addDays, getLastStartOfWeek } from './../../common/util.js' 

export class BarChartComponent {
  constructor(state) {   
    this.maxHeight = 80;
    this.bars = [
      document.getElementById('component-bar-chart-bar-0'),
      document.getElementById('component-bar-chart-bar-1'),
      document.getElementById('component-bar-chart-bar-2'),
      document.getElementById('component-bar-chart-bar-3'),
      document.getElementById('component-bar-chart-bar-4'),
      document.getElementById('component-bar-chart-bar-5'),
      document.getElementById('component-bar-chart-bar-6')
    ];
    
    this.barLabels = [
      document.getElementById('component-bar-chart-label-0'),
      document.getElementById('component-bar-chart-label-1'),
      document.getElementById('component-bar-chart-label-2'),
      document.getElementById('component-bar-chart-label-3'),
      document.getElementById('component-bar-chart-label-4'),
      document.getElementById('component-bar-chart-label-5'),
      document.getElementById('component-bar-chart-label-6')
    ];
    
    this.barDividers = [
      document.getElementById('component-bar-chart-divider-0-1'),
      document.getElementById('component-bar-chart-divider-1-2'),
      document.getElementById('component-bar-chart-divider-2-3'),
      document.getElementById('component-bar-chart-divider-3-4'),
      document.getElementById('component-bar-chart-divider-4-5'),
      document.getElementById('component-bar-chart-divider-5-6'),
    ];
    
    this.render(state);
  }

  render(state) {    
    const dayOfWeek = state.date.getDay();
        
    this.bars.forEach((bar, i) => {
      if (bar) {
        if (!bar.style) { bar.style = {}; }
        
        if (this.barLabels[i]) {
          if (!this.barLabels[i].style) { this.barLabels[i].style = {}; }
          this.barLabels[i].style.fill = state.color;
        }
        
        if (this.barDividers[i]) {
          if (!this.barDividers[i].style) { this.barDividers[i].style = {}; }
          this.barDividers[i].style.fill = state.color;
        }

        bar.style.fill = state.color;

        const firstDayOfWeekDate = getLastStartOfWeek(state.date, preferences.firstDayOfWeek);
        this.barLabels[i].text = getDayOfWeek(addDays(firstDayOfWeekDate, i)).toUpperCase();

        if (preferences.firstDayOfWeek === 1) {
          if ((dayOfWeek - 1) < 0) dayOfWeek = 7;
        }

        if (i < (dayOfWeek-1)) {
          this.barLabels[i].style.fontFamily = 'Fabrikat-Bold';
          this.barLabels[i].style.opacity = 0.75;
        } else if (i === (dayOfWeek - preferences.firstDayOfWeek)) { 
           this.barLabels[i].style.fontFamily = 'Fabrikat-Black';
           this.barLabels[i].style.opacity = 1;
        } else {        
          this.barLabels[i].style.fontFamily = 'Fabrikat-Bold';
          this.barLabels[i].style.opacity = 0.5;
        }

        const height = state.barChart[i] * this.maxHeight;
        const y = this.maxHeight - height;
        bar.height = height;
        bar.y      = y;
      }
    });
  }
}