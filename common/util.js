import { ENV, ENV_DEV } from './constants.js'

export const log = (ENV === ENV_DEV) ? console.log.bind(console) : ()=>{};

export function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

//0: Sunday
//1: Monday
export function getLastStartOfWeek(date, startDay = 0) {
  var day = date.getDay() || 7;
  if (day !== startDay) {
    date.setHours(-24 * (day - startDay));
  }
  return date;
}

export function sameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}