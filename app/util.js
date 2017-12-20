import { preferences, units } from 'user-settings';
import { DEFAULT_STATE } from './../common/constants';
import { log } from './../common/util';
import { memory } from 'system'; 

const defaultDateOptions = {
  'amPm': false,
};

export function dateToTime(date, options = defaultDateOptions) {
    if (typeof date === 'number') {
      date = new Date(date);
    }
  
    var hours = 0;
    var minutes = date.getMinutes();
    
    hours = date.getHours();
   
    if (preferences.clockDisplay === "12h" && hours > 12)
        hours -= 12;
    if (hours === 0)
        hours = 12;
    return padLeft(hours.toString(), 2) + ":" + padLeft(minutes.toString(), 2);
}

export function addHours(date, hours) {
  date.setHours(date.getHours() + hours);
  return date;
}

export function clone(object) {
  return JSON.parse(JSON.stringify(object));
}

export function kmToMi(ki) {
  return ki * 0.621371; 
}

function spkmToSpmi(spkm) {
  return spkm * 1.60934;
}

function secondsPerUnitToMinUnit(secondsPerUnit) {
  return secondsPerUnit / 60;
}

export function formatPace(spkm) {
  if (spkm === 0) { return DEFAULT_STATE.lastRunPace; }
  
  let minutesPerUnit;
  if (units.distance === 'us') {
    const spmi = spkmToSpmi(spkm);
    const minmi = secondsPerUnitToMinUnit(spmi);
    minutesPerUnit = minmi;
  } else {
    const minkm = secondsPerUnitToMinUnit(spkm);
    minutesPerUnit = minkm;
  }
  
  const minutes = Math.floor(minutesPerUnit);
  const seconds = Math.ceil((minutesPerUnit % 1) * 60);
  
  const formattedPace = `${minutes}:${seconds}`;
  return formattedPace;
}

export function getDayOfWeek(date) {
  return date.toLocaleString(undefined, {weekday: 'long'}).slice(0, 3);
}

export function padLeft(nr, n, str) {
    return Array(n - String(nr).length + 1).join(str || '0') + nr;
}
export function watchMemoryMonitor() {
  memory.monitor.onmemorypressurechange = () => updateMemoryMonitor();
}
export function updateMemoryMonitor() {
  const memoryJSPercent = Math.floor((memory.js.used / memory.js.total) * 100);
  const memoryNativePercent = Math.floor((memory.native.used / memory.native.total) * 100);

  log(`Memory Report - JS: ${memoryJSPercent}% Native ${memoryNativePercent}%`);     
}