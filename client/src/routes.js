const func1 = (trx) => { console.log(`DO func1 Host is ${window.location.host}.`); console.log('trx::', trx); };
const func2 = (trx) => { console.log(`DO func2 Current URI is ${window.location.pathname}${window.location.search} or ${trx.uri}.`); };


// route definitions
module.exports = [
  // docs
  ['when', '/', 'HomeCtrl'],
  ['when', '/single-page-app', 'SinglePageAppCtrl', { ssr: true }],
  ['when', '/websocket/server', 'WebsocketServerCtrl'],
  ['when', '/websocket/clients', 'WebsocketClientsCtrl'],
  ['when', '/websocket/clients/nodejs', 'WebsocketClientsNodejsCtrl'],
  ['when', '/websocket/clients/browser', 'WebsocketClientsBrowserCtrl'],
  ['when', '/mobile-app', 'MobileAppCtrl'],
  ['when', '/database', 'DatabaseCtrl'],
  ['when', '/router', 'RouterCtrl'],
  ['when', '/contact', 'ContactCtrl'],

  // playground
  ['when', '/playground/controller-hooks', 'Controller_hooksCtrl', { ssr: true }],
  ['when', '/playground/controller-hooks-same', 'Controller_hooksCtrl'],
  ['when', '/playground/model', 'ModelCtrl'],
  ['when', '/playground/view-rginc', 'View_rgIncCtrl'],
  ['when', '/playground/view-loadviews', 'View_loadViewsCtrl'],
  ['when', '/playground/view-lazyjs', 'View_lazyJSCtrl'],
  ['when', '/playground/datarg', 'DataRgCtrl'],
  ['when', '/playground/datarglisteners', 'DataRgListenersCtrl'],
  ['when', '/playground/cookie', 'CookieCtrl'],
  ['when', '/playground/form', 'FormCtrl'],
  ['when', '/playground/login', 'LoginCtrl', { authGuards: ['autoLogin'] }],
  ['when', '/playground/developer/dashboard', 'LoginokCtrl', { authGuards: ['isLogged', 'hasRole'] }],
  ['when', '/playground/navig1', 'Navig1Ctrl'],
  ['when', '/playground/navig2', 'Navig2Ctrl'],
  ['redirect', '/playground/navig3', '/playground/navig1'],

  ['notfound', 'NotfoundCtrl'],
  // ['do', func1, func2]
];
