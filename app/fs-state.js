import * as fs from 'fs';
import { DEFAULT_STATE } from './../common/constants';
import { log } from './../common/util';

import debounce from './modules/lodash@4.17.4/debounce';

const DEBUG_MODE = true;
const FILE_NAME = 'state.txt';

const state = DEFAULT_STATE;

export function set(newState) {
  state = newState;
  
  debounce(save, 5000);
}

export function get() {  
  let returnState = state;
  try { 
    returnState = (typeof state === 'object') ?  returnState : JSON.parse(returnState);
  } catch(error) {
    log(`Caught error: ${error}`);
    returnState = {error};
  } finally {
    return returnState; 
  } 
}

export function load() {  
  try {
   
    state = fs.readFileSync(FILE_NAME, "json");   
    
    if (DEBUG_MODE) {
      log(FILE_NAME + " loaded:\n" + JSON.stringify(state));
    }    
    
    return true;
  } catch(error) {
    log("Failed to load " + FILE_NAME + ". It is OK if no values were stored yet.");
    log(`Caught error: ${error}`);

    return false;
  }
}

export function save() {  
  try {
    if (DEBUG_MODE) {
      log(`About to save state to ${FILE_NAME}`);
    }
    fs.writeFileSync(FILE_NAME, state, "json");
    
    if (DEBUG_MODE) {
      log(FILE_NAME + " saved:\n");
    }   
    
    return true;
  } catch(error) {
    log("Failed to save " + FILE_NAME);
    log(`Caught error: ${error}`);
    return false;
  }
}

export function init() {
  if (DEBUG_MODE) {
    log("App started, loading preferences");
  }   
  
  load();
 
}