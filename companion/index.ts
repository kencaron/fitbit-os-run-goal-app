import * as messaging from 'messaging';
import { settingsStorage } from 'settings';
import { localStorage } from 'local-storage';
import * as fs from 'fs';
import { me } from 'companion';
import { locale } from 'user-settings';

import { log, addDays, getLastStartOfWeek, sameDay } from './../common/util.js';


import { WEB_APP, WAKE_INTERVAL, DEFAULT_START_DAY_OF_WEEK, ACTIVITY_TYPES } from './constants';
import { msToMin, queryParams, formatDate, normalize, stripQuotes } from './util';
import { getActivityLogList, getProfile, refreshToken, getTokens, setTokens } from './fitbitWebApi.ts';
import { enqueue } from './fileTransfer';

interface Activity {
  readonly activityName: string;
  readonly activeDuration: number;
  readonly distance: number;
  readonly originalStartTime: string;
  readonly pace: number;
  readonly steps: number;
  readonly averageHeartRate: number;
};

interface SettingsEvent {
  key: string;
  oldValue: string;
  newValue: string;
};

interface Token {
  readonly timestamp: number;
  readonly value: string;
};

interface User {
  readonly startDayOfWeek: string;
}

interface WebState {
  readonly barChart: number[];
  readonly distRanNum: number;
  readonly lastRunHeartRate: number;
  readonly lastRunCadence: number;
  readonly lastRunTime: string;
}

declare const Promise: any;

function reduceActivities(activities: Activity[]) {  
  return new Promise((resolve: any, reject: any) => {
    log('process runs method');
    log('activities length ' + activities.length);
    let runs = activities.filter(activity => (ACTIVITY_TYPES.indexOf(activity.activityName) > -1));
    log(runs.length);

    if (!runs.length) {
      const run: Activity = {
        activityName: 'Run',
        activeDuration: 0,
        originalStartTime: '',
        distance: 0,
        averageHeartRate: 0,
        steps: 0,
        pace: 0
      };
      runs = [run];
    }
    
    const sRuns = runs.map(run => {
      return {
        activeDuration: run.activeDuration,
        date: new Date(run.originalStartTime),
        distance: run.distance,
        pace: run.pace,
        steps: run.steps,
        averageHeartRate: run.averageHeartRate || 0
      }
    });
    log('START DAY OF WEEK ' + startDayOfWeek);
    const afterDate = getLastStartOfWeek(new Date(), startDayOfWeek);
    
    //TODO don't bother w future dates
    const day0 = sRuns.filter(run => sameDay(run.date, afterDate));
    const day1 = sRuns.filter(run => sameDay(run.date, addDays(afterDate, 1)));
    const day2 = sRuns.filter(run => sameDay(run.date, addDays(afterDate, 2)));
    const day3 = sRuns.filter(run => sameDay(run.date, addDays(afterDate, 3)));
    const day4 = sRuns.filter(run => sameDay(run.date, addDays(afterDate, 4)));
    const day5 = sRuns.filter(run => sameDay(run.date, addDays(afterDate, 5)));
    const day6 = sRuns.filter(run => sameDay(run.date, addDays(afterDate, 6)));
 
    const days = [day0, day1, day2, day3, day4, day5, day6];
    const graph: number[] = [];
    days.forEach(day => {      
      const distRanDay = (day.reduce((memo, sRun) => memo + sRun.distance, 0));
      graph.push(distRanDay);
    });

    const min = Math.min.apply(null, graph);
    const max = Math.max.apply(null, graph);
    
    //TODO 
    const barChart = graph.map(normalize(min, max));   
    const distRanNum = Number(sRuns.reduce((memo, sRun) => memo + sRun.distance, 0).toFixed(1)); 
    const latestRunMinutes = msToMin(sRuns[0].activeDuration);
    //const lastRunPace = sRuns[0].pace; //Pace is seconds to run 1km.
    const lastRunCadence = Math.floor(sRuns[0].steps / latestRunMinutes);
    const lastRunHeartRate = sRuns[0].averageHeartRate;
    const noRunsLastRunTime = 'GO RUNNING';
    const hasRunsLastRunTime = `LAST RUN ${sRuns[0].date.toLocaleString(locale.language.replace('_', '-'), {weekday: 'short', hour: 'numeric'}).toUpperCase()}`;
    const lastRunTime = (sRuns[0].distance) ? hasRunsLastRunTime : noRunsLastRunTime;
    const webState: WebState = {barChart, distRanNum, lastRunHeartRate, lastRunCadence, lastRunTime};
    resolve(webState);    
  });
}

