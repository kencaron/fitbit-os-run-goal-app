import document from 'document';
import * as messaging from 'messaging';
import { me as device } from 'device';
import { preferences } from 'user-settings';

import { dateToTime, addHours, getDayOfWeek } from './../util';
import { log, sameDay } from './../../common/util'
 
export class LastSyncTimeComponent {
  constructor(state) {
    this.$lastSyncTopLabelText = document.getElementById('last-sync-top-label');
    this.$lastSyncText = document.getElementById('last-sync-text');
    this.$lastSyncSecondaryText = document.getElementById('last-sync-secondary-text');
    this.$wsClosedCircle = document.getElementById('ws-closed-circle');
    
    if (!this.$lastSyncTopLabelText.style) { this.$lastSyncTopLabelText.style = {}; }
    if (!this.$lastSyncText.style) { this.$lastSyncText.style = {}; }
    if (!this.$lastSyncSecondaryText.style) { this.$lastSyncSecondaryText.style = {}; }
    if (!this.$wsClosedCircle.style) { this.$wsClosedCircle.style = {}; }
    
    this.render(state);
  }
  
  render(state) {
    state.webSocketState = (messaging.peerSocket.readyState === messaging.peerSocket.OPEN);
    state.lastSyncTime = device.lastSyncTime;
    this.$lastSyncTopLabelText.style.fill = state.color;
    this.$lastSyncText.style.fill = state.color;
    this.$lastSyncSecondaryText.style.fill = state.color;
    this.$wsClosedCircle.style.fill = state.color;
    this.$wsClosedCircle.style.display = (state.webSocketState) ? 'none' : 'inline';
    
    this.$lastSyncText.text = (state.lastSyncTime !== '--:--') ? dateToTime(state.lastSyncTime) : state.lastSyncTime;
    
    if (sameDay(state.lastSyncTime, state.date)) {
      if (preferences.clockDisplay === '12h') {
        state.lastSyncSecondary = (state.lastSyncTime.getHours() <= 12) ? 'AM' : 'PM';
      }
    } else {
      state.lastSyncSecondary = getDayOfWeek(state.lastSyncTime).toUpperCase();
    }
    this.$lastSyncSecondaryText.text = state.lastSyncSecondary;

  }
}