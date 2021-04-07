const log1 = () => { console.log(`1 Host is ${window.location.host}.`); };
const log2 = () => { console.log(`2 Current URI is ${window.location.pathname}${window.location.search}.`); };



// route definitions
module.exports = [
  // docs
  ['when', '/', 'HomeCtrl'],
  ['when', '/single-page-app', 'SinglePageAppCtrl'],
  ['when', '/websocket-server', 'WebsocketServerCtrl'],

  // playground
  ['when', '/playground/page-loadinc', 'Page_LoadIncCtrl'],
  ['when', '/playground/page-loadviews', 'Page_LoadViewsCtrl'],
  ['when', '/playground/controller-hooks', 'Controller_hooksCtrl'],
  ['when', '/playground/datarg', 'DataRgCtrl'],
  ['when', '/playground/datarglisteners', 'DataRgListenersCtrl'],
  ['when', '/playground/cookie', 'CookieCtrl'],
  ['when', '/playground/form', 'FormCtrl'],


  ['notfound', 'NotfoundCtrl'],
  // ['do', log1, log2]
];
