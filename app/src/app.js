const { App, syslib } = require('../../sys');
const viewsCached = require('../cache/views.json');
const routes = require('./routes');

// conf
const { $debugOpts, apiConst, authOpts, cookieOpts, httpClientOpts } = require('./conf');

// lib
const StringExt = require('./lib/StringExt');
const Rand = require('./lib/Rand');

// controllers
const HomeCtrl = require('./controllers/HomeCtrl');
const WebsocketServerCtrl = require('./controllers/WebsocketServerCtrl');
const WebsocketClientsCtrl = require('./controllers/WebsocketClientsCtrl');
const WebsocketClientsNodejsCtrl = require('./controllers/WebsocketClientsNodejsCtrl');
const WebsocketClientsBrowserCtrl = require('./controllers/WebsocketClientsBrowserCtrl');
const SinglePageAppCtrl = require('./controllers/SinglePageAppCtrl');
const MobileAppCtrl = require('./controllers/MobileAppCtrl');
const DatabaseCtrl = require('./controllers/DatabaseCtrl');
const RouterCtrl = require('./controllers/RouterCtrl');
const ContactCtrl = require('./controllers/ContactCtrl');
const NotfoundCtrl = require('./controllers/NotfoundCtrl');

// controllers - playground
const Controller_hooksCtrl = require('./controllers/playground/Controller_hooksCtrl');
const ModelCtrl = require('./controllers/playground/ModelCtrl');
const View_rgIncCtrl = require('./controllers/playground/View_rgIncCtrl');
const View_loadViewsCtrl = require('./controllers/playground/View_loadViewsCtrl');
const View_lazyJSCtrl = require('./controllers/playground/View_lazyJSCtrl');
const DataRgCtrl = require('./controllers/playground/DataRgCtrl');
const DataRgListenersCtrl = require('./controllers/playground/DataRgListenersCtrl');
const CookieCtrl = require('./controllers/playground/CookieCtrl');
const FormCtrl = require('./controllers/playground/FormCtrl');
const LoginCtrl = require('./controllers/playground/LoginCtrl');
const LoginokCtrl = require('./controllers/playground/LoginokCtrl');
const Navig1Ctrl = require('./controllers/playground/Navig1Ctrl');
const Navig2Ctrl = require('./controllers/playground/Navig2Ctrl');


// auth
const cookie = new syslib.Cookie(cookieOpts);
const httpClient = new syslib.HTTPClient(httpClientOpts);
const auth = new syslib.Auth(authOpts, cookie, httpClient);

const app = new App();

app
  .const('apiConst', apiConst)
  .const('myNum', 10)
  .const('myStr', 'some thing')
  .const('myObj', { a: 22 })
  .freeze();

app.libInject({ StringExt, Rand }); // use it as app.lib.Rand

app
  .controllersInject([
    // docs
    HomeCtrl,
    WebsocketServerCtrl,
    WebsocketClientsCtrl,
    WebsocketClientsNodejsCtrl,
    WebsocketClientsBrowserCtrl,
    SinglePageAppCtrl,
    MobileAppCtrl,
    DatabaseCtrl,
    RouterCtrl,
    ContactCtrl,

    // playground
    Controller_hooksCtrl,
    ModelCtrl,
    View_rgIncCtrl,
    View_loadViewsCtrl,
    View_lazyJSCtrl,
    DataRgCtrl,
    DataRgListenersCtrl,
    CookieCtrl,
    FormCtrl,
    LoginCtrl,
    LoginokCtrl,
    Navig1Ctrl,
    Navig2Ctrl,

    // not found page
    NotfoundCtrl
  ])
  .controllerAuth(auth) // needed for route authGuards
  .controllerViewsCached(viewsCached)
  .debugger();


// preflight/postflight
const pref1 = async (trx) => { console.log('PREFLIGHT 1 - trx::', trx); };
const pref2 = async (trx) => { console.log('PREFLIGHT 2 - trx::', trx); };
const postf1 = async (trx) => { console.log('POSTFLIGHT 1 - trx::', trx); };
const postf2 = async (trx) => { console.log('POSTFLIGHT 2 - trx::', trx); };
// app.preflight(pref1, pref2);
// app.postflight(postf1, postf2);


app.routes(routes, false); // debug = false
