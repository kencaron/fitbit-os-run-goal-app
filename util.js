export function msToMin(ms) {
  return ms / 60000;
}

export function queryParams(params) {
  return Object.keys(params)
    .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
    .join('&');
}

export function formatDate(date) {
  return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
}

//TODO firstDayOfWeek import { preferences } from "user-settings";
//preferences.firstDayOfWeek

export function normalize(min, max) {
    var delta = max - min;
    if (!delta) {
      return function(val) {
        return 0;
      }
    } else return function (val) {
        return (val - min) / delta;
    };
}

// Remove all quotation marks from a string
export function stripQuotes(str) {
  return str ? str.replace(/"/g, "") : "";
}