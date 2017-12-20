export const ENV_DEV = 'ENV_DEV';
export const ENV_PROD = 'ENV_PROD';
export const ENV = ENV_DEV;

export const TYPE_CLOCKFACE = 'TYPE_CLOCKFACE';
export const TYPE_APP = 'TYPE_APP';
export const TYPE = TYPE_APP;

export const DATA_LIVE = 'DATA_LIVE';
export const DATA_MOCK = 'DATA_MOCK';
export const DATA =  DATA_LIVE;

export const DEFAULT_STATE = {
    color: 'fb-white',
    goal: 12,
    goalPercent: 'SET',
    distRanNum: 0,
    distRan: '- mi',
    lastRunCadence: '---',
    lastRunHeartRate: '---',
    lastRunTime: 'CONNECT SETTINGS',
    barChart: [0, 0, 0, 0, 0, 0, 0],
    date: undefined,
    lastSyncTime: '--:--',
    error: undefined,
    oAuthState: 'unauthenticated',
    webSocketState: 'WS -'
};

export const MOCK_DEFAULT_STATE = {
    color: 'fb-red',
    displayAlwaysOn: false,
    goal: 12,
    goalPercent: '79%',
    distRanNum: 9,
    distRan: '9 mi',
    lastRunCadence: '168',
    lastRunHeartRate: '180',
    lastRunTime: 'LAST RUN SAT, 7AM',
    barChart: [1, 0, 0.75, .5, .66, .25, 0], //9.48
    date: 1511636787,
    lastSyncTime: '05:19',
    error: undefined,
    oAuthState: 'unauthenticated',
    webSocketState: 'WS -'
};

export const WEB_STATE_FILENAME = 'webstate.txt';