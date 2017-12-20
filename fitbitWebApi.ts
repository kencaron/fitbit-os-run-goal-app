import { localStorage } from 'local-storage';

import { log, getLastStartOfWeek } from './../common/util.js';
import { queryParams, formatDate } from './util.js';
import { WEB_APP } from './constants.js';
import { enqueue } from './fileTransfer';

export function getTokens() {
  let stampedAccessToken = localStorage.getItem('stampedAccessToken');
  let stampedRefreshToken = localStorage.getItem('stampedRefreshToken');
  
  if (stampedAccessToken) {
    stampedAccessToken = JSON.parse(stampedAccessToken);
  }
  if (stampedRefreshToken) {
    stampedRefreshToken = JSON.parse(stampedRefreshToken);
  }
  return { stampedAccessToken,  stampedRefreshToken};
}

export function setTokens(authResponse) {
  const timestamp = new Date().valueOf();
  log('settings tokens ' + authResponse.access_token);
  const stampedAccessToken = (authResponse.access_token) ? {
    timestamp,
    value: authResponse.access_token
  } : undefined;

  const stampedRefreshToken = (authResponse.refresh_token) ? {
    timestamp,
    value: authResponse.refresh_token
  } : undefined; 
  
  localStorage.setItem('stampedAccessToken', stampedAccessToken);
  localStorage.setItem('stampedRefreshToken', stampedRefreshToken);
  log('just set');
  log(typeof localStorage.getItem('stampedAccessToken'));
  return { stampedAccessToken, stampedRefreshToken };
}

function getHeaders() {
  const accept = 'application/x-www-form-urlencoded';
  const tokens = getTokens();
  log('tokens ' + typeof tokens + JSON.stringify(tokens));
  const authorization = `Bearer ${tokens.stampedAccessToken.value}`;
  
  return {
    accept,
    authorization
  };
}

//Opinionated request tailored for Fitbit Web API requests
function request(url, options) {
  log(`DEBUG: INCOMING REQUEST URL ${url}`);
  //log(`DEBUG: INCOMING REQUEST TYPE ${options.method}`);
  log(`DEBUG: INCOMING REQUEST HAS AUTH HEADER ${options.headers.has('authorization')}`);
  if (!options.headers.has('authorization')) {
    return reject(401);
  }
  log(`DEBUG: INCOMING REQUEST AUTH HEADER ${options.headers.get('authorization')}`);
  //log(`DEBUG: INCOMING REQUEST content-type HEADER ${options.headers.get('Content-Type')}`);  
  //log(`DEBUG: INCOMING REQUEST BODY ${options.body}`);

  return new Promise((resolve, reject) => {
    fetch(url, options)
      .then((response) => response.json())
      .then(responseJson => {
        //log('about to print responseJson')
        //log(JSON.stringify(responseJson));

        if (responseJson.errors) {
          log('WE HAVE ERRORS');
          log(responseJson.errors[0].errorType);
          log(responseJson.errors[0].message);
          
          if (responseJson.errors[0].errorType === 'invalid_grant') {
            log('clearing refresh token because Fitbit says it is bad');
            refresh_token = null;
            localStorage.removeItem('stampedRefreshToken');
            localStorage.removeItem('stampedAccessToken');
            //End of the road, send message to user to reconnect via settings?
            enqueue({lastRunTime: 'RECONNECT'});
          }

          log(JSON.stringify(responseJson));

          reject(responseJson.errors[0].errorType);
        } else {
          log('resolving');
          resolve(responseJson);
        }
      })
      .catch((error) => {
        log(`DEBUG: CATCH`);
        log(JSON.stringify(error));
        reject(error)
      });
  });
}

//Set the tokens too 
export function refreshToken() {
  return new Promise((resolve, reject) => {
    const tokens = getTokens();
    if (!tokens.stampedRefreshToken) {
      reject('No refresh token');
    }
    log(JSON.stringify(tokens.stampedRefreshToken));
    const requestUrl = `${WEB_APP.BASE_URL}oauth2/token`;
    
    const contentType = 'application/x-www-form-urlencoded';
    const Authorization = WEB_APP.BASIC_AUTHORIZATION;
    const headers = {
      'Content-Type': contentType,
      Authorization
    };
   /// log(`DEBUG HEADERS ${JSON.stringify(headers)}`);
    const body = queryParams({
      grant_type: 'refresh_token',
      refresh_token: tokens.stampedRefreshToken.value
    });
    log('DEBUG BODY.' + body);

    const requestOptions = {
      method: 'POST',
      headers: new Headers(headers),
      body
    };
    
    request(requestUrl, requestOptions)
      .then(jsonResponse => {
        log('inside get token then about to resolve');
        setTokens(jsonResponse);
        resolve();
      })
      .catch(err => {
        log('CATCH ON refresh token. logging err:');
        log(err)
        log(JSON.stringify(err));

        reject(err)
      });
    
    localStorage.removeItem('stampedRefreshToken');
  });
  //Good Response format
  //{"access_token":"[token]","expires_in":28800,"refresh_token":"[token]","scope":"activity","token_type":"Bearer","user_id":"5NXP3Y"}
}

export function getActivityLogList(params) {
  //Get this inline with the device API at least...
  
  //log(`afterDate ${afterDate}`);
  return new Promise((resolve, reject) => {
    const queryString = queryParams(params);
   // log(queryString);
    const requestUrl = `${WEB_APP.BASE_URL}1/user/-/activities/list.json?${queryString}`;
   // log(`DEBUG HEADERS ${JSON.stringify(headers)}`);
    const requestOptions = {
      method: 'GET',
      headers: new Headers(getHeaders())
    };

    request(requestUrl, requestOptions)
      .then(jsonResponse => {
        //log('inside get activities then about to resolve');
        resolve(jsonResponse.activities)
      })
      .catch(err => {
        log('CATCH ON get activities. logging err:');
        log(err)
        log(JSON.stringify(err));

        reject(err)
      });
  });
}

export function getProfile() {
  return new Promise((resolve, reject) => {
    const requestUrl = `${WEB_APP.BASE_URL}1/user/-/profile.json`;

    const requestOptions = {
      method: 'GET',
      headers: new Headers(getHeaders())
    };

    request(requestUrl, requestOptions)
      .then(jsonResponse => {
        log('JSON RESPONSE FOR USER PROFILE');
        log(JSON.stringify(jsonResponse));
        resolve(jsonResponse.user);
      })
      .catch(err => {
        log('CATCH ON get user profile. logging err:');
        log(err)
        log(JSON.stringify(err));
        reject(err)
      });
  });
}