function tryToFetchData() {
  log('trying to fetch activity data');
  const tokens = getTokens();
  log('stamped tokens');
  log(JSON.stringify(tokens));
  const now = new Date().valueOf();
  if (tokens.stampedAccessToken || tokens.stampedRefreshToken) {
    if (
      (tokens.stampedAccessToken && tokens.stampedAccessToken.timestamp + WEB_APP.lifespan < now) ||
      (tokens.stampedRefreshToken && !tokens.stampedAccessToken)
    ) {
      //access token is too old, use the refresh token
      log('too old, trying to refresh');
      refreshToken().then(() => tryToFetchData() );
    } else {
      useAccessToken();
    } 
  } else {
    
    enqueue({lastRunTime: 'CONNECT SETTINGS'});
  }
     
}

function useAccessToken() {
  
  getProfile()
    .then( (user: User) => {
      startDayOfWeek = (user.startDayOfWeek === 'SUNDAY') ? 0 : 1;
      log('start day ' + startDayOfWeek);
      const params = {
        afterDate: formatDate(getLastStartOfWeek(new Date(), startDayOfWeek)),
        sort: 'desc',
        offset: 0,
        limit: 100
      };
      return getActivityLogList(params);
    })
    .then( (activities: Activity[]) => reduceActivities(activities))
    .then( (state: WebState) => enqueue(state)) 
    .catch((err: any) => {
      log(`DEBUG: CATCH ON FETCHING`);
      log(JSON.stringify(err));
      if (err === 'expired_token') {
        const tokens = getTokens();
        
        localStorage.removeItem('stampedAccessToken');
        log('err is expired token');
        if (tokens.stampedRefreshToken.value) {
          refreshToken()
            .then((response: any) => {
              log('then on refresh token');
              tryToFetchData();
            })
            .catch((err: any) => {
              log(`CAUGHT REFRESH ERR ${err}`);
              //failed to refresh... now what?
              enqueue({lastRunTime: 'RECONNECT'});
            });
        }
        
      }
      if (err) {
      }
    });
}

// Import the Companion module
let startDayOfWeek = DEFAULT_START_DAY_OF_WEEK;

me.wakeInterval = WAKE_INTERVAL;

log(JSON.stringify(me.launchReasons));
tryToFetchData();

settingsStorage.onchange = (evt: SettingsEvent) => {
  log('companion: settings onchange');
  //log('FROM ONCHANGE');
  //Might be a bad idea
  //if (evt.key && evt.key === '__oauth') evt.key = 'oauth';
  
  if (evt.key === 'color') {
    const settingsState = {
      color: stripQuotes(evt.newValue)
    };
    
    enqueue(settingsState);
  } else if (evt.key === 'tokens') {

    const oauthResponse = (evt.newValue) ? JSON.parse(evt.newValue) : (evt.oldValue) ? JSON.parse(evt.oldValue) : null;
    //const oauthResponse = (evt.newValue) ? JSON.parse(evt.newValue) : null;

    log('OAUTH RESPONSE');
    log(JSON.stringify(oauthResponse));
    
   
    if (oauthResponse && oauthResponse.access_token) {      
      const tokens = setTokens(oauthResponse);
      
      useAccessToken();
    }
  } else {
    log('unexpected key: ');
    log(JSON.stringify(evt))
  }
 
};