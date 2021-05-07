const log1 = () => { console.log(`1 Host is ${window.location.host}.`); };
const log2 = () => { console.log(`2 Current URI is ${window.location.pathname}${window.location.search}.`); };



// route definitions
module.exports = [
  // docs
  ['when', '/', 'HomeCtrl'],
  ['when', '/single-page-app', 'SinglePageAppCtrl'],
  ['when', '/websocket-server', 'WebsocketServerCtrl'],
  ['when', '/websocket-clients', 'WebsocketClientsCtrl'],
  ['when', '/mobile-app', 'MobileAppCtrl'],
  ['when', '/database', 'DatabaseCtrl'],
  ['when', '/router', 'RouterCtrl'],
  ['when', '/contact', 'ContactCtrl'],

  // playground
  ['when', '/playground/page-loadinc', 'Page_LoadIncCtrl'],
  ['when', '/playground/page-loadviews', 'Page_LoadViewsCtrl'],
  ['when', '/playground/page-lazyjs', 'Page_LazyJSCtrl'],
  ['when', '/playground/controller-hooks', 'Controller_hooksCtrl'],
  ['when', '/playground/controller-hooks-same', 'Controller_hooksCtrl'],
  ['when', '/playground/datarg', 'DataRgCtrl'],
  ['when', '/playground/datarglisteners', 'DataRgListenersCtrl'],
  ['when', '/playground/cookie', 'CookieCtrl'],
  ['when', '/playground/form', 'FormCtrl'],
  ['when', '/playground/login', 'LoginCtrl', {renderDelay: 10, authGuards: ['autoLogin']}],
  ['when', '/playground/customer/dashboard', 'LoginokCtrl', {authGuards: ['isLogged', 'hasRole']}],
  ['when', '/playground/navig1', 'Navig1Ctrl'],
  ['when', '/playground/navig2', 'Navig2Ctrl'],
  ['redirect', '/playground/navig3', '/playground/navig1'],
  ['when', '/playground/scope', 'ScopeCtrl', {renderDelay: 10}],
  ['when', '/playground/model', 'ModelCtrl'],

  ['notfound', 'NotfoundCtrl'],
  // ['do', log1, log2]
];